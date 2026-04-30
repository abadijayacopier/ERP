"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider, useAuth } from '@/context/AuthContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const isLoginPage = pathname === '/login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
