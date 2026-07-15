'use client';

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
import { format, subDays, startOfDay } from 'date-fns';

interface OrderVolumeChartProps {
  orders: Order[];
}

export default function OrderVolumeChart({ orders }: OrderVolumeChartProps) {
  // Get last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(startOfDay(new Date()), 6 - i);
    return format(date, 'MMM dd');
  });

  // Count orders per day
  const volumeByDay = days.map((dayLabel) => {
    const dayStart = subDays(startOfDay(new Date()), 6 - days.indexOf(dayLabel));
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = orders.filter((order) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    }).length;

    return { day: dayLabel, orders: count };
  });

  if (volumeByDay.every((d) => d.orders === 0)) {
    return (
      <Card size="sm" className="rounded-xl shadow-none border">
        <CardContent className="p-5 h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No order volume data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-5">7-Day Order Volume</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={volumeByDay}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(15,23,42,0.12)', strokeWidth: 2 }}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
                fontSize: '13px',
                color: '#111827',
              }}
              formatter={(value) => [`${value} orders`, 'Count']}
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="url(#orderVolumeGradient)" 
              strokeWidth={3}
              dot={{ fill: '#F97316', r: 4 }}
              activeDot={{ r: 6, fill: '#F97316' }}
            >
              <defs>
                <linearGradient id="orderVolumeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}