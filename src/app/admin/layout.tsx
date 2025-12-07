'use client';

import { ReactNode } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2, ShieldCheck, Users, Ship } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

function AdminLoadingScreen() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4 text-center">
                <ShieldCheck className="h-16 w-16 animate-pulse text-primary" />
                <h1 className="text-xl font-bold">جاري التحقق من الصلاحيات...</h1>
                <p className="text-sm text-muted-foreground">يتم الآن التحقق من هويتك الأمنية.</p>
            </div>
        </div>
    );
}

const adminNavLinks = [
    { href: '/admin', label: 'نظرة عامة', icon: ShieldCheck, exact: true },
    { href: '/admin/users', label: 'إدارة المستخدمين', icon: Users, exact: false },
    { href: '/admin/trips', label: 'إدارة الرحلات', icon: Ship, exact: false },
];


export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isLoading, isAdmin } = useAdmin();
    const pathname = usePathname();

    if (isLoading) {
        return <AdminLoadingScreen />;
    }

    if (!isAdmin) {
        // This should technically not be visible as the hook redirects.
        return null;
    }

    return (
        <div className="flex min-h-screen w-full bg-gray-900 text-gray-200" dir="rtl">
            <aside className="hidden w-64 flex-col border-l border-gray-700 bg-gray-800 p-4 md:flex">
                <div className="mb-8 flex justify-center">
                    <Logo />
                </div>
                <nav className="flex flex-col gap-2">
                    {adminNavLinks.map((link) => {
                        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-300 transition-all hover:bg-gray-700 hover:text-white",
                                    isActive && "bg-primary/10 text-primary font-bold"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
            <div className="flex flex-1 flex-col">
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
                    <h1 className="text-xl font-semibold">لوحة تحكم الإدارة</h1>
                    {/* Add User menu or other header items here */}
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
