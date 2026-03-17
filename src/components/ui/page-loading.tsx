import { cn } from '@/lib/utils';

interface PageLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
  fullScreen?: boolean;
  className?: string;
}

const SPINNER_SIZE = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
};

function PageLoading({ message, size = 'md', fullScreen, className }: PageLoadingProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className={cn('animate-spin rounded-full border-b-2 border-primary', SPINNER_SIZE[size])} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
      <div className="text-center">
        <div className={cn('animate-spin rounded-full border-b-2 border-primary mx-auto', SPINNER_SIZE[size])} />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

export default PageLoading;
