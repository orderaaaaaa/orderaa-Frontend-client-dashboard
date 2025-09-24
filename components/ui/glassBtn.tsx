import React from "react";

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  colors?: [string, string, string];
  angleDeg?: number;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  colors = ["#FFFFFF", "#CBB5FD", "#FFFFFF"],
  angleDeg = -7,
}) => {
  const [from, via, to] = colors;
  return (
    <button
      onClick={onClick}
      className="
      w-[142px]
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
          backgroundImage: `linear-gradient(${angleDeg}deg, ${from}, ${via}, ${to})`,
        }}
      />
      <span className="relative z-0">{children}</span>
    </button>
  );
};

export default GlassButton;
