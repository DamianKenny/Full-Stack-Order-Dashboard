'use client';

import { Order } from '../types/order';
import { TrendingUp } from 'lucide-react';

interface KPIRowProps {
  orders: Order[];
}

export default function KPIRow({ orders }: KPIRowProps) {
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const deliveredThisWeek = orders.filter((o) => {
    if (!o.createdAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return o.status === 'Delivered' && new Date(o.createdAt) > weekAgo;
  }).length;

  // Simple sparkline data (mock - in real app, this would be historical)
  const sparklinePoints = [12, 19, 15, 22, 18, 25, totalOrders];

  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 px-8 py-6">
      {/* Card 1: Total Orders with Sparkline */}
      <div className="border border-default rounded-xl bg-surface p-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-faint">Total Orders</p>
        <div className="flex items-end justify-between">
          <span className="text-[28px] font-semibold text-primary">{totalOrders}</span>
          <svg width="60" height="24" className="opacity-70">
            <polyline
              points={sparklinePoints
                .map((val, i) => `${(i * 60) / (sparklinePoints.length - 1)},${24 - val / 2}`)
                .join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Pending */}
      <div className="border border-default rounded-xl bg-surface p-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-faint">Pending</p>
        <span className="text-lg font-semibold" style={{ color: 'var(--pending-text)' }}>
          {pendingCount}
        </span>
        <p className="text-xs text-secondary">Awaiting shipment</p>
      </div>

      {/* Card 3: Delivered This Week */}
      <div className="border border-default rounded-xl bg-surface p-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-faint">Delivered This Week</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold" style={{ color: 'var(--delivered-text)' }}>
            {deliveredThisWeek}
          </span>
          <span className="text-xs text-secondary flex items-center">
            ↑12%
          </span>
        </div>
      </div>
    </div>
  );
}