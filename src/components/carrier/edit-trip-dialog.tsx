'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import type { Trip, Booking } from '@/lib/data';
import { Loader2, Minus, Plus, Save, AlertCircle, CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EditTripDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
}

const editTripSchema = z.object({
  price: z.coerce.number().positive('السعر يجب أن يكون رقماً موجباً'),
  availableSeats: z.coerce.number().int().min(0, 'عدد المقاعد لا يمكن أن يكون سالباً'),
  departureDate: z.date({ required_error: 'تاريخ المغادرة مطلوب' }),
});

type EditTripFormValues = z.infer<typeof editTripSchema>;

export function EditTripDialog({ isOpen, onOpenChange, trip }: EditTripDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSeatsCount, setBookedSeatsCount] = useState(0);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const form = useForm<EditTripFormValues>({
    resolver: zodResolver(editTripSchema),
    defaultValues: {
      price: 0,
      availableSeats: 0,
    },
  });

  useEffect(() => {
    // const fetchBookedSeats = async () => {
    //   if (!firestore || !trip) return;
    //   setIsLoadingBookings(true);
    //   try {
    //     const bookingsQuery = query(
    //       collection(firestore, 'bookings'),
    //       where('tripId', '==', trip.id),
    //       where('status', '==', 'Confirmed')
    //     );
    //     const querySnapshot = await getDocs(bookingsQuery);
    //     const confirmedSeats = querySnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Booking).seats, 0);
    //     setBookedSeatsCount(confirmedSeats);
    //   } catch (error) {
    //     console.error("Failed to fetch booked seats:", error);
    //     setBookedSeatsCount(0);
    //   } finally {
    //     setIsLoadingBookings(false);
    //   }
    // };

    if (trip && isOpen) {
      form.reset({
        price: trip.price || 0,
        availableSeats: trip.availableSeats || 0,
        departureDate: trip.departureDate ? new Date(trip.departureDate) : new Date(),
      });
      // fetchBookedSeats();

      // SIMULATION MODE
      setBookedSeatsCount(3); 
    }
  }, [trip, isOpen, firestore, form]);

  const onSubmit = async (data: EditTripFormValues) => {
    if (!firestore || !trip) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'لا يمكن تحديث الرحلة حالياً.' });
      return;
    }
    
    // --- Integrity Guard ---
    if (data.availableSeats < bookedSeatsCount) {
        form.setError("availableSeats", {
            type: "manual",
            message: `وضع محاكاة: لا يمكن تقليل السعة عن ${bookedSeatsCount} لوجود حجوزات مؤكدة`,
        });
        return;
    }
    
    setIsSubmitting(true);
    try {
      const tripRef = doc(firestore, 'trips', trip.id);
      await updateDoc(tripRef, {
        price: data.price,
        availableSeats: data.availableSeats,
        departureDate: Timestamp.fromDate(data.departureDate),
      });
      toast({ title: 'تم تحديث الرحلة بنجاح!' });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update trip:', error);
      toast({ variant: 'destructive', title: 'فشل تحديث الرحلة', description: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل تفاصيل الرحلة</DialogTitle>
          <DialogDescription>
            قم بتحديث تفاصيل رحلتك. التغييرات ستكون مرئية للمستخدمين.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
             <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ المغادرة</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>اختر تاريخاً</span>}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر المقعد (بالدينار)</FormLabel>
                   <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المقاعد المتاحة</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {bookedSeatsCount > 0 && (
                 <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    <AlertCircle className="h-4 w-4 !text-yellow-500" />
                    <AlertDescription>
                        وضع محاكاة: نفترض وجود {bookedSeatsCount} مقاعد محجوزة.
                    </AlertDescription>
                </Alert>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting || isLoadingBookings}>
                {isSubmitting || isLoadingBookings ? (
                  <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري التحميل...</>
                ) : (
                  <><Save className="ml-2 h-4 w-4" /> حفظ التغييرات</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
