import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { detectAnimal } from '@/lib/aiMock';
import { AnimalMeasurements, Keypoint, ClassificationScore, ClassificationLabel } from '@/types/evaluation';
import { toast } from 'sonner';

const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageData = location.state?.imageData as string | undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [measurements, setMeasurements] = useState<AnimalMeasurements | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [classificationScore, setClassificationScore] = useState<ClassificationScore | null>(null);
  const [classificationLabel, setClassificationLabel] = useState<ClassificationLabel | null>(null);
  const [explanation, setExplanation] = useState<string[]>([]);
  const [confidenceBand, setConfidenceBand] = useState(0);

  useEffect(() => {
    if (!imageData) {
      navigate('/capture');
      return;
    }

    const analyzeImage = async () => {
      try {
        const result = await detectAnimal(imageData);
        setMeasurements(result.measurements);
        setKeypoints(result.keypoints);
        setClassificationScore(result.classificationScore);
        setClassificationLabel(result.classificationLabel);
        setExplanation(result.explanation);
        setConfidenceBand(result.confidenceBand);
      } catch (error) {
        toast.error('Failed to analyze image');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeImage();
  }, [imageData, navigate]);

  const handleMeasurementChange = (field: keyof AnimalMeasurements, value: number) => {
    if (!measurements) return;
    setMeasurements({ ...measurements, [field]: value });
  };

  const handleSave = () => {
    navigate('/save', {
      state: {
        imageData,
        measurements,
        keypoints,
        classificationScore,
        classificationLabel,
        explanation,
        confidenceBand,
      },
    });
  };

  if (!imageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/capture')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analysis</h1>
            <p className="text-sm text-muted-foreground">Review detection results</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing image...</p>
          </Card>
        ) : (
          <>
            {/* Image with Overlay */}
            <Card className="p-4 space-y-2">
              <h2 className="font-semibold">Detected Animal</h2>
              <div className="relative">
                <img 
                  src={imageData} 
                  alt="Analyzed animal" 
                  className="w-full rounded-lg"
                />
                {/* Keypoints overlay would be rendered here with canvas */}
              </div>
              <p className="text-xs text-muted-foreground">
                Keypoints detected: {keypoints.length}
              </p>
            </Card>

            {/* Classification Results */}
            {classificationLabel && classificationScore && (
              <Card className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Classification</h2>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-2xl font-bold text-primary">
                      {classificationLabel}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(confidenceBand * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Score Breakdown</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cattle</span>
                      <span className="text-sm font-medium">
                        {(classificationScore.cattle * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${classificationScore.cattle * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Buffalo</span>
                      <span className="text-sm font-medium">
                        {(classificationScore.buffalo * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${classificationScore.buffalo * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Explanation</Label>
                  <ul className="space-y-2">
                    {explanation.map((line, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* Measurements */}
            {measurements && (
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Body Measurements</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bodyLength">Body Length (cm)</Label>
                    <Input
                      id="bodyLength"
                      type="number"
                      value={measurements.bodyLength.toFixed(1)}
                      onChange={(e) => handleMeasurementChange('bodyLength', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heightAtWithers">Height at Withers (cm)</Label>
                    <Input
                      id="heightAtWithers"
                      type="number"
                      value={measurements.heightAtWithers.toFixed(1)}
                      onChange={(e) => handleMeasurementChange('heightAtWithers', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chestWidth">Chest Width (cm)</Label>
                    <Input
                      id="chestWidth"
                      type="number"
                      value={measurements.chestWidth.toFixed(1)}
                      onChange={(e) => handleMeasurementChange('chestWidth', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rumpAngle">Rump Angle (°)</Label>
                    <Input
                      id="rumpAngle"
                      type="number"
                      value={measurements.rumpAngle.toFixed(1)}
                      onChange={(e) => handleMeasurementChange('rumpAngle', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pelvicWidth">Pelvic Width (cm)</Label>
                    <Input
                      id="pelvicWidth"
                      type="number"
                      value={measurements.pelvicWidth.toFixed(1)}
                      onChange={(e) => handleMeasurementChange('pelvicWidth', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legLengthRatio">Leg Length Ratio</Label>
                    <Input
                      id="legLengthRatio"
                      type="number"
                      step="0.01"
                      value={measurements.legLengthRatio.toFixed(2)}
                      onChange={(e) => handleMeasurementChange('legLengthRatio', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            )}

            <Button size="lg" className="w-full" onClick={handleSave}>
              Continue to Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;