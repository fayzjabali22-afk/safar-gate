'use client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const bgImage = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center text-center text-white">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/70" />
      
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          بوابتك للسفر البري الآمن
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          منصة تجمع الناقلين والمسافرين لتجربة نقل بري موثوقة وسهلة بين الدول.
        </p>
        <div className="mt-10">
          <Button
            size="lg"
            className="text-lg"
            onClick={() => router.push('/login')}
          >
            ابدأ الآن
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
