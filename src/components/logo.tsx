import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-lg font-bold tracking-tighter text-primary p-2',
        className
      )}
    >
      <img
        src="https://i.postimg.cc/zvbhTsXV/Iwjw-sfryat.png"
        alt="Safar Carrier Logo"
        style={{ width: '140px', height: '40px', objectFit: 'contain' }}
      />
    </div>
  );
}
