import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";

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
          <div className="mesh-bg" />
          <div className="flex min-h-screen relative z-10">
            <Sidebar />
            <main className="flex-1 flex flex-col ml-[312px]">
              <Header />
              <div className="p-8 flex-1">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </GlobalSettingsProvider>
      </body>
    </html>
  );
}
