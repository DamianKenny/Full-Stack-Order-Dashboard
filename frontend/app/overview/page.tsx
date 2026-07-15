'use client';

import { useOrders } from '@/hooks/useOrders';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import KPIRow from '@/components/KPIRow';
import TopProductsChart from '@/components/overview/TopProductsChart';
import RevenueByStatusChart from '@/components/overview/RevenueByStatusChart';
import RevenueTrendChart from '@/components/overview/RevenueTrendChart';
import CustomerSegmentationChart from '@/components/overview/CustomerSegmentationChart';
import OrderVolumeChart from '@/components/overview/OrderVolumeChart';
import ActivityFeed from '@/components/overview/ActivityFeed';
import SecondaryKPIs from '@/components/overview/SecondaryKPIs';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorBanner from '@/components/ErrorBanner';

export default function OverviewPage() {
  const { orders, isLoading, error, refetch } = useOrders();
  const [revenueDateFrom, setRevenueDateFrom] = useState('');
  const [revenueDateTo, setRevenueDateTo] = useState('');

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard overview</h1>
                <p className="text-xs text-slate-500">Monitor orders, revenue, and delivery performance</p>
              </div>
            </div>
          </div>

          <KPIRow orders={orders} />

          <div className="grid grid-cols-2 gap-5 px-8 mb-5">
            <RevenueTrendChart
              orders={orders}
              dateFrom={revenueDateFrom}
              dateTo={revenueDateTo}
              onDateFromChange={setRevenueDateFrom}
              onDateToChange={setRevenueDateTo}
            />
            <TopProductsChart orders={orders} />
          </div>

          <div className="grid grid-cols-2 gap-5 px-8 mb-5">
            <RevenueByStatusChart orders={orders} />
            <CustomerSegmentationChart orders={orders} />
          </div>

          <div className="grid grid-cols-2 gap-5 px-8 mb-5">
            <OrderVolumeChart orders={orders} />
            <ActivityFeed orders={orders} />
          </div>

          <div className="px-8 pb-10">
            <SecondaryKPIs orders={orders} />
          </div>
        </div>
      </div>
    </div>
  );
}
