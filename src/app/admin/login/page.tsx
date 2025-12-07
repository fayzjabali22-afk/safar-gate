'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useAuth, initiateEmailSignIn, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

const adminLoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح.'),
  password: z.string().min(1, 'كلمة المرور مطلوبة.'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    if (!auth || !firestore) {
        toast({ title: "خطأ", description: "خدمات Firebase غير مهيأة.", variant: "destructive" });
        return;
    };
    
    toast({
      title: 'جاري التحقق من الهوية...',
      description: 'الرجاء الانتظار.',
    });

    const userCredential = await initiateEmailSignIn(auth, data.email, data.password);
    
    if (userCredential && userCredential.user) {
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'admin' || userData.role === 'owner') {
                toast({
                    title: 'أهلاً بعودتك أيها المدير',
                    description: 'سيتم توجيهك إلى لوحة التحكم.',
                });
                router.push('/admin');
            } else {
                toast({
                    variant: "destructive",
                    title: "الدخول مرفوض",
                    description: "هذا الحساب لا يملك صلاحيات الدخول إلى لوحة التحكم.",
                });
                await auth.signOut();
            }
        } else {
            toast({
                variant: "destructive",
                title: "فشل تسجيل الدخول",
                description: "لم يتم العثور على ملف تعريف المستخدم.",
            });
             await auth.signOut();
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-6 space-y-6 rounded-lg shadow-2xl border-2 border-primary/50">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
                <Shield className="h-12 w-12 text-primary"/>
            </div>
            <h1 className="text-3xl font-bold">بوابة القلعة</h1>
            <p className="text-muted-foreground">
              تسجيل الدخول للمدراء والمشرفين فقط
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                الدخول إلى لوحة التحكم
              </Button>
            </form>
          </Form>
        </Card>
    </div>
  );
}
