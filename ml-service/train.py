#!/usr/bin/env python3
"""
ML Training Pipeline
Trains Prophet models on order data to predict top-selling products.
Usage: python train.py
"""

import sys
import json
import logging
from pathlib import Path
from datetime import datetime

# Add ml-service to path for imports
sys.path.append(str(Path(__file__).parent))

from utils.parser import load_and_normalize_csv, get_product_stats
from utils.aggregator import get_products_with_sufficient_data, aggregate_to_timeseries, get_product_categories, aggregate_by_category
from utils.trainer import train_prophet_model, make_predictions, aggregate_predictions, save_model

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def train_all_models(csv_path: str = 'data/orders_history.csv') -> dict:
    """
    Main training pipeline: load CSV, train models, generate predictions.
    
    Args:
        csv_path: Path to CSV file with order history
    
    Returns:
        Dictionary of predictions by product
    """
    logger.info("="*60)
    logger.info("ML TRAINING PIPELINE STARTED")
    logger.info("="*60)
    
    # Step 1: Load and normalize CSV
    logger.info("\n[1/5] Loading and normalizing CSV data...")
    ml_df = load_and_normalize_csv(csv_path)
    
    # Display product statistics
    logger.info("\nProduct Statistics:")
    stats = get_product_stats(ml_df)
    print(stats.to_string())
    
    # Step 2: Identify products with sufficient data
    logger.info("\n[2/5] Analyzing data sufficiency...")
    sufficient_products = get_products_with_sufficient_data(ml_df, min_observations=15)
    product_to_category = get_product_categories(ml_df)
    
    all_predictions = {}
    
    # Step 3: Train models for products with sufficient data
    logger.info(f"\n[3/5] Training models for {len(sufficient_products)} products...")
    
    for product_name in sufficient_products:
        try:
            # Aggregate to time-series (weekly frequency)
            ts_df = aggregate_to_timeseries(ml_df, product_name, freq='W')
            
            # Train Prophet model
            model = train_prophet_model(ts_df, product_name, confidence_interval=0.80)
            
            # Generate predictions
            forecast = make_predictions(model, forecast_days=400)
            
            # Aggregate to month/quarter/year (pass training data for historical end date)
            preds = aggregate_predictions(forecast, train_df=ts_df)
            
            # Store predictions
            all_predictions[product_name] = preds
            
            # Save model to disk
            model_path = save_model(model, product_name, output_dir='models')
            
            logger.info(f"  ✓ {product_name}: Next month = {preds['next_month']} units "
                       f"(80% CI: {preds['monthly_lower']}-{preds['monthly_upper']})")
            
        except Exception as e:
            logger.error(f"  ✗ Failed to train {product_name}: {str(e)}")
            continue
    
    # Step 4: Train category-level models for sparse products
    logger.info("\n[4/5] Training category-level models for sparse products...")
    
    # Train category-level models
    categories_to_train = ['Bakery', 'Beverages', 'Dairy']  # Focus on main categories
    
    for category in categories_to_train:
        try:
            category_ts = aggregate_by_category(ml_df, category, product_to_category)
            
            # Train model on category-level data
            model = train_prophet_model(category_ts, f"Category_{category}", confidence_interval=0.80)
            forecast = make_predictions(model, forecast_days=400)
            preds = aggregate_predictions(forecast, train_df=category_ts)
            
            all_predictions[f"Category_{category}"] = preds
            save_model(model, f"Category_{category}", output_dir='models')
            
            logger.info(f"  ✓ {category}: Next month = {preds['next_month']} units")
            
        except Exception as e:
            logger.error(f"  ✗ Failed to train category {category}: {str(e)}")
            continue
    
    # Step 5: Save predictions to JSON
    logger.info("\n[5/5] Saving predictions...")
    
    output_path = 'models/predictions.json'
    Path('models').mkdir(exist_ok=True)
    
    # Add metadata
    output_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'training_data_range': f"{ml_df['order_date'].min()} to {ml_df['order_date'].max()}",
            'total_orders': ml_df['order_id'].nunique(),
            'total_products': ml_df['product_name'].nunique(),
            'model_version': 'v1.0_prophet',
            'confidence_interval': '80%'
        },
        'predictions': all_predictions
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    logger.info(f"✓ Predictions saved to {output_path}")
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("TRAINING COMPLETE")
    logger.info("="*60)
    logger.info(f"Total products/categories with predictions: {len(all_predictions)}")
    logger.info(f"Predictions file: {output_path}")
    logger.info(f"Models saved to: models/")
    
    # Display top 5 predicted products
    logger.info("\nTop 5 Predicted Products (Next Month):")
    sorted_preds = sorted(all_predictions.items(), key=lambda x: x[1]['next_month'], reverse=True)[:5]
    for i, (product, preds) in enumerate(sorted_preds, 1):
        logger.info(f"  {i}. {product}: {preds['next_month']} units "
                   f"(CI: {preds['monthly_lower']}-{preds['monthly_upper']})")
    
    return all_predictions


if __name__ == '__main__':
    try:
        predictions = train_all_models()
        sys.exit(0)
    except Exception as e:
        logger.error(f"Training failed: {str(e)}", exc_info=True)
        sys.exit(1)