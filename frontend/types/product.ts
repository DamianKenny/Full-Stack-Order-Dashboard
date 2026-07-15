export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface TopProduct {
  name: string;
  count: number;
  revenue: number;
}

export interface OrderLineItem {
  product: Product;
  quantity: number;
}