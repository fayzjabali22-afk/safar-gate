import { AppLayout } from '@/components/app-layout';
import { rideHistory } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HistorySummary } from '@/components/history-summary';
import { Car, CircleDot, MapPin, Star } from 'lucide-react';

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <HistorySummary />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rideHistory.map((ride) => (
            <Card key={ride.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{new Date(ride.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}</span>
                   <Badge variant="secondary" className="font-mono">{ride.id}</Badge>
                </CardTitle>
                <CardDescription>
                  Fare: <span className="font-semibold text-primary">${ride.fare.toFixed(2)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <div className="flex items-start space-x-3">
                    <CircleDot className="mt-1 h-4 w-4 text-accent" />
                    <div>
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="font-medium">{ride.pickup}</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-3">
                    <MapPin className="mt-1 h-4 w-4 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-medium">{ride.destination}</p>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/50 px-6 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{ride.driver.name}</p>
                        <p className="text-xs text-muted-foreground">{ride.driver.vehicle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span>{ride.driver.rating.toFixed(1)}</span>
                  </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
