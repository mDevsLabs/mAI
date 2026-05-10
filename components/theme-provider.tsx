"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
// Correction de l'import de ThemeProviderProps qui provient directement de "next-themes"
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
