'use client';
import { RequestCard } from '@/components/carrier/request-card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { PackageOpen, Settings, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Trip, CarrierProfile } from '@/lib/data';
import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

function NoSpecializationState() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500/80 mb-4" />
            <h3 className="text-xl font-bold">يرجى تحديد تخصصك أولاً</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              لعرض الطلبات المناسبة لك، يرجى الذهاب إلى صفحة الملف الشخصي وتحديد "تخصص خط النقل" الذي تعمل عليه عادةً.
            </p>
            <Button asChild className="mt-6">
                <Link href="/profile">
                    <Settings className="ml-2 h-4 w-4" />
                    الذهاب إلى الملف الشخصي
                </Link>
            </Button>
      </div>
    )
}

function NoRequestsState() {
     return (
      <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
        <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold">لا توجد طلبات متاحة حالياً</h3>
        <p className="text-muted-foreground mt-2">
          السوق هادئ حالياً. لا توجد طلبات تطابق تخصصك.
        </p>
      </div>
    );
}


export default function CarrierRequestsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [carrierProfile, setCarrierProfile] = useState<CarrierProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchCarrierProfile = async () => {
      if (!firestore || !user) return;
      setIsLoadingProfile(true);
      const carrierRef = doc(firestore, 'carriers', user.uid);
      const carrierSnap = await getDoc(carrierRef);
      if (carrierSnap.exists()) {
        setCarrierProfile(carrierSnap.data() as CarrierProfile);
      }
      setIsLoadingProfile(false);
    };
    fetchCarrierProfile();
  }, [firestore, user]);


  // Query: Get trips where status is 'Awaiting-Offers' and matches specialization
  const tripsQuery = useMemoFirebase(() => {
    if (!firestore || !carrierProfile?.specialization) return null;
    
    return query(
        collection(firestore, 'trips'),
        where('status', '==', 'Awaiting-Offers'),
        where('origin', '==', carrierProfile.specialization.from.toLowerCase()),
        where('destination', '==', carrierProfile.specialization.to.toLowerCase())
      );
  }, [firestore, carrierProfile]);

  const { data: requests, isLoading: isLoadingRequests } = useCollection<Trip>(tripsQuery);
  
  const isLoading = isLoadingProfile || (carrierProfile?.specialization && isLoadingRequests);

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!carrierProfile?.specialization) {
      return <NoSpecializationState />
  }

  if (!requests || requests.length === 0) {
    return <NoRequestsState />;
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <RequestCard key={request.id} tripRequest={request} />
      ))}
    </div>
  );
}

    