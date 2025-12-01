
'use client';

import type { Offer } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { HandCoins, MessageCircle, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

interface OfferCardProps {
  offer: Offer;
}

const CarrierInfo = ({ carrierId }: { carrierId: string }) => {
    const firestore = useFirestore();
    const carrierRef = firestore ? doc(firestore, 'carriers', carrierId) : null;
    const { data: carrier, isLoading } = useDoc(carrierRef);
    const carrierImage = PlaceHolderImages.find((img) => img.id === 'user-avatar');

    if (isLoading) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-accent">
              {carrierImage && <AvatarImage src={carrierImage.imageUrl} alt={carrier?.name} />}
              <AvatarFallback>{carrier?.name?.charAt(0) || 'C'}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold text-md text-foreground">{carrier?.name || 'ناقل غير معروف'}</p>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span>{carrier?.averageRating || 'جديد'}</span>
                </div>
            </div>
        </div>
    )
}

export function OfferCard({ offer }: OfferCardProps) {
    const { toast } = useToast();

    const handleAccept = () => {
        toast({ title: "قبول العرض", description: "سيتم تفعيل هذه الميزة قريباً." });
    };

    const handleReject = () => {
        toast({ title: "رفض العرض", description: "سيتم تفعيل هذه الميزة قريباً.", variant: 'destructive' });
    };

  return (
    <Card className="w-full overflow-hidden shadow-lg transition-all hover:shadow-primary/20 border-2 border-border/60 flex flex-col justify-between bg-card/70">
        <CardHeader>
            <CarrierInfo carrierId={offer.carrierId} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-baseline gap-2 text-3xl font-bold text-accent">
              <HandCoins className="h-8 w-8" />
              <span>{offer.price}</span>
              <span className="text-lg font-normal text-muted-foreground">JOD</span>
          </div>

          {offer.notes && (
            <div className="text-sm text-muted-foreground p-3 bg-background/50 rounded-md border border-dashed border-border">
                <p className='flex gap-2'><MessageCircle className="h-4 w-4 mt-0.5" /> <strong>ملاحظات الناقل:</strong></p>
                <p>{offer.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 p-4 bg-background/30">
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={handleAccept}>
                <ThumbsUp className="ml-2 h-4 w-4" />
                قبول
            </Button>
            <Button size="sm" variant="destructive" className="w-full" onClick={handleReject}>
                <ThumbsDown className="ml-2 h-4 w-4" />
                رفض
            </Button>
        </CardFooter>
    </Card>
  );
}
