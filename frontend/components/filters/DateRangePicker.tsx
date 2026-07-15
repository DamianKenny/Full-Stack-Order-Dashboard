'use client';

import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export default function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
      <CalendarDays size={16} className="text-muted-foreground" />
      <Input
        type="date"
        value={dateFrom}
        onChange={(event) => onDateFromChange(event.target.value)}
        className="h-8 w-36 border-0 bg-transparent p-0 shadow-none"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        value={dateTo}
        onChange={(event) => onDateToChange(event.target.value)}
        className="h-8 w-36 border-0 bg-transparent p-0 shadow-none"
      />
    </div>
  );
}
