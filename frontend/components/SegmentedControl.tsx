'use client';

import { OrderStatus } from '../types/order';

interface SegmentedControlProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

const statuses: OrderStatus[] = ['All', 'Pending', 'Shipped', 'Delivered'];

export default function SegmentedControl({
  currentStatus,
  onStatusChange,
}: SegmentedControlProps) {
  return (
    <div className="inline-flex items-center h-9 rounded-lg border border-default bg-surface p-0.5">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onStatusChange(status)}
          className={`px-3 h-8 rounded-md text-sm font-medium transition-all duration-150 ${
            currentStatus === status
              ? 'bg-surface-raised text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}