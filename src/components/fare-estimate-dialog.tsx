'use client';
import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { estimateFareFromPrompt } from '@/ai/flows/fare-estimate-from-prompt';

type FareEstimate = {
  estimatedFare: number;
  reasoning: string;
};

export function FareEstimateDialog() {
  const [prompt, setPrompt] = useState('');
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleEstimate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setEstimate(null);
    try {
      const result = await estimateFareFromPrompt({ rideDescription: prompt });
      setEstimate(result);
    } catch (e) {
      setError('Failed to get an estimate. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
        setPrompt('');
        setEstimate(null);
        setError(null);
        setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" />
          AI Fare Estimate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI-Powered Fare Estimate</DialogTitle>
          <DialogDescription>
            Describe your desired trip, and our AI will estimate the fare. For
            example, &quot;a quick trip from the airport to the downtown
            hotel.&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="ride-prompt"
            placeholder="Tell us about your ride..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Calculating...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {estimate && (
          <Alert variant="default" className="border-primary/50 bg-primary/5">
             <Wand2 className="h-4 w-4" />
            <AlertTitle className="font-bold text-primary">
              Estimated Fare: ${estimate.estimatedFare.toFixed(2)}
            </AlertTitle>
            <AlertDescription>{estimate.reasoning}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button onClick={handleEstimate} disabled={loading || !prompt}>
            {loading ? 'Estimating...' : 'Get Estimate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
