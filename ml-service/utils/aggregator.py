import pandas as pd
from typing import Dict, List
import numpy as np


def aggregate_to_timeseries(ml_df: pd.DataFrame, product_name: str, freq: str = 'D') -> pd.DataFrame:
    """
    Aggregate product sales to time-series format for Prophet.
    
    Args:
        ml_df: Normalized DataFrame from parser
        product_name: Product to aggregate
        freq: 'D' for daily, 'W' for weekly, 'M' for monthly
    
    Returns:
        DataFrame with 'ds' (date without timezone) and 'y' (quantity) columns
    """
    product_df = ml_df[ml_df['product_name'] == product_name].copy()
    
    if len(product_df) == 0:
        raise ValueError(f"No data found for product: {product_name}")
    
    # Group by date and sum quantities
    daily_sales = product_df.groupby('order_date')['quantity'].sum().reset_index()
    daily_sales.columns = ['ds', 'y']
    
    # Strip timezone from dates (Prophet doesn't support timezone-aware datetimes)
    daily_sales['ds'] = daily_sales['ds'].dt.tz_localize(None)
    
    # Set date as index and resample to desired frequency
    daily_sales = daily_sales.set_index('ds')
    daily_sales = daily_sales.asfreq('D', fill_value=0)
    
    # Resample to target frequency (e.g., weekly)
    if freq == 'W':
        aggregated = daily_sales.resample('W').sum().reset_index()
    elif freq == 'M':
        aggregated = daily_sales.resample('M').sum().reset_index()
    else:  # Daily
        aggregated = daily_sales.reset_index()
    
    # Rename columns for Prophet compatibility
    aggregated.columns = ['ds', 'y']
    
    return aggregated


def get_products_with_sufficient_data(ml_df: pd.DataFrame, min_observations: int = 15) -> List[str]:
    """
    Filter products that have enough data points for reliable training.
    
    Args:
        ml_df: Normalized DataFrame
        min_observations: Minimum number of order appearances
    
    Returns:
        List of product names meeting threshold
    """
    product_counts = ml_df['product_name'].value_counts()
    sufficient_products = product_counts[product_counts >= min_observations].index.tolist()
    
    print(f"Products with ≥{min_observations} observations: {len(sufficient_products)}")
    for product in sufficient_products:
        count = product_counts[product]
        print(f"  - {product}: {count} orders")
    
    # Log sparse products
    sparse_products = product_counts[product_counts < min_observations].index.tolist()
    if sparse_products:
        print(f"\nSparse products (<{min_observations} orders, using category-level predictions):")
        for product in sparse_products:
            count = product_counts[product]
            print(f"  - {product}: {count} orders")
    
    return sufficient_products


def get_product_categories(ml_df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Group products into categories based on naming patterns.
    This helps with sparse data by training on categories instead of individual products.
    """
    categories = {
        'Bakery': ['Artisanal Bread', 'Croissant', 'Butter Croissant', 'Sourdough Loaf', 'Bread'],
        'Beverages': ['Coffee Beans', 'Espresso Cup'],
        'Dairy': ['Milk', 'Eggs'],
        'Sweets': ['Chocolate Cake'],
        'Pantry': ['Organic Honey']
    }
    
    # Reverse mapping: product → category
    product_to_category = {}
    for category, products in categories.items():
        for product in products:
            product_to_category[product] = category
    
    return product_to_category


def aggregate_by_category(ml_df: pd.DataFrame, category: str, product_to_category: Dict[str, str]) -> pd.DataFrame:
    """Aggregate sales at category level for sparse products"""
    # Filter products in this category
    products_in_category = [p for p, c in product_to_category.items() if c == category]
    category_df = ml_df[ml_df['product_name'].isin(products_in_category)].copy()
    
    if len(category_df) == 0:
        raise ValueError(f"No data found for category: {category}")
    
    # Group by date and sum across all products in category
    category_sales = category_df.groupby('order_date')['quantity'].sum().reset_index()
    category_sales.columns = ['ds', 'y']
    
    # Strip timezone from dates (Prophet doesn't support timezone-aware datetimes)
    category_sales['ds'] = category_sales['ds'].dt.tz_localize(None)
    
    # Resample to weekly frequency (like individual products)
    category_sales = category_sales.set_index('ds').asfreq('W', fill_value=0).reset_index()
    category_sales.columns = ['ds', 'y']
    
    return category_sales
