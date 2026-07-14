'use client';

import { Order } from '../types/order';
import { Card, CardContent } from '@/components/ui/card';

interface KPIRowProps {
  orders: Order[];
}

export default function KPIRow({ orders }: KPIRowProps) {
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Simple sparkline data (mock - in real app, this would be historical)
  const sparklinePoints = [12, 19, 15, 22, 18, 25, totalOrders];
  const sparklinePath = sparklinePoints
    .map((val, i) => `${(i * 60) / (sparklinePoints.length - 1)},${24 - val / 2}`)
    .join(' ');

  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 px-8 py-6">
      {/* Card 1: Total Orders with Sparkline */}
      <Card size="sm" className="p-5 gap-2 rounded-xl shadow-none border">
        <CardContent className="p-0 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Orders</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-semibold text-foreground">{totalOrders}</span>
            <svg width="60" height="24" className="opacity-70" aria-label="7-day order trend">
              <polyline
                points={sparklinePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Pending */}
      <Card size="sm" className="p-5 gap-2 rounded-xl shadow-none border">
        <CardContent className="p-0 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
          <span className="text-lg font-semibold" style={{ color: 'var(--status-pending-text)' }}>
            {pendingCount}
          </span>
          <p className="text-xs text-muted-foreground">Awaiting shipment</p>
        </CardContent>
      </Card>

      {/* Card 3: Delivered */}
      <Card size="sm" className="p-5 gap-2 rounded-xl shadow-none border">
        <CardContent className="p-0 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Delivered</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold" style={{ color: 'var(--status-delivered-text)' }}>
              {deliveredCount}
            </span>
            <span className="text-xs text-muted-foreground">↑12%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}