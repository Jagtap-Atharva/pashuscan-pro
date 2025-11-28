import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, BookOpen, History, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-foreground">
            Animal Classification
          </h1>
          <p className="text-lg text-muted-foreground">
            Cattle vs Buffalo Evaluation System
          </p>
        </div>

        {/* Quick Guide Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Guide</h2>
          </div>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</div>
              <p>Capture or upload a clear, full-body photo of the animal</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</div>
              <p>The system will detect keypoints and measure body parameters</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</div>
              <p>Review classification results and save the evaluation</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Tips for best results:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Hold camera steady with full animal in frame</li>
              <li>Ensure good lighting and clear visibility</li>
              <li>Include a reference object for accurate measurements</li>
            </ul>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/capture">
            <Button size="lg" className="w-full h-24 text-lg">
              <Camera className="mr-2 h-6 w-6" />
              Start Evaluation
            </Button>
          </Link>
          
          <Link to="/history">
            <Button size="lg" variant="outline" className="w-full h-24 text-lg">
              <History className="mr-2 h-6 w-6" />
              View History
            </Button>
          </Link>
        </div>

        <Link to="/settings">
          <Button size="lg" variant="secondary" className="w-full">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </Link>

        {/* Example Photos Section */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Example Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Examples of properly framed animal photos
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;