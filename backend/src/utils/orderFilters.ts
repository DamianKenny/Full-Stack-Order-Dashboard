import type { Order, OrderSortBy, OrderSortOrder } from '../types/order';

export interface OrderFilterOptions {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: OrderSortBy;
  sortOrder?: OrderSortOrder;
}

const statusRank: Record<string, number> = {
  Pending: 0,
  Shipped: 1,
  Delivered: 2,
};

const getTimeValue = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

const getComparableValue = (order: Order, sortBy: OrderSortBy) => {
  if (sortBy === 'total') {
    return order.total;
  }

  if (sortBy === 'status') {
    return statusRank[order.status] ?? Number.MAX_SAFE_INTEGER;
  }

  return getTimeValue(order.createdAt) ?? Number.MAX_SAFE_INTEGER;
};

export const applyOrderFilters = (
  orders: Order[],
  filters: OrderFilterOptions = {}
): Order[] => {
  let result = [...orders];

  if (filters.status && filters.status !== 'All') {
    result = result.filter((order) => order.status.toLowerCase() === filters.status!.toLowerCase());
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((order) => {
      const haystacks = [order.customerName, order.id, ...order.items];
      return haystacks.some((value) => value.toLowerCase().includes(query));
    });
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((order) => {
      const createdAt = getTimeValue(order.createdAt);
      return createdAt !== null && createdAt >= from.getTime();
    });
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((order) => {
      const createdAt = getTimeValue(order.createdAt);
      return createdAt !== null && createdAt <= to.getTime();
    });
  }

  const sortBy = filters.sortBy ?? 'date';
  const sortOrder = filters.sortOrder ?? 'desc';
  const direction = sortOrder === 'asc' ? 1 : -1;

  result.sort((left, right) => {
    const leftValue = getComparableValue(left, sortBy);
    const rightValue = getComparableValue(right, sortBy);

    if (leftValue < rightValue) {
      return -1 * direction;
    }

    if (leftValue > rightValue) {
      return 1 * direction;
    }

    return left.id.localeCompare(right.id);
  });

  return result;
};
