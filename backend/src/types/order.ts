export interface Order{
    id: string;
    customerName: string;
    items: string[];
    total: number;
    status: 'Pending' | 'Shipped' | 'Delivered' ;
    createdAt?: string;
}

export type OrderStatus = Order['status'] | 'All';

export interface CreateOrderDTO {
    customerName: string;
    items: string[];
    total: number;
    status?: OrderStatus;
}