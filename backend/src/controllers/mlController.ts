import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { PredictionModel } from '../schemas/predictionSchema';
import { ProductModelMongoDB } from '../models/ProductModelMongo';

// Types for predictions
export interface Prediction {
  productId: string;
  productName: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  generatedAt: Date;
}

export interface MLStatus {
  lastTraining: Date | null;
  modelVersion: string;
  totalPredictions: number;
  nextScheduledTraining: Date;
}

/**
 * POST /api/ml/train
 * Triggers ML training pipeline asynchronously
 */
export const triggerTraining = async (req: Request, res: Response) => {
  try {
    const pythonScript = path.join(__dirname, '../../../ml-service/train.py');
    
    // Try multiple Python executables for Windows compatibility
    const pythonCandidates = [
      process.env.PYTHON_INTERPRETER,
      'python',
      'python3',
      'py'
    ].filter(Boolean) as string[];
    
    console.log(`Starting ML training pipeline...`);
    console.log(`Script: ${pythonScript}`);
    console.log(`Trying Python interpreters: ${pythonCandidates.join(', ')}`);
    
    // Try each Python candidate until one works
    let pythonProcess: ReturnType<typeof spawn> | null = null;
    let usedInterpreter = '';
    
    // Use absolute path for script (ml-service is at project root)
    // __dirname = backend/src/controllers/, need ../../../ to reach project root
    const pythonScriptAbsolute = path.resolve(__dirname, '../../../ml-service/train.py');
    console.log(`Absolute script path: ${pythonScriptAbsolute}`);
    
    // Try to spawn Python directly without shell
    for (const candidate of pythonCandidates) {
      try {
        console.log(`Trying: ${candidate}`);
        pythonProcess = spawn(candidate, [pythonScriptAbsolute], {
          cwd: path.resolve(__dirname, '../../../ml-service'),
          env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' }
        });
        
        usedInterpreter = candidate;
        console.log(`✓ Using Python: ${candidate}`);
        break;
      } catch (error) {
        console.log(`✗ Failed: ${candidate} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      return res.status(500).json({
        success: false,
        message: 'No Python interpreter found',
        error: `Tried: ${pythonCandidates.join(', ')}. Install Python or set PYTHON_INTERPRETER in backend/.env`
      });
    }
    
    let stdout = '';
    let stderr = '';
    let hasResponded = false;
    
    pythonProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      console.log(`[ML Training] ${data.toString()}`);
    });
    
    pythonProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error(`[ML Training Error] ${data.toString()}`);
    });
    
    pythonProcess.on('error', (error) => {
      if (hasResponded) return;
      hasResponded = true;
      console.error(`Failed to start Python: ${error.message}`);
      console.error(`Attempted path: ${usedInterpreter}`);
      console.error(`Error details: ${JSON.stringify(error)}`);
      
      res.status(500).json({
        success: false,
        message: 'Python interpreter not found',
        error: `Cannot execute Python at: "${usedInterpreter}". Error: ${error.message}`,
        troubleshooting: [
          '1. Verify Python exists: Test running C:\\Python314\\python.exe in PowerShell',
          '2. If Python works manually but fails here, restart the backend server',
          '3. Ensure backend/.env has correct path and server was restarted',
          '4. Try running PowerShell as Administrator',
          '5. Check Windows Defender/antivirus is not blocking'
        ]
      });
    });
    
    pythonProcess.on('close', async (code) => {
      if (hasResponded) return;
      hasResponded = true;
      
      if (code !== 0) {
        console.error(`ML training failed with code ${code}`);
        res.status(500).json({
          success: false,
          message: 'Training failed',
          error: stderr || 'Unknown error',
          code
        });
        return;
      }
      
      console.log('ML training completed successfully');
      
      try {
        const predictionsPath = path.join(__dirname, '../../../ml-service/models/predictions.json');
        const predictionsData = JSON.parse(await fs.readFile(predictionsPath, 'utf-8'));
        
        await storePredictionsInMongoDB(predictionsData.predictions);
        
        res.json({
          success: true,
          message: 'Training completed successfully',
          predictions_generated: Object.keys(predictionsData.predictions).length,
          metadata: predictionsData.metadata,
          top_5: getTopPredictions(predictionsData.predictions, 5)
        });
        
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Training completed but failed to store predictions',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start training',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/ml/predictions/:period
 */
export const getPredictions = async (req: Request, res: Response) => {
  try {
    const { period } = req.params;
    const { limit = 50, sortBy = 'predictedSales' } = req.query;
    
    if (!['monthly', 'quarterly', 'yearly'].includes(period as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Use: monthly, quarterly, or yearly'
      });
    }
    
    const predictionFilter = { period: period as 'monthly' | 'quarterly' | 'yearly' };
    const predictions = await PredictionModel.find(predictionFilter)
      .sort({ generatedAt: -1, [sortBy as string]: -1 })
      .limit(Number(limit))
      .lean();
    
    const seen = new Set<string>();
    const uniquePredictions = predictions.filter((pred) => {
      if (seen.has(pred.productId)) return false;
      seen.add(pred.productId);
      return true;
    });
    
    res.json({
      success: true,
      period,
      count: uniquePredictions.length,
      data: uniquePredictions
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch predictions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/ml/top-products/:period
 */
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { period } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!['monthly', 'quarterly', 'yearly'].includes(period as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Use: monthly, quarterly, or yearly'
      });
    }
    
    const predictionFilter = { period: period as 'monthly' | 'quarterly' | 'yearly' };
    const predictions = await PredictionModel.find(predictionFilter)
      .sort({ generatedAt: -1, predictedSales: -1 })
      .limit(limit * 2)
      .lean();
    
    const seen = new Set<string>();
    const uniquePredictions = predictions.filter((pred) => {
      if (seen.has(pred.productId)) return false;
      seen.add(pred.productId);
      return true;
    }).slice(0, limit);
    
    res.json({
      success: true,
      period,
      limit,
      count: uniquePredictions.length,
      data: uniquePredictions
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/ml/status
 */
export const getMLStatus = async (req: Request, res: Response) => {
  try {
    const latestPrediction = await PredictionModel.findOne().sort({ generatedAt: -1 }).lean();
    const totalPredictions = await PredictionModel.countDocuments();
    
    const status: MLStatus = {
      lastTraining: latestPrediction?.generatedAt || null,
      modelVersion: latestPrediction?.modelVersion || 'unknown',
      totalPredictions,
      nextScheduledTraining: getNextScheduledTraining()
    };
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ML status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/ml/export/:period
 */
export const exportPredictionsCSV = async (req: Request, res: Response) => {
  try {
    const { period } = req.params;
    
    if (!['monthly', 'quarterly', 'yearly'].includes(period as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period'
      });
    }
    
    const predictionFilter = { period: period as 'monthly' | 'quarterly' | 'yearly' };
    const predictions = await PredictionModel.find(predictionFilter)
      .sort({ predictedSales: -1 })
      .lean();
    
    const seen = new Set<string>();
    const uniquePredictions = predictions.filter((pred) => {
      if (seen.has(pred.productId)) return false;
      seen.add(pred.productId);
      return true;
    });
    
    const headers = ['Product Name', 'Period', 'Predicted Sales', 'Lower Bound', 'Upper Bound', 'Confidence %', 'Generated At'];
    const rows = uniquePredictions.map(p => [
      p.productName,
      p.period,
      p.predictedSales,
      p.lowerBound,
      p.upperBound,
      p.confidence,
      p.generatedAt.toISOString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const filename = `predictions_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export predictions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============ HELPER FUNCTIONS ============

async function storePredictionsInMongoDB(predictions: Record<string, any>) {
  console.log('Storing predictions in MongoDB...');
  
  const now = new Date();
  const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  await PredictionModel.deleteMany({});
  
  const products = await ProductModelMongoDB.findAll();
  const productNameToId = new Map(products.map(p => [p.name, p.id]));
  
  const bulkOps: any[] = [];
  
  for (const [productName, preds] of Object.entries(predictions)) {
    const productId = productNameToId.get(productName) || productName.toLowerCase().replace(/\s+/g, '_');
    
    const periods = [
      { key: 'next_month', period: 'monthly' as const, prefix: 'monthly' },
      { key: 'next_quarter', period: 'quarterly' as const, prefix: 'quarterly' },
      { key: 'next_year', period: 'yearly' as const, prefix: 'yearly' }
    ];
    
    for (const { key, period, prefix } of periods) {
      const pred = preds as any;
      
      bulkOps.push({
        updateOne: {
          filter: { productId, period },
          update: {
            $set: {
              productId,
              productName,
              period,
              predictedSales: pred[key],
              lowerBound: pred[`${prefix}_lower`],
              upperBound: pred[`${prefix}_upper`],
              confidence: 80,
              generatedAt: now,
              modelVersion: 'v1.0_prophet',
              validUntil
            }
          },
          upsert: true
        }
      });
    }
  }
  
  if (bulkOps.length > 0) {
    await PredictionModel.bulkWrite(bulkOps);
    console.log(`✓ Stored ${bulkOps.length} predictions`);
  }
}

async function storeModelsInGridFS() {
  console.log('Storing models in GridFS...');
  
  const modelsDir = path.join(__dirname, '../../../ml-service/models');
  
  try {
    const files = await fs.readdir(modelsDir);
    const modelFiles = files.filter(f => f.endsWith('.pkl'));
    console.log(`Found ${modelFiles.length} model files to store`);
  } catch (error) {
    console.log('No models directory found (this is okay for MVP)');
  }
}

function getTopPredictions(predictions: Record<string, any>, n: number) {
  return Object.entries(predictions)
    .map(([name, preds]) => ({
      product: name,
      next_month: (preds as any).next_month,
      next_quarter: (preds as any).next_quarter,
      next_year: (preds as any).next_year
    }))
    .sort((a, b) => b.next_month - a.next_month)
    .slice(0, n);
}

function getNextScheduledTraining(): Date {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  nextSunday.setHours(2, 0, 0, 0);
  
  if (nextSunday <= now) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }
  
  return nextSunday;
}