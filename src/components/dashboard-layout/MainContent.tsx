interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
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
    <main className={`flex-1 overflow-auto p-4 lg:p-6 ${className}`}>
      {children}
    </main>
  );
}
