import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold tracking-tighter text-primary',
        className
      )}
    >
      <img 
        src="https://i.postimg.cc/zvbhTsXV/Iwjw-sfryat.png" 
        alt="Safar Carrier Logo"
        width={140}
        height={40}
        className="object-contain"
        style={{ width: '140px', height: '40px' }}
      />
    </div>
  );
}
