interface ChatDaySeparatorProps {
  label: string;
}

export function ChatDaySeparator({ label }: ChatDaySeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="bg-muted text-muted-foreground text-xs font-medium px-4 py-1.5 rounded-full">{label}</span>
    </div>
  );
}
