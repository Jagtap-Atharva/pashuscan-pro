import { EvaluationRecord } from '@/types/evaluation';
import { storage } from './storage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const bpaApi = {
  async pushRecord(record: EvaluationRecord): Promise<void> {
    const settings = storage.getSettings();
    
    if (!settings.bpaApi.enabled || !settings.bpaApi.endpoint) {
      throw new Error('BPA API not configured');
    }

    const payload = {
      id: record.id,
      timestamp: new Date(record.timestamp).toISOString(),
      operator: {
        name: record.operatorName,
      },
      location: record.location,
      animalId: record.animalId,
      notes: record.notes,
      measurements: record.measurements,
      classification: {
        label: record.classificationLabel,
        score: record.classificationScore,
        confidence: record.confidenceBand,
        explanation: record.explanation,
      },
      images: {
        original: record.originalImage,
        overlay: record.overlayImage,
      },
      calibration: {
        method: record.calibrationMethod,
        value: record.calibrationValue,
      },
    };

    const response = await fetch(settings.bpaApi.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.bpaApi.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`BPA API error: ${response.status} ${response.statusText}`);
    }
  },

  async pushWithRetry(record: EvaluationRecord, maxAttempts = 5): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Update attempt count
        record.syncAttempts = attempt;
        record.lastSyncAttempt = Date.now();
        storage.saveRecord(record);

        await this.pushRecord(record);
        
        // Success
        record.status = 'synced';
        record.syncError = undefined;
        storage.saveRecord(record);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxAttempts) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          await delay(backoffMs);
        }
      }
    }

    // All attempts failed
    record.status = 'failed';
    record.syncError = lastError?.message || 'Unknown error';
    storage.saveRecord(record);
    throw lastError;
  },
};