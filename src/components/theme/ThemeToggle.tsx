"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: "icons" | "segmented" | "dropdown" | "compact";
  dropdownAlign?: "left" | "right";
}

export function ThemeToggle({
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card p-2 text-muted-foreground shadow-sm opacity-50",
          className
        )}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode (☀️)" : "Switch to Dark Mode (🌙)"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:border-amber-500/50 hover:bg-muted hover:text-amber-500 cursor-pointer active:scale-95 shrink-0",
        showLabel ? "h-9 px-3 rounded-xl text-xs font-semibold" : "h-9 w-9 p-0",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-[11px] font-bold">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
