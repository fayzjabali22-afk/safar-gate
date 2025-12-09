'use client';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Trip, Booking, UserProfile, PassengerDetails } from '@/lib/data';
import { User, ShieldCheck, Phone, Users as UsersIcon, Printer } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface PassengersListDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    trip: Trip | null;
}

export function PassengersListDialog({ isOpen, onOpenChange, trip }: PassengersListDialogProps) {
    const firestore = useFirestore();

    const bookingsQuery = useMemo(() => {
        if (!firestore || !trip?.id) return null;
        return query(
            collection(firestore, 'bookings'),
            where('tripId', '==', trip.id),
            where('status', '==', 'Confirmed')
        );
    }, [firestore, trip]);
    
    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const allPassengers = useMemo(() => {
        if (!bookings) return [];
        return bookings.flatMap(b => b.passengersDetails);
    }, [bookings]);

    const totalPassengers = allPassengers.length;
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>كشف المسافرين (المانيفست)</title>');
            printWindow.document.write('<style>body{direction: rtl; font-family: sans-serif;} table {width: 100%; border-collapse: collapse;} th, td {border: 1px solid #ddd; padding: 8px; text-align: right;} th {background-color: #f2f2f2;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<h1>كشف المسافرين (المانيفست)</h1>`);
            printWindow.document.write(`<p><strong>الرحلة:</strong> ${trip?.origin} إلى ${trip?.destination}</p>`);
            printWindow.document.write(`<p><strong>تاريخ الرحلة:</strong> ${trip?.departureDate ? new Date(trip.departureDate).toLocaleDateString('ar-SA') : ''}</p>`);
            printWindow.document.write('<table>');
            printWindow.document.write('<thead><tr><th>#</th><th>الاسم الكامل</th><th>الجنسية</th><th>رقم الوثيقة</th></tr></thead>');
            printWindow.document.write('<tbody>');
            allPassengers.forEach((p, index) => {
                printWindow.document.write(`<tr><td>${index + 1}</td><td>${p.name}</td><td>${p.nationality}</td><td>${p.documentNumber}</td></tr>`);
            });
            printWindow.document.write('</tbody></table>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>كشف ركاب الرحلة (المانيفست)</DialogTitle>
                    <DialogDescription>
                        قائمة الركاب المؤكدين للرحلة من {trip?.origin} إلى {trip?.destination}.
                        <br/>
                        <span className="font-bold">إجمالي الركاب: {totalPassengers}</span>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-4 px-4">
                    <div className="py-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : allPassengers.length > 0 ? (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الاسم الكامل</TableHead>
                                        <TableHead>الجنسية</TableHead>
                                        <TableHead>رقم الوثيقة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPassengers.map((passenger, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{passenger.name}</TableCell>
                                            <TableCell>{passenger.nationality}</TableCell>
                                            <TableCell>{passenger.documentNumber}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <User className="mx-auto h-8 w-8 mb-2" />
                                لا يوجد ركاب مؤكدون لهذه الرحلة بعد.
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter className="gap-2 sm:gap-4">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        إغلاق
                    </Button>
                    <Button type="button" onClick={handlePrint} disabled={allPassengers.length === 0}>
                        <Printer className="ml-2 h-4 w-4" />
                        طباعة المانيفست
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
