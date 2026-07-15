'use client';

import { Order } from '../types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Clock, Truck, CheckCircle2 } from 'lucide-react';

interface KPIRowProps {
  orders: Order[];
}

export default function KPIRow({ orders }: KPIRowProps) {
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Simple sparkline data (mock)
  const sparklinePoints = [12, 19, 15, 22, 18, 25, totalOrders];

  return (
    <div className="grid grid-cols-4 gap-5 px-8 py-3">
      {/* Card 1: Total Orders */}
      <Card size="sm" className="rounded-[24px] card-gradient-1 shadow-soft overflow-hidden border border-white/10 card-glow">
        <CardContent className="px-6 py-3 flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/75 font-semibold">Total Orders</p>
              <p className="text-5xl font-black text-white mt-3">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-3xl bg-white/15 flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
          </div>
          <svg width="100%" height="40" className="opacity-70" aria-label="7-day order trend">
            <polyline
              points={sparklinePoints.map((val, i) => `${(i * 100) / (sparklinePoints.length - 1)},${40 - val / 1.1}`).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-xs text-white/70">All time orders</p>
        </CardContent>
      </Card>

      {/* Card 2: Pending */}
      <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
        <CardContent className="px-6 py-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Pending</p>
            <div className="w-12 h-12 rounded-3xl bg-amber-100 flex items-center justify-center">
              <Clock size={18} className="text-amber-700" />
            </div>
          </div>
          <span className="text-5xl font-black text-amber-900">{pendingCount}</span>
          <p className="text-sm text-slate-500">Awaiting shipment</p>
        </CardContent>
      </Card>

      {/* Card 3: Shipped */}
      <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
        <CardContent className="px-6 py-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Shipped</p>
            <div className="w-12 h-12 rounded-3xl bg-sky-100 flex items-center justify-center">
              <Truck size={18} className="text-sky-700" />
            </div>
          </div>
          <span className="text-5xl font-black text-sky-900">{shippedCount}</span>
          <p className="text-sm text-slate-500">In transit</p>
        </CardContent>
      </Card>

      {/* Card 4: Delivered */}
      <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
        <CardContent className="px-6 py-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Delivered</p>
            <div className="w-12 h-12 rounded-3xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-700" />
            </div>
          </div>
          <span className="text-5xl font-black text-emerald-900">{deliveredCount}</span>
          <p className="text-sm text-slate-500">Completed orders</p>
        </CardContent>
      </Card>
    </div>
  );
}