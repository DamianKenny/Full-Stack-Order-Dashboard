export interface Prediction {
  productId: string;
  productName: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  generatedAt: string;
}

export interface MLStatus {
  lastTraining: string | null;
  modelVersion: string;
  totalPredictions: number;
  nextScheduledTraining: string;
}

export interface PredictionsResponse {
  success: boolean;
  period: string;
  count: number;
  data: Prediction[];
}

export interface MLStatusResponse {
  success: boolean;
  data: MLStatus;
}

export interface TrainingResponse {
  success: boolean;
  message: string;
  predictions_generated: number;
  metadata: {
    generated_at: string;
    training_data_range: string;
    total_orders: number;
    total_products: number;
    model_version: string;
    confidence_interval: string;
  };
  top_5: Array<{
    product: string;
    next_month: number;
    next_quarter: number;
    next_year: number;
  }>;
}