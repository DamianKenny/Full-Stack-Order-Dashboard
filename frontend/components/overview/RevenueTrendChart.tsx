'use client';

import { useMemo } from 'react';
import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DateRangePicker from '@/components/filters/DateRangePicker';
import { addDays, endOfDay, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';

interface RevenueTrendChartProps {
  orders: Order[];
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

const formatLabel = (date: Date) => format(date, 'MMM d');

export default function RevenueTrendChart({
  orders,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: RevenueTrendChartProps) {
  const rangeStart = useMemo(() => {
    const parsed = dateFrom ? parseISO(dateFrom) : addDays(startOfDay(new Date()), -29);
    return isNaN(parsed.getTime()) ? addDays(startOfDay(new Date()), -29) : startOfDay(parsed);
  }, [dateFrom]);

  const rangeEnd = useMemo(() => {
    const parsed = dateTo ? parseISO(dateTo) : new Date();
    return isNaN(parsed.getTime()) ? new Date() : endOfDay(parsed);
  }, [dateTo]);

  const chartData = useMemo(() => {
    const days: Date[] = [];
    let current = startOfDay(rangeStart);

    while (current <= rangeEnd) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }

    return days.map((day) => {
      const revenue = orders.reduce((sum, order) => {
        if (!order.createdAt) return sum;
        const created = parseISO(order.createdAt);
        if (isWithinInterval(created, { start: day, end: endOfDay(day) })) {
          return sum + order.total;
        }
        return sum;
      }, 0);

      return {
        label: formatLabel(day),
        revenue: Math.round(revenue * 100) / 100,
      };
    });
  }, [orders, rangeStart, rangeEnd]);

  const chartHasData = chartData.some((entry) => entry.revenue > 0);

  return (
    <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
      <CardContent className="p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Revenue Trend</h3>
            <p className="text-sm text-slate-500">Track revenue over time using a custom date range.</p>
          </div>
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
          />
        </div>

        {chartHasData ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value ?? 0).toFixed(2)}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(15,23,42,0.08)',
                    borderRadius: '14px',
                    boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
                    fontSize: '13px',
                    color: '#111827',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-3xl bg-slate-50">
            <p className="text-sm text-slate-500">No revenue data available for the selected range.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
