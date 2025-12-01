'use client';

import type { Trip } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Car } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import { TripDetailsDialog } from './trip-details-dialog'; // Import the new component

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const carrierImage = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const [departureTime, setDepartureTime] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    // Format the time on the client-side to avoid hydration mismatch
    setDepartureTime(
      new Date(trip.departureDate).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
  }, [trip.departureDate]);


  const handleDetailsClick = () => {
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card className="w-full overflow-hidden shadow-lg transition-all hover:shadow-primary/20 border-2" style={{borderColor: '#EDC17C'}}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-accent">
              {carrierImage && <AvatarImage src={carrierImage.imageUrl} alt={trip.carrierName} />}
              <AvatarFallback>{trip.carrierName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow space-y-1">
              <p className="font-bold text-lg text-foreground">{trip.carrierName}</p>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Car className="h-4 w-4 text-accent" />
                <span>{trip.vehicleType} - موديل {trip.vehicleModelYear}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 my-4" />

          <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4"/>
                  <span>وقت المغادرة: {departureTime || '...'}</span>
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
              <Button size="sm" onClick={handleDetailsClick}>
                تفاصيل وحجز
              </Button>
          </div>
        </CardContent>
      </Card>

      <TripDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        trip={trip}
      />
    </>
  );
}
