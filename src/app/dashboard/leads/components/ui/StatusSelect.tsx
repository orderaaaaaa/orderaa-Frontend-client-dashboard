import { useEffect, useRef, useState, useCallback } from 'react';
import { LEADS_STATS_CONFIG } from '../../constants/leadsConfig';
import clsx from 'clsx';
import { ChevronDown, X } from 'lucide-react';

type LeadStatusKey = string;

interface StatusSelectProps {
  value?: LeadStatusKey;
  onChange: (v: LeadStatusKey) => void;
  onClear?: () => void;
  placeholder?: string;
  triggerClassName?: string;
  clearable?: boolean;
}

export function StatusSelect({
  value,
  onChange,
  onClear,
  placeholder = 'Select status',
  triggerClassName,
  clearable = true,
}: StatusSelectProps) {
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

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear ? onClear() : onChange('');
      setOpen(false);
    },
    [onClear, onChange],
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'relative h-14 w-full bg-gray-50 rounded-xl px-4 flex items-center justify-between',
          triggerClassName,
        )}
      >
        <div
          className={clsx(
            'flex items-center gap-2 font-medium truncate',
            !selected && 'text-gray-600',
          )}
          style={selected ? { color: selected.valueColor } : undefined}
        >
          {selected ? (
            <>
              <span>{selected.title}</span>
              {selected.icon && <selected.icon />}
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>

        {/* Clear button */}
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-10 top-1/2 -translate-y-1/2
                       text-gray-400 hover:text-primary z-10"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <ChevronDown
          className={clsx(
            'text-gray-400 w-5 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
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
                'px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2',
                'hover:text-white hover:bg-primary',
              )}
            >
              <span>{status.title}</span>
              {status.icon && <status.icon />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
