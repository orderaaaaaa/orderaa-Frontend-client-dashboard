export function Label({
  icon,
  text,
  htmlFor,
  required = false,
}: {
  icon: React.ReactNode;
  text: string;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-base md:text-lg font-normal text-right">
        {text}
        {required && <span className="text-red-500 ms-1">*</span>}
      </span>
    </label>
  );
}
