'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LegalDisclaimerDialog } from './legal-disclaimer-dialog';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Trip } from '@/lib/data';
import { Car, Clock, Users, MapPin, Calendar, Info } from 'lucide-react';

interface TripDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: Trip;
}

export function TripDetailsDialog({ isOpen, onOpenChange, trip }: TripDetailsDialogProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const handleBookingClick = () => {
    if (!user) {
      // If user is not logged in, we should guide them to login.
      // The disclaimer dialog can handle this.
      toast({
        title: "الرجاء تسجيل الدخول",
        description: "يجب عليك تسجيل الدخول أولاً لتتمكن من الحجز.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }
     if (user && !user.emailVerified) {
        toast({
            variant: "destructive",
            title: "الحساب غير مفعل",
            description: "الرجاء تفعيل حسابك أولاً لتتمكن من الحجز.",
        });
        return;
    }
    // If user is logged in, open the legal disclaimer
    setIsDisclaimerOpen(true);
  };
  
  const handleDisclaimerContinue = () => {
      // This is the final step in this flow for now.
      // It confirms the whole path is working.
      setIsDisclaimerOpen(false);
      onOpenChange(false); // Close the details dialog as well
      toast({
          title: "تم الإقرار.",
          description: "سيتم الآن فتح بطاقة الحجز...",
      });
      // In the next phase, we will navigate to or open the booking/payment form here.
  }

  const departureDate = new Date(trip.departureDate).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const departureTime = new Date(trip.departureDate).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl">تفاصيل الرحلة</DialogTitle>
            <DialogDescription>
              معلومات مفصلة عن الرحلة من {trip.origin} إلى {trip.destination}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="font-semibold">{departureDate}</p>
                <p className="text-sm text-muted-foreground">تاريخ المغادرة</p>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="font-semibold">{departureTime}</p>
                <p className="text-sm text-muted-foreground">وقت المغادرة</p>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="font-semibold">{trip.availableSeats} مقاعد متاحة</p>
                <p className="text-sm text-muted-foreground">العدد المتاح للحجز</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Car className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="font-semibold">{trip.vehicleType} - موديل {trip.vehicleModelYear}</p>
                <p className="text-sm text-muted-foreground">نوع المركبة</p>
              </div>
            </div>
             {trip.cargoDetails && (
                 <div className="flex items-start gap-4">
                  <Info className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="text-right">
                    <p className="font-semibold">{trip.cargoDetails}</p>
                    <p className="text-sm text-muted-foreground">ملاحظات إضافية من الناقل</p>
                  </div>
                </div>
             )}
          </div>
          <DialogFooter className="sm:justify-between items-center">
            <div className="flex items-center gap-1 font-bold text-accent text-2xl">
              <span>50</span>
              <span className="text-base font-normal">JOD</span>
            </div>
            <Button type="button" size="lg" onClick={handleBookingClick}>حجز الآن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <LegalDisclaimerDialog 
        isOpen={isDisclaimerOpen}
        onOpenChange={setIsDisclaimerOpen}
        onContinue={handleDisclaimerContinue}
      />
    </>
  );
}
