'use client';

interface ComboboxOption {
  key: string;
  value: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options?: ComboboxOption[]; // ✅ make it optional
  placeholder?: string;
  label?: string;
}

export default function Drobdown({
  value,
  onChange,
  options = [], // ✅ fallback to empty array
  placeholder = 'اختر',
  label,
}: ComboboxProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 font-medium text-[16px]">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 text-[18px] text-[#878A99]"
      >
        <option value="">{placeholder}</option>
        {Array.isArray(options) &&
          options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.value}
            </option>
          ))}
      </select>
    </div>
  );
}
