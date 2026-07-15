'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DateRangePicker from './DateRangePicker';
import SortDropdown from './SortDropdown';
import { OrderSortBy, OrderSortOrder, OrderStatus } from '@/types/order';

interface FilterBarProps {
  searchValue: string;
  dateFrom: string;
  dateTo: string;
  sortBy: OrderSortBy;
  sortOrder: OrderSortOrder;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortByChange: (value: OrderSortBy) => void;
  onSortOrderChange: (value: OrderSortOrder) => void;
  currentStatus: OrderStatus;
}

export default function FilterBar({
  searchValue,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder,
  activeFiltersCount,
  onClearFilters,
  onDateFromChange,
  onDateToChange,
  onSortByChange,
  onSortOrderChange,
}: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
        />
        <SortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={onSortByChange}
          onSortOrderChange={onSortOrderChange}
        />
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X size={14} className="mr-2" />
          Clear ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}
