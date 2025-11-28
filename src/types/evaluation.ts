export interface AnimalMeasurements {
  bodyLength: number; // cm
  heightAtWithers: number; // cm
  chestWidth: number; // cm
  rumpAngle: number; // degrees
  pelvicWidth: number; // cm
  legLengthRatio: number; // front/back ratio
}

export interface Keypoint {
  x: number;
  y: number;
  label: string;
}

export interface ClassificationScore {
  cattle: number;
  buffalo: number;
}

export type ClassificationLabel = 'Cattle' | 'Buffalo' | 'Uncertain';

export type RecordStatus = 'synced' | 'queued' | 'failed' | 'local';

export interface EvaluationRecord {
  id: string;
  timestamp: number;
  operatorName: string;
  location: string;
  animalId?: string;
  notes?: string;
  
  // Image data
  originalImage: string; // base64 or blob URL
  overlayImage?: string; // base64 or blob URL
  
  // Measurements
  measurements: AnimalMeasurements;
  keypoints: Keypoint[];
  
  // Classification
  classificationLabel: ClassificationLabel;
  classificationScore: ClassificationScore;
  explanation: string[];
  confidenceBand: number;
  
  // Calibration
  calibrationMethod: 'scale-detection' | 'reference-height' | 'default';
  calibrationValue?: number;
  
  // Sync status
  status: RecordStatus;
  syncAttempts: number;
  lastSyncAttempt?: number;
  syncError?: string;
}

export interface BPAApiConfig {
  endpoint: string;
  apiKey: string;
  enabled: boolean;
}

export interface AppSettings {
  bpaApi: BPAApiConfig;
  measurementUnit: 'metric' | 'imperial';
  calibrationOffset: number;
  inferenceMode: 'client' | 'server';
}