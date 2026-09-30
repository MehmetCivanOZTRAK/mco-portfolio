"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FlowButtonProps = {
  text: string;
  href?: string;
  target?: string;
  rel?: string;
  download?: string;
  className?: string;
};

export function FlowButton({ text, href, target, rel, download, className }: FlowButtonProps) {
  const classes = cn(
    "group relative inline-flex min-h-12 items-center gap-1 overflow-hidden rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent active:scale-95",
    className,
  );

  const content = (
    <>
      <ArrowRight className="absolute left-[-25%] z-[9] h-4 w-4 stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4" />
      <span className="relative z-[1] -translate-x-2 transition-all duration-[800ms] ease-out group-hover:translate-x-3">{text}</span>
      <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b5cf6] opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[240px] group-hover:w-[240px] group-hover:opacity-100" />
      <ArrowRight className="absolute right-4 z-[9] h-4 w-4 stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]" />
    </>
  );

  if (href) {
    return <a className={classes} href={href} target={target} rel={rel} download={download}>{content}</a>;
  }

  return <button className={classes} type="button">{content}</button>;
}
