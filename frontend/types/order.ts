export interface Order {
    id: string;
    customerName: string;
    items: string[];
    total: number;
    status: 'Pending' | 'Shipped' | 'Delivered'; 
    createdAt?: string;
}

export type OrderStatus = 'All' | 'Pending' | 'Shipped' | 'Delivered';

export interface CreateOrderRequest {
    customerName: string;
    items: string[];
    total: number;
}