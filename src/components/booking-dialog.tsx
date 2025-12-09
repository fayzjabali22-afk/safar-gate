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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import type { Trip, PassengerDetails } from '@/lib/data';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type { PassengerDetails };

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip;
  seatCount: number;
  onConfirm: (passengers: PassengerDetails[]) => Promise<void>;
  isProcessing?: boolean; // خاصية التحكم بحالة التحميل
}

export function BookingDialog({ 
  isOpen, 
  onOpenChange, 
  trip, 
  seatCount, 
  onConfirm, 
}: BookingDialogProps) {
    const { toast } = useToast();
    const [passengers, setPassengers] = useState<PassengerDetails[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (isOpen) {
            // إعادة تعيين النموذج عند فتح النافذة
            setPassengers(Array.from({ length: seatCount }, () => ({ name: '', nationality: '', documentNumber: '', type: 'adult' })));
        }
    }, [isOpen, seatCount]);


    // دالة تحديث بيانات الراكب مع معالجة الأنواع
    const handlePassengerChange = (index: number, field: keyof PassengerDetails, value: string) => {
        setPassengers(prev => {
            const newPassengers = [...prev];
            // Type assertion here ensures typescript is happy treating the string as the specific union type
            newPassengers[index] = { ...newPassengers[index], [field]: value as any }; 
            return newPassengers;
        });
    };

    const handleSubmit = async () => {
        const allNamesFilled = passengers.every(p => p.name.trim() !== '' && p.nationality.trim() !== '' && p.documentNumber.trim() !== '');
        if (!allNamesFilled) {
            toast({
                variant: 'destructive',
                title: 'بيانات غير مكتملة',
                description: 'الرجاء إدخال كافة البيانات المطلوبة لكل راكب (الاسم، الجنسية، رقم الوثيقة).',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await onConfirm(passengers);
            // On success, the parent component handles closing the dialog
        } catch (error) {
            // Errors are toasted in the parent, but we must stop the loading state here
            setIsSubmitting(false);
        }
        // No need to set isSubmitting(false) on success, as the component will unmount
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onOpenChange(open)}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                <DialogTitle>تأكيد الحجز: تفاصيل الركاب</DialogTitle>
                <DialogDescription>
                    أنت على وشك حجز {seatCount} مقعد(مقاعد) لرحلة {trip.origin} - {trip.destination}.
                </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh] p-1 pr-4">
                    <div className="space-y-6">
                        {passengers.map((passenger, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                            <Label className="font-bold text-primary">الراكب {index + 1}</Label>
                            
                            <div className="grid gap-2">
                                <Label htmlFor={`name-${index}`}>الاسم الكامل (كما في الوثيقة)</Label>
                                <Input
                                    id={`name-${index}`}
                                    placeholder="أدخل الاسم الكامل"
                                    value={passenger.name}
                                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-background"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor={`nationality-${index}`}>الجنسية</Label>
                                    <Input
                                        id={`nationality-${index}`}
                                        placeholder="مثال: أردني"
                                        value={passenger.nationality}
                                        onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                                        disabled={isSubmitting}
                                        className="bg-background"
                                    />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor={`document-${index}`}>رقم جواز السفر/الهوية</Label>
                                    <Input
                                        id={`document-${index}`}
                                        placeholder="أدخل رقم الوثيقة"
                                        value={passenger.documentNumber}
                                        onChange={(e) => handlePassengerChange(index, 'documentNumber', e.target.value)}
                                        disabled={isSubmitting}
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
                
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => onOpenChange(false)} 
                        disabled={isSubmitting}
                    >
                        إلغاء
                    </Button>
                    <Button 
                        type="submit" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري الإرسال...
                            </>
                        ) : (
                            <>
                                <Send className="ml-2 h-4 w-4" />
                                إرسال الطلب للناقل
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
