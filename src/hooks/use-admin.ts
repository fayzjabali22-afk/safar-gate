'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

// القائمة البيضاء للمفاتيح الماستر (أضف بريدك هنا)
const MASTER_EMAILS = ['dev@safar.com', 'dev@torasco.com', 'admin@safar.com']; 

export function useAdmin() {
  const { profile, isLoading, user } = useUserProfile();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. إذا انتهى تحميل المصادقة (Auth)
    if (!isLoading) {
      
      // أ) إذا لم يكن هناك مستخدم -> طرد
      if (!user) {
        router.replace('/login');
        return;
      }

      // ب) المفتاح الماستر (THE MASTER KEY FIX)
      // إذا كان الإيميل في القائمة البيضاء، اسمح له فوراً دون انتظار البروفايل
      if (user.email && MASTER_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        setIsChecking(false);
        return; // توقف هنا، لقد نجح الدخول
      }

      // ج) الفحص التقليدي (للمشرفين الآخرين)
      const authorized = profile?.role === 'admin' || profile?.role === 'owner';
      
      if (authorized) {
        setIsAdmin(true);
      } else {
        // إذا لم يكن ماستر ولم يكن مشرفاً -> طرد
        router.replace('/dashboard');
      }
      setIsChecking(false);
    }
  }, [profile, isLoading, user, router]);

  return { 
    // طالما نحن نتحقق، اعتبر الحالة تحميل
    isLoading: isLoading || isChecking, 
    isAdmin 
  };
}
