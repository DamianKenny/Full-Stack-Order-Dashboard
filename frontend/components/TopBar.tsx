'use client';

import { Search, Plus } from 'lucide-react';
import { OrderStatus } from '../types/order';
import SegmentedControl from './SegmentedControl';

interface TopBarProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  onNewOrder: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function TopBar({
  currentStatus,
  onStatusChange,
  onNewOrder,
  searchValue,
  onSearchChange,
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between h-16 px-8 border-b border-default bg-surface">
      {/* Left: Page Title */}
      <h1 className="text-2xl font-semibold text-primary">Orders</h1>

      {/* Right: Search, Filter, Action */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders..."
            className="w-64 h-9 pl-9 pr-3 rounded-lg border border-default bg-surface text-sm placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter */}
        <SegmentedControl currentStatus={currentStatus} onStatusChange={onStatusChange} />

        {/* New Order Button */}
        <button
          onClick={onNewOrder}
          className="flex items-center gap-2 h-9 px-4 bg-[color:var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          New Order
        </button>
      </div>
    </div>
  );
}