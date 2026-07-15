'use client';

import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface SecondaryKPIsProps {
  orders: Order[];
}

export default function SecondaryKPIs({ orders }: SecondaryKPIsProps) {
  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const fulfillmentRate = orders.length > 0 ? (deliveredCount / orders.length) * 100 : 0;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const ordersToday = orders.filter((o) => o.createdAt?.startsWith(today)).length;

  const kpis = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-foreground',
      bg: 'bg-muted',
    },
    {
      label: 'Orders Today',
      value: ordersToday.toString(),
      icon: Calendar,
      color: 'text-foreground',
      bg: 'bg-muted',
    },
    {
      label: 'Fulfillment Rate',
      value: `${fulfillmentRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-status-delivered-text',
      bg: 'bg-status-delivered-fill',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} size="sm" className="rounded-[24px] card-surface shadow-soft overflow-hidden border card-glow">
            <CardContent className="px-5 py-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[12px] uppercase tracking-[0.26em] text-slate-500 font-semibold">
                  {kpi.label}
                </p>
                <div className={`w-12 h-12 rounded-3xl flex items-center justify-center ${kpi.bg}`}>
                  <Icon size={18} className={kpi.color} />
                </div>
              </div>
              <span className="text-3xl font-black text-slate-900 leading-none">
                {kpi.value}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}