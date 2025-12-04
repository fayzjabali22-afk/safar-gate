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
import type { Trip } from '@/lib/data';
import { Send, Loader2, CreditCard, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface PassengerDetails {
  name: string;
  type: 'adult' | 'child';
}

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip;
  seatCount: number;
  offerPrice: number; // Price per seat from the offer
  depositPercentage: number; // Percentage required for deposit
  onConfirm: (passengers: PassengerDetails[]) => void;
  isProcessing?: boolean;
}

export function BookingDialog({ 
  isOpen, 
  onOpenChange, 
  trip, 
  seatCount, 
  offerPrice,
  depositPercentage,
  onConfirm, 
  isProcessing = false 
}: BookingDialogProps) {
    const { toast } = useToast();
    const [passengers, setPassengers] = useState<PassengerDetails[]>([]);

    // Calculate totals
    const { totalAmount, depositAmount, remainingAmount } = useMemo(() => {
        const total = offerPrice * seatCount;
        const deposit = total * (depositPercentage / 100);
        const remaining = total - deposit;
        return { 
            totalAmount: total, 
            depositAmount: deposit, 
            remainingAmount: remaining 
        };
    }, [offerPrice, seatCount, depositPercentage]);

    useEffect(() => {
        if (isOpen) {
            setPassengers(Array.from({ length: seatCount }, () => ({ name: '', type: 'adult' })));
        }
    }, [isOpen, seatCount]);

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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                <DialogTitle>تأكيد الحجز والدفع</DialogTitle>
                <DialogDescription>
                    أكمل بيانات الركاب وادفع العربون لتأكيد حجزك.
                </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[50vh] p-1 pr-4">
                    <div className="space-y-6">
                        {/* Passenger Details Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</span>
                                بيانات الركاب ({seatCount})
                            </h3>
                            {passengers.map((passenger, index) => (
                            <div key={index} className="p-3 border rounded-lg space-y-3 bg-card">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs text-muted-foreground">الراكب {index + 1}</Label>
                                </div>
                                <div className="grid gap-3">
                                    <Input
                                        placeholder="الاسم الكامل"
                                        value={passenger.name}
                                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                        disabled={isProcessing}
                                        className="h-9"
                                    />
                                    <RadioGroup
                                        value={passenger.type}
                                        onValueChange={(value) => handlePassengerChange(index, 'type', value)}
                                        className="flex gap-2"
                                        disabled={isProcessing}
                                    >
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse border px-3 py-1.5 rounded-md bg-background flex-1 cursor-pointer hover:bg-accent/50">
                                            <RadioGroupItem value="adult" id={`adult-${index}`} />
                                            <Label htmlFor={`adult-${index}`} className="cursor-pointer text-sm">بالغ</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse border px-3 py-1.5 rounded-md bg-background flex-1 cursor-pointer hover:bg-accent/50">
                                            <RadioGroupItem value="child" id={`child-${index}`} />
                                            <Label htmlFor={`child-${index}`} className="cursor-pointer text-sm">طفل</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Payment Summary Section */}
                        <div className="space-y-3">
                             <h3 className="font-semibold text-sm flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</span>
                                ملخص الدفع
                            </h3>
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="p-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>السعر الإجمالي ({seatCount} مقاعد)</span>
                                        <span>{totalAmount.toFixed(2)} د.أ</span>
                                    </div>
                                    <Separator className="bg-border/50" />
                                    <div className="flex justify-between font-medium pt-1">
                                        <span className="flex items-center gap-1.5 text-primary">
                                            <CreditCard className="h-4 w-4" />
                                            العربون المطلوب (الآن)
                                        </span>
                                        <span className="text-primary font-bold">{depositAmount.toFixed(2)} د.أ</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-xs pt-1">
                                        <span className="flex items-center gap-1.5">
                                            <Banknote className="h-3 w-3" />
                                            المبلغ المتبقي للكابتن
                                        </span>
                                        <span>{remainingAmount.toFixed(2)} د.أ</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
                
                <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
                        className="w-full sm:w-auto min-w-[140px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري المعالجة...
                            </>
                        ) : (
                            <>
                                <Send className="ml-2 h-4 w-4" />
                                دفع {depositAmount.toFixed(2)} د.أ وتأكيد
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}