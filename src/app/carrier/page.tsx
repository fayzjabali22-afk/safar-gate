'use client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { QuickActions } from '@/components/carrier/quick-actions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { DashboardStats } from '@/components/carrier/dashboard-stats';
import { PaymentInstructionsDisplay } from '@/components/carrier/payment-instructions-display';

export default function CarrierDashboardPage() {
  const { profile, isLoading } = useUserProfile();

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header is now empty */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        
      </header>

      {/* Main Content */}
      <div className="space-y-4 md:space-y-6">
        
        <DashboardStats />
        <QuickActions />
        <PaymentInstructionsDisplay />


        {/* Legal Disclaimer */}
        <Alert variant="default" className="bg-card/50 border-accent/30">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent font-bold">تنويه قانوني</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            نود تذكيركم بأن تطبيق "سفريات" يعمل كوسيط لتسهيل التواصل بين الناقلين والمسافرين. التطبيق غير مسؤول عن أي اتفاقات أو تعاملات تتم خارج المنصة. يرجى التأكد من الالتزام بالقوانين واللوائح المحلية المنظمة لعمليات النقل.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
