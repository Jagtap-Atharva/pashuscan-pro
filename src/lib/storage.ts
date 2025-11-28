import { EvaluationRecord, AppSettings } from '@/types/evaluation';

const RECORDS_KEY = 'animal_evaluation_records';
const SETTINGS_KEY = 'animal_evaluation_settings';

// Encrypt/decrypt helper (simple implementation for local storage)
const encryptApiKey = (key: string): string => {
  return btoa(key); // Base64 encoding (use better encryption in production)
};

const decryptApiKey = (encrypted: string): string => {
  return atob(encrypted);
};

export const storage = {
  // Records
  getRecords: (): EvaluationRecord[] => {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRecord: (record: EvaluationRecord): void => {
    const records = storage.getRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  deleteRecord: (id: string): void => {
    const records = storage.getRecords().filter(r => r.id !== id);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  getRecord: (id: string): EvaluationRecord | null => {
    const records = storage.getRecords();
    return records.find(r => r.id === id) || null;
  },

  // Settings
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        bpaApi: {
          endpoint: '',
          apiKey: '',
          enabled: false,
        },
        measurementUnit: 'metric',
        calibrationOffset: 0,
        inferenceMode: 'client',
      };
    }
    
    const settings = JSON.parse(data);
    if (settings.bpaApi.apiKey) {
      settings.bpaApi.apiKey = decryptApiKey(settings.bpaApi.apiKey);
    }
    return settings;
  },

  saveSettings: (settings: AppSettings): void => {
    const toSave = { ...settings };
    if (toSave.bpaApi.apiKey) {
      toSave.bpaApi.apiKey = encryptApiKey(toSave.bpaApi.apiKey);
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  },

  // Export
  exportToJSON: (): string => {
    const records = storage.getRecords();
    return JSON.stringify(records, null, 2);
  },

  exportToCSV: (): string => {
    const records = storage.getRecords();
    if (records.length === 0) return '';

    const headers = [
      'ID', 'Timestamp', 'Operator', 'Location', 'Animal ID', 
      'Classification', 'Cattle Score', 'Buffalo Score', 'Confidence',
      'Body Length (cm)', 'Height at Withers (cm)', 'Chest Width (cm)',
      'Rump Angle (deg)', 'Pelvic Width (cm)', 'Leg Length Ratio',
      'Status', 'Notes'
    ];

    const rows = records.map(r => [
      r.id,
      new Date(r.timestamp).toISOString(),
      r.operatorName,
      r.location,
      r.animalId || '',
      r.classificationLabel,
      r.classificationScore.cattle.toFixed(2),
      r.classificationScore.buffalo.toFixed(2),
      r.confidenceBand.toFixed(2),
      r.measurements.bodyLength.toFixed(1),
      r.measurements.heightAtWithers.toFixed(1),
      r.measurements.chestWidth.toFixed(1),
      r.measurements.rumpAngle.toFixed(1),
      r.measurements.pelvicWidth.toFixed(1),
      r.measurements.legLengthRatio.toFixed(2),
      r.status,
      r.notes?.replace(/,/g, ';') || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },
};