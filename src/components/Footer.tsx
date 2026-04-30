"use client";

import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 border-t border-white/5 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-500 text-sm font-medium">
          &copy; {currentYear} <span className="text-accent">Abadijaya Developer</span>. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs text-slate-500 hover:text-accent transition-colors font-bold uppercase tracking-widest">Privacy Policy</a>
          <a href="#" className="text-xs text-slate-500 hover:text-accent transition-colors font-bold uppercase tracking-widest">Terms of Service</a>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
