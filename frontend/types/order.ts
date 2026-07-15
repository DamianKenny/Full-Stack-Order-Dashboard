export interface Order {
    id: string;
    customerName: string;
    items: string[];
    total: number;
    status: 'Pending' | 'Shipped' | 'Delivered'; 
    createdAt?: string;
}

export type OrderStatus = 'All' | 'Pending' | 'Shipped' | 'Delivered';
export type OrderSortBy = 'date' | 'total' | 'status';
export type OrderSortOrder = 'asc' | 'desc';

export interface OrderFilters {
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: OrderSortBy;
    sortOrder?: OrderSortOrder;
}

export interface CreateOrderRequest {
    customerName: string;
    items: string[];
    total: number;
}