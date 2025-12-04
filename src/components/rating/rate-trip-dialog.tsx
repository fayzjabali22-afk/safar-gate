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
import type { Trip } from '@/lib/data';
import { Loader2, Send, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RateTripDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip | null;
}

const ratingSchema = z.object({
  ratingValue: z.number().min(1, 'التقييم مطلوب').max(5),
  comment: z.string().optional(),
});

type RatingFormValues = z.infer<typeof ratingSchema>;

export function RateTripDialog({ isOpen, onOpenChange, trip }: RateTripDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      ratingValue: 0,
      comment: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setHoverRating(0);
    }
  }, [isOpen, form]);

  const onSubmit = async (data: RatingFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        console.log("Simulated Rating Submission:", {
            tripId: trip?.id,
            carrierId: trip?.carrierId,
            ...data
        });
        toast({
            title: 'تم إرسال تقييمك بنجاح!',
            description: 'شكراً لمساهمتك في تحسين جودة الخدمة.',
        });
        setIsSubmitting(false);
        onOpenChange(false);
    }, 1500);
  };
  
  const selectedRating = form.watch('ratingValue');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تقييم تجربة رحلتك</DialogTitle>
          <DialogDescription>
            شاركنا رأيك في رحلتك مع الناقل لمساعدتنا في تحسين الخدمة.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="ratingValue"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="mb-2">تقييمك العام</FormLabel>
                  <FormControl>
                    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-8 w-8 cursor-pointer transition-colors',
                            (hoverRating || selectedRating) >= star
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-muted-foreground/50'
                          )}
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoverRating(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="صف لنا تجربتك..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting || selectedRating === 0}>
                {isSubmitting ? (
                    <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...</>
                ) : (
                    <><Send className="ml-2 h-4 w-4" /> إرسال التقييم</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
