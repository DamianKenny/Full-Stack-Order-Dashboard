'use client';

import { Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderSortOrder, OrderSortBy, OrderStatus } from '@/types/order';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusUpdate: (status: OrderStatus) => void;
  onExportCsv: () => void;
  availableStatuses: OrderStatus[];
}

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatusUpdate,
  onExportCsv,
  availableStatuses,
}: BulkActionBarProps) {
  return (
    <div className="mb-4 mx-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-foreground">{selectedCount} selected</p>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <Button key={status} variant="outline" size="sm" onClick={() => onBulkStatusUpdate(status)}>
              <CheckCircle2 size={14} className="mr-2" />
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onExportCsv}>
          Export CSV
        </Button>
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 size={14} className="mr-2" />
          Delete Selected
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );
}
