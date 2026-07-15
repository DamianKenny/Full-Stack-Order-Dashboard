'use client';

import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Package, Truck, CheckCircle2, type LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  orders: Order[];
}

const STATUS_ICONS: Record<string, LucideIcon> = {
  Pending: Clock,
  Shipped: Truck,
  Delivered: CheckCircle2,
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'text-status-pending-text',
  Shipped: 'text-status-shipped-text',
  Delivered: 'text-status-delivered-text',
};

export default function ActivityFeed({ orders }: ActivityFeedProps) {
  // Sort by createdAt desc, take top 10
  const recentOrders = [...orders]
    .filter((o) => o.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 10);

  if (recentOrders.length === 0) {
    return (
      <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
        <CardContent className="p-6 h-[300px] flex items-center justify-center">
          <p className="text-sm text-slate-500">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-5">Recent Activity</h3>
        <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
          {recentOrders.map((order) => {
            const Icon = STATUS_ICONS[order.status] || Package;
            const colorClass = STATUS_COLORS[order.status] || 'text-slate-900';
            
            return (
              <div key={order.id} className="flex items-start gap-4 rounded-3xl bg-slate-50 p-4">
                <div className={`mt-0.5 rounded-3xl p-3 bg-white shadow-sm ${colorClass.replace('text-', 'bg-')}20`}>
                  <Icon size={18} strokeWidth={1.75} className={colorClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {order.customerName}&apos;s order <span className="text-slate-500">#{order.id.slice(-6)}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(order.createdAt!), { addSuffix: true })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : order.status === 'Shipped' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {order.status}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}