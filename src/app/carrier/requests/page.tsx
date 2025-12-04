
'use client';
import { RequestCard } from '@/components/carrier/request-card';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { PackageOpen, Settings, AlertTriangle, ListFilter, ShipWheel, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Trip, CarrierProfile } from '@/lib/data';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OfferDialog } from '@/components/carrier/offer-dialog';
import { suggestOfferPrice, type SuggestOfferPriceInput } from '@/ai/flows/suggest-offer-price-flow';
import { useToast } from '@/hooks/use-toast';

const mockRequests: Trip[] = [
    {
      id: 'mock_trip_1',
      userId: 'mock_user_1',
      origin: 'amman',
      destination: 'riyadh',
      departureDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 2,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock_trip_2',
      userId: 'mock_user_2',
      origin: 'damascus',
      destination: 'amman',
      departureDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 1,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock_trip_3',
      userId: 'mock_user_3',
      origin: 'cairo',
      destination: 'jeddah',
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 4,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock_trip_4',
      userId: 'mock_user_4',
      origin: 'amman',
      destination: 'damascus',
      departureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 3,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
     {
      id: 'mock_trip_5',
      userId: 'mock_user_5',
      origin: 'riyadh',
      destination: 'damascus',
      departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 1,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock_trip_6',
      userId: 'mock_user_6',
      origin: 'amman',
      destination: 'riyadh',
      departureDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 1,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock_trip_7',
      userId: 'mock_user_7',
      origin: 'homs',
      destination: 'zarqa',
      departureDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      passengers: 5,
      status: 'Awaiting-Offers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
];

const mockCarrierProfile: CarrierProfile = {
    id: 'carrier_user_id',
    name: 'Safar Transport',
    contactEmail: 'carrier@safar.com',
    primaryRoute: {
        origin: 'amman',
        destination: 'riyadh'
    }
}

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
              للاستفادة من الفلترة الذكية، يرجى الذهاب إلى صفحة الملف الشخصي وتحديد "خط السير المفضل" الذي تعمل عليه.
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
  const [carrierProfile, setCarrierProfile] = useState<CarrierProfile | null>(mockCarrierProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [filterBySpecialization, setFilterBySpecialization] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<{price: number, justification: string} | null>(null);
  const { toast } = useToast();


  const filteredRequests = useMemo(() => {
    const uniqueRequests = mockRequests;

    if (filterBySpecialization && carrierProfile?.primaryRoute?.origin && carrierProfile.primaryRoute.destination) {
      const from = carrierProfile.primaryRoute.origin.toLowerCase();
      const to = carrierProfile.primaryRoute.destination.toLowerCase();
      return uniqueRequests.filter(req => 
        req.origin.toLowerCase() === from &&
        req.destination.toLowerCase() === to
      );
    }
    return uniqueRequests.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
  }, [filterBySpecialization, carrierProfile]);

  const isLoading = isLoadingProfile;
  
  const handleOfferClick = (trip: Trip) => {
    setSuggestion(null); // Clear previous suggestion
    setSelectedTrip(trip);
    setIsOfferDialogOpen(true);
  }
  
  const handlePriceSuggestion = async () => {
    if (!selectedTrip) return;
    setIsGettingSuggestion(true);
    try {
        const input: SuggestOfferPriceInput = {
            origin: selectedTrip.origin,
            destination: selectedTrip.destination,
            passengers: selectedTrip.passengers || 1,
            departureDate: selectedTrip.departureDate
        };
        const result = await suggestOfferPrice(input);
        setSuggestion({
            price: result.suggestedPrice,
            justification: result.justification
        });
        toast({
            title: 'تم إنشاء الاقتراح بنجاح',
            description: 'تم تحديث حقل السعر بالاقتراح الجديد.',
        });
    } catch(e) {
        toast({
            variant: 'destructive',
            title: 'فشل إنشاء الاقتراح',
            description: 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.',
        });
    } finally {
        setIsGettingSuggestion(false);
    }
  }


  if (isLoading) {
    return <LoadingState />;
  }
  
  const canFilter = !!(carrierProfile?.primaryRoute?.origin && carrierProfile?.primaryRoute?.destination);

  if (!canFilter && filterBySpecialization) {
    return <NoSpecializationState />
  }

  return (
    <>
    <div className="space-y-4">
        {canFilter && (
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse bg-card p-3 rounded-lg border">
                <Label htmlFor="filter-switch" className="flex items-center gap-2 font-semibold">
                    <ListFilter className="h-4 w-4" />
                    <span>فلترة حسب خط السير المفضل</span>
                </Label>
                <Switch
                    id="filter-switch"
                    checked={filterBySpecialization}
                    onCheckedChange={setFilterBySpecialization}
                />
            </div>
        )}

        {filteredRequests && filteredRequests.length > 0 ? (
            <div className="space-y-3">
                {filteredRequests.map(req => (
                    <RequestCard key={req.id} tripRequest={req} onOffer={handleOfferClick} />
                ))}
            </div>
        ) : (
            <NoRequestsState isFiltered={filterBySpecialization && canFilter} />
        )}
    </div>
    {selectedTrip && (
        <OfferDialog
            isOpen={isOfferDialogOpen}
            onOpenChange={setIsOfferDialogOpen}
            trip={selectedTrip}
            suggestion={suggestion}
            onSuggestPrice={handlePriceSuggestion}
            isSuggestingPrice={isGettingSuggestion}
        />
    )}
    </>
  );
}
