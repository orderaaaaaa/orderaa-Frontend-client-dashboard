export function Label({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-base md:text-lg font-normal text-right">
        {text}
      </span>
    </div>
  );
}
