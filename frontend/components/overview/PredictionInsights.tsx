'use client';

import { Prediction } from '@/types/prediction';
import { useMLStatus, useTraining, useExportPredictions } from '@/hooks/usePredictions';

interface PredictionInsightsProps {
  period: 'monthly' | 'quarterly' | 'yearly';
}

export default function PredictionInsights({ period }: PredictionInsightsProps) {
  const { status, loading: statusLoading } = useMLStatus();
  const { training, error: trainingError, triggerTraining } = useTraining();
  const { exportCSV, exporting } = useExportPredictions();

  const handleExport = async () => {
    try {
      await exportCSV(period);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRetrain = async () => {
    try {
      await triggerTraining();
      // Refresh the page or refetch data
      window.location.reload();
    } catch (error) {
      console.error('Training failed:', error);
    }
  };

  if (statusLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-4 rounded bg-slate-100"></div>
            <div className="h-4 rounded bg-slate-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Prediction Insights</h3>

      {/* Model Status */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
          <span className="text-sm text-slate-600">Last Training</span>
          <span className="text-sm font-medium text-slate-900">
            {status?.lastTraining
              ? new Date(status.lastTraining).toLocaleString()
              : 'Never'}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
          <span className="text-sm text-slate-600">Model Version</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {status?.modelVersion || 'N/A'}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
          <span className="text-sm text-slate-600">Total Predictions</span>
          <span className="text-sm font-medium text-slate-900">
            {status?.totalPredictions || 0}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleRetrain}
          disabled={training}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {training ? 'Training in Progress...' : '🔄 Retrain Model'}
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : '📥 Export Predictions CSV'}
        </button>
      </div>

      {/* Error Message */}
      {trainingError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-600">{trainingError}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="text-xs text-blue-700">
          <strong>Auto-retraining:</strong> Model retrains automatically every Sunday at 2 AM.
        </p>
      </div>
    </div>
  );
}