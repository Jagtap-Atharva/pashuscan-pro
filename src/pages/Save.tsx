import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Wifi, WifiOff } from 'lucide-react';
import { storage } from '@/lib/storage';
import { bpaApi } from '@/lib/bpaApi';
import { EvaluationRecord } from '@/types/evaluation';
import { toast } from 'sonner';

const Save = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageData, measurements, keypoints, classificationScore, classificationLabel, explanation, confidenceBand } = location.state || {};

  const [operatorName, setOperatorName] = useState('');
  const [locationText, setLocationText] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline] = useState(navigator.onLine);

  const handleSaveLocal = () => {
    if (!operatorName.trim()) {
      toast.error('Operator name is required');
      return;
    }

    const record: EvaluationRecord = {
      id: `eval_${Date.now()}`,
      timestamp: Date.now(),
      operatorName: operatorName.trim(),
      location: locationText.trim() || 'Unknown',
      animalId: animalId.trim() || undefined,
      notes: notes.trim() || undefined,
      originalImage: imageData,
      measurements,
      keypoints,
      classificationLabel,
      classificationScore,
      explanation,
      confidenceBand,
      calibrationMethod: 'default',
      status: 'local',
      syncAttempts: 0,
    };

    storage.saveRecord(record);
    toast.success('Evaluation saved locally');
    navigate('/history');
  };

  const handleSaveAndPush = async () => {
    if (!operatorName.trim()) {
      toast.error('Operator name is required');
      return;
    }

    setIsSaving(true);

    const record: EvaluationRecord = {
      id: `eval_${Date.now()}`,
      timestamp: Date.now(),
      operatorName: operatorName.trim(),
      location: locationText.trim() || 'Unknown',
      animalId: animalId.trim() || undefined,
      notes: notes.trim() || undefined,
      originalImage: imageData,
      measurements,
      keypoints,
      classificationLabel,
      classificationScore,
      explanation,
      confidenceBand,
      calibrationMethod: 'default',
      status: 'queued',
      syncAttempts: 0,
    };

    storage.saveRecord(record);

    if (!isOnline) {
      toast.info('Saved to queue - will sync when online');
      navigate('/history');
      return;
    }

    try {
      await bpaApi.pushWithRetry(record);
      toast.success('Evaluation saved and synced to BPA');
      navigate('/history');
    } catch (error) {
      toast.warning('Saved locally - BPA sync failed, will retry');
      navigate('/history');
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageData || !measurements) {
    navigate('/capture');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analysis', { state: { imageData } })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Save Evaluation</h1>
            <p className="text-sm text-muted-foreground">Add details and save record</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-success" />
            ) : (
              <WifiOff className="h-5 w-5 text-warning" />
            )}
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operator">Operator Name *</Label>
            <Input
              id="operator"
              placeholder="Enter your name"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="animalId">Animal ID (Optional)</Label>
            <Input
              id="animalId"
              placeholder="Enter animal ID"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 space-y-2">
          <h3 className="font-semibold">Evaluation Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Classification:</span>
              <span className="font-medium">{classificationLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium">{(confidenceBand * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Body Length:</span>
              <span className="font-medium">{measurements.bodyLength.toFixed(1)} cm</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={handleSaveLocal}
            disabled={isSaving}
          >
            Save Locally
          </Button>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSaveAndPush}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Push to BPA'
            )}
          </Button>
        </div>

        {!isOnline && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
            <p className="text-sm text-foreground">
              <strong>Offline Mode:</strong> Records will be queued and automatically synced when connection is restored.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Save;