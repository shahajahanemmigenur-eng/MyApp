import { cn } from '@/lib/utils';

export function MobileMockup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[712px] w-[352px] shadow-2xl',
        className
      )}
    >
      <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[72px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg"></div>
      {/* 
          Using transform: translateZ(0) creates a new containing block. 
          This makes 'fixed' positioned children relative to this div instead of the viewport.
      */}
      <div 
        className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative"
        style={{ transform: 'translateZ(0)' }}
      >
        {children}
      </div>
    </div>
  );
}
