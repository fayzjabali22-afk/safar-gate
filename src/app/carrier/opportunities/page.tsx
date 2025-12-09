'use client';
import { RequestCard } from '@/components/carrier/request-card';
import { useFirestore, useCollection, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, writeBatch, serverTimestamp, runTransaction, getDocs, addDoc } from 'firebase/firestore';
import { PackageOpen, Settings, AlertTriangle, ListFilter, Armchair, UserCheck, UsersRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Trip, Offer, TransferRequest, Booking } from '@/lib/data';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OfferDialog } from '@/components/carrier/offer-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/use-user-profile';
import { suggestOfferPrice, SuggestOfferPriceInput, SuggestOfferPriceOutput } from '@/ai/flows/suggest-offer-price-flow';


function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  );
}

function NoSpecializationState() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500/80 mb-4" />
            <h3 className="text-xl font-bold">يرجى تحديد بيانات مركبتك أولاً</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              للاستفادة من الفلترة الذكية، يرجى الذهاب إلى صفحة الملف الشخصي وتحديد "خط السير المفضل" و "السعة القصوى للمركبة".
            </p>
             <Button asChild className="mt-6">
                <Link href="/carrier/profile">
                    <Settings className="ml-2 h-4 w-4" />
                    الذهاب إلى الملف الشخصي
                </Link>
            </Button>
      </div>
    )
}

function NoOpportunitiesState({ isFiltered }: { isFiltered: boolean }) {
     return (
      <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
        <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold">
            {isFiltered ? "لا توجد فرص تطابق تخصصك وسعة مركبتك" : "لا توجد فرص متاحة حالياً في السوق العام"}
        </h3>
        <p className="text-muted-foreground mt-2">
          {isFiltered ? "يمكنك إيقاف الفلترة لعرض كل الفرص المتاحة." : "سيتم عرض الطلبات الجديدة هنا فور وصولها."}
        </p>
      </div>
    );
}

export default function CarrierOpportunitiesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { profile: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const { toast } = useToast();

  const [filterBySpecialization, setFilterBySpecialization] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  
  const [priceSuggestion, setPriceSuggestion] = useState<SuggestOfferPriceOutput | null>(null);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);


  // --- QUERY FOR GENERAL MARKET REQUESTS ---
  const opportunitiesQuery = useMemo(() => {
    if (!firestore || !user || userProfile?.isDeactivated) return null;
    
    let q = query(
        collection(firestore, 'trips'), 
        where('status', '==', 'Awaiting-Offers'), 
        where('requestType', '==', 'General')
    );
    
    if (filterBySpecialization && userProfile?.primaryRoute?.origin && userProfile?.primaryRoute?.destination) {
        q = query(q, where('origin', '==', userProfile.primaryRoute.origin), where('destination', '==', userProfile.primaryRoute.destination));
    }
    if (userProfile?.vehicleCapacity && userProfile.vehicleCapacity > 0) {
        q = query(q, where('passengers', '<=', userProfile.vehicleCapacity));
    }
    return q;
  }, [firestore, user, filterBySpecialization, userProfile]);

  const { data: generalRequests, isLoading: isLoadingGeneral } = useCollection<Trip>(opportunitiesQuery);
  
  const opportunities = useMemo(() => {
    if (!generalRequests) return [];
    return [...generalRequests].sort((a, b) => new Date(b.createdAt?.seconds * 1000).getTime() - new Date(a.createdAt?.seconds * 1000).getTime());
  }, [generalRequests]);

  const isLoading = isLoadingProfile || isLoadingGeneral;

  const handleOfferClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setPriceSuggestion(null); // Clear previous suggestion
    setIsOfferDialogOpen(true);
  };
  
  const handleSuggestPrice = async () => {
    if (!selectedTrip) return;
    setIsSuggestingPrice(true);
    setPriceSuggestion(null);
    try {
        const input: SuggestOfferPriceInput = {
            origin: selectedTrip.origin,
            destination: selectedTrip.destination,
            passengers: selectedTrip.passengers || 1,
            departureDate: selectedTrip.departureDate,
        };
        const suggestion = await suggestOfferPrice(input);
        setPriceSuggestion(suggestion);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "فشل اقتراح السعر",
            description: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي."
        });
    } finally {
        setIsSuggestingPrice(false);
    }
  };


  const handleSendOffer = async (offerData: Omit<Offer, 'id' | 'tripId' | 'carrierId' | 'status' | 'createdAt'>): Promise<boolean> => {
     if (!firestore || !user || !selectedTrip) return false;

    try {
        const offersCollection = collection(firestore, 'trips', selectedTrip.id, 'offers');
        const offerPayload: Omit<Offer, 'id'> = {
            ...offerData,
            tripId: selectedTrip.id,
            carrierId: user.uid,
            status: 'Pending',
            createdAt: serverTimestamp() as any,
        };

        await addDoc(offersCollection, offerPayload);

        const notificationPayload = {
            userId: selectedTrip.userId,
            title: 'عرض جديد لرحلتك!',
            message: `لقد استلمت عرضاً جديداً لرحلتك من ${userProfile?.firstName || 'ناقل'}.`,
            type: 'new_offer' as const,
            isRead: false,
            createdAt: serverTimestamp(),
            link: '/history',
        };
        await addDocumentNonBlocking(collection(firestore, 'users', selectedTrip.userId, 'notifications'), notificationPayload);

        toast({ title: 'تم إرسال العرض بنجاح!', description: 'سيتم إعلام المسافر بعرضك.' });
        return true;
    } catch (error) {
        console.error("Error sending offer:", error);
        toast({ variant: 'destructive', title: 'فشل إرسال العرض', description: 'حدث خطأ ما.' });
        return false;
    }
  };

  if (isLoading) return <LoadingState />;
  
  const canFilter = !!(userProfile?.primaryRoute?.origin && userProfile?.primaryRoute?.destination);
  const hasCapacity = !!(userProfile?.vehicleCapacity && userProfile.vehicleCapacity > 0);

  if (!canFilter || !hasCapacity) return <NoSpecializationState />;
  
  if (userProfile?.isDeactivated) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500/80 mb-4" />
            <h3 className="text-xl font-bold">حسابك مجمد حالياً</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
                لقد قمت بتجميد حسابك. لن تظهر لك أي فرص جديدة. يمكنك إعادة تنشيط حسابك من صفحة الملف الشخصي.
            </p>
             <Button asChild className="mt-6">
                <Link href="/carrier/profile">
                    <Settings className="ml-2 h-4 w-4" />
                    الذهاب إلى الملف الشخصي
                </Link>
            </Button>
      </div>
      )
  }
  
  const hasOpportunities = opportunities && opportunities.length > 0;

  return (
    <>
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-2 rtl:space-x-reverse bg-card p-3 rounded-lg border">
                <Label htmlFor="filter-switch" className="flex items-center gap-2 font-semibold">
                    <ListFilter className="h-4 w-4" />
                    <span>فلترة حسب خط السير</span>
                </Label>
                <Switch
                    id="filter-switch"
                    checked={filterBySpecialization}
                    onCheckedChange={setFilterBySpecialization}
                    disabled={!canFilter}
                />
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-sm font-bold bg-card p-3 rounded-lg border text-primary">
                <Armchair className="h-5 w-5" />
                <span>السعة القصوى لمركبتك:</span>
                <span>{userProfile?.vehicleCapacity || 'غير محدد'} ركاب</span>
            </div>
        </div>

        <div className="space-y-6">
            {hasOpportunities ? (
                <div className="space-y-3">
                    {opportunities.map(req => (
                       <RequestCard key={req.id} tripRequest={req} onOffer={handleOfferClick} />
                    ))}
                </div>
            ) : (
                <NoOpportunitiesState isFiltered={filterBySpecialization && canFilter} />
            )}
        </div>
    </div>
    {selectedTrip && (
        <OfferDialog
            isOpen={isOfferDialogOpen}
            onOpenChange={setIsOfferDialogOpen}
            trip={selectedTrip}
            suggestion={priceSuggestion}
            onSuggestPrice={handleSuggestPrice}
            isSuggestingPrice={isSuggestingPrice}
            onSendOffer={handleSendOffer}
        />
    )}
    </>
  );
}
