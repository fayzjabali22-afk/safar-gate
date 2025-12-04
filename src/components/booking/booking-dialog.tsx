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
import { useState, useEffect, useMemo } from 'react';
import type { Trip, Offer } from '@/lib/data';
import { Send, Loader2, Wallet, CircleDollarSign, HandCoins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export interface PassengerDetails {
  name: string;
  type: 'adult' | 'child';
}

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip;
  offerPrice: number;
  depositPercentage: number;
  seatCount: number;
  onConfirm: (passengers: PassengerDetails[]) => void;
  isProcessing?: boolean;
}

export function BookingDialog({ 
  isOpen, 
  onOpenChange, 
  trip,
  offerPrice,
  depositPercentage,
  seatCount, 
  onConfirm, 
  isProcessing = false 
}: BookingDialogProps) {
    const { toast } = useToast();
    const [passengers, setPassengers] = useState<PassengerDetails[]>([]);

    useEffect(() => {
        if (isOpen) {
            setPassengers(Array.from({ length: seatCount }, () => ({ name: '', type: 'adult' })));
        }
    }, [isOpen, seatCount]);
    
    const { totalAmount, depositAmount, remainingAmount } = useMemo(() => {
        const total = offerPrice * seatCount;
        const deposit = total * (depositPercentage / 100);
        const remaining = total - deposit;
        return {
            totalAmount: total,
            depositAmount: deposit,
            remainingAmount: remaining,
        };
    }, [offerPrice, seatCount, depositPercentage]);

    const handlePassengerChange = (index: number, field: keyof PassengerDetails, value: string) => {
        setPassengers(prev => {
            const newPassengers = [...prev];
            newPassengers[index] = { ...newPassengers[index], [field]: value as any }; 
            return newPassengers;
        });
    };

    const handleSubmit = () => {
        const allNamesFilled = passengers.every(p => p.name.trim() !== '');
        if (!allNamesFilled) {
            toast({
                variant: 'destructive',
                title: 'بيانات غير مكتملة',
                description: 'الرجاء إدخال أسماء جميع الركاب لإتمام الحجز.',
            });
            return;
        }
        onConfirm(passengers);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && onOpenChange(open)}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>تأكيد الحجز والدفع</DialogTitle>
                    <DialogDescription>
                        أنت على وشك حجز {seatCount} مقعد(مقاعد) لرحلة {trip.origin} - {trip.destination}.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[50vh] p-1 pr-4">
                    <div className="space-y-6">
                        {passengers.map((passenger, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                            <Label className="font-bold text-primary">الراكب {index + 1}</Label>
                            <div className="grid gap-2">
                                <Label htmlFor={`name-${index}`}>الاسم الكامل</Label>
                                <Input
                                    id={`name-${index}`}
                                    placeholder="أدخل الاسم الكامل كما في الهوية"
                                    value={passenger.name}
                                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                    disabled={isProcessing}
                                    className="bg-background"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>الفئة العمرية</Label>
                                <RadioGroup
                                    value={passenger.type}
                                    onValueChange={(value) => handlePassengerChange(index, 'type', value)}
                                    className="flex gap-4"
                                    disabled={isProcessing}
                                >
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse border p-2 rounded-md bg-background flex-1 justify-center cursor-pointer hover:bg-accent/50 transition-colors">
                                        <RadioGroupItem value="adult" id={`adult-${index}`} />
                                        <Label htmlFor={`adult-${index}`} className="cursor-pointer">بالغ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse border p-2 rounded-md bg-background flex-1 justify-center cursor-pointer hover:bg-accent/50 transition-colors">
                                        <RadioGroupItem value="child" id={`child-${index}`} />
                                        <Label htmlFor={`child-${index}`} className="cursor-pointer">طفل</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
                
                <Separator className="my-4"/>

                <div className="p-4 border rounded-lg bg-secondary/30 space-y-3">
                    <h3 className="font-bold flex items-center gap-2"><Wallet className="h-5 w-5 text-primary"/>ملخص الدفع</h3>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">السعر الإجمالي للرحلة:</span>
                        <span className="font-bold">{totalAmount.toFixed(2)} د.أ</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                        <span className="font-bold flex items-center gap-1"><HandCoins className="h-4 w-4"/> العربون المطلوب دفعه الآن ({depositPercentage}%):</span>
                        <span className="font-bold text-lg">{depositAmount.toFixed(2)} د.أ</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>المبلغ المتبقي (يُدفع للناقل مباشرة):</span>
                        <span className="font-semibold">{remainingAmount.toFixed(2)} د.أ</span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)} 
                        disabled={isProcessing}
                    >
                        إلغاء
                    </Button>
                    <Button 
                        type="submit" 
                        onClick={handleSubmit} 
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري التأكيد...
                            </>
                        ) : (
                            <>
                                <Send className="ml-2 h-4 w-4" />
                                تأكيد ودفع العربون
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
