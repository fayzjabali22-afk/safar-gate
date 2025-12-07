
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Trip, UserProfile, Rating } from '@/lib/data';
import { Loader2, Send, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';


interface RateTripDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
  onConfirm: () => void;
}

const ratingSchema = z.object({
  drivingProfessionalism: z.number().min(1, 'التقييم مطلوب').max(5),
  specificationCredibility: z.number().min(1, 'التقييم مطلوب').max(5),
  driverCourtesy: z.number().min(1, 'التقييم مطلوب').max(5),
  vehicleQuality: z.number().min(1, 'التقييم مطلوب').max(5),
  vehicleCleanliness: z.number().min(1, 'التقييم مطلوب').max(5),
  comment: z.string().optional(),
});

type RatingFormValues = z.infer<typeof ratingSchema>;

// THE WEIGHTS for the final average calculation
const RATING_WEIGHTS = {
    drivingProfessionalism: 0.30,   // 30%
    specificationCredibility: 0.25, // 25%
    driverCourtesy: 0.20,           // 20%
    vehicleQuality: 0.15,           // 15%
    vehicleCleanliness: 0.10,       // 10%
};

const ratingCriteria: { key: keyof Omit<RatingFormValues, 'comment'>; label: string; weight: number }[] = [
    { key: 'drivingProfessionalism', label: 'القيادة الآمنة والمهنية', weight: RATING_WEIGHTS.drivingProfessionalism },
    { key: 'specificationCredibility', label: 'مصداقية مواصفات المركبة', weight: RATING_WEIGHTS.specificationCredibility },
    { key: 'driverCourtesy', label: 'تهذيب ومساعدة السائق', weight: RATING_WEIGHTS.driverCourtesy },
    { key: 'vehicleQuality', label: 'جودة المركبة', weight: RATING_WEIGHTS.vehicleQuality },
    { key: 'vehicleCleanliness', label: 'نظافة المركبة', weight: RATING_WEIGHTS.vehicleCleanliness },
];


const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-6 w-6 cursor-pointer transition-colors',
            (hoverValue || value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
          )}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
        />
      ))}
    </div>
  );
};


export function RateTripDialog({ isOpen, onOpenChange, trip, onConfirm }: RateTripDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      drivingProfessionalism: 0,
      specificationCredibility: 0,
      driverCourtesy: 0,
      vehicleQuality: 0,
      vehicleCleanliness: 0,
      comment: '',
    },
  });
  
  useEffect(() => {
    if (!isOpen) {
        form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (data: RatingFormValues) => {
    if (!firestore || !trip || !user || !trip.carrierId) {
        toast({ variant: 'destructive', title: 'خطأ فادح', description: 'بيانات الرحلة أو المستخدم غير مكتملة.' });
        return;
    }
    setIsSubmitting(true);
    
    // Calculate the weighted average rating
    const weightedAverage = 
        (data.drivingProfessionalism * RATING_WEIGHTS.drivingProfessionalism) +
        (data.specificationCredibility * RATING_WEIGHTS.specificationCredibility) +
        (data.driverCourtesy * RATING_WEIGHTS.driverCourtesy) +
        (data.vehicleQuality * RATING_WEIGHTS.vehicleQuality) +
        (data.vehicleCleanliness * RATING_WEIGHTS.vehicleCleanliness);

    try {
        await runTransaction(firestore, async (transaction) => {
            const ratingRef = doc(collection(firestore, 'ratings'));
            const carrierRef = doc(firestore, 'users', trip.carrierId!);
            const carrierDoc = await transaction.get(carrierRef);

            if (!carrierDoc.exists()) {
                throw new Error("Carrier profile does not exist!");
            }
            
            // 1. Create the detailed rating document
            const ratingData: Omit<Rating, 'id'> = {
                tripId: trip.id,
                carrierId: trip.carrierId!,
                userId: user.uid,
                ratingValue: weightedAverage,
                details: data,
                comment: data.comment,
                createdAt: serverTimestamp() as any,
            };
            transaction.set(ratingRef, ratingData);

            // 2. Update the carrier's average rating atomically
            const carrierData = carrierDoc.data() as UserProfile;
            const oldAverage = carrierData.averageRating || 0;
            const oldTotalRatings = carrierData.totalRatings || 0;
            const newTotalRatings = oldTotalRatings + 1;
            const newAverage = ((oldAverage * oldTotalRatings) + weightedAverage) / newTotalRatings;

            transaction.update(carrierRef, {
                averageRating: newAverage,
                totalRatings: increment(1)
            });
            
            // 3. Mark the traveler's booking as Completed
            const bookingQuery = query(
                collection(firestore, 'bookings'),
                where('tripId', '==', trip.id),
                where('userId', '==', user.uid)
            );
            const bookingSnapshot = await getDocs(bookingQuery); // Use getDocs within transaction is tricky, better to have booking ID if possible
            if (!bookingSnapshot.empty) {
                const bookingDocRef = bookingSnapshot.docs[0].ref;
                transaction.update(bookingDocRef, { status: 'Completed' });
            }

        });
        
        toast({
            title: 'تم إغلاق الرحلة بنجاح!',
            description: `شكراً لتقييمك. تم أرشفة الرحلة.`,
        });

        onOpenChange(false);
        if (onConfirm) onConfirm();

    } catch (error) {
        console.error("Rating and closure failed:", error);
        toast({
            variant: "destructive",
            title: "فشل إرسال التقييم",
            description: "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى."
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>التقييم المعياري للرحلة</DialogTitle>
          <DialogDescription>
            تقييمك المفصل يساعدنا على ضمان أعلى مستويات الجودة.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            
            <div className="space-y-4">
                {ratingCriteria.map((criterion) => (
                    <FormField
                        key={criterion.key}
                        control={form.control}
                        name={criterion.key}
                        render={({ field }) => (
                            <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3">
                                <FormLabel className="text-sm font-semibold mb-2 sm:mb-0">
                                    {criterion.label} <span className="text-muted-foreground text-xs">({criterion.weight * 100}%)</span>
                                </FormLabel>
                                <FormControl>
                                    <StarRating value={field.value as number} onChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="صف لنا تجربتك بشكل عام..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                العودة
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...</>
                ) : (
                    <><Send className="ml-2 h-4 w-4" /> إرسال التقييم وإغلاق الرحلة</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
