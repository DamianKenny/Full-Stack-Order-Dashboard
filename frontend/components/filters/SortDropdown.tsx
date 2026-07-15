'use client';

import { ArrowUpDown } from 'lucide-react';
import { OrderSortBy, OrderSortOrder } from '@/types/order';

interface SortDropdownProps {
  sortBy: OrderSortBy;
  sortOrder: OrderSortOrder;
  onSortByChange: (value: OrderSortBy) => void;
  onSortOrderChange: (value: OrderSortOrder) => void;
}

export default function SortDropdown({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
      <ArrowUpDown size={16} className="text-muted-foreground" />
      <select
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value as OrderSortBy)}
        className="h-8 rounded-md border-0 bg-transparent text-sm outline-none"
      >
        <option value="date">Date</option>
        <option value="total">Total</option>
        <option value="status">Status</option>
      </select>
      <select
        value={sortOrder}
        onChange={(event) => onSortOrderChange(event.target.value as OrderSortOrder)}
        className="h-8 rounded-md border-0 bg-transparent text-sm outline-none"
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>
    </div>
  );
}
