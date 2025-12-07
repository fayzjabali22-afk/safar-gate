'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { GuideDialog } from './guide-dialog';

export function GuideTrigger() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
          aria-label="افتح المرشد الذكي"
        >
          <Lightbulb className="h-7 w-7" />
        </Button>
      </div>
      <GuideDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
