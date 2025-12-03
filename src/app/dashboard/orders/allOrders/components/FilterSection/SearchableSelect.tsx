"use client";

import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  options: string[];
  placeholder?: string;
  widthClass?: string;
  error?: string;
  name?: string;
};

const SearchableSelect = forwardRef<HTMLDivElement, Props>(function SearchableSelect({
  value,
  onChange,
  onBlur,
  options,
  placeholder = "ابحث...",
  widthClass = "w-56",
  error,
  name,
}, ref) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const internalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!internalRef.current) return;
      if (!internalRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
        if (onBlur) onBlur();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const commitSelect = (val: string) => {
    onChange(val);
    setQ("");
    setOpen(false);
    setActiveIdx(-1);
  };

  return (
    <div className={`flex flex-col gap-1  ${widthClass}`} ref={ref || internalRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`px-3 py-2 relative rounded border cursor-pointer bg-white font-medium truncate flex items-center justify-between ${error ? 'border-red-500' : 'border-gray-300'
          }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`text-right ${value ? "text-gray-900" : "text-gray-500"}`}
        >
          {value || `${placeholder}`}
        </span>
        <svg
          className={`w-6 h-6 absolute left-2 top-2 text-gray-400 transition-transform ${open ? "rotate-180" : ""
            }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.084l3.71-3.854a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 38 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute !z-100 mt-1 w-auto max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
            role="listbox"
          >
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="w-full px-2 py-1 rounded border border-gray-200"
              />
            </div>
            <ul>
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">
                  لا توجد نتائج
                </li>
              ) : (
                filtered.map((opt, idx) => (
                  <li
                    key={opt}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(-1)}
                    onClick={() => commitSelect(opt)}
                    className={`px-3 py-2 z-20 cursor-pointer hover:bg-[#5D24E1] text-semibold  hover:text-white  ${activeIdx === idx ? "bg-gray-100" : ""
                      }`}
                    role="option"
                    aria-selected={value === opt}
                  >
                    {opt}
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
});

export default SearchableSelect;
