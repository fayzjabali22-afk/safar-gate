'use client';

import { useState } from 'react';
import { RequestCard } from '@/components/carrier/request-card';
import { mockTripRequests } from '@/lib/data'; // Using mock data as ordered
import { PackageOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarrierRequestsPage() {
  // In a real scenario, this would come from a hook like useCollection
  const [requests, setRequests] = useState(mockTripRequests);
  const [isLoading, setIsLoading] = useState(false); // Set to false for mock data

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
          عد لاحقاً للتحقق من وجود طلبات جديدة من المسافرين.
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
