"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export type ThemeMode = "dark" | "light" | "system";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  return {
    theme: (theme as ThemeMode) || "dark",
    resolvedTheme: (resolvedTheme as "dark" | "light") || "dark",
    setTheme: (t: ThemeMode) => setTheme(t),
    systemTheme,
  };
}
