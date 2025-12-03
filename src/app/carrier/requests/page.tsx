'use client';
import { RequestCard } from '@/components/carrier/request-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { PackageOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Trip } from '@/lib/data';

export default function CarrierRequestsPage() {
  const firestore = useFirestore();

  // Query: Get trips where status is 'Awaiting-Offers'
  const tripsQuery = useMemoFirebase(() => 
    firestore
    ? query(
        collection(firestore, 'trips'),
        where('status', '==', 'Awaiting-Offers')
        // Note: orderBy requires an index, we might add it later
      )
    : null,
  [firestore]);

  const { data: requests, isLoading } = useCollection<Trip>(tripsQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
        <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold">لا توجد طلبات متاحة حالياً</h3>
        <p className="text-muted-foreground mt-2">
          السوق هادئ حالياً. عد لاحقاً للتحقق من طلبات المسافرين الجديدة.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <RequestCard key={request.id} tripRequest={request} />
      ))}
    </div>
  );
}
