'use client';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Calendar, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [bookingType, setBookingType] = useState<'carrier' | 'scheduled' | 'date'>('scheduled');

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              ابدأ رحلتك
            </CardTitle>
            <CardDescription className="text-center">
              اختر وجهتك وحدد تفاصيل رحلتك بسهولة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="origin-country">من</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر دولة الانطلاق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="syria">سوريا</SelectItem>
                      <SelectItem value="jordan">الأردن</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مدينة الانطلاق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damascus">دمشق</SelectItem>
                      <SelectItem value="amman">عمّان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination-country">إلى</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر دولة الوصول" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jordan">الأردن</SelectItem>
                      <SelectItem value="syria">سوريا</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مدينة الوصول" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amman">عمّان</SelectItem>
                       <SelectItem value="damascus">دمشق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Seats */}
              <div className="grid gap-2">
                <Label htmlFor="seats">عدد المقاعد</Label>
                <Input id="seats" type="number" placeholder="1" min="1" />
              </div>

              {/* Booking Philosophy */}
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
                 <Button variant={bookingType === 'carrier' ? 'default' : 'ghost'} onClick={() => setBookingType('carrier')} className={cn("flex-col h-auto p-2", bookingType === 'carrier' && "bg-primary text-primary-foreground")}>
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-xs">ناقل محدد</span>
                </Button>
                <Button variant={bookingType === 'scheduled' ? 'default' : 'ghost'} onClick={() => setBookingType('scheduled')} className={cn("flex-col h-auto p-2", bookingType === 'scheduled' && "bg-primary text-primary-foreground")}>
                    <CalendarDays className="w-5 h-5 mb-1" />
                    <span className="text-xs">رحلات مجدولة</span>
                </Button>
                 <Button variant={bookingType === 'date' ? 'default' : 'ghost'} onClick={() => setBookingType('date')} className={cn("flex-col h-auto p-2", bookingType === 'date' && "bg-primary text-primary-foreground")}>
                    <Calendar className="w-5 h-5 mb-1" />
                    <span className="text-xs">بتاريخ محدد</span>
                </Button>
              </div>

              <div className="flex justify-between mt-4">
                  <Button variant="outline">إلغاء العملية</Button>
                  <Button>تكملة الحجز</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
