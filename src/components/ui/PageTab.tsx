type PageTabProps = {
  label: string;
  count?: number;
  icon: React.ReactNode;
  active?: boolean;
};

//TODO: Add the onClick active effect
export default function PageTab({ label, count, icon, active }: PageTabProps) {
  return (
    <button
      className={`group flex items-center justify-between gap-2 px-4 py-2 border-2 border-[#5D24E1] font-bold text-[15px] rounded-full transition
        ${
          active
            ? 'bg-[#5D24E1] text-white'
            : 'text-[#5D24E1] bg-[linear-gradient(105.28deg,_#FFFFFF_1.48%,_#CBB5FD_182.49%,_#FFFFFF_187.88%)] hover:bg-none hover:bg-[#5D24E1] hover:text-white'
        }
      `}
    >
      <span className="shrink-0">{icon}</span>

      <span className="truncate text-[15px]">{label}</span>

      {count !== undefined && (
        <span
          className={`flex items-center justify-center px-2 py-[2px] font-bold text-[13px] rounded-full transition
          ${
            active
              ? 'bg-white text-[#5D24E1]'
              : 'bg-[#5D24E1] text-white group-hover:bg-white group-hover:text-[#5D24E1]'
          }
        `}
        >
          {count}
        </span>
      )}
    </button>
  );
}
