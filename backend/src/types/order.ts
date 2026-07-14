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

export interface CreateOrderDTO {
  customerName: string;
  items: string[];
  total: number;
  status?: 'Pending' | 'Shipped' | 'Delivered'; 
}