'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { GuideDialog } from './guide-dialog';

export function GuideTrigger() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      {/* FIX: Z-Index increased to 100 to stay above BottomNav and Toaster.
         FIX: Bottom position increased to bottom-20 on mobile to clear the nav bar.
      */}
      <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-[100]">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 hover:scale-105 transition-transform border-2 border-white/20"
          onClick={() => setIsDialogOpen(true)}
          aria-label="افتح المرشد الذكي"
        >
          <Lightbulb className="h-7 w-7 animate-pulse" />
        </Button>
      </div>
      <GuideDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
