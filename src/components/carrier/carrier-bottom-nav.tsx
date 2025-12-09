'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Archive, Search, Route, PlusCircle, LayoutDashboard, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavLink {
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
    count: number;
}

interface CarrierBottomNavProps {
  onAddTripClick: () => void;
  navLinks: NavLink[];
}

export function CarrierBottomNav({ onAddTripClick, navLinks }: CarrierBottomNavProps) {
  const pathname = usePathname();

  // Create the display items, inserting the FAB placeholder in the middle
  const displayItems: (NavLink | null)[] = [];
  const middleIndex = Math.floor(navLinks.length / 2);
  navLinks.forEach((link, index) => {
      if (index === middleIndex) {
          displayItems.push(null); // FAB placeholder
      }
      displayItems.push(link);
  });
  // If the list was even, the placeholder needs to be inserted manually
  if (navLinks.length % 2 === 0) {
      displayItems.splice(middleIndex, 0, null);
  }


  return (
    <div className="carrier-bottom-nav">
      <div className="relative h-full">
        <div className="absolute left-1/2 -top-7 -translate-x-1/2 flex items-center justify-center">
            <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-4 focus:ring-primary/50"
                onClick={onAddTripClick}
                aria-label="تأسيس رحلة جديدة"
            >
                <PlusCircle className="h-8 w-8" />
            </Button>
        </div>

        <nav className="grid grid-cols-5 h-full items-center px-2">
          {displayItems.slice(0, 5).map((item, index) => {
            if (!item) {
                return <div key={`spacer-${index}`} aria-hidden="true" />;
            }
            
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center gap-1 w-full py-2 h-full">
                {item.count > 0 && (
                    <Badge variant="destructive" className="absolute top-1 right-2 bg-orange-500 text-white px-1.5 py-0.5 text-[10px] rounded-full">
                        {item.count}
                    </Badge>
                )}
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
