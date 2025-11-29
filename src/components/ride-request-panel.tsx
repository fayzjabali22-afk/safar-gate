'use client';
import { useState, useEffect } from 'react';
import {
  Car,
  ChevronRight,
  CircleDot,
  Loader2,
  MapPin,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FareEstimateDialog } from './fare-estimate-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

type RideStatus = 'idle' | 'requesting' | 'driver_found' | 'in_progress' | 'completed';

const driver = {
    name: 'Ahmed',
    vehicle: 'Toyota Camry',
    rating: 4.9,
    plate: 'ABC 1234',
    avatarUrl: 'https://picsum.photos/seed/4/100/100',
    eta: 5
}

export function RideRequestPanel() {
  const [status, setStatus] = useState<RideStatus>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'requesting') {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 5;
            });
        }, 500);
        timer = setTimeout(() => {
            clearInterval(interval);
            setStatus('driver_found');
            toast({
                title: "Driver Found!",
                description: `${driver.name} is on their way.`,
            });
        }, 10000);
    } else if (status === 'driver_found') {
        timer = setTimeout(() => {
            setStatus('in_progress');
            toast({
                title: "You're on your way!",
                description: `Heading to your destination.`,
            });
        }, driver.eta * 60 * 1000 * 0.2); // Simulate pickup
    } else if (status === 'in_progress') {
        timer = setTimeout(() => {
            setStatus('completed');
            toast({
                title: "Ride Completed!",
                description: `Thanks for riding with Fayz.`,
            });
        }, 15000);
    }

    return () => clearTimeout(timer);
  }, [status, toast]);


  const handleRequestRide = () => {
    setStatus('requesting');
    toast({
        title: "Requesting Ride",
        description: "Searching for nearby drivers...",
    });
  };

  const handleNewRide = () => {
    setStatus('idle');
    setProgress(0);
  }

  if (status !== 'idle') {
    return (
        <Card className="h-full flex flex-col shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline">{
                    {
                        requesting: 'Finding your ride...',
                        driver_found: 'Driver is on the way!',
                        in_progress: 'On your way!',
                        completed: 'Ride Completed'
                    }[status]
                }</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center text-center gap-4">
                {status === 'requesting' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-muted-foreground">This should only take a moment.</p>
                        <Progress value={progress} className="w-full" />
                    </>
                )}
                {(status === 'driver_found' || status === 'in_progress') && (
                    <>
                         <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={driver.avatarUrl} alt={driver.name} />
                            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{driver.name}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {driver.rating}
                        </div>
                        <div className="text-lg">{driver.vehicle} &bull; <span className="font-mono">{driver.plate}</span></div>
                        {status === 'driver_found' && <p className="text-2xl font-bold text-primary">{driver.eta} min away</p>}
                        {status === 'in_progress' && <p className="text-lg font-bold text-green-600">You have arrived at your destination.</p>}
                    </>
                )}
                {status === 'completed' && (
                    <>
                        <Car className="h-16 w-16 text-primary" />
                        <h3 className="text-2xl font-bold">Thank You!</h3>
                        <p className="text-muted-foreground">We hope you enjoyed your ride.</p>
                        <Button onClick={handleNewRide} className="w-full mt-4">
                            Request Another Ride
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
  }


  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Where to?</CardTitle>
        <CardDescription>Enter your destination to start your journey.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pickup">Pickup location</Label>
          <div className="relative">
            <CircleDot className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="pickup" placeholder="Current location" className="pl-8" defaultValue="King Saud University" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="destination">Destination</Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="destination" placeholder="Where are you going?" className="pl-8" />
          </div>
        </div>
        <div className="flex justify-end">
            <FareEstimateDialog />
        </div>
        <Button onClick={handleRequestRide} size="lg" className="w-full">
          Request Ride
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
