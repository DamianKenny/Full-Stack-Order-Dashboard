'use client';

import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CustomerSegmentationChartProps {
  orders: Order[];
}

const SEGMENT_COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6'];

export default function CustomerSegmentationChart({ orders }: CustomerSegmentationChartProps) {
  const segmentCounts = orders.reduce(
    (counts, order) => {
      const status = order.status;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(segmentCounts).map(([status, value]) => ({ status, value }));

  if (chartData.length === 0) {
    return (
      <Card size="sm" className="rounded-xl shadow-none border">
        <CardContent className="p-5 h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No customer segmentation data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Customer Segmentation</h3>
            <p className="text-sm text-slate-500">Status-based customer segmentation for orders.</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={4}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.status} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value ?? 0} orders`, 'Orders']}
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
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {chartData.map((item, index) => (
            <div key={item.status} className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }} />
                <span className="text-sm font-semibold text-slate-900">{item.status}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{item.value} orders</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
