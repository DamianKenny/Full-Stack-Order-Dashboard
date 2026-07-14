'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types/order';
import { orderAPI } from '../services/api';

export const useOrders = (initialStatus: OrderStatus = 'All') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  const fetchOrders = async (filterStatus?: OrderStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await orderAPI.getOrders(
        filterStatus && filterStatus !== 'All' ? filterStatus : undefined
      );
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(status);
  }, [status]);

  const refetch = () => fetchOrders(status);

  return {
    orders,
    isLoading,
    error,
    status,
    setStatus,
    refetch,
  };
};