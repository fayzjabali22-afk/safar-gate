'use client';
import { useMemo } from 'react';
import { Booking, Trip } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, History, Hourglass } from 'lucide-react';
import { BookingActionCard } from '@/components/carrier/booking-action-card';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';


// --- SIMULATION DATA ---
const mockHistoricalBookings: Booking[] = [
    {
        id: 'booking_hist_1',
        tripId: 'trip_456_past',
        userId: 'traveler_C',
        carrierId: 'carrier_user_id',
        seats: 1,
        passengersDetails: [{ name: 'Sara Fouad', type: 'adult' }],
        status: 'Confirmed',
        totalPrice: 70,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'booking_hist_2',
        tripId: 'trip_789_past',
        userId: 'traveler_D',
        carrierId: 'carrier_user_id',
        seats: 2,
        passengersDetails: [{ name: 'Mona Ali', type: 'adult' }, { name: 'Hassan Ali', type: 'adult' }],
        status: 'Cancelled',
        totalPrice: 180,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    }
];
// --- END SIMULATION DATA ---


export default function CarrierBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const pendingBookingsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'bookings'),
            where('carrierId', '==', user.uid),
            where('status', '==', 'Pending-Carrier-Confirmation'),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user]);

    const { data: pendingBookings, isLoading } = useCollection<Booking>(pendingBookingsQuery);
    
    // We'll keep historical bookings as mock for now to keep focus on the main flow
    const historicalBookings = mockHistoricalBookings;

    if (isLoading) {
        return (
          <div className="space-y-6">
              <Skeleton key="header-1" className="h-8 w-48 rounded-lg" />
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
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
            {/* New Requests Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Hourglass className="h-5 w-5 text-primary" />
                    طلبات حجز جديدة
                </h2>
                {pendingBookings && pendingBookings.length > 0 ? (
                    <div className="space-y-4">
                        {pendingBookings.map(booking => (
                            <BookingActionCard 
                                key={booking.id} 
                                booking={booking} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg bg-card/50">
                        <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-bold">لا توجد طلبات حجز جديدة</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                            سيتم عرض طلبات الحجز المرسلة من المسافرين هنا فور وصولها.
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
                {historicalBookings.length > 0 ? (
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