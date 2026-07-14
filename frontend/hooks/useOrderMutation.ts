'use client';

import { useState } from 'react';
import { CreateOrderRequest } from '../types/order';
import { orderAPI } from '../services/api';

export const useOrderMutation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: CreateOrderRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newOrder = await orderAPI.createOrder(orderData);
      return newOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedOrder = await orderAPI.updateOrderStatus(id, newStatus);
      return updatedOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createOrder,
    updateOrderStatus,
    isSubmitting,
    error,
  };
};