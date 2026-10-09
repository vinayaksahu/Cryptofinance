import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CryptoNova - Quantitative Algo & DeFi Arbitrage Protocol | 4% Daily Yield",
  description: "Official CryptoNova Protocol Portal. Next-generation quantitative wealth protocol engineered for mathematical certainty, sustainable 4% daily yields, and triple-isolated liquidity. Powered by USDT BEP-20.",
  icons: {
    icon: "/logo_transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased bg-background text-foreground selection:bg-amber-400 selection:text-black transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}