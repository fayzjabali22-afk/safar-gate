'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ListChecks, Route, Wallet, Save, Loader2, Upload, Car } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState, useMemo } from 'react';


const countries: { [key: string]: { name: string; cities?: string[] } } = {
  syria: { name: 'سوريا' },
  jordan: { name: 'الأردن' },
  ksa: { name: 'السعودية' },
  egypt: { name: 'مصر' },
};

const conditionsSchema = z.object({
  vehicleImageUrls: z.array(z.string().url('الرجاء إدخال رابط صورة صالح').or(z.literal(''))).max(2).optional(),
  primaryRoute: z.object({
      origin: z.string().optional(),
      destination: z.string().optional(),
  }).optional(),
  paymentInformation: z.string().max(300, 'يجب ألا تتجاوز التعليمات 300 حرف').optional(),
});

type ConditionsFormValues = z.infer<typeof conditionsSchema>;

export default function CarrierConditionsPage() {
    const { toast } = useToast();
    const { profile, isLoading } = useUserProfile();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userProfileRef = useMemo(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const form = useForm<ConditionsFormValues>({
        resolver: zodResolver(conditionsSchema),
        defaultValues: {
            vehicleImageUrls: ['', ''],
            primaryRoute: { origin: '', destination: '' },
            paymentInformation: '',
        }
    });

    const paymentInfoValue = form.watch('paymentInformation');

    useEffect(() => {
        if (profile) {
            form.reset({
                vehicleImageUrls: profile.vehicleImageUrls && profile.vehicleImageUrls.length > 0 ? (profile.vehicleImageUrls.length > 1 ? profile.vehicleImageUrls : [profile.vehicleImageUrls[0], '']) : ['', ''],
                primaryRoute: profile.primaryRoute || { origin: '', destination: '' },
                paymentInformation: profile.paymentInformation || '',
            });
        }
    }, [profile, form]);

    async function onSubmit(data: ConditionsFormValues) {
        if (!userProfileRef) return;
        
        setIsSubmitting(true);
        const dataToSave: Partial<ConditionsFormValues> = { ...data };

        if (dataToSave.vehicleImageUrls) {
            dataToSave.vehicleImageUrls = dataToSave.vehicleImageUrls.filter(
                (url) => url && url.trim() !== ''
            );
        }

        try {
            await updateDoc(userProfileRef, dataToSave);
            toast({ title: 'تم تحديث الشروط الدائمة', description: 'تم حفظ تغييراتك بنجاح.' });
        } catch (error) {
            toast({ title: 'فشل التحديث', description: 'حدث خطأ ما.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-4">
             <header className="p-4 rounded-b-lg md:rounded-lg bg-card shadow-sm border-b md:border">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary" />
                    إدارة الإعدادات الدائمة
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm pt-1">
                    حدد هنا الإعدادات التي تطبق تلقائياً على رحلاتك وعروضك لتسريع وتيرة عملك.
                </p>
            </header>

            <main>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Route/> خط السير المفضل</CardTitle>
                                <CardDescription>يستخدم هذا الإعداد للفلترة الذكية في مركز الفرص.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="primaryRoute.origin" render={({ field }) => (<FormItem><FormLabel>من</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر دولة" /></SelectTrigger></FormControl><SelectContent>{Object.entries(countries).map(([key, { name }]) => (<SelectItem key={key} value={key}>{name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="primaryRoute.destination" render={({ field }) => (<FormItem><FormLabel>إلى</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر دولة" /></SelectTrigger></FormControl><SelectContent>{Object.entries(countries).filter(([key]) => key !== form.watch('primaryRoute.origin')).map(([key, { name }]) => (<SelectItem key={key} value={key}>{name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Wallet/> تعليمات استلام الدفعات</CardTitle>
                                <CardDescription>
                                    هذه التعليمات تظهر للمسافر عند دفعه للعربون. كن واضحاً ودقيقاً.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <FormField
                                    control={form.control}
                                    name="paymentInformation"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="اكتب هنا تفاصيل الدفع (مثل: محفظة زين كاش 079...، كليك Alias...، أو الدفع نقداً عند الالتقاء)."
                                                className="min-h-[100px]"
                                                maxLength={300}
                                                {...field}
                                            />
                                        </FormControl>
                                        <div className="text-xs text-muted-foreground text-end pt-1">
                                            {paymentInfoValue?.length || 0}/300
                                        </div>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Car/> صور المركبة</CardTitle>
                                <CardDescription>
                                   هذه الصور تظهر للمسافرين في العروض والرحلات المجدولة.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="vehicleImageUrls.0" render={({ field }) => (<FormItem><FormLabel className="text-xs">الصورة الأساسية (رابط)</FormLabel><FormControl><Input dir="ltr" placeholder="https://example.com/main-image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="vehicleImageUrls.1" render={({ field }) => (<FormItem><FormLabel className="text-xs">صورة إضافية (رابط)</FormLabel><FormControl><Input dir="ltr" placeholder="https://example.com/extra-image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || isLoading}>
                                {isSubmitting ? (
                                    <><Loader2 className="ml-2 h-4 w-4 animate-spin"/> جاري الحفظ...</>
                                ) : (
                                    <><Save className="ml-2 h-4 w-4"/> حفظ الإعدادات الدائمة</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </div>
    )
}
