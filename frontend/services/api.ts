import axios from 'axios';
import { Order, CreateOrderRequest } from '../types/order';
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

  createOrder: async (order: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', order);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
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
