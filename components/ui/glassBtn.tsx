import React from "react";

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  colors?: [string, string]; // [from, to]
  angleDeg?: number; // 90 = left -> right
  fromPercent?: number; // how much of the width the "from" color takes (0-100)
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  colors = ["#FFFFFF", "#CBB5FD"],
  angleDeg = 160,
  fromPercent = 30, // <-- make "from" take 70% by default
}) => {
  const [from, to] = colors;
  const p = Math.max(0, Math.min(100, fromPercent)); // clamp 0..100

  return (
    <button
      onClick={onClick}
      className="
              min-w-[142px] w-auto
 h-[39px]
        relative overflow-hidden group
        inline-flex items-center justify-center gap-2 whitespace-nowrap
        rounded-3xl 
        px-5 py-2.5 
        text-xs font-medium 
        text-[#5D24E1] 
        backdrop-blur-md 
        border-[1.5px] border-[#5D24E1]
        shadow-lg 
        bg-transparent hover:bg-[#5D24E1]
        hover:text-[#FFFFFF] 
        transition-all duration-300
        [&_img]:transition-all [&_img]:duration-300 group-hover:[&_img]:invert group-hover:[&_img]:brightness-0 group-hover:[&_img]:contrast-200 group-hover:[&_img]:saturate-0
      "
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 transition-opacity duration-300 group-hover:opacity-0"
        style={{
          // Two stops for 'from' so it occupies more of the gradient
          backgroundImage: `linear-gradient(${angleDeg}deg, ${from} 0%, ${from} ${p}%, ${to} 100%)`,
        }}
      />
      <span className="relative z-0">{children}</span>
    </button>
  );
};

export default GlassButton;
