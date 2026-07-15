'use client';

import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RevenueByStatusChartProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'var(--status-pending-text)',
  Shipped: 'var(--status-shipped-text)',
  Delivered: 'var(--status-delivered-text)',
};

export default function RevenueByStatusChart({ orders }: RevenueByStatusChartProps) {
  // Group by status and sum totals
  const revenueByStatus: Record<string, number> = {};
  
  orders.forEach((order) => {
    revenueByStatus[order.status] = (revenueByStatus[order.status] || 0) + order.total;
  });

  const chartData = Object.entries(revenueByStatus).map(([status, value]) => ({
    status,
    value: Math.round(value * 100) / 100,
  }));

  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card size="sm" className="rounded-xl shadow-none border">
        <CardContent className="p-5 h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Revenue by Status</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={84}
              outerRadius={130}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#ec4899'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
                fontSize: '13px',
                color: '#111827',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-3 justify-center mt-4">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-3 rounded-3xl bg-slate-50 px-3 py-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[item.status] || '#ec4899' }}
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">{item.status}</p>
                <p className="text-xs text-slate-500">{Math.round((item.value / totalRevenue) * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 text-center mt-4">
          Total revenue: <span className="font-semibold text-slate-900">${totalRevenue.toFixed(2)}</span>
        </p>
      </CardContent>
    </Card>
  );
}