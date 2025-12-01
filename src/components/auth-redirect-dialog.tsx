
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { UserPlus, LogIn } from 'lucide-react';

interface AuthRedirectDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function AuthRedirectDialog({ isOpen, onOpenChange }: AuthRedirectDialogProps) {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/login');
        onOpenChange(false);
    };

    const handleSignup = () => {
        router.push('/signup');
        onOpenChange(false);
    };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>يجب عليك تسجيل الدخول أولاً</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            للمتابعة وإرسال طلبك، يرجى تسجيل الدخول إلى حسابك أو إنشاء حساب جديد إذا لم تكن مسجلاً بعد.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex-col sm:flex-col gap-2 pt-4">
          <Button onClick={handleLogin} className="w-full">
            <LogIn className="ml-2 h-4 w-4"/>
            تسجيل الدخول (حساب سابق)
          </Button>
          <Button variant="secondary" onClick={handleSignup} className="w-full">
            <UserPlus className="ml-2 h-4 w-4"/>
            إنشاء حساب جديد
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
