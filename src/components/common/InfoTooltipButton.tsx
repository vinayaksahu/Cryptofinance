"use client";

import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface InfoTooltipButtonProps {
  content: React.ReactNode;
  durationMs?: number; // default 2500ms (2-3 seconds as requested)
  className?: string;
  iconClassName?: string;
  buttonAriaLabel?: string;
  position?: "top" | "bottom" | "auto";
}

export function InfoTooltipButton({
  content,
  durationMs = 2800,
  className = "",
  iconClassName = "w-3.5 h-3.5",
  buttonAriaLabel = "Information",
  position = "top",
}: InfoTooltipButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setOpen(false);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [open, durationMs]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={buttonAriaLabel}
        className="w-5 h-5 rounded-full inline-flex items-center justify-center text-muted-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors focus:outline-none cursor-pointer"
        title="Click for details"
      >
        <Info className={iconClassName} />
      </button>

      {open && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 w-56 sm:w-64 p-2.5 rounded-xl text-[11px] leading-relaxed bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            position === "bottom"
              ? "top-full mt-1.5 left-1/2 -translate-x-1/2"
              : "bottom-full mb-1.5 left-1/2 -translate-x-1/2"
          }`}
        >
          {content}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 border-slate-700/80 ${
              position === "bottom"
                ? "-top-1 border-t border-l"
                : "-bottom-1 border-b border-r"
            }`}
          />
        </div>
      )}
    </div>
  );
}
