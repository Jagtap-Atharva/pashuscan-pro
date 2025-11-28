import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Trash2, RefreshCw } from 'lucide-react';
import { storage } from '@/lib/storage';
import { bpaApi } from '@/lib/bpaApi';
import { EvaluationRecord } from '@/types/evaluation';
import { toast } from 'sonner';

const History = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = storage.getRecords();
    setRecords(allRecords.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this evaluation record?')) {
      storage.deleteRecord(id);
      toast.success('Record deleted');
      loadRecords();
    }
  };

  const handleRetry = async (record: EvaluationRecord) => {
    setRetryingId(record.id);
    try {
      await bpaApi.pushWithRetry(record);
      toast.success('Record synced successfully');
      loadRecords();
    } catch (error) {
      toast.error('Sync failed - will retry later');
    } finally {
      setRetryingId(null);
    }
  };

  const handleExportJSON = () => {
    const json = storage.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations_${Date.now()}.json`;
    a.click();
    toast.success('Exported as JSON');
  };

  const handleExportCSV = () => {
    const csv = storage.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations_${Date.now()}.csv`;
    a.click();
    toast.success('Exported as CSV');
  };

  const getStatusBadge = (status: EvaluationRecord['status']) => {
    switch (status) {
      case 'synced':
        return <Badge className="bg-success text-success-foreground">Synced</Badge>;
      case 'queued':
        return <Badge variant="secondary">Queued</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'local':
        return <Badge variant="outline">Local</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Evaluation History</h1>
            <p className="text-sm text-muted-foreground">{records.length} records</p>
          </div>
        </div>

        {/* Export Buttons */}
        {records.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        )}

        {/* Records List */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No evaluations yet</p>
              <Button className="mt-4" onClick={() => navigate('/capture')}>
                Start Evaluation
              </Button>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">
                        {record.classificationLabel}
                      </h3>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {record.originalImage && (
                    <img 
                      src={record.originalImage} 
                      alt="Animal" 
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Operator:</span>
                    <p className="font-medium">{record.operatorName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{record.location}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <p className="font-medium">{(record.confidenceBand * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Body Length:</span>
                    <p className="font-medium">{record.measurements.bodyLength.toFixed(1)} cm</p>
                  </div>
                </div>

                {record.notes && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {record.notes}
                  </p>
                )}

                {record.syncError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    <strong>Sync Error:</strong> {record.syncError}
                  </div>
                )}

                <div className="flex gap-2">
                  {(record.status === 'failed' || record.status === 'queued') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(record)}
                      disabled={retryingId === record.id}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${retryingId === record.id ? 'animate-spin' : ''}`} />
                      Retry Sync
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;