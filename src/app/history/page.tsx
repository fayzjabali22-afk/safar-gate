
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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Trip, Notification, Offer, Booking } from '@/lib/data';
import { collection, query, where, doc, writeBatch, deleteDoc, getDoc } from 'firebase/firestore';
import { Bell, CheckCircle, PackageOpen, Ship, Hourglass, XCircle, Info, Loader2 } from 'lucide-react';
import { OfferCard } from '@/components/offer-card';
import { useToast } from '@/hooks/use-toast';
import { LegalDisclaimerDialog } from '@/components/legal-disclaimer-dialog';

const statusMap: Record<string, string> = {
    'Awaiting-Offers': 'بانتظار العروض',
    'Planned': 'مؤكدة',
    'Completed': 'مكتملة',
    'Cancelled': 'ملغاة',
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'Awaiting-Offers': 'outline',
    'Planned': 'secondary',
    'Completed': 'default',
    'Cancelled': 'destructive',
}

const cities: { [key: string]: string } = {
    damascus: 'دمشق', aleppo: 'حلب', homs: 'حمص',
    amman: 'عمّان', irbid: 'إربد', zarqa: 'الزرقاء',
    riyadh: 'الرياض', jeddah: 'جدة', dammam: 'الدمام',
    cairo: 'القاهرة', alexandria: 'الاسكندرية', giza: 'الجيزة',
    dubai: 'دبي', kuwait: 'الكويت'
};


const WaitingScreen = ({ onCancel }: { onCancel: () => void }) => {
    return (
        <div className="text-center p-8 space-y-4 bg-background">
            <Hourglass className="mx-auto h-12 w-12 text-accent" />
            <h3 className="text-xl font-bold text-foreground">سفريات بانتظار تأكيد المقاعد من الناقل</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                فور موافقة الناقل وفتح شاشة الحجز، سيصلك إشعار فوري لتتمكن من إكمال الحجز بسهولة. يحرص فريق سفريات على تنظيم العملية وعدم تراكم الحجوزات لدى الناقل.
            </p>
            <p className="text-sm text-accent font-semibold">قوم بمتابعة اعملك دقائق ويصلك الاشعار</p>
            <Button variant="destructive" onClick={onCancel} className="mt-4">
                <XCircle className="ml-2 h-4 w-4" />
                إلغاء الطلب
            </Button>
        </div>
    );
};

const TripBookingManager = ({ trip }: { trip: Trip; }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    
    // This state determines what to show: 'offers' or 'waiting'
    const [viewMode, setViewMode] = useState<'offers' | 'waiting'>('offers');

    const offersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `trips/${trip.id}/offers`));
    }, [firestore, trip.id]);

    const { data: offers, isLoading: isLoadingOffers } = useCollection<Offer>(offersQuery);

    const bookingQuery = useMemoFirebase(() => {
        if (!firestore || !trip.currentBookingId) return null;
        return doc(firestore, 'bookings', trip.currentBookingId);
    }, [firestore, trip.currentBookingId]);
    
    const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingQuery);
    
    // Effect to set the initial view mode based on Firestore data
    useEffect(() => {
        if (booking && booking.status === 'Pending-Carrier-Confirmation') {
            setViewMode('waiting');
        } else {
            setViewMode('offers');
        }
    }, [booking]);


    const handleAcceptClick = (offer: Offer) => {
        setSelectedOffer(offer);
        setIsDisclaimerOpen(true);
    };

    const handleDisclaimerContinue = async () => {
        setIsDisclaimerOpen(false);
        if (!firestore || !user || !selectedOffer || !trip.passengers) return;

        const batch = writeBatch(firestore);

        // 1. Create a new booking document
        const newBookingRef = doc(collection(firestore, 'bookings'));
        const newBooking: Booking = {
            id: newBookingRef.id,
            tripId: trip.id,
            userId: user.uid,
            carrierId: selectedOffer.carrierId,
            seats: trip.passengers,
            status: 'Pending-Carrier-Confirmation',
            totalPrice: selectedOffer.price,
        };
        batch.set(newBookingRef, newBooking);

        // 2. Update the trip with the new booking and accepted offer IDs
        const tripRef = doc(firestore, 'trips', trip.id);
        batch.update(tripRef, { 
            currentBookingId: newBookingRef.id,
            acceptedOfferId: selectedOffer.id
        });

        // 3. Update the offer status to 'Accepted'
        const offerRef = doc(firestore, `trips/${trip.id}/offers`, selectedOffer.id);
        batch.update(offerRef, { status: 'Accepted' });

        // 4. Create a notification for the carrier
        const notificationRef = doc(collection(firestore, `users/${selectedOffer.carrierId}/notifications`));
        const newNotification = {
            id: notificationRef.id,
            userId: selectedOffer.carrierId,
            title: "طلب حجز جديد!",
            message: `المسافر ${user.displayName || user.email} يرغب بحجز ${trip.passengers} مقاعد في رحلتك من ${cities[trip.origin]} إلى ${cities[trip.destination]}.`,
            type: "new_booking_request",
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/carrier/bookings/${newBookingRef.id}` // A potential link for the carrier
        };
        batch.set(notificationRef, newNotification);

        try {
            await batch.commit();
            // After successful commit, change the view to the waiting screen
            setViewMode('waiting');
        } catch (error) {
            console.error("Error accepting offer: ", error);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء قبول العرض. الرجاء المحاولة مرة أخرى.",
                variant: "destructive"
            });
        }
    };
    
    const handleCancelPendingBooking = async () => {
        if (!firestore || !booking || !trip.acceptedOfferId) return;

        toast({ title: "جاري إلغاء الطلب..." });

        const batch = writeBatch(firestore);

        // 1. Delete the booking document
        const bookingRef = doc(firestore, 'bookings', booking.id);
        batch.delete(bookingRef);

        // 2. Revert the offer status to 'Pending'
        const offerRef = doc(firestore, `trips/${trip.id}/offers`, trip.acceptedOfferId);
        batch.update(offerRef, { status: 'Pending' });

        // 3. Clear booking/offer info from the trip
        const tripRef = doc(firestore, 'trips', trip.id);
        batch.update(tripRef, { currentBookingId: null, acceptedOfferId: null });

        try {
            await batch.commit();
            setViewMode('offers'); // Switch back to offers view
            toast({
                title: "تم إلغاء الطلب",
                description: "يمكنك الآن اختيار عرض آخر."
            });
        } catch (error) {
            console.error("Error cancelling booking: ", error);
            toast({
                title: "خطأ في الإلغاء",
                description: "لم نتمكن من إلغاء الطلب. الرجاء المحاولة مرة أخرى.",
                variant: "destructive"
            });
        }
    };

    if (isLoadingOffers || isLoadingBooking) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (viewMode === 'waiting') {
        return <WaitingScreen onCancel={handleCancelPendingBooking} />;
    }

    // Default view is 'offers'
    const pendingOffers = offers?.filter(o => o.status === 'Pending') || [];
    
    if (pendingOffers.length === 0) {
        return <p className="text-center text-muted-foreground p-8">لم يصلك أي عروض بعد، أو تم قبول عرض بالفعل. عليك الانتظار.</p>;
    }

    return (
        <>
            <div className="p-0 md:p-0 space-y-4">
                <p className="text-center text-accent font-semibold px-4 pt-4">انتظر، قد تصلك عروض أفضل.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {pendingOffers.map(offer => (
                        <OfferCard key={offer.id} offer={offer} trip={trip} onAccept={() => handleAcceptClick(offer)} />
                    ))}
                </div>
            </div>
            {selectedOffer && (
                 <LegalDisclaimerDialog 
                    isOpen={isDisclaimerOpen}
                    onOpenChange={setIsDisclaimerOpen}
                    onContinue={handleDisclaimerContinue}
                />
            )}
        </>
    );
};


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [openAccordion, setOpenAccordion] = useState<string[]>([]);
  
  const userTripsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'trips'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: allUserTrips, isLoading } = useCollection<Trip>(userTripsQuery);

  const awaitingTrips = allUserTrips?.filter(t => t.status === 'Awaiting-Offers') || [];
  const confirmedTrips = allUserTrips?.filter(t => ['Planned', 'Completed', 'Cancelled'].includes(t.status)) || [];
  
  const hasAwaitingOffers = !isLoading && awaitingTrips.length > 0;
  const hasConfirmedTrips = !isLoading && confirmedTrips.length > 0;
  
  const notificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`));
  }, [firestore, user]);
  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const notificationCount = notifications?.length || 0;

  useEffect(() => {
    if (!isUserLoading && !user) {
        router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (isLoading) return;
    
    const openItems: string[] = [];
    if (hasAwaitingOffers) openItems.push('awaiting');
    if (hasConfirmedTrips) openItems.push('confirmed');
    setOpenAccordion(openItems);

  }, [hasAwaitingOffers, hasConfirmedTrips, isLoading]);


  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  );

  if (isUserLoading) return <AppLayout>{renderSkeleton()}</AppLayout>;


  return (
    <AppLayout>
      <div className="bg-[#130609] p-0 md:p-0 rounded-lg space-y-8">
        <Card style={{ backgroundColor: '#EDC17C' }} className="rounded-none md:rounded-lg">
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div className="text-black">
                <CardTitle>إدارة الحجز</CardTitle>
                <CardDescription className="text-black/80">تابع العروض والحجوزات من هنا</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-black hover:bg-black/10">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">{notificationCount}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications?.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1">
                        <p className="font-bold">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات جديدة.</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        </Card>

        <Accordion type="multiple" className="w-full space-y-6 px-0 md:px-0" value={openAccordion} onValueChange={setOpenAccordion}>
          
          {isLoading && renderSkeleton()}
          {hasAwaitingOffers && (
            <AccordionItem value="awaiting" className="border-none">
              <Card className="rounded-none md:rounded-lg">
                <AccordionTrigger className="p-6 text-lg hover:no-underline">
                  <div className='flex items-center gap-2'><PackageOpen className="h-6 w-6 text-primary" /><CardTitle>طلبات بانتظار العروض</CardTitle></div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <CardDescription className="mb-4 px-6">
                    هنا تظهر طلباتك التي أرسلتها. يمكنك استعراض العروض المقدمة من الناقلين لكل طلب.
                  </CardDescription>
                  <Accordion type="single" collapsible className="w-full">
                       {awaitingTrips.map(trip => {
                            return (
                                <AccordionItem value={trip.id} key={trip.id} className="border-none">
                                    <Card className="overflow-hidden rounded-none">
                                        <AccordionTrigger className="p-4 bg-card/80 hover:no-underline data-[state=closed]:rounded-b-none">
                                            <div className="flex justify-between items-center w-full">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-bold text-base">{cities[trip.origin as keyof typeof cities] || trip.origin} إلى {cities[trip.destination as keyof typeof cities] || trip.destination}</p>
                                                        <p className="text-sm text-muted-foreground">({new Date(trip.departureDate).toLocaleDateString('ar-SA')})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <TripBookingManager trip={trip} />
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
          
          {isLoading && renderSkeleton()}
          {hasConfirmedTrips && (
              <AccordionItem value="confirmed" className="border-none">
                <Card className="rounded-none md:rounded-lg">
                  <AccordionTrigger className="p-6 text-lg hover:no-underline">
                    <div className='flex items-center gap-2'><CheckCircle className="h-6 w-6 text-green-500" /><CardTitle>رحلاتي السابقة والمؤكدة</CardTitle></div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="space-y-6 p-4 md:p-6">
                      <CardDescription className="mb-4">سجل رحلاتك التي قمت بحجزها بالفعل.</CardDescription>
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الناقل</TableHead>
                                <TableHead className="text-right">من</TableHead>
                                <TableHead className="text-right">إلى</TableHead>
                                <TableHead className="text-right">تاريخ الرحلة</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {confirmedTrips.map(trip => (
                               <TableRow key={trip.id}>
                                  <TableCell>{trip.carrierName || 'غير محدد'}</TableCell>
                                  <TableCell>{cities[trip.origin as keyof typeof cities] || trip.origin}</TableCell>
                                  <TableCell>{cities[trip.destination as keyof typeof cities] || trip.destination}</TableCell>
                                  <TableCell>{new Date(trip.departureDate).toLocaleDateString('ar-SA')}</TableCell>
                                  <TableCell><Badge variant={statusVariantMap[trip.status]}>{statusMap[trip.status]}</Badge></TableCell>
                               </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            )
          }
        </Accordion>
        
        {!isLoading && !hasAwaitingOffers && !hasConfirmedTrips && (
            <div className="text-center text-muted-foreground py-12">
                <Ship className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg">لا يوجد لديك أي حجوزات أو طلبات حالياً.</p>
                <p className="text-sm mt-2">يمكنك البحث عن رحلة أو طلب حجز جديد من لوحة التحكم.</p>
                <Button onClick={() => router.push('/dashboard')} className="mt-4">الذهاب إلى لوحة التحكم</Button>
            </div>
        )}

      </div>
    </AppLayout>
  );
}
