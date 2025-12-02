'use client';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Search, ShipWheel, CalendarIcon, UserSearch, Globe, Star, TestTube2, Bus, Car, ArrowDownUp, DollarSign, Hourglass } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { Trip, Offer, Booking } from '@/lib/data';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, addDoc, writeBatch, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { AuthRedirectDialog } from '@/components/auth-redirect-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { scheduledTrips } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimerDialog } from '@/components/legal-disclaimer-dialog';
import { ScheduledTripCard } from '@/components/scheduled-trip-card';
import { BookingDialog, PassengerDetails } from '@/components/booking-dialog';


// Mock data for countries and cities
const countries: { [key: string]: { name: string; cities: string[] } } = {
  syria: { name: 'Syria', cities: ['damascus', 'aleppo', 'homs'] },
  jordan: { name: 'Jordan', cities: ['amman', 'irbid', 'zarqa'] },
  ksa: { name: 'Saudi Arabia', cities: ['riyadh', 'jeddah', 'dammam'] },
  egypt: { name: 'Egypt', cities: ['cairo', 'alexandria', 'giza'] },
};

const cities: { [key: string]: string } = {
    damascus: 'Damascus', aleppo: 'Aleppo', homs: 'Homs',
    amman: 'Amman', irbid: 'Irbid', zarqa: 'Zarqa',
    riyadh: 'Riyadh', jeddah: 'Jeddah', dammam: 'Dammam',
    cairo: 'Cairo', alexandria: 'Alexandria', giza: 'Giza',
    dubai: 'Dubai', kuwait: 'Kuwait'
};


