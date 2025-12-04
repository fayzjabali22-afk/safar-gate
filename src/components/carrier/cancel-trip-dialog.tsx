'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Trip } from '@/lib/data';

interface CancelTripDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
}

export function CancelTripDialog({ isOpen, onOpenChange, trip }: CancelTripDialogProps) {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async () => {
    if (!trip) return;
    setIsCancelling(true);

    // --- SIMULATION LOGIC ---
    setTimeout(() => {
        console.log(`Simulating cancellation for trip: ${trip.id}`);
        console.log(`Updating trip status to 'Cancelled'.`);
        if (trip.bookingIds && trip.bookingIds.length > 0) {
            console.log(`Updating ${trip.bookingIds.length} associated bookings to 'Cancelled'.`);
            console.log(`Sending notifications to affected travelers.`);
        }
        
        toast({
            title: 'محاكاة: تم إلغاء الرحلة بنجاح',
            description: 'سيتم إبلاغ جميع المسافرين بهذا الإلغاء.',
        });

        setIsCancelling(false);
        onOpenChange(false);
    }, 1500);
    // --- END SIMULATION LOGIC ---
  };

  const bookedSeats = trip?.bookingIds?.length || 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            تأكيد إلغاء الرحلة
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="font-bold py-2 text-base">هل أنت متأكد من رغبتك في إلغاء هذه الرحلة؟</p>
            <div className="p-3 text-destructive-foreground bg-destructive/80 rounded-lg text-sm space-y-1">
                <p className="font-bold">سيتم إبلاغ جميع المسافرين المسجلين فوراً.</p>
                <p className="text-xs">
                    يوجد حالياً <span className="font-bold">{bookedSeats}</span> حجز مؤكد على هذه الرحلة.
                    إلغاء الرحلة يعتبر إجراءً نهائياً ولا يمكن التراجع عنه. 
                </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 pt-4">
          <AlertDialogCancel disabled={isCancelling}>تراجع</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isCancelling}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isCancelling ? (
                <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإلغاء...
                </>
            ) : "نعم، قم بالإلغاء وإبلاغ المسافرين"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
