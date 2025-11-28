import { AnimalMeasurements, Keypoint, ClassificationScore, ClassificationLabel } from '@/types/evaluation';

// Mock AI detection - returns simulated keypoints and measurements
export const detectAnimal = async (imageData: string): Promise<{
  keypoints: Keypoint[];
  measurements: AnimalMeasurements;
  classificationScore: ClassificationScore;
  classificationLabel: ClassificationLabel;
  explanation: string[];
  confidenceBand: number;
}> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock keypoints (normalized coordinates 0-1)
  const keypoints: Keypoint[] = [
    { x: 0.3, y: 0.4, label: 'head' },
    { x: 0.35, y: 0.45, label: 'withers' },
    { x: 0.6, y: 0.5, label: 'pelvis' },
    { x: 0.3, y: 0.8, label: 'front-hoof' },
    { x: 0.6, y: 0.85, label: 'back-hoof' },
  ];

  // Mock measurements with some randomization
  const measurements: AnimalMeasurements = {
    bodyLength: 140 + Math.random() * 20,
    heightAtWithers: 120 + Math.random() * 15,
    chestWidth: 35 + Math.random() * 10,
    rumpAngle: 10 + Math.random() * 8,
    pelvicWidth: 32 + Math.random() * 8,
    legLengthRatio: 0.85 + Math.random() * 0.15,
  };

  // Mock classification
  const isCattle = Math.random() > 0.5;
  const score = 0.6 + Math.random() * 0.3;
  
  const classificationScore: ClassificationScore = isCattle 
    ? { cattle: score, buffalo: 1 - score }
    : { cattle: 1 - score, buffalo: score };

  const classificationLabel: ClassificationLabel = 
    score > 0.75 ? (isCattle ? 'Cattle' : 'Buffalo') : 'Uncertain';

  const explanation = [
    `Rump angle: ${measurements.rumpAngle.toFixed(1)}° indicates ${isCattle ? 'cattle' : 'buffalo'} characteristics`,
    `Body length to height ratio: ${(measurements.bodyLength / measurements.heightAtWithers).toFixed(2)} is typical for ${isCattle ? 'cattle' : 'buffalo'}`,
    `Chest width: ${measurements.chestWidth.toFixed(1)}cm suggests ${isCattle ? 'narrower cattle build' : 'broader buffalo build'}`,
    `Leg length ratio: ${measurements.legLengthRatio.toFixed(2)} supports ${classificationLabel.toLowerCase()} classification`,
  ];

  return {
    keypoints,
    measurements,
    classificationScore,
    classificationLabel,
    explanation,
    confidenceBand: score,
  };
};