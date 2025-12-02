
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

interface LegalDisclaimerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onContinue: () => void;
}

export function LegalDisclaimerDialog({ isOpen, onOpenChange, onContinue }: LegalDisclaimerDialogProps) {

    const handleConfirm = () => {
        onContinue();
    };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important Legal Notice</AlertDialogTitle>
          <AlertDialogDescription>
            By clicking "Continue", you acknowledge and agree that Fayz RideShare acts solely as a technical intermediary to facilitate communication between two parties: the traveler and the carrier.
            <br/><br/>
            Fayz RideShare assumes no legal, contractual, or criminal liability for any act, behavior, or obligation that may arise from the carrier or the traveler.
            <br/><br/>
            All obligations and rights are exclusively the responsibility of the contracting parties, and Fayz RideShare remains free from any related legal liability or consequence.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
