import { useState, useEffect, useCallback } from 'react';
import { Prediction, MLStatus } from '@/types/prediction';
import { mlAPI } from '@/services/api';

export const usePredictions = (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mlAPI.getPredictions(period);
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, error, refetch: fetchPredictions };
};

export const useTopProducts = (
  period: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  limit: number = 10
) => {
  const [topProducts, setTopProducts] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mlAPI.getTopProducts(period, limit);
      setTopProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top products');
    } finally {
      setLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  return { topProducts, loading, error, refetch: fetchTopProducts };
};

export const useMLStatus = () => {
  const [status, setStatus] = useState<MLStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mlAPI.getMLStatus();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ML status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
};

export const useTraining = () => {
  const [training, setTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerTraining = useCallback(async () => {
    setTraining(true);
    setError(null);
    try {
      const response = await mlAPI.triggerTraining();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Training failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTraining(false);
    }
  }, []);

  return { training, error, triggerTraining };
};

export const useExportPredictions = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = useCallback(async (period: 'monthly' | 'quarterly' | 'yearly') => {
    setExporting(true);
    setError(null);
    try {
      const blob = await mlAPI.exportPredictionsCSV(period);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `predictions_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, error, exportCSV };
};