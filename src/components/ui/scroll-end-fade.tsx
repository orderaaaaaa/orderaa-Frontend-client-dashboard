import { cn } from '@/lib/utils';

interface ScrollEndFadeProps {
  visible: boolean;
  className?: string;
}

export function ScrollEndFade({ visible, className }: ScrollEndFadeProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 end-0 w-10 from-white to-transparent rtl:bg-gradient-to-r ltr:bg-gradient-to-l transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
