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
      className={`group flex items-center justify-between gap-2 px-4 py-2 border text-base rounded-[8px] transition 
    ${active
          ? "bg-[#5D24E1] text-white font-bold hover:bg-[#5D24E1] hover:text-white"
          : "text-[#00000099] border-[#00000014]"
        }
  `}
    >
      <span className="shrink-0">{icon}</span>

      <span className="truncate text-[15px]">{label}</span>

      {count !== undefined && (
        <span
          className={`flex items-center justify-center px-2 py-[2px] font-bold text-[13px] rounded-full transition
          ${active
            && "bg-white text-[#5D24E1]"

            }
        `}
        >
          {count}
        </span>
      )}
    </Button>
  );
}
