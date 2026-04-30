import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Mining ERP | Pro Max Contractor Suite",
  description: "Advanced ERP system for mining contractors with Multi-Language & Multi-Currency support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans transition-colors duration-500`}>
        <GlobalSettingsProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </GlobalSettingsProvider>
      </body>
    </html>
  );
}
