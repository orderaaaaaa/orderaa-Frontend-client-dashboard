import Heading1 from "@/components/ui/typography/Heading1";
import Image from "next/image";
import React from "react";

interface ContentProps {
  icon?: string;
  content: string;
}

export default function Content({ icon, content }: ContentProps) {
  return (
    <div className="flex items-center gap-2">
      {icon ? (
        <Image
          src={`/Icons/${icon}.svg`}
          alt="Refresh Icon"
          width={18}
          height={18}
        />
      ) : null}

      <Heading1>{content}</Heading1>
    </div>
  );
}
