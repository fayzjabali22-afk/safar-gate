'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Ticket,
  LogOut,
  MapPin,
  Settings,
  User,
  Menu,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const menuItems = [
  {
    href: '/dashboard',
    label: 'لوحة التحكم',
    icon: MapPin,
  },
  {
    href: '/history',
    label: 'حجوزاتي',
    icon: Ticket,
  },
  {
    href: '/profile',
    label: 'ملفي الشخصي',
    icon: User,
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userProfileRef);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <img 
              src="https://i.postimg.cc/zvbhTsXV/Iwjw-sfryat.png" 
              alt="Safar Carrier Logo" 
              style={{ height: '80px', width: '140px' }} 
            />
            <span className="sr-only">Safar Carrier</span>
          </Link>
          {menuItems.map((item) => (
             <Link
              key={item.label}
              href={item.href}
              className={`transition-colors hover:text-foreground ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <img 
                  src="https://i.postimg.cc/zvbhTsXV/Iwjw-sfryat.png" 
                  alt="Safar Carrier Logo" 
                  style={{ height: '80px', width: '140px' }} 
                />
                <span className="sr-only">Safar Carrier</span>
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`hover:text-foreground ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt={userProfile?.firstName || ''} />}
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {userProfile?.firstName ? userProfile.firstName.charAt(0) : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userProfile?.firstName ? `مرحباً، ${userProfile.firstName}`: 'حسابي'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="ml-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
