'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order, OrderFilters, OrderSortBy, OrderSortOrder, OrderStatus } from '../types/order';
import { orderAPI } from '../services/api';

const useDebouncedValue = (value: string, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const useOrders = (initialStatus: OrderStatus = 'All') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<OrderSortBy>('date');
  const [sortOrder, setSortOrder] = useState<OrderSortOrder>('desc');

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo<OrderFilters>(() => ({
    status: status === 'All' ? undefined : status,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy,
    sortOrder,
  }), [status, debouncedSearch, dateFrom, dateTo, sortBy, sortOrder]);

  const fetchOrders = async (currentFilters: OrderFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await orderAPI.getOrdersWithFilters(currentFilters);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filters);
  }, [filters]);

  const refetch = () => fetchOrders(filters);

  return {
    orders,
    isLoading,
    error,
    status,
    setStatus,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    refetch,
  };
};