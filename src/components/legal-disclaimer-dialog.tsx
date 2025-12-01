'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface LegalDisclaimerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onContinue: () => void; // A function to call when user clicks "Continue"
}

export function LegalDisclaimerDialog({ isOpen, onOpenChange, onContinue }: LegalDisclaimerDialogProps) {
    const router = useRouter();

    const handleConfirm = () => {
        // We no longer handle redirection here.
        // We just call the onContinue prop passed from the parent component.
        onContinue();
    };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>ملاحظة قانونية هامة</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            بمجرد قيامك بالضغط على زر "المتابعة"، فإنك تقر وتوافق على أن موقع سفريات يعمل فقط كوسيط تقني لتقريب التواصل بين طرفين: المسافر والناقل.
            <br/><br/>
            ولا يتحمل موقع سفريات أي مسؤولية قانونية أو تعاقدية أو جزائية عن أي فعل أو سلوك أو التزام قد يصدر عن الناقل أو المسافر.
            <br/><br/>
            وتقع جميع الالتزامات والحقوق حصراً على عاتق الأطراف المتعاقدة فيما بينهم، ويظل موقع سفريات خالياً من أي مسؤولية أو تبعة قانونية ذات صلة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>متابعة</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
