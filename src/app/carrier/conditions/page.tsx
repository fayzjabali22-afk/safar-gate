'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";


export default function CarrierConditionsPage() {

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-4">
             <header className="p-4 rounded-b-lg md:rounded-lg bg-card shadow-sm border-b md:border">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary" />
                    إدارة الشروط الدائمة
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm pt-1">
                    حدد هنا الشروط والأحكام التي تظهر تلقائياً في كل رحلة جديدة تقوم بنشرها.
                </p>
            </header>

            <main>
                 <Card>
                    <CardHeader>
                        <CardTitle>صفحة قيد الإنشاء</CardTitle>
                        <CardDescription>
                            سيتم هنا بناء واجهة لإدارة شروطك الدائمة التي تطبق على جميع رحلاتك.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">شكراً لاهتمامك، نعمل على تطوير هذه الميزة.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
