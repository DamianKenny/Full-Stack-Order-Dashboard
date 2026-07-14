'use client';

import { Search, Plus } from 'lucide-react';
import { OrderStatus } from '../types/order';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-between h-16 px-8 border-b bg-card">
      {/* Left: Page Title */}
      <h1 className="text-2xl font-semibold text-foreground">Orders</h1>

      {/* Right: Search, Filter, Action */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders..."
            className="w-64 pl-9 bg-background"
          />
        </div>

        {/* Status Filter */}
        <SegmentedControl currentStatus={currentStatus} onStatusChange={onStatusChange} />

        {/* New Order Button */}
        <Button onClick={onNewOrder} size="sm">
          <Plus size={14} />
          New Order
        </Button>
      </div>
    </div>
  );
}