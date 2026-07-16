'use client';

import { useMemo } from 'react';
import { useTopProducts } from '@/hooks/usePredictions';

interface PredictedTopProductsChartProps {
  period: 'monthly' | 'quarterly' | 'yearly';
  onPeriodChange: (period: 'monthly' | 'quarterly' | 'yearly') => void;
  onExportCSV?: () => void;
  exporting?: boolean;
}

export default function PredictedTopProductsChart({
  period,
  onPeriodChange,
  onExportCSV,
  exporting
}: PredictedTopProductsChartProps) {
  const { topProducts, loading, error, refetch } = useTopProducts(period, 10);
  const maxValue = useMemo(() => {
    if (!topProducts.length) return 0;
    return Math.max(...topProducts.map(p => p.predictedSales || 0));
  }, [topProducts]);

  const periods = [
    { value: 'monthly' as const, label: 'Month' },
    { value: 'quarterly' as const, label: 'Quarter' },
    { value: 'yearly' as const, label: 'Year' },
  ];

  const barColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-slate-200" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">Error loading predictions: {error}</p>
        <button
          onClick={refetch}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Predicted Top Products
          </h3>
          <p className="text-xs text-slate-500">
            ML-powered sales forecasts for next {period}
          </p>
        </div>
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            disabled={exporting || !topProducts.length}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : '📥 Export CSV'}
          </button>
        )}
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2 rounded-md bg-slate-100 p-1">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {topProducts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-400">
          <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No predictions available</p>
          <p className="mt-1 text-xs">Train the model to see forecasts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topProducts.map((product, index) => {
            const safePredicted = product.predictedSales || 0;
            const safeLower = product.lowerBound || 0;
            const safeUpper = product.upperBound || 0;
            const pct = maxValue > 0 ? (safePredicted / maxValue) * 100 : 0;
            const lowerPct = maxValue > 0 ? (safeLower / maxValue) * 100 : 0;
            const upperPct = maxValue > 0 ? (safeUpper / maxValue) * 100 : 0;
            const color = barColors[index % barColors.length];
            const marginLeft = `${lowerPct}%`;
            const width = `${upperPct}%`;

            return (
              <div key={product.productId} className="group">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {product.productName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      {safePredicted.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-slate-500">units</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="relative h-8">
                  <div className="absolute inset-y-0 left-7 right-0 flex items-center">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="pointer-events-none absolute left-7 top-full z-10 mt-1 hidden rounded-md border border-slate-200 bg-white px-3 py-2 shadow-md group-hover:block">
                    <p className="text-xs font-medium text-slate-900">
                      {product.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Predicted: <span className="font-semibold">{safePredicted.toFixed(1)}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Range: {safeLower.toFixed(1)} - {safeUpper.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Confidence: {product.confidence}%
                    </p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="ml-7 mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Lower: {safeLower.toFixed(1)}</span>
                      <span>Upper: {safeUpper.toFixed(1)}</span>
                    </div>
                    <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${color} opacity-40`}
                        style={{ width, marginLeft }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}