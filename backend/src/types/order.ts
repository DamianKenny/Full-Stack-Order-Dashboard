export interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered'; 
  createdAt?: string;
}

// This is for filtering/UI purposes only - includes 'All'
export type OrderStatus = Order['status'] | 'All';
export type OrderSortBy = 'date' | 'total' | 'status';
export type OrderSortOrder = 'asc' | 'desc';

export interface CreateOrderDTO {
  customerName: string;
  items: string[];
  total: number;
  status?: 'Pending' | 'Shipped' | 'Delivered'; 
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: OrderSortBy;
  sortOrder?: OrderSortOrder;
}