import pandas as pd
import re
from typing import List, Tuple


def parse_items(items_str: str) -> List[Tuple[str, int]]:
    """
    Parse items string like 'Coffee Beans x2; Milk x1'
    Returns: [('Coffee Beans', 2), ('Milk', 1)]
    """
    if not isinstance(items_str, str):
        return []
    
    items = items_str.split(';')
    result = []
    
    for item in items:
        item = item.strip()
        if not item:
            continue
            
        # Match pattern: "Product Name xQuantity"
        match = re.match(r'(.+?) x(\d+)$', item)
        if match:
            product_name = match.group(1).strip()
            quantity = int(match.group(2))
            result.append((product_name, quantity))
    
    return result


def load_and_normalize_csv(csv_path: str) -> pd.DataFrame:
    """
    Load CSV and normalize to ML-ready format.
    Input: One row per order with nested items
    Output: One row per order-product combination
    """
    print(f"Loading CSV from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Parse dates
    df['order_date'] = pd.to_datetime(df['Placed'])
    df['year'] = df['order_date'].dt.year
    df['month'] = df['order_date'].dt.month
    df['quarter'] = df['order_date'].dt.quarter
    
    # Explode items column into separate rows
    records = []
    for _, row in df.iterrows():
        items = parse_items(row['Items'])
        for product_name, quantity in items:
            records.append({
                'order_id': row['Order ID'],
                'customer': row['Customer'],
                'product_name': product_name,
                'quantity': quantity,
                'order_total': float(row['Total']),
                'order_date': row['order_date'],
                'year': row['year'],
                'month': row['month'],
                'quarter': row['quarter'],
                'status': row['Status']
            })
    
    ml_df = pd.DataFrame(records)
    
    # Normalize product names: merge variants
    # "Bread" → "Artisanal Bread" (assuming they're the same product)
    ml_df['product_name'] = ml_df['product_name'].replace('Bread', 'Artisanal Bread')
    
    print(f"✓ Loaded {len(ml_df)} order-product combinations")
    print(f"  Date range: {ml_df['order_date'].min()} to {ml_df['order_date'].max()}")
    print(f"  Unique products: {ml_df['product_name'].nunique()}")
    
    return ml_df


def get_product_stats(ml_df: pd.DataFrame) -> pd.DataFrame:
    """Get statistics per product for analysis"""
    stats = ml_df.groupby('product_name').agg({
        'quantity': ['sum', 'mean', 'count'],
        'order_date': ['min', 'max'],
        'order_total': 'sum'
    }).round(2)
    
    stats.columns = ['total_qty', 'avg_qty', 'order_count', 'first_order', 'last_order', 'total_revenue']
    stats = stats.sort_values('order_count', ascending=False)
    
    return stats