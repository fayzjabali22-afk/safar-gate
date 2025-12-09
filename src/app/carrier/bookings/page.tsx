'use client';
import { useMemo } from 'react';
import { Booking, Trip } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, History, Hourglass, UserCheck } from 'lucide-react';
import { BookingActionCard } from '@/components/carrier/booking-action-card';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DirectRequestActionCard } from '@/components/carrier/direct-request-action-card';

export default function CarrierBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Query for booking requests on scheduled trips
    const bookingRequestsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'bookings'),
            where('carrierId', '==', user.uid),
            where('status', 'in', ['Pending-Carrier-Confirmation', 'Pending-Payment'])
        );
    }, [firestore, user]);

    // Query for direct trip requests from travelers
    const directTripRequestsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'trips'),
            where('requestType', '==', 'Direct'),
            where('targetCarrierId', '==', user.uid),
            where('status', 'in', ['Awaiting-Offers', 'Pending-Carrier-Confirmation'])
        );
    }, [firestore, user]);

    // Query for historical bookings (already actioned)
    const historicalBookingsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'bookings'),
            where('carrierId', '==', user.uid),
            where('status', 'in', ['Confirmed', 'Cancelled', 'Completed'])
        );
    }, [firestore, user]);

    const { data: bookingRequestsData, isLoading: isLoadingBookingRequests } = useCollection<Booking>(bookingRequestsQuery);
    const { data: directTripRequestsData, isLoading: isLoadingDirectRequests } = useCollection<Trip>(directTripRequestsQuery);
    const { data: historicalBookingsData, isLoading: isLoadingHistory } = useCollection<Booking>(historicalBookingsQuery);
    
    // Sort all incoming new requests by date
    const allNewRequests = useMemo(() => {
        const combined = [
            ...(bookingRequestsData || []).map(item => ({ ...item, type: 'booking' })),
            ...(directTripRequestsData || []).map(item => ({ ...item, type: 'direct' }))
        ];
        
        return combined.sort((a, b) => {
             const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
             const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
             return dateB.getTime() - dateA.getTime();
        });
    }, [bookingRequestsData, directTripRequestsData]);

    const historicalBookings = useMemo(() => {
        if (!historicalBookingsData) return [];
        return [...historicalBookingsData].sort((a, b) => {
             const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
             const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
             return dateB.getTime() - dateA.getTime();
        });
    }, [historicalBookingsData]);


    const isLoading = isLoadingBookingRequests || isLoadingDirectRequests || isLoadingHistory;

    if (isLoading) {
        return (
          <div className="space-y-6">
              <Skeleton key="header-1" className="h-8 w-48 rounded-lg" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
              </div>
              <Skeleton key="header-2" className="h-8 w-48 rounded-lg" />
              <div className="space-y-3">
                 {[...Array(1)].map((_, i) => <Skeleton key={`hist-${i}`} className="h-48 w-full rounded-lg" />)}
              </div>
          </div>
        );
    }
    
    return (
        <div className="space-y-8">
            {/* New Directed Requests Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Hourglass className="h-5 w-5 text-primary" />
                    طلبات جديدة تحتاج إجراء
                </h2>
                {allNewRequests && allNewRequests.length > 0 ? (
                    <div className="space-y-4">
                        {allNewRequests.map(item => 
                            item.type === 'booking' ? (
                                <BookingActionCard 
                                    key={item.id} 
                                    booking={item as Booking} 
                                />
                            ) : (
                                <DirectRequestActionCard 
                                    key={item.id} 
                                    tripRequest={item as Trip}
                                    onApprove={() => Promise.resolve(false)} // Placeholder, logic is in opportunities page
                                    onReject={() => Promise.resolve(false)} // Placeholder
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg bg-card/50">
                        <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-bold">لا توجد طلبات موجهة جديدة</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                            سيتم عرض طلبات الحجز المباشرة أو على رحلاتك المجدولة هنا فور وصولها.
                        </p>
                    </div>
                )}
            </div>

            {/* Historical Log Section */}
            <div>
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    سجل الحجوزات السابق
                </h2>
                {historicalBookings && historicalBookings.length > 0 ? (
                     <div className="space-y-4">
                        {historicalBookings.map(booking => (
                            <BookingActionCard 
                                key={booking.id} 
                                booking={booking} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        لا يوجد سجل حجوزات سابق بعد.
                    </div>
                )}
            </div>
        </div>
    );
}
