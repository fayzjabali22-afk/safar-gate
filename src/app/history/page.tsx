
'use client';
import { AppLayout } from '@/components/app-layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Trip, Notification, Offer, Booking } from '@/lib/data';
import { collection, query, where, doc, writeBatch, getDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { Bell, CheckCircle, PackageOpen, Ship, Hourglass, XCircle, Info, Loader2, CreditCard } from 'lucide-react';
import { OfferCard } from '@/components/offer-card';
import { useToast } from '@/hooks/use-toast';
import { mockOffers, mockCarriers } from '@/lib/data';
import { LegalDisclaimerDialog } from '@/components/legal-disclaimer-dialog';
import { format } from 'date-fns';


const statusMap: Record<string, string> = {
    'Awaiting-Offers': 'Awaiting Offers',
    'Planned': 'Pending Payment',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled',
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'Awaiting-Offers': 'outline',
    'Planned': 'secondary',
    'Completed': 'default',
    'Cancelled': 'destructive',
}

const cities: { [key: string]: string } = {
    damascus: 'Damascus', aleppo: 'Aleppo', homs: 'Homs',
    amman: 'Amman', irbid: 'Irbid', zarqa: 'Zarqa',
    riyadh: 'Riyadh', jeddah: 'Jeddah', dammam: 'Dammam',
    cairo: 'Cairo', alexandria: 'Alexandria', giza: 'Giza',
    dubai: 'Dubai', kuwait: 'Kuwait'
};

const TripOfferManager = ({ trip }: { trip: Trip; }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isAccepting, setIsAccepting] = useState<string | null>(null);
    const [isLegalDisclaimerOpen, setIsLegalDisclaimerOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);


    const offersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `trips/${trip.id}/offers`), where("status", "==", "Pending"));
    }, [firestore, trip.id]);

    const { data: offers, isLoading: isLoadingOffers } = useCollection<Offer>(offersQuery);
    
    const acceptedOfferRef = useMemoFirebase(() => {
        if (!firestore || !trip.acceptedOfferId) return null;
        return doc(firestore, `trips/${trip.id}/offers`, trip.acceptedOfferId);
    }, [firestore, trip.id, trip.acceptedOfferId]);

    const { data: acceptedOffer, isLoading: isLoadingOffer } = useDoc<Offer>(acceptedOfferRef);

    const bookingRef = useMemoFirebase(() => {
        if (!firestore || !trip.currentBookingId) return null;
        return doc(firestore, 'bookings', trip.currentBookingId);
    }, [firestore, trip.currentBookingId]);

    const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingRef);

    const handleAcceptOfferClick = (offer: Offer) => {
        setSelectedOffer(offer);
        setIsLegalDisclaimerOpen(true);
    };


    const handleLegalConfirm = async () => {
        setIsLegalDisclaimerOpen(false);
        if (!firestore || !user || !selectedOffer || isAccepting) return;

        setIsAccepting(selectedOffer.id);
        toast({ title: "Sending booking request...", description: "We will simulate carrier approval." });

        const bookingDocRef = doc(collection(firestore, 'bookings'));
        const tripDocRef = doc(firestore, 'trips', trip.id);
        const offerDocRef = doc(firestore, `trips/${trip.id}/offers`, selectedOffer.id);

        const batch = writeBatch(firestore);
        
        const carrier = mockCarriers.find(c => c.id === selectedOffer.carrierId);
        
        batch.update(tripDocRef, {
            status: 'Planned',
            acceptedOfferId: selectedOffer.id,
            currentBookingId: bookingDocRef.id,
            carrierId: selectedOffer.carrierId,
            carrierName: carrier?.name || 'Mock Carrier Name',
        });
        
         batch.set(bookingDocRef, {
            tripId: trip.id,
            userId: user.uid,
            carrierId: selectedOffer.carrierId,
            seats: trip.passengers || 1,
            status: 'Pending-Payment',
            totalPrice: selectedOffer.price,
            passengersDetails: [],
        });

        batch.update(offerDocRef, { status: 'Accepted' });
        
        const userNotifRef = doc(collection(firestore, `users/${user.uid}/notifications`));
        const userNotification: Partial<Notification> = {
            userId: user.uid,
            title: "Booking Confirmed!",
            message: `Your booking for the trip from ${cities[trip.origin]} to ${cities[trip.destination]} has been approved. Please complete payment.`,
            type: 'booking_confirmed',
            isRead: false,
            createdAt: serverTimestamp() as any,
            link: `/history`
        };
        batch.set(userNotifRef, userNotification);


        try {
            await batch.commit();
            toast({ 
                title: "Booking Confirmed!", 
                description: "Your booking status is now pending payment.",
                duration: 5000,
            });

        } catch (err) {
            console.error("Error accepting offer:", err);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Could not accept the offer and create the booking.'
            })
        } finally {
            setIsAccepting(null);
        }
    };
    
    if (trip.status === 'Planned' && booking && acceptedOffer) {
        return (
             <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-b-lg">
                <CreditCard className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold">Pending Payment</h3>
                <p className="text-muted-foreground mt-2">
                    Your booking is confirmed by the carrier. Please proceed to payment.
                </p>
                <Button className="mt-4">Proceed to Payment</Button>
            </div>
        )
    }
    
    if (booking?.status === 'Pending-Carrier-Confirmation') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-b-lg">
                <Hourglass className="h-12 w-12 text-primary animate-bounce mb-4" />
                <h3 className="text-xl font-bold">Awaiting Carrier Approval</h3>
                <p className="text-muted-foreground mt-2">
                    Your request has been sent successfully. We will notify you once the carrier approves the booking.
                    <br/>
                    You can close this screen; a notification will be sent.
                </p>
            </div>
        )
    }

    const availableOffers = offers && offers.length > 0 ? offers : trip.id === 'TRIP-AWAITING-001' ? mockOffers : [];

    return (
        <>
            <div className="p-4 space-y-4 bg-card/80 rounded-b-lg">
                {isLoadingOffers ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : availableOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableOffers.map(offer => (
                            <OfferCard 
                                key={offer.id} 
                                offer={offer} 
                                trip={trip} 
                                onAccept={() => handleAcceptOfferClick(offer)} 
                                isAccepting={isAccepting === offer.id} 
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground p-8">No offers yet for this request. You can wait or cancel the request.</p>
                )}
            </div>
            <LegalDisclaimerDialog isOpen={isLegalDisclaimerOpen} onOpenChange={setIsLegalDisclaimerOpen} onContinue={handleLegalConfirm} />
        </>
    );
};


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const userTripsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'trips'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: allUserTrips, isLoading } = useCollection<Trip>(userTripsQuery);
  
   const userBookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'bookings'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: userBookings } = useCollection<Booking>(userBookingsQuery);

  const awaitingTrips = useMemo(() => allUserTrips?.filter(t => t.status === 'Awaiting-Offers') || [], [allUserTrips]);
  
  const pendingConfirmationBookings = useMemo(() => userBookings?.filter(b => b.status === 'Pending-Carrier-Confirmation') || [], [userBookings]);
  const pendingPaymentBookings = useMemo(() => userBookings?.filter(b => b.status === 'Pending-Payment') || [], [userBookings]);
  const pastBookings = useMemo(() => userBookings?.filter(b => b.status === 'Completed' || b.status === 'Cancelled') || [], [userBookings]);


  const defaultOpenAccordion = useMemo(() => {
      if(isLoading) return [];
      if(pendingConfirmationBookings.length > 0) return ['pendingConfirmation'];
      if(pendingPaymentBookings.length > 0) return ['pendingPayment'];
      if(awaitingTrips.length > 0) return ['awaiting'];
      if(pastBookings.length > 0) return ['past'];
      return [];
  }, [isLoading, awaitingTrips, pendingConfirmationBookings, pendingPaymentBookings, pastBookings]);

  
  const notificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`));
  }, [firestore, user]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const notificationCount = notifications?.filter(n => !n.isRead).length || 0;


  const renderSkeleton = () => (
    <div className="space-y-4 px-4 md:px-0">
      {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
    </div>
  );

  if (isUserLoading && !user) {
      return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-bold">Loading...</h2>
                <p className="text-muted-foreground">Loading your account data.</p>
            </div>
        </AppLayout>
      );
  }

  return (
    <AppLayout>
      <div className="rounded-lg space-y-8">
        <Card className="rounded-lg">
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Track offers and bookings here</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">{notificationCount}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications?.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1">
                        <p className="font-bold">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications.</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        </Card>

        {(isLoading && !allUserTrips && !userBookings) && renderSkeleton()}

        {!isLoading && allUserTrips?.length === 0 && userBookings?.length === 0 && (
             <div className="text-center text-muted-foreground py-12">
                <Ship className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg">You don't have any bookings or requests yet.</p>
                <p className="text-sm mt-2">You can find a trip or request a new booking from the dashboard.</p>
                <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
            </div>
        )}

        <Accordion type="multiple" className="w-full space-y-6 px-0 md:px-0" defaultValue={defaultOpenAccordion}>
          
          {awaitingTrips.length > 0 && (
            <AccordionItem value="awaiting" className="border-none">
              <Card className="rounded-lg overflow-hidden">
                <AccordionTrigger className="p-6 text-lg hover:no-underline bg-card">
                  <div className='flex items-center gap-2'><PackageOpen className="h-6 w-6 text-primary" /><CardTitle>Requests Awaiting Offers</CardTitle></div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <CardDescription className="mb-4 px-6 pt-4 bg-card">
                    Here are your sent requests. You can review offers from carriers for each request.
                  </CardDescription>
                  <Accordion type="single" collapsible className="w-full">
                       {awaitingTrips.map(trip => {
                            return (
                                <AccordionItem value={trip.id} key={trip.id} className="border-t border-border/50">
                                    <Card className="overflow-hidden rounded-none shadow-none border-none">
                                        <AccordionTrigger className="p-4 bg-card/80 hover:no-underline hover:bg-accent/10 data-[state=closed]:rounded-b-none">
                                            <div className="flex justify-between items-center w-full">
                                                <div className="text-left">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-bold text-base">{cities[trip.origin as keyof typeof cities] || trip.origin} to {cities[trip.destination as keyof typeof cities] || trip.destination}</p>
                                                        <p className="text-sm text-muted-foreground">({format(new Date(trip.departureDate), "PPP")})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0 border-t border-border/50">
                                            <TripOfferManager trip={trip} />
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            )
                       })}
                  </Accordion>
                </AccordionContent>
                </Card>
            </AccordionItem>
          )}

          {pendingConfirmationBookings.length > 0 && (
             <AccordionItem value="pendingConfirmation" className="border-none">
              <Card className="rounded-lg overflow-hidden">
                <AccordionTrigger className="p-6 text-lg hover:no-underline bg-card">
                  <div className='flex items-center gap-2'><Hourglass className="h-6 w-6 text-yellow-500" /><CardTitle>Requests Awaiting Carrier Approval</CardTitle></div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    <CardDescription className="mb-4 px-6 pt-4 bg-card">
                        These requests have been sent and are awaiting confirmation from the carrier. You will be notified of the result.
                    </CardDescription>
                     <div className="p-4 space-y-2">
                        {pendingConfirmationBookings.map(booking => (
                            <div key={booking.id} className="p-4 border rounded-lg bg-background">
                                <p>Booking request for trip ID: {booking.tripId.substring(0, 8)}...</p>
                                <p>Status: Awaiting Carrier Approval</p>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          )}

          {pendingPaymentBookings.length > 0 && (
             <AccordionItem value="pendingPayment" className="border-none">
              <Card className="rounded-lg overflow-hidden">
                <AccordionTrigger className="p-6 text-lg hover:no-underline bg-card">
                  <div className='flex items-center gap-2'><CreditCard className="h-6 w-6 text-green-500" /><CardTitle>Bookings Pending Payment</CardTitle></div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    <CardDescription className="mb-4 px-6 pt-4 bg-card">
                        These bookings have been confirmed by the carrier and are awaiting your payment.
                    </CardDescription>
                    {/* Placeholder for payment UI for each booking */}
                </AccordionContent>
              </Card>
            </AccordionItem>
          )}
          
          
          <AccordionItem value="past" className="border-none">
            <Card className="rounded-lg">
              <AccordionTrigger className="p-6 text-lg hover:no-underline bg-card">
                <div className='flex items-center gap-2'><CheckCircle className="h-6 w-6 text-green-500" /><CardTitle>My Past Trips</CardTitle></div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 p-4 md:p-6">
                  <CardDescription className="mb-4">History of your completed or cancelled trips.</CardDescription>
                   {pastBookings.length > 0 ? (
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">Carrier</TableHead>
                                <TableHead className="text-left">Trip</TableHead>
                                <TableHead className="text-left">Date</TableHead>
                                <TableHead className="text-left">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pastBookings.map(booking => (
                               <TableRow key={booking.id}>
                                  <TableCell>{'Carrier Name'}</TableCell>
                                  <TableCell>{'Trip Details'}</TableCell>
                                  <TableCell>{'Date'}</TableCell>
                                  <TableCell><Badge variant={booking.status === 'Completed' ? 'default' : 'destructive'}>{booking.status}</Badge></TableCell>
                               </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No past trips.</p>
                    )}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

        </Accordion>
        
      </div>
    </AppLayout>
  );
}
