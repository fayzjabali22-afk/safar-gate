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
import type { Trip } from '@/lib/data';
import { Flag, Star, LogOut, X, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

interface TripClosureDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
  onRate: () => void;
}

export function TripClosureDialog({ isOpen, onOpenChange, trip, onRate }: TripClosureDialogProps) {
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleCloseWithoutRating = () => {
        if (!firestore || !trip) return;
        
        // This is a simulation, in a real scenario you would update the backend
        const tripRef = doc(firestore, 'trips', trip.id);
        updateDocumentNonBlocking(tripRef, { status: 'Completed' });

        toast({
            title: 'تم إغلاق الرحلة',
            description: 'تم نقل الرحلة إلى الأرشيف دون تقييم.',
        });
        onOpenChange(false);
    };

    const handleSnooze = () => {
        onOpenChange(false);
        toast({
            title: 'تم التأجيل',
            description: 'سيتم تذكيرك لاحقاً لإغلاق الرحلة.'
        });
    }

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-6 w-6 text-primary" />
            إغلاق الرحلة
          </DialogTitle>
          <DialogDescription>
            لقد حان وقت إغلاق رحلتك. تقييمك يساعدنا على تحسين الخدمة.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
            <Button className="w-full h-16 justify-start p-4 text-base" onClick={onRate}>
                <Star className="ml-4 h-6 w-6" />
                أرغب بالتقييم وإغلاق الرحلة
            </Button>
             <Button variant="secondary" className="w-full h-16 justify-start p-4 text-base" onClick={handleCloseWithoutRating}>
                <ThumbsDown className="ml-4 h-6 w-6" />
                إغلاق الرحلة فقط (بدون تقييم)
            </Button>
            <Button variant="ghost" className="w-full h-16 justify-start p-4 text-base" onClick={handleSnooze}>
                <X className="ml-4 h-6 w-6" />
                ليس الآن (أغلق النافذة)
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
