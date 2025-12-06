
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flag, Loader2, RefreshCw, Moon } from 'lucide-react';
import type { Trip } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface TripCompletionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
}

export function TripCompletionDialog({ isOpen, onOpenChange, trip }: TripCompletionDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (action: 'schedule-return' | 'rest') => {
    // In phase 1, we just show a toast and close the dialog.
    setIsProcessing(true);
    setTimeout(() => {
        toast({
            title: `محاكاة: تم اختيار "${action === 'schedule-return' ? 'جدولة العودة' : 'أخذ قسط من الراحة'}"`,
            description: "سيتم ربط هذا الإجراء في المرحلة التالية.",
        });
        setIsProcessing(false);
        onOpenChange(false);
    }, 1500);
  };


  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-6 w-6 text-primary"/>
            نقطة القرار: لقد وصلت
          </DialogTitle>
          <DialogDescription className="pt-2">
            لقد أتممت رحلتك بنجاح من {trip.origin} إلى {trip.destination}. ما هي خطوتك التالية؟
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            size="lg"
            className="h-auto py-3"
            onClick={() => handleAction('schedule-return')}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <div className="flex flex-col items-start w-full text-right">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        <span className="font-bold text-base">إنهاء وجدولة العودة فوراً</span>
                    </div>
                    <p className="text-xs opacity-80 whitespace-normal mt-1">
                        سيقوم النظام بإنهاء رحلتك الحالية وإنشاء رحلة عودة جديدة تلقائياً.
                    </p>
                </div>
            )}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="h-auto py-3"
            onClick={() => handleAction('rest')}
            disabled={isProcessing}
          >
             {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <div className="flex flex-col items-start w-full text-right">
                <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    <span className="font-bold text-base">إنهاء وأخذ قسط من الراحة</span>
                </div>
                <p className="text-xs opacity-80 whitespace-normal mt-1">
                    سيقوم النظام بإنهاء رحلتك الحالية فقط، ويمكنك تصفح السوق لاحقاً.
                </p>
                </div>
            )}
          </Button>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
