import axios from 'axios';
import { Order, CreateOrderRequest } from '../types/order';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

export const orderAPI = {
    getOrder: async (status?: string): Promise<Order[]> => {
        const params = status && status !== 'All' ? { status } : {};
        const response = await apiClient.get<Order[]>('/orders', { params });
        return response.data;
    },

    createOrder: async (order: CreateOrderRequest): Promise<Order> => {
        const reponse = await apiClient.post<Order>('/orders', order);
        return reponse.data;
    },

    updateOrderStatus: async (id: string, status: string): Promise<Order> => {
        const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
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