'use client';
import { RequestCard } from '@/components/carrier/request-card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { PackageOpen, Settings, AlertTriangle, ListFilter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Trip, CarrierProfile } from '@/lib/data';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

function NoRequestsState({ isFiltered }: { isFiltered: boolean }) {
     return (
      <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
        <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold">
            {isFiltered ? "لا توجد طلبات تطابق تخصصك" : "لا توجد طلبات متاحة حالياً"}
        </h3>
        <p className="text-muted-foreground mt-2">
          {isFiltered ? "يمكنك إيقاف الفلترة لعرض كل طلبات السوق." : "سيتم عرض الطلبات الجديدة هنا فور وصولها."}
        </p>
      </div>
    );
}


export default function CarrierRequestsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [carrierProfile, setCarrierProfile] = useState<CarrierProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [filterBySpecialization, setFilterBySpecialization] = useState(true);

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


  const tripsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'trips'),
        where('status', '==', 'Awaiting-Offers')
      );
  }, [firestore]);

  const { data: allRequests, isLoading: isLoadingRequests } = useCollection<Trip>(tripsQuery);
  
  const filteredRequests = useMemo(() => {
    if (!allRequests) return [];
    if (filterBySpecialization && carrierProfile?.specialization) {
      return allRequests.filter(req => 
        req.origin.toLowerCase() === carrierProfile.specialization!.from.toLowerCase() &&
        req.destination.toLowerCase() === carrierProfile.specialization!.to.toLowerCase()
      );
    }
    return allRequests;
  }, [allRequests, filterBySpecialization, carrierProfile]);

  const isLoading = isLoadingProfile || isLoadingRequests;

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!carrierProfile?.specialization?.from || !carrierProfile?.specialization?.to) {
      return <NoSpecializationState />
  }

  const canFilter = !!(carrierProfile?.specialization?.from && carrierProfile?.specialization?.to);

  return (
    <div className="space-y-4">
        {canFilter && (
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse p-4 bg-card rounded-lg border">
                <Label htmlFor="filter-switch" className="font-semibold text-sm">عرض الطلبات المطابقة لتخصصي فقط</Label>
                <Switch
                    id="filter-switch"
                    checked={filterBySpecialization}
                    onCheckedChange={setFilterBySpecialization}
                    aria-label="Filter by specialization"
                />
            </div>
        )}

        {filteredRequests.length > 0 ? (
             <div className="space-y-2">
                {filteredRequests.map((request) => (
                    <RequestCard key={request.id} tripRequest={request} />
                ))}
            </div>
        ) : (
            <NoRequestsState isFiltered={filterBySpecialization} />
        )}
    </div>
  );
}

    