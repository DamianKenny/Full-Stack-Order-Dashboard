import mongoose, { Schema } from 'mongoose';

export interface PredictionDocument extends mongoose.Document {
  productId: string;
  productName: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  generatedAt: Date;
  modelVersion: string;
  validUntil: Date;
}

const predictionSchema = new Schema<PredictionDocument>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  period: { 
    type: String, 
    required: true, 
    enum: ['monthly', 'quarterly', 'yearly']
  },
  predictedSales: { type: Number, required: true },
  lowerBound: { type: Number, required: true },
  upperBound: { type: Number, required: true },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  generatedAt: { type: Date, required: true, default: Date.now },
  modelVersion: { type: String, required: true },
  validUntil: { type: Date, required: true }
}, {
  versionKey: false,
  timestamps: false
});

// Compound index for efficient querying
predictionSchema.index({ productId: 1, period: 1, generatedAt: -1 });
predictionSchema.index({ period: 1, generatedAt: -1 });

export const PredictionModel = mongoose.model<PredictionDocument>('Prediction', predictionSchema);