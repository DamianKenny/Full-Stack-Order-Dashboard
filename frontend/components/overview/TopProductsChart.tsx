'use client';

import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TopProductsChartProps {
  orders: Order[];
}

export default function TopProductsChart({ orders }: TopProductsChartProps) {
  // Parse items and count frequency
  const productCounts: Record<string, number> = {};
  
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const productName = item.trim();
      if (productName) {
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      }
    });
  });

  // Convert to array, sort by count, take top 8
  const chartData = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <Card size="sm" className="rounded-xl shadow-none border">
        <CardContent className="p-5 h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No product data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-5">Top Products</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" horizontal={false} vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              tick={{ fill: '#4B5563', fontSize: 13 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(15,23,42,0.04)' }}
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
                fontSize: '13px',
                color: '#111827',
              }}
            />
            <Bar dataKey="count" fill="url(#topProductsGradient)" radius={[0, 12, 12, 0]}>
              <defs>
                <linearGradient id="topProductsGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}