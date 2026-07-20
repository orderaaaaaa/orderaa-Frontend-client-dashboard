interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <div className={`flex-1 flex flex-col w-0 min-w-0 ${className}`}>
      {children}
    </div>
  );
}

export function PageContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`flex-1 overflow-x-hidden p-4 w-full min-h-0 ${className}`}>
      {children}
    </main>
  );
}
