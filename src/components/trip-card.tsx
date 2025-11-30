
'use client';

import type { Trip } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, MapPin, Users, Phone, Car, Tag } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { LegalDisclaimerDialog } from './legal-disclaimer-dialog';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const carrierImage = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const departureTime = new Date(trip.departureDate).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const handleBookingClick = () => {
    setIsDisclaimerOpen(true);
  };

  return (
    <>
      <Card className="w-full overflow-hidden shadow-lg transition-all hover:shadow-primary/20 hover:border-primary/40 border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-accent">
              {carrierImage && <AvatarImage src={carrierImage.imageUrl} alt={trip.carrierName} />}
              <AvatarFallback>{trip.carrierName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow space-y-1">
              <p className="font-bold text-lg text-foreground">{trip.carrierName}</p>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Car className="h-4 w-4 text-accent" />
                <span>{trip.vehicleType} - موديل {trip.vehicleModelYear}</span>
              </div>
               <div className="flex items-center text-sm text-muted-foreground gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span>نقطة الانطلاق: {trip.origin}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 my-4" />

          <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4"/>
                  <span>وقت المغادرة: {departureTime}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4"/>
                  <span>{trip.availableSeats} مقاعد متاحة</span>
              </div>
          </div>
            
          <div className="flex justify-between items-center mt-4">
             <div className="flex items-center gap-1 font-bold text-accent text-xl">
                  <span>50</span>
                  <span className="text-sm font-normal">JOD</span>
              </div>
              <Button size="sm" onClick={handleBookingClick}>
                حجز وتفاصيل
              </Button>
          </div>
        </CardContent>
      </Card>

      <LegalDisclaimerDialog 
        isOpen={isDisclaimerOpen}
        onOpenChange={setIsDisclaimerOpen}
      />
    </>
  );
}
