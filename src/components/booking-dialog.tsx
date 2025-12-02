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
import type { Trip } from '@/lib/data';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface PassengerDetails {
  name: string;
  type: 'adult' | 'child';
}

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip;
  seatCount: number;
  onConfirm: (passengers: PassengerDetails[]) => void;
}

export function BookingDialog({ isOpen, onOpenChange, trip, seatCount, onConfirm }: BookingDialogProps) {
    const { toast } = useToast();
    
    const [passengers, setPassengers] = useState<PassengerDetails[]>([]);

    useEffect(() => {
        if (isOpen) {
            setPassengers(Array(seatCount).fill({ name: '', type: 'adult' }));
        }
    }, [isOpen, seatCount]);


    const handlePassengerChange = (index: number, field: 'name' | 'type', value: string) => {
        const newPassengers = [...passengers];
        newPassengers[index] = { ...newPassengers[index], [field]: value };
        setPassengers(newPassengers);
    };

    const handleSubmit = () => {
        const allNamesFilled = passengers.every(p => p.name.trim() !== '');
        if (!allNamesFilled) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Data',
                description: 'Please enter the names of all passengers.',
            });
            return;
        }
        onConfirm(passengers);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                <DialogTitle>Confirm Booking: Passenger Details</DialogTitle>
                <DialogDescription>
                    You are about to book {seatCount} seat(s). Please enter passenger details.
                </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh] p-4">
                    <div className="space-y-6">
                        {Array.from({ length: seatCount }).map((_, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/50">
                            <Label className="font-bold">Passenger {index + 1}</Label>
                            <div className="grid gap-2">
                                <Label htmlFor={`name-${index}`}>Full Name</Label>
                                <Input
                                    id={`name-${index}`}
                                    placeholder="Enter passenger's full name"
                                    value={passengers[index]?.name || ''}
                                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Age Group</Label>
                                <RadioGroup
                                    defaultValue="adult"
                                    className="flex gap-4"
                                    value={passengers[index]?.type || 'adult'}
                                    onValueChange={(value) => handlePassengerChange(index, 'type', value)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="adult" id={`adult-${index}`} />
                                        <Label htmlFor={`adult-${index}`}>Adult</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="child" id={`child-${index}`} />
                                        <Label htmlFor={`child-${index}`}>Child</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
                
                <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" onClick={handleSubmit}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Booking Request
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
