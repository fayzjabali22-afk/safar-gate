'use client';
import { WalletBalanceCard } from "@/components/carrier/wallet-balance-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Skeleton } from "@/components/ui/skeleton";

function PaymentSetupPrompt() {
    return (
        <Card className="border-accent">
            <CardHeader>
                <CardTitle className="text-accent">إعداد طريقة استلام الدفعات</CardTitle>
                <CardDescription>
                    لم تقم بإعداد طريقة استلام دفعات العربون من المسافرين بعد. يرجى الذهاب إلى ملفك الشخصي لإضافة تعليمات الدفع الخاصة بك.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button asChild>
                    <Link href="/profile">
                        <Settings className="ml-2 h-4 w-4" />
                        الذهاب إلى الملف الشخصي
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

function PaymentInstructionsDisplay({ instructions }: { instructions: string }) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>تعليمات الدفع الحالية</CardTitle>
                <CardDescription>
                    هذه هي التعليمات التي سيراها المسافرون لدفع العربون لك مباشرة. يمكنك تعديلها من ملفك الشخصي.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-muted rounded-md border text-sm whitespace-pre-wrap">
                    {instructions}
                </div>
            </CardContent>
             <CardFooter>
                <Button asChild variant="outline">
                    <Link href="/profile">
                        <Settings className="ml-2 h-4 w-4" />
                        تعديل التعليمات
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function WalletPage() {
    const { profile, isLoading } = useUserProfile();

    return (
        <div className="space-y-8">
            <WalletBalanceCard />

            {isLoading ? (
                <Skeleton className="h-48 w-full" />
            ) : (
                profile?.paymentInformation ? (
                    <PaymentInstructionsDisplay instructions={profile.paymentInformation} />
                ) : (
                    <PaymentSetupPrompt />
                )
            )}
            
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
                <Info className="h-4 w-4 !text-blue-500" />
                <AlertTitle className="font-bold">مرحلة تجريبية</AlertTitle>
                <AlertDescription>
                    نظام المحفظة والدفع قيد التطوير حالياً. لا يمكن سحب أو إيداع أموال حقيقية في هذه المرحلة. سيتم تفعيل المعاملات المالية قريباً.
                </AlertDescription>
            </Alert>
        </div>
    );
}
