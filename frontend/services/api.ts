import axios from 'axios';
import { Order, CreateOrderRequest, OrderFilters } from '../types/order';
import { Product, TopProduct } from '../types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const orderAPI = {
  getOrders: async (status?: string): Promise<Order[]> => {
    const params = status && status !== 'All' ? { status } : {};
    const response = await apiClient.get<Order[]>('/orders', { params });
    return response.data;
  },

  getOrdersWithFilters: async (filters: OrderFilters): Promise<Order[]> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
    );

    const response = await apiClient.get<Order[]>('/orders', { params });
    return response.data;
  },

  createOrder: async (order: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', order);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  bulkUpdateOrderStatus: async (ids: string[], status: string): Promise<{ updatedCount: number; orders: Order[] }> => {
    const response = await apiClient.post<{ updatedCount: number; orders: Order[] }>('/orders/bulk/status', { ids, status });
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  bulkDeleteOrders: async (ids: string[]): Promise<{ deletedCount: number }> => {
    const response = await apiClient.delete('/orders/bulk', { data: { ids } });
    return response.data;
  },

  updateOrder: async (id: string, data: { customerName?: string; items?: string[]; total?: number }): Promise<Order> => {
    const response = await apiClient.put<Order>(`/orders/${id}`, data);
    return response.data;
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return true;
    } catch {
      return false;
    }
  },
};

export const analyticsAPI = {
  getRevenueTrend: async (params: { startDate?: string; endDate?: string; groupBy?: string } = {}) => {
    const response = await apiClient.get<{ period: string; revenue: number }[]>('/analytics/revenue', { params });
    return response.data;
  },

  getVolumeTrend: async (params: { groupBy?: string } = {}) => {
    const response = await apiClient.get<{ period: string; count: number }[]>('/analytics/volume', { params });
    return response.data;
  },

  getCustomerSegments: async () => {
    const response = await apiClient.get<{ status: string; count: number; revenue: number }[]>('/analytics/customers/segments');
    return response.data;
  },
};

export const productAPI = {
  getProducts: async (category?: string): Promise<Product[]> => {
    const params = category ? { category } : {};
    const response = await apiClient.get<Product[]>('/products', { params });
    return response.data;
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const response = await apiClient.get<TopProduct[]>('/products/top');
    return response.data;
  },
};
