import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Capture = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }
    
    setIsProcessing(true);
    // Navigate to analysis page with image data
    navigate('/analysis', { state: { imageData: selectedImage } });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Capture Image</h1>
            <p className="text-sm text-muted-foreground">Take or upload a photo</p>
          </div>
        </div>

        {/* Image Preview or Capture Area */}
        <Card className="p-6 space-y-4">
          {selectedImage ? (
            <div className="space-y-4">
              <img 
                src={selectedImage} 
                alt="Selected animal" 
                className="w-full rounded-lg"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedImage(null)}
              >
                Choose Different Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
              
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
                <p className="text-sm text-foreground font-medium mb-2">
                  Tips for best results:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Hold camera steady</li>
                  <li>Ensure full-body animal in frame</li>
                  <li>Good lighting and clear visibility</li>
                  <li>Include reference object if possible</li>
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Button 
            size="lg" 
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload from Gallery
          </Button>
          
          <Button 
            size="lg"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 h-5 w-5" />
            Take Photo
          </Button>
        </div>

        {selectedImage && (
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleAnalyze}
            disabled={isProcessing}
          >
            Analyze Image
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default Capture;