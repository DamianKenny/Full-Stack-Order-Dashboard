'use client';

import { OrderStatus } from '../types/order';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface SegmentedControlProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

const statuses: OrderStatus[] = ['All', 'Pending', 'Shipped', 'Delivered'];

export default function SegmentedControl({
  currentStatus,
  onStatusChange,
}: SegmentedControlProps) {
  // ToggleGroup uses string[] for value in `single` mode with @base-ui/react
  const groupValue = [currentStatus];

  const handleValueChange = (newValue: string[]) => {
    if (newValue.length > 0 && newValue[0] !== currentStatus) {
      onStatusChange(newValue[0] as OrderStatus);
    }
  };

  return (
    <ToggleGroup
      value={groupValue}
      onValueChange={handleValueChange}
      variant="outline"
      spacing={0}
      orientation="horizontal"
      size="sm"
    >
      {statuses.map((status) => (
        <ToggleGroupItem
          key={status}
          value={status}
          aria-label={status}
          className="px-3 text-xs font-medium min-w-0"
        >
          {status}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}