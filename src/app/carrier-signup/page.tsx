'use client';
import Link from 'next/link';
import Image from 'next/image';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, initiateEmailSignUp, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Ship } from 'lucide-react';

const carrierSignupSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل يجب أن يتكون من حرفين على الأقل.'),
  phoneNumber: z.string().min(1, 'رقم الهاتف مطلوب.'),
  email: z.string().email('البريد الإلكتروني غير صالح.'),
  password: z.string().min(5, 'كلمة المرور يجب أن تتكون من 5 أحرف على الأقل.'),
});

type CarrierSignupFormValues = z.infer<typeof carrierSignupSchema>;

export default function CarrierSignupPage() {
  const bgImage = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<CarrierSignupFormValues>({
    resolver: zodResolver(carrierSignupSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: CarrierSignupFormValues) => {
    if (!auth || !firestore) {
        toast({ title: "خطأ", description: "Firebase not initialized.", variant: "destructive"});
        return;
    };

    const [firstName, ...lastNameParts] = data.fullName.split(' ');
    const userProfile = {
        firstName: firstName,
        lastName: lastNameParts.join(' '),
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: 'carrier' as const // Assign 'carrier' role directly
    };

    const userCredential = await initiateEmailSignUp(auth, firestore, data.email, data.password, userProfile, false);

    if (userCredential) {
        toast({
          title: 'أهلاً بك في أسطولنا!',
          description: 'تم إنشاء حسابك كناقل بنجاح. سيتم توجيهك الآن إلى لوحة التحكم.',
        });
        router.push('/carrier');
    }
  };


  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 md:px-0">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/60" />
      <Card className="mx-auto max-w-sm bg-card/90 backdrop-blur-sm border-border">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit border border-primary">
            <Ship className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl mt-4">بوابة تسجيل الناقلين</CardTitle>
          <CardDescription>
            انضم إلى أسطولنا وابدأ في تحقيق الأرباح.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="فايز الحربي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input dir="ltr" placeholder="+966 50 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
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
                  <FormItem className="grid gap-2">
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
              <Button variant="default" type="submit" className="w-full">
                إنشاء حساب ناقل
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="underline">
              تسجيل الدخول
            </Link>
          </div>
           <div className="mt-4 text-center text-sm">
            هل أنت مسافر؟{' '}
            <Link href="/signup" className="underline">
              أنشئ حساب مسافر من هنا
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
