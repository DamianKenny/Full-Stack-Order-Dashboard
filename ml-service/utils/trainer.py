import pandas as pd
from prophet import Prophet
import joblib
import json
from typing import Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train_prophet_model(train_df: pd.DataFrame, product_name: str, confidence_interval: float = 0.80) -> Prophet:
    """
    Train a Prophet model for a single product.
    
    Args:
        train_df: DataFrame with 'ds' (date) and 'y' (quantity) columns
        product_name: Name of the product for logging
        confidence_interval: Width of confidence interval (0.80 = 80%)
    
    Returns:
        Trained Prophet model
    """
    logger.info(f"Training Prophet model for {product_name}...")
    logger.info(f"  Training data points: {len(train_df)}")
    logger.info(f"  Date range: {train_df['ds'].min()} to {train_df['ds'].max()}")
    
    # Initialize Prophet with seasonality
    model = Prophet(
        yearly_seasonality=True,   # Your 2.5 years of data supports yearly patterns
        weekly_seasonality=True,   # Day-of-week patterns (e.g., weekend vs weekday)
        daily_seasonality=False,   # Too granular for daily sales data
        interval_width=confidence_interval  # 80% confidence intervals
    )
    
    # Fit the model
    model.fit(train_df)
    
    logger.info(f"✓ Model trained for {product_name}")
    return model


def make_predictions(model: Prophet, forecast_days: int = 400) -> pd.DataFrame:
    """
    Generate forecasts from trained model.
    
    Args:
        model: Trained Prophet model
        forecast_days: Number of days to forecast ahead (400 = ~13 months)
    
    Returns:
        DataFrame with forecasts including confidence intervals
    """
    # Create future dataframe
    future = model.make_future_dataframe(periods=forecast_days)
    
    # Predict
    forecast = model.predict(future)
    
    return forecast


def aggregate_predictions(forecast: pd.DataFrame, train_df: pd.DataFrame = None) -> Dict:
    """
    Aggregate forecast into next month/quarter/year predictions.
    
    Args:
        forecast: Prophet forecast DataFrame
        train_df: Original training data with 'ds' and 'y' (for getting historical end date)
    
    Returns:
        Dictionary with aggregated predictions and confidence intervals
    """
    # Get the last date in historical data
    # Prophet forecast has: ds, yhat, yhat_lower, yhat_upper (no 'y' column)
    # Use the training data to find the last historical date
    if train_df is not None:
        historical_end = train_df['ds'].max()
    else:
        # Fallback: find boundary where forecast transitions from historical
        # (first date where yhat starts trending differently)
        sorted_forecast = forecast.sort_values('ds')
        mid_point = len(sorted_forecast) // 3  # Roughly 1/3 is historical
        historical_end = sorted_forecast['ds'].iloc[mid_point]
    
    # Define periods
    next_month_end = historical_end + pd.Timedelta(days=30)
    next_quarter_end = historical_end + pd.Timedelta(days=90)
    next_year_end = historical_end + pd.Timedelta(days=365)
    
    # Filter forecast for each period
    monthly_forecast = forecast[(forecast['ds'] > historical_end) & (forecast['ds'] <= next_month_end)]
    quarterly_forecast = forecast[(forecast['ds'] > historical_end) & (forecast['ds'] <= next_quarter_end)]
    yearly_forecast = forecast[(forecast['ds'] > historical_end) & (forecast['ds'] <= next_year_end)]
    
    # Aggregate predictions
    result = {
        'next_month': round(monthly_forecast['yhat'].sum(), 1),
        'next_quarter': round(quarterly_forecast['yhat'].sum(), 1),
        'next_year': round(yearly_forecast['yhat'].sum(), 1),
        'monthly_lower': round(monthly_forecast['yhat_lower'].sum(), 1),
        'monthly_upper': round(monthly_forecast['yhat_upper'].sum(), 1),
        'quarterly_lower': round(quarterly_forecast['yhat_lower'].sum(), 1),
        'quarterly_upper': round(quarterly_forecast['yhat_upper'].sum(), 1),
        'yearly_lower': round(yearly_forecast['yhat_lower'].sum(), 1),
        'yearly_upper': round(yearly_forecast['yhat_upper'].sum(), 1),
    }
    
    return result


def save_model(model: Prophet, product_name: str, output_dir: str = 'models') -> str:
    """
    Save trained model to disk using joblib.
    
    Args:
        model: Trained Prophet model
        product_name: Product name for filename
        output_dir: Directory to save models
    
    Returns:
        Path to saved model file
    """
    import os
    
    # Sanitize product name for filename
    safe_name = product_name.replace(' ', '_').replace('/', '_')
    filename = f"{output_dir}/{safe_name}_model.pkl"
    
    # Ensure directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Save model
    joblib.dump(model, filename)
    
    logger.info(f"✓ Model saved: {filename}")
    return filename


def load_model(model_path: str) -> Prophet:
    """Load a saved Prophet model from disk."""
    logger.info(f"Loading model from {model_path}...")
    model = joblib.load(model_path)
    logger.info(f"✓ Model loaded")
    return model