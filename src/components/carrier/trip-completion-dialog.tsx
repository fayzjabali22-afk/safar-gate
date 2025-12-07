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
import { Flag, Loader2, RefreshCw, Moon, Calendar as CalendarIcon, Check } from 'lucide-react';
import type { Trip } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';

interface TripCompletionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
  onConfirm: (trip: Trip, returnDate: Date | null) => void;
}

export function TripCompletionDialog({ isOpen, onOpenChange, trip, onConfirm }: TripCompletionDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const handleConfirm = async () => {
    if (!trip) return;
    setIsProcessing(true);
    try {
      // The actual logic is now in my-trips-list.tsx
      await onConfirm(trip, returnDate || null);
      onOpenChange(false);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "خطأ في تأكيد الإنهاء",
        description: "حدث خطأ غير متوقع.",
      });
    } finally {
        setIsProcessing(false);
    }
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-6 w-6 text-primary"/>
            إنهاء الرحلة وجدولة العودة
          </DialogTitle>
          <DialogDescription className="pt-2">
            لقد أتممت رحلتك من {trip.origin} إلى {trip.destination}. حدد تاريخ العودة لجدولتها فوراً، أو قم بإنهاء الرحلة فقط.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-center mb-2">اختر تاريخ رحلة العودة (اختياري)</h3>
            <Calendar
                mode="single"
                selected={returnDate}
                onSelect={setReturnDate}
                className="rounded-md border"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
                {returnDate 
                    ? `سيتم جدولة رحلة العودة بتاريخ: ${returnDate.toLocaleDateString('ar-SA')}`
                    : 'إذا لم تختر تاريخاً، سيتم إنهاء الرحلة الحالية فقط.'}
            </p>
        </div>
        
        <DialogFooter className="gap-2 sm:flex-col">
            <Button
                size="lg"
                className="w-full"
                onClick={handleConfirm}
                disabled={isProcessing}
            >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                        <Check className="ml-2 h-5 w-5" />
                         {returnDate ? 'إنهاء وجدولة العودة' : 'إنهاء الرحلة الحالية فقط'}
                    </>
                )}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
