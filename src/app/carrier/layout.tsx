'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Ship, LayoutDashboard, Search, PlusCircle, Archive, Menu, Route, User, ArrowRightLeft, Loader2, ListChecks, List } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddTripDialog } from '@/app/carrier/add-trip-dialog';
import { CarrierBottomNav } from '@/components/carrier/carrier-bottom-nav';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CarrierMobileMenu } from '@/components/carrier/carrier-mobile-menu';
import { Logo } from '@/components/logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { updateDoc } from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError } from '@/firebase';


function LoadingSpinner() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Ship className="h-16 w-16 animate-pulse text-primary" />
                <p className="font-bold text-lg text-muted-foreground">جاري تحميل واجهة الناقل...</p>
            </div>
        </div>
    );
}

const sidebarNavLinks = [
    { href: '/carrier', label: 'لوحة القيادة', icon: LayoutDashboard, exact: true },
    { href: '/carrier/opportunities', label: 'مركز الفرص', icon: Search, exact: false },
    { href: '/carrier/trips', label: 'رحلاتي المجدولة', icon: Route, exact: false },
    { href: '/carrier/bookings', label: 'طلبات الحجز', icon: List, exact: false },
    { href: '/carrier/archive', label: 'الأرشيف', icon: Archive, exact: false },
    { href: '/carrier/conditions', label: 'الشروط الدائمة', icon: ListChecks, exact: false },
];


export default function CarrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddTripDialogOpen, setIsAddTripDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const { toast } = useToast();
  const { user, profile, isLoading, userProfileRef } = useUserProfile();

  // === CARRIER GUARD PROTOCOL ===
  useEffect(() => {
    if (!isLoading && profile && profile.role !== 'carrier') {
      router.replace('/dashboard');
    }
  }, [isLoading, profile, router]);

  if (isLoading || !profile) {
    return <LoadingSpinner />;
  }
  // ===============================

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background" dir="rtl">
        <header
          className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-accent px-4 text-accent-foreground shadow-lg md:px-6"
        >
            {/* Right Section: Logo */}
            <Link href="/carrier">
                <Logo />
            </Link>
            
            {/* Left Section: Controls */}
            <div className="flex items-center gap-2">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">فتح القائمة</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-xs p-0 bg-card text-card-foreground">
                       <SheetTitle className="sr-only">Carrier Navigation Menu</SheetTitle>
                       <CarrierMobileMenu onLinkClick={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
                <Button asChild variant="ghost" size="icon">
                  <Link href="/carrier/profile">
                    <User className="h-6 w-6" />
                    <span className="sr-only">الملف الشخصي</span>
                  </Link>
                </Button>
            </div>
        </header>
        
        <div className="grid h-full flex-1 grid-cols-1 md:grid-cols-[240px_1fr]">
            <aside className="hidden h-full border-l bg-card p-4 overflow-y-auto md:block">
                <Button className="mb-4 w-full" onClick={() => setIsAddTripDialogOpen(true)}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    تأسيس رحلة جديدة
                </Button>
                <nav className="flex flex-col gap-1">
                    {sidebarNavLinks.map(link => {
                        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                        return (
                            <Link key={link.href} href={link.href}>
                                <div className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-all hover:bg-muted/50 hover:text-primary-foreground",
                                    isActive && "bg-primary text-primary-foreground font-bold"
                                )}>
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto bg-background/80 pb-24 md:pb-0 p-4">
                {children}
            </main>
        </div>
        
        <CarrierBottomNav onAddTripClick={() => setIsAddTripDialogOpen(true)} />
      </div>
      
      <AddTripDialog 
        isOpen={isAddTripDialogOpen}
        onOpenChange={setIsAddTripDialogOpen}
      />
    </TooltipProvider>
  );
}
