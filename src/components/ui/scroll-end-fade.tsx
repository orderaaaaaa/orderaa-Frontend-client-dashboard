import { cn } from '@/lib/utils';

interface ScrollEndFadeProps {
  visible: boolean;
  className?: string;
  axis?: 'x' | 'y';
  fromClassName?: string;
}

export function ScrollEndFade({
  visible,
  className,
  axis = 'x',
  fromClassName = 'from-background',
}: ScrollEndFadeProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute to-transparent transition-opacity duration-200',
        axis === 'y'
          ? 'inset-x-0 bottom-0 h-8 bg-gradient-to-t'
          : 'inset-y-0 end-0 w-10 rtl:bg-gradient-to-r ltr:bg-gradient-to-l',
        fromClassName,
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