export default function DashboardPage() {
  const [date, setDate] = useState<Date>();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAuthRedirectOpen, setIsAuthRedirectOpen] = useState(false);
  const [isLegalDisclaimerOpen, setIsLegalDisclaimerOpen] = useState(false);
  const [tripRequestData, setTripRequestData] = useState<Omit<Trip, 'id' | 'userId' | 'status' | 'departureDate'> | null>(null);

  const [searchOriginCountry, setSearchOriginCountry] = useState('');
  const [searchOriginCity, setSearchOriginCity] = useState('');
  const [searchDestinationCountry, setSearchDestinationCountry] = useState('');
  const [searchDestinationCity, setSearchDestinationCity] = useState('');
  const [searchSeats, setSearchSeats] = useState(1);
  const [searchMode, setSearchMode] = useState<'all-carriers' | 'specific-carrier'>('all-carriers');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [carrierSearch, setCarrierSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'date' | 'price'>('default');

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedTripForBooking, setSelectedTripForBooking] = useState<Trip | null>(null);
  
  useEffect(() => {
    setSearchOriginCity('');
  }, [searchOriginCountry]);

  useEffect(() => {
    setSearchDestinationCity('');
  }, [searchDestinationCountry]);

  const handleBookNow = (trip: Trip) => {
    if (!user) {
        setIsAuthRedirectOpen(true);
        return;
    }
    setSelectedTripForBooking(trip);
    setIsBookingDialogOpen(true);
  };
  
  const handleConfirmBooking = async (passengers: PassengerDetails[]) => {
     if (!user || !firestore || !selectedTripForBooking) return;

    toast({ title: "Sending booking request...", description: "You will be redirected to track the request status." });

    const newBooking: Omit<Booking, 'id'> = {
        tripId: selectedTripForBooking.id,
        userId: user.uid,
        carrierId: selectedTripForBooking.carrierId!,
        seats: passengers.length,
        passengersDetails: passengers,
        status: 'Pending-Carrier-Confirmation',
        totalPrice: (selectedTripForBooking.price || 0) * passengers.length,
    };
    
     try {
        await addDoc(collection(firestore, 'bookings'), newBooking);

        const userNotifRef = doc(collection(firestore, `users/${user.uid}/notifications`));
        await addDoc(collection(firestore, `users/${user.uid}/notifications`), {
            userId: user.uid,
            title: "Booking Request Sent",
            message: `Your request for the trip to ${cities[selectedTripForBooking.origin]} is under review by the carrier.`,
            type: 'new_booking_request',
            isRead: false,
            createdAt: serverTimestamp(),
            link: `/history`
        });


        toast({ title: "Booking request sent successfully", description: "Awaiting carrier approval. You can track the request on the history page." });
        router.push('/history');
    } catch (error) {
        console.error("Error creating booking:", error);
        toast({ title: "Error", description: "Could not create booking.", variant: "destructive" });
    } finally {
        setIsBookingDialogOpen(false);
        setSelectedTripForBooking(null);
    }
  };


  const handleLegalConfirm = async () => {
    setIsLegalDisclaimerOpen(false);
    if (!user || !firestore || !tripRequestData || !date) return;

    const newTrip: Omit<Trip, 'id'> = {
        userId: user.uid,
        origin: tripRequestData.origin,
        destination: tripRequestData.destination,
        departureDate: date.toISOString(),
        status: 'Awaiting-Offers',
        passengers: tripRequestData.passengers,
    };
    
    try {
        const tripRef = await addDoc(collection(firestore, 'trips'), newTrip);
        toast({ title: "Request Sent!", description: "Your trip request has been sent to carriers." });
        router.push('/history'); // Redirect to history to see the new request
    } catch (error) {
        console.error("Error creating trip request:", error);
        toast({ title: "Error", description: "Could not create your trip request.", variant: "destructive" });
    }
  };


  const handleCreateTripRequest = async () => {
    if (!user) {
        setIsAuthRedirectOpen(true);
        return;
    }
    
    if (!searchOriginCity || !searchDestinationCity || !date) {
        toast({ title: "Incomplete details", description: "Please fill in all trip details.", variant: "destructive" });
        return;
    }

    const currentTripData = {
        origin: searchOriginCity,
        destination: searchDestinationCity,
        passengers: searchSeats,
    };
    
    setTripRequestData(currentTripData);
    setIsLegalDisclaimerOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthRedirectOpen(false);
  };

  const filteredScheduledTrips = useMemo(() => {
    let trips = scheduledTrips.filter(trip => {
      const originMatch = !searchOriginCity || trip.origin === searchOriginCity;
      const destinationMatch = !searchDestinationCity || trip.destination === searchDestinationCity;
      const carrierMatch = !carrierSearch || (trip.carrierName && trip.carrierName.toLowerCase().includes(carrierSearch.toLowerCase()));
      return originMatch && destinationMatch && carrierMatch;
    });

    if (sortOrder === 'date') {
        trips = trips.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
    } else if (sortOrder === 'price') {
        trips = trips.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
    }
    
    return trips;

  }, [searchOriginCity, searchDestinationCity, carrierSearch, filterVehicle, sortOrder]);


  return (
    <AppLayout>
      <div className="container mx-auto p-0 md:p-4 rounded-lg space-y-8">
        
        <div className="flex flex-col items-center gap-8 p-2 lg:p-4">
          <header className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Where to next?</h1>
            <p className="text-muted-foreground mt-2">Find a ride or request quotes from top carriers.</p>
          </header>

          <Card className="w-full max-w-4xl shadow-lg rounded-lg border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Find a ride or create a request</CardTitle>
              <CardDescription>Use the form below to search for scheduled trips or create a custom trip request.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="grid gap-3">
                  <Label className="text-base">Step 1: Choose request method</Label>
                   <RadioGroup
                      defaultValue="all-carriers"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      onValueChange={(value) => setSearchMode(value as 'specific-carrier' | 'all-carriers')}
                  >
                    <div>
                      <RadioGroupItem value="all-carriers" id="all-carriers" className="peer sr-only" />
                      <Label
                        htmlFor="all-carriers"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Globe className="mb-3 h-6 w-6" />
                        Request quotes from all carriers
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="specific-carrier" id="specific-carrier" className="peer sr-only" />
                      <Label
                        htmlFor="specific-carrier"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <UserSearch className="mb-3 h-6 w-6" />
                        Request from a specific carrier
                      </Label>
                    </div>
                  </RadioGroup>
                   <div className="flex flex-col gap-3 pt-4">
                    {searchMode === 'specific-carrier' && (
                      <div className="grid gap-2 animate-in fade-in-50">
                        <Label htmlFor="carrier-search">Search your favorite carrier by name or phone</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="carrier-search" placeholder="e.g. Speedy Transport..." className="pl-10" onChange={(e) => setCarrierSearch(e.target.value)} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                        <RadioGroup defaultValue="all" className="flex items-center gap-4 flex-wrap" onValueChange={setFilterVehicle}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="r-all-req" />
                              <Label htmlFor="r-all-req">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="small" id="r-car-req" />
                              <Label htmlFor="r-car-req" className="flex items-center gap-2"><Car/>Car</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bus" id="r-bus-req" />
                              <Label htmlFor="r-bus-req" className="flex items-center gap-2"><Bus/>Bus</Label>
                            </div>
                        </RadioGroup>
                    </div>
                 </div>
                </div>
                
                 <div className="grid gap-3 md:col-span-1">
                  <Label className="text-base">Step 2: Enter your trip details</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="origin-country">Origin Country</Label>
                        <Select onValueChange={setSearchOriginCountry} value={searchOriginCountry}>
                          <SelectTrigger id="origin-country"><SelectValue placeholder="Select origin country" /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(countries).map(([key, {name}]) => (
                              <SelectItem key={key} value={key}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="origin-city">Origin City</Label>
                        <Select onValueChange={setSearchOriginCity} value={searchOriginCity} disabled={!searchOriginCountry}>
                          <SelectTrigger id="origin-city"><SelectValue placeholder="Select origin city" /></SelectTrigger>
                          <SelectContent>
                            {searchOriginCountry && countries[searchOriginCountry as keyof typeof countries]?.cities.map(cityKey => (
                              <SelectItem key={cityKey} value={cityKey}>{cities[cityKey]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="destination-country">Destination Country</Label>
                      <Select onValueChange={setSearchDestinationCountry} value={searchDestinationCountry}>
                        <SelectTrigger id="destination-country"><SelectValue placeholder="Select destination country" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(countries)
                            .filter(([key]) => key !== searchOriginCountry)
                            .map(([key, {name}]) => (
                              <SelectItem key={key} value={key}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="destination-city">Destination City</Label>
                      <Select onValueChange={setSearchDestinationCity} value={searchDestinationCity} disabled={!searchDestinationCountry}>
                        <SelectTrigger id="destination-city"><SelectValue placeholder="Select destination city" /></SelectTrigger>
                        <SelectContent>
                          {searchDestinationCountry && countries[searchDestinationCountry as keyof typeof countries]?.cities.map(cityKey => (
                              <SelectItem key={cityKey} value={cityKey}>{cities[cityKey]}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="travel-date">Travel Date (approx.)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="seats">Number of Seats</Label>
                      <Select onValueChange={(val) => setSearchSeats(parseInt(val))} defaultValue={String(searchSeats)}>
                        <SelectTrigger id="seats">
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
          
            <div className="w-full max-w-4xl space-y-4">
               <CardTitle className="text-primary text-center">Or book a scheduled trip directly</CardTitle>
              
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScheduledTrips.map(trip => (
                  <ScheduledTripCard key={trip.id} trip={trip} onBookNow={handleBookNow} />
                ))}
              </div>

              {filteredScheduledTrips.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                      <p>No scheduled trips match your search right now.</p>
                      <p className="text-sm">Try adjusting your filters or create a new request below.</p>
                  </div>
              )}

               <div className="pt-4 space-y-2">
                    <Button size="lg" className="w-full" onClick={handleCreateTripRequest}>
                        Request Quotes from Carriers
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full" onClick={() => setSortOrder('date')}>
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Sort by Date
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setSortOrder('price')}>
                           <DollarSign className="mr-2 h-4 w-4" />
                            Sort by Price
                        </Button>
                    </div>
                </div>
            </div>
        </div>


      </div>
      <AuthRedirectDialog isOpen={isAuthRedirectOpen} onOpenChange={setIsAuthRedirectOpen} onLoginSuccess={handleAuthSuccess} />
      <LegalDisclaimerDialog isOpen={isLegalDisclaimerOpen} onOpenChange={setIsLegalDisclaimerOpen} onContinue={handleLegalConfirm} />
       {selectedTripForBooking && (
            <BookingDialog
                isOpen={isBookingDialogOpen}
                onOpenChange={setIsBookingDialogOpen}
                trip={selectedTripForBooking}
                seatCount={searchSeats}
                onConfirm={handleConfirmBooking}
            />
        )}
    </AppLayout>
  );
}
