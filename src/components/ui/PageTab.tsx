import { Button } from './button';

type PageTabProps = {
  label: string;
  count?: number;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export default function PageTab({ label, count, icon, active, onClick }: PageTabProps) {
  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={onClick}
      title={label}
      className={`group flex items-center justify-between gap-2 px-3 py-2 border text-base rounded-[8px] transition min-w-[120px] max-w-full
    ${active
          ? "bg-primary text-white font-bold hover:bg-primary hover:text-white"
          : "text-[#00000099] border-[#00000014]"
        }
  `}
    >
      <span className="shrink-0">{icon}</span>

      <span className="truncate text-[15px] min-w-0 flex-1">{label}</span>

      {count !== undefined && (
        <span
          className={`flex items-center justify-center px-2 py-[2px] font-bold text-[13px] rounded-full transition shrink-0
          ${active
            && "bg-white text-primary"

            }
        `}
        >
          {count}
        </span>
      )}
    </Button>
  );
}
