import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { AppSettings } from '@/types/evaluation';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const handleSave = () => {
    storage.saveSettings(settings);
    toast.success('Settings saved');
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
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure app preferences</p>
          </div>
        </div>

        {/* BPA API Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">BPA API Integration</h3>
              <p className="text-sm text-muted-foreground">Bharat Pashudhan App sync</p>
            </div>
            <Switch
              checked={settings.bpaApi.enabled}
              onCheckedChange={(enabled) =>
                setSettings({
                  ...settings,
                  bpaApi: { ...settings.bpaApi, enabled },
                })
              }
            />
          </div>

          {settings.bpaApi.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://api.bpa.gov.in/evaluate"
                  value={settings.bpaApi.endpoint}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bpaApi: { ...settings.bpaApi, endpoint: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Enter API key"
                    value={settings.bpaApi.apiKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bpaApi: { ...settings.bpaApi, apiKey: e.target.value },
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  API key is encrypted in local storage
                </p>
              </div>
            </>
          )}
        </Card>

        {/* Measurement Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Measurement Settings</h3>

          <div className="flex items-center justify-between">
            <div>
              <Label>Unit System</Label>
              <p className="text-sm text-muted-foreground">Display measurements in</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={settings.measurementUnit === 'metric' ? 'default' : 'outline'}
                onClick={() =>
                  setSettings({ ...settings, measurementUnit: 'metric' })
                }
              >
                Metric (cm)
              </Button>
              <Button
                size="sm"
                variant={settings.measurementUnit === 'imperial' ? 'default' : 'outline'}
                onClick={() =>
                  setSettings({ ...settings, measurementUnit: 'imperial' })
                }
              >
                Imperial (in)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calibrationOffset">Calibration Offset</Label>
            <Input
              id="calibrationOffset"
              type="number"
              step="0.1"
              value={settings.calibrationOffset}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  calibrationOffset: parseFloat(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Apply offset to all measurements (cm)
            </p>
          </div>
        </Card>

        {/* AI Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">AI Inference</h3>

          <div className="flex items-center justify-between">
            <div>
              <Label>Inference Mode</Label>
              <p className="text-sm text-muted-foreground">Where to run AI detection</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={settings.inferenceMode === 'client' ? 'default' : 'outline'}
                onClick={() =>
                  setSettings({ ...settings, inferenceMode: 'client' })
                }
              >
                Client-side
              </Button>
              <Button
                size="sm"
                variant={settings.inferenceMode === 'server' ? 'default' : 'outline'}
                onClick={() =>
                  setSettings({ ...settings, inferenceMode: 'server' })
                }
              >
                Server-side
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <strong>Client-side:</strong> Faster, works offline, processes locally
            </p>
            <p className="text-sm mt-2">
              <strong>Server-side:</strong> More accurate, requires internet connection
            </p>
          </div>
        </Card>

        {/* Save Button */}
        <Button size="lg" className="w-full" onClick={handleSave}>
          Save Settings
        </Button>

        {/* About */}
        <Card className="p-6 space-y-2">
          <h3 className="font-semibold">About</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Animal Classification System v1.0</p>
            <p>Cattle vs Buffalo Evaluation Tool</p>
            <p className="text-xs mt-4">
              For support and documentation, contact your system administrator.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;