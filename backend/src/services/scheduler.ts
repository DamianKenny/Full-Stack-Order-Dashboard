import cron from 'node-cron';
import { triggerTraining } from '../controllers/mlController';
import { PredictionModel } from '../schemas/predictionSchema';

/**
 * Scheduler service for automated ML model retraining
 * Retrains the model every Sunday at 2 AM
 */

let schedulerTask: cron.ScheduledTask | null = null;
let isTraining = false;

/**
 * Start the ML training scheduler
 */
export const startMLScheduler = (): void => {
  if (schedulerTask) {
    console.log('ML Scheduler already running');
    return;
  }

  // Cron expression: Every Sunday at 2:00 AM
  // Format: minute hour day month day-of-week
  const cronExpression = '0 2 * * 0';

  console.log('Starting ML training scheduler...');
  console.log(`Schedule: Every Sunday at 2:00 AM`);

  schedulerTask = cron.schedule(cronExpression, async () => {
    console.log('\n[Scheduler] Starting scheduled ML training...');
    await runScheduledTraining();
  });

  console.log('✓ ML Scheduler started');
};

/**
 * Stop the ML training scheduler
 */
export const stopMLScheduler = (): void => {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('ML Scheduler stopped');
  }
};

/**
 * Run scheduled training
 */
async function runScheduledTraining(): Promise<void> {
  // Prevent concurrent training runs
  if (isTraining) {
    console.log('[Scheduler] Training already in progress, skipping this run');
    return;
  }

  isTraining = true;

  try {
    // Check if training is needed (e.g., if predictions are stale or missing)
    const shouldTrain = await checkIfTrainingNeeded();

    if (!shouldTrain) {
      console.log('[Scheduler] Training not needed, predictions are up-to-date');
      isTraining = false;
      return;
    }

    console.log('[Scheduler] Starting training pipeline...');

    // Set encoding to UTF-8 for Windows compatibility
    process.env.PYTHONIOENCODING = 'utf-8';
    
    // Trigger training (this will run the Python script)
    // We need to create a mock request/response since triggerTraining expects Express types
    const mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {},
    } as any;

    const mockRes = {
      json: (data: any) => {
        if (data.success) {
          console.log('[Scheduler] Training completed successfully');
          console.log(`[Scheduler] Generated ${data.predictions_generated} predictions`);
        } else {
          console.error('[Scheduler] Training failed:', data.error);
        }
      },
      status: (code: number) => ({
        json: (data: any) => {
          console.error(`[Scheduler] Training failed with status ${code}:`, data);
        },
      }),
    } as any;

    // Execute training with a timeout
    const trainingPromise = triggerTraining(mockReq, mockRes);
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ timeout: true });
      }, 3600000); // 1 hour timeout
    });

    const result = await Promise.race([trainingPromise, timeoutPromise]);

    if ((result as any).timeout) {
      console.error('[Scheduler] Training timed out after 1 hour');
    }

  } catch (error) {
    console.error('[Scheduler] Error during training:', error);
  } finally {
    isTraining = false;
  }
}

/**
 * Check if training is needed based on:
 * 1. No predictions exist
 * 2. Predictions are older than 7 days
 * 3. Last training failed
 */
async function checkIfTrainingNeeded(): Promise<boolean> {
  try {
    // Get the most recent prediction
    const latestPrediction = await PredictionModel.findOne()
      .sort({ generatedAt: -1 })
      .lean();

    if (!latestPrediction) {
      console.log('[Scheduler] No predictions found, training needed');
      return true;
    }

    // Check if predictions are stale (older than 7 days)
    const trainingDate = new Date(latestPrediction.generatedAt);
    const now = new Date();
    const daysSinceTraining = (now.getTime() - trainingDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceTraining > 7) {
      console.log(`[Scheduler] Predictions are ${daysSinceTraining.toFixed(1)} days old, training needed`);
      return true;
    }

    return false;

  } catch (error) {
    console.error('[Scheduler] Error checking training status:', error);
    return true; // Train on error to be safe
  }
}

/**
 * Get scheduler status
 */
export const getSchedulerStatus = (): { running: boolean; nextRun: string | null } => {
  if (!schedulerTask) {
    return { running: false, nextRun: null };
  }

  // Node-cron doesn't provide next run time easily, so we'll calculate it
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  nextSunday.setHours(2, 0, 0, 0);

  if (nextSunday <= now) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  return {
    running: true,
    nextRun: nextSunday.toISOString(),
  };
};