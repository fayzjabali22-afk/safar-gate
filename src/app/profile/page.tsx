
'use client';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking, useAuth } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { deleteUser, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Trash2, MailCheck, TestTube2, ArrowRightLeft, Loader2, Briefcase, Upload } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { actionCodeSettings } from '@/firebase/config';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const carrierSettingsSchema = z.object({
    specialization: z.object({
        from: z.string().min(1, 'Origin country is required.'),
        to: z.string().min(1, 'Destination country is required.'),
    }).optional(),
    vehicleCategory: z.enum(['small', 'bus']).optional(),
});

type CarrierSettingsValues = z.infer<typeof carrierSettingsSchema>;

// Mock data for countries - should be moved to a shared location
const countries: { [key: string]: { name: string; cities?: string[] } } = {
  syria: { name: 'سوريا' },
  jordan: { name: 'الأردن' },
  ksa: { name: 'السعودية' },
  egypt: { name: 'مصر' },
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { profile, isLoading } = useUserProfile();
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const carrierProfileRef = useMemoFirebase(() => {
    if (!firestore || !user || profile?.role !== 'carrier') return null;
    return doc(firestore, 'carriers', user.uid);
  }, [firestore, user, profile?.role]);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phoneNumber: '' },
  });

  const carrierForm = useForm<CarrierSettingsValues>({
      resolver: zodResolver(carrierSettingsSchema),
      defaultValues: {
          specialization: { from: '', to: ''},
          vehicleCategory: undefined,
      }
  });


  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || user?.email || '',
        phoneNumber: profile.phoneNumber || user?.phoneNumber || ''
      });
      if (profile.role === 'carrier') {
        // Fetch and set carrier-specific data
        const fetchCarrierProfile = async () => {
            if (!carrierProfileRef) return;
            const { getDoc } = await import('firebase/firestore');
            const carrierSnap = await getDoc(carrierProfileRef);
            if(carrierSnap.exists()) {
                const carrierData = carrierSnap.data();
                carrierForm.reset({
                    specialization: carrierData.specialization || { from: '', to: '' },
                    vehicleCategory: carrierData.vehicleCategory,
                });
            }
        }
        fetchCarrierProfile();
      }
    } else if (user) {
        form.reset({
        ...form.getValues(),
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
        });
    }
  }, [profile, user, form, carrierForm, carrierProfileRef]);
  
  function onUserSubmit(data: ProfileFormValues) {
    if (!userProfileRef) return;
    setDocumentNonBlocking(userProfileRef, data, { merge: true });
    toast({ title: 'تم تحديث الملف الشخصي', description: 'تم حفظ تغييراتك بنجاح.' });
  }

  async function onCarrierSubmit(data: CarrierSettingsValues) {
    if (!carrierProfileRef) return;
    try {
        await updateDoc(carrierProfileRef, data);
        toast({ title: 'تم تحديث إعدادات الناقل', description: 'تم حفظ إعداداتك التخصصية.' });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'فشل التحديث', description: 'لم نتمكن من حفظ إعدادات الناقل.' });
    }
  }


  const handleRoleChange = async (newRole: 'traveler' | 'carrier') => {
    if (!userProfileRef) return;
    setIsSwitchingRole(true);
    try {
        await updateDoc(userProfileRef, { role: newRole });
        toast({
            title: `تم تغيير الدور إلى ${newRole === 'carrier' ? 'ناقل' : 'مسافر'}`,
            description: "سيتم تحديث صلاحياتك."
        });
        if (newRole === 'carrier') {
            router.push('/carrier');
        } else {
            router.push('/dashboard');
        }
    } catch (e) {
         toast({ variant: "destructive", title: "فشل تحديث الدور", description: "حدث خطأ ما." });
    } finally {
        setIsSwitchingRole(false);
    }
  }

  const handleResendVerification = async () => {
    if (user && !user.emailVerified) {
        try {
            await sendEmailVerification(user, actionCodeSettings);
            toast({ title: 'تم إرسال البريد', description: 'تم إرسال بريد تفعيل جديد. الرجاء التحقق من صندوق الوارد.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إرسال بريد التفعيل. الرجاء المحاولة مرة أخرى قريبًا.' });
        }
    }
  };

    const handleDeleteAccount = async () => {
    if (!user || !auth || !firestore) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على المستخدم أو خدمات Firebase.' });
        setIsDeleteConfirmOpen(false);
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    try {
        await deleteDoc(userDocRef);
        toast({ title: 'تم حذف ملف Firestore الشخصي', description: 'تمت إزالة ملفك الشخصي من قاعدة البيانات.' });
        await deleteUser(user);
        
        toast({ title: 'تم حذف الحساب بنجاح', description: 'نأمل أن نراك مرة أخرى قريبًا.' });
        router.push('/signup');

    } catch (error: any) {
        console.error("Delete account error:", error);
        
        if (error.code === 'auth/requires-recent-login') {
            toast({ variant: 'destructive', title: 'فشل حذف المصادقة', description: 'هذه العملية تتطلب إعادة تسجيل دخول حديثة. تم حذف بياناتك، يرجى تسجيل الخروج ثم الدخول مرة أخرى لإكمال الحذف.' });
             router.push('/login'); 
        } else {
             toast({ variant: 'destructive', title: 'فشل حذف الحساب', description: 'حدث خطأ أثناء محاولة حذف حسابك.' });
        }
    } finally {
        setIsDeleteConfirmOpen(false);
    }
  };

  const isGuestUser = user?.email === 'guest@example.com';
  const roleIsLoading = isLoading || isSwitchingRole;


  return (
    <>
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 p-4">
        
        {user && !user.emailVerified && !isGuestUser && (
          <Card className="border-yellow-500 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500"><ShieldAlert /> تفعيل الحساب</CardTitle>
                <CardDescription>حسابك غير مُفعّل. الرجاء التحقق من بريدك الإلكتروني أو طلب رابط تفعيل جديد.</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="outline" onClick={handleResendVerification}><MailCheck className="ml-2 h-4 w-4" /> إعادة إرسال بريد التفعيل</Button>
            </CardFooter>
          </Card>
        )}

        {isGuestUser && (
          <Card className="border-accent shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent"><TestTube2 /> منطقة المطور (Dev Zone)</CardTitle>
                <CardDescription>أنت تستخدم حساب الضيف. يمكنك تبديل دورك لأغراض الاختبار. الدور الحالي: <span className="font-bold text-foreground">{profile?.role || '...'}</span></CardDescription>
             </CardHeader>
             <CardFooter className="flex flex-col sm:flex-row gap-4">
                 <Button variant={profile?.role === 'traveler' ? 'default' : 'outline'} onClick={() => handleRoleChange('traveler')} disabled={roleIsLoading} className="flex-1">
                    {roleIsLoading && profile?.role !== 'traveler' ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <ArrowRightLeft className="ml-2 h-4 w-4" />}
                    التحويل إلى مسافر (Traveler)
                </Button>
                <Button variant={profile?.role === 'carrier' ? 'default' : 'outline'} onClick={() => handleRoleChange('carrier')} disabled={roleIsLoading} className="flex-1">
                    {roleIsLoading && profile?.role !== 'carrier' ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <ArrowRightLeft className="ml-2 h-4 w-4" />}
                    التحويل إلى ناقل (Carrier)
                </Button>
             </CardFooter>
          </Card>  
        )}


        <Card className="shadow-lg">
            <CardHeader><CardTitle className="font-headline">إعدادات الملف الشخصي</CardTitle><CardDescription>قم بإدارة معلومات حسابك وتفضيلاتك.</CardDescription></CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onUserSubmit)} className="space-y-8">
                <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    <Avatar className="h-20 w-20"><AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} /><AvatarFallback>{profile?.firstName ? profile.firstName.charAt(0) : user?.email?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    <Button variant="outline" type="button" onClick={() => toast({ title: 'قيد التطوير', description: 'ميزة رفع الصور ستكون متاحة قريباً.' })}><Upload className="ml-2 h-4 w-4" /> تغيير الصورة</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>الاسم الأول</FormLabel><FormControl><Input placeholder="اسمك الأول" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>الاسم الأخير</FormLabel><FormControl><Input placeholder="اسمك الأخير" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" placeholder="بريدك الإلكتروني" {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input type="tel" placeholder="رقم هاتفك" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit">حفظ التغييرات</Button>
                </form>
            </Form>
            </CardContent>
        </Card>

        {profile?.role === 'carrier' && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase /> إعدادات الناقل التخصصية</CardTitle>
                    <CardDescription>حدد خط النقل الذي تعمل عليه ونوع مركبتك لتصلك الطلبات المناسبة.</CardDescription>
                </CardHeader>
                <Form {...carrierForm}>
                    <form onSubmit={carrierForm.handleSubmit(onCarrierSubmit)}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-semibold">تخصص خط النقل</Label>
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={carrierForm.control} name="specialization.from" render={({ field }) => (<FormItem><FormLabel>من</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر دولة" /></SelectTrigger></FormControl><SelectContent>{Object.entries(countries).map(([key, {name}]) => (<SelectItem key={key} value={key}>{name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                     <FormField control={carrierForm.control} name="specialization.to" render={({ field }) => (<FormItem><FormLabel>إلى</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر دولة" /></SelectTrigger></FormControl><SelectContent>{Object.entries(countries).map(([key, {name}]) => (<SelectItem key={key} value={key}>{name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            <Separator />
                            <FormField control={carrierForm.control} name="vehicleCategory" render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="font-semibold">فئة المركبة الأساسية</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                            <FormItem className="flex items-center space-x-3 space-x-reverse"><FormControl><RadioGroupItem value="small" /></FormControl><FormLabel className="font-normal">مركبة صغيرة (4-7 ركاب)</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-3 space-x-reverse"><FormControl><RadioGroupItem value="bus" /></FormControl><FormLabel className="font-normal">حافلة (8+ ركاب)</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">حفظ إعدادات الناقل</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        )}

        <Card className="border-destructive shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert /> منطقة الخطر</CardTitle><CardDescription>هذه الإجراءات دائمة ولا يمكن التراجع عنها. يرجى المتابعة بحذر.</CardDescription></CardHeader>
            <CardContent><p>بمجرد حذف حسابك، ستفقد كل بياناتك الشخصية وسجل الحجوزات بشكل نهائي.</p></CardContent>
            <CardFooter><Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}><Trash2 className="ml-2 h-4 w-4" /> حذف الحساب بشكل نهائي</Button></CardFooter>
        </Card>
      </div>
    </AppLayout>

    <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent dir="rtl">
            <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-red-500" /> هل أنت متأكد من حذف حسابك؟</AlertDialogTitle><AlertDialogDescription>هذا الإجراء سيقوم بحذف حسابك بشكل نهائي. لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع بياناتك الشخصية وحجوزاتك وسجل رحلاتك.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">نعم، قم بحذف حسابي</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    