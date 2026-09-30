"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface SocialItem {
  href: string;
  ariaLabel: string;
  tooltip: string;
  svgUrl: string;
  color: string;
}

export interface SocialTooltipProps extends React.HTMLAttributes<HTMLUListElement> {
  items: SocialItem[];
}

const SocialTooltip = React.forwardRef<HTMLUListElement, SocialTooltipProps>(
  ({ className, items, ...props }, ref) => (
    <ul ref={ref} className={cn("social-tooltip flex items-center gap-3", className)} {...props}>
      {items.map((item) => (
        <li key={item.ariaLabel} className="group relative">
          <a
            href={item.href}
            aria-label={item.ariaLabel}
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#151319] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-transparent hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a7ff]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="absolute bottom-0 left-0 h-0 w-full transition-all duration-300 ease-out group-hover:h-full group-focus-within:h-full" style={{ backgroundColor: item.color }} />
            <Image src={item.svgUrl} alt="" width={26} height={26} className="relative z-10 h-[26px] w-[26px] object-contain transition-transform duration-300 group-hover:scale-110" />
          </a>
          <span className="pointer-events-none absolute left-1/2 top-[58px] z-20 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100" style={{ backgroundColor: item.color }}>
            {item.tooltip}
          </span>
        </li>
      ))}
    </ul>
  ),
);

SocialTooltip.displayName = "SocialTooltip";

export { SocialTooltip };
