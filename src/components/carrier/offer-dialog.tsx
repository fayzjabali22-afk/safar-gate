'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Trip } from '@/lib/data';
import { Loader2, Send, Sparkles } from 'lucide-react';
import React from 'react';

const offerFormSchema = z.object({
  price: z.coerce.number().positive('يجب أن يكون السعر رقماً موجباً'),
  vehicleType: z.string().min(3, 'نوع المركبة مطلوب'),
  depositPercentage: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

interface OfferDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip;
  suggestion: { price: number; justification: string } | null;
  isSuggestingPrice: boolean;
  onSuggestPrice: () => void;
}

export function OfferDialog({ isOpen, onOpenChange, trip, suggestion, isSuggestingPrice, onSuggestPrice }: OfferDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      price: undefined,
      vehicleType: '',
      depositPercentage: 20,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (suggestion) {
        form.setValue('price', suggestion.price);
    }
  }, [suggestion, form]);

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    // SIMULATION
    setTimeout(() => {
        toast({
            title: 'محاكاة: تم إرسال العرض بنجاح',
            description: 'سيتم إعلام المسافر بعرضك.',
        });
        setIsSubmitting(false);
        onOpenChange(false);
        form.reset();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>تقديم عرض جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل عرضك لرحلة {trip.origin} إلى {trip.destination}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>السعر الإجمالي (بالدينار)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 100" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="depositPercentage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>نسبة العربون (%)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 20" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <Button type="button" variant="outline" className="w-full" onClick={onSuggestPrice} disabled={isSuggestingPrice}>
                {isSuggestingPrice ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <Sparkles className="ml-2 h-4 w-4 text-yellow-500" />}
                {isSuggestingPrice ? 'جاري التفكير...' : 'اقترح لي سعراً مناسباً (AI)'}
             </Button>
            {suggestion && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
                    <p><strong>تعليل الاقتراح:</strong> {suggestion.justification}</p>
                </div>
            )}
             <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المركبة</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., GMC Yukon 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اذكر أي تفاصيل إضافية هنا (مثل: التوقف للاستراحة، وجود واي فاي...)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                    </>
                ) : (
                    <>
                        <Send className="ml-2 h-4 w-4" />
                        إرسال العرض
                    </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
