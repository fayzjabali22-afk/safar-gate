
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRelevantGuide, type Guide } from '@/ai/guide-engine';
import { Bot, Loader2, Volume2, StepForward, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';

interface GuideDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function GuideDialog({ isOpen, onOpenChange }: GuideDialogProps) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);


  // Load Guide Content
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        let context = pathname.split('/').filter(Boolean).pop() || 'dashboard';
        if (pathname.startsWith('/admin')) {
            context = 'admin_dashboard';
            if (pathname.includes('/users')) context = 'admin_users';
            if (pathname.includes('/trips')) context = 'admin_trips';
        }
        const relevantGuide = getRelevantGuide(context);
        setGuide(relevantGuide);
        setActiveStep(0);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
        // Stop audio when dialog closes
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }
  }, [isOpen, pathname]);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsSpeaking(false);
        return;
    }
    
    setIsSpeaking(true);
    try {
        const { audioDataUri } = await textToSpeech({ text });
        if (audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
        }
    } catch (error) {
        console.error('Text-to-speech failed:', error);
        toast({
            variant: 'destructive',
            title: 'فشل تشغيل الصوت',
            description: 'حدث خطأ أثناء تحويل النص إلى كلام.',
        });
        setIsSpeaking(false);
    }
  };
  
  useEffect(() => {
      // Create audio element on mount
      const audio = new Audio();
      audioRef.current = audio;

      const handleAudioEnd = () => setIsSpeaking(false);
      audio.addEventListener('ended', handleAudioEnd);

      return () => {
          audio.removeEventListener('ended', handleAudioEnd);
      }
  }, []);


  const nextStep = () => {
    if (guide && activeStep < guide.steps.length - 1) {
      setActiveStep(prev => prev + 1);
       if (isSpeaking && audioRef.current) {
          audioRef.current.pause();
          setIsSpeaking(false);
       }
    }
  };
  
  const resetGuide = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            المرشد السياقي الذكي
          </DialogTitle>
          <DialogDescription>
            دعني أرشدك خطوة بخطوة في هذه الشاشة.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-h-[200px] flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : guide ? (
            <div className="text-center space-y-4 w-full">
              <h3 className="font-bold text-lg">{guide.title}</h3>
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-base font-semibold leading-relaxed">
                  {guide.steps[activeStep].text}
                </p>
              </div>
              <div className="flex items-center justify-center gap-4">
                 <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleSpeak(guide.steps[activeStep].text)}
                  >
                    {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                    <span className="sr-only">استمع</span>
                </Button>
                {activeStep < guide.steps.length - 1 ? (
                    <Button onClick={nextStep}>
                        <StepForward className="ml-2 h-4 w-4" />
                        الخطوة التالية ({activeStep + 2}/{guide.steps.length})
                    </Button>
                ) : (
                    <Button onClick={resetGuide} variant="secondary">
                        <X className="ml-2 h-4 w-4"/>
                        فهمت، شكراً لك
                    </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">لا توجد إرشادات خاصة بهذه الشاشة حالياً.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
