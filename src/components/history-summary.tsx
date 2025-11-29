'use client';
import { useState } from 'react';
import { AlertCircle, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { summarizeRideHistory } from '@/ai/flows/summarize-ride-history';
import { rideHistory } from '@/lib/data';

type Summary = {
  summary: string;
};

export function HistorySummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await summarizeRideHistory({ rideHistory });
      setSummary(result);
    } catch (e) {
      setError('Failed to get summary. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold font-headline">Ride Summary</h2>
                <p className="text-muted-foreground">Get an AI-powered summary of your ride history.</p>
            </div>
            <Button onClick={handleSummarize} disabled={loading}>
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <History className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Generating...' : 'Summarize My History'}
            </Button>
        </div>
        
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {summary && (
        <Alert>
          <History className="h-4 w-4" />
          <AlertTitle className="font-bold">Your Ride Summary</AlertTitle>
          <AlertDescription>{summary.summary}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
