import { useEffect, useRef, useState } from 'react';
import { LEADS_STATS_CONFIG } from '../../constants/leadsConfig';
import clsx from 'clsx';
import { LiaChevronDownSolid } from 'react-icons/lia';
import { ChevronDown } from 'lucide-react';

type LeadStatusKey = string;

export function StatusSelect({
  value,
  onChange,
  triggerClassName,
}: {
  value: LeadStatusKey;
  onChange: (v: LeadStatusKey) => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = LEADS_STATS_CONFIG.find((s) => s.key === value);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          `h-14 w-full bg-gray-50 rounded-xl px-4 flex items-center justify-between cursor-pointer`,
          triggerClassName
        )}
      >
        <div
          className="flex items-center gap-2 font-medium"
          style={{ color: selected?.valueColor }}
        >
          <span>{selected?.title}</span>
          {selected?.icon && <selected.icon />}
        </div>
        <ChevronDown className="text-gray-400 w-5" />
      </button>

      {open && (
        <div className="absolute z-[200] sm:mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto">
          {LEADS_STATS_CONFIG.map((status) => (
            <div
              key={status.key}
              onClick={() => {
                onChange(status.key);
                setOpen(false);
              }}
              className={clsx(
                'px-4 py-3 rounded-lg cursor-pointer',
                'hover:text-white hover:bg-primary'
              )}
            >
              <div className="flex items-center gap-2">
                <span>{status.title}</span>
                <status.icon />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
