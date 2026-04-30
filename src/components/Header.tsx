"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  Command, 
  AlertTriangle, 
  Package, 
  ChevronRight,
  X,
  Palette,
  ExternalLink,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Languages,
  DollarSign,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

export default function Header() {
  const router = useRouter();
  const { language, setLanguage, currency, setCurrency, theme, setTheme, t } = useGlobalSettings();
  
  const [hasAlerts, setHasAlerts] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const data = await apiRequest('dashboard/stats');
        setStats(data);
        if (data.lowStock > 0 || data.maintenanceDue > 0) {
          setHasAlerts(true);
        }
      } catch (err) {
        console.warn("Header stats fetch failed");
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotif(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setShowSettings(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (url: string) => {
    setShowNotif(false);
    setShowSettings(false);
    setShowProfile(false);
    router.push(url);
  };

  return (
    <header className="h-[90px] px-8 flex items-center justify-between sticky top-0 z-40 bg-transparent transition-all duration-500">
      {/* Search Container */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-4 w-[400px] focus-within:border-accent/50 focus-within:bg-white/10 focus-within:ring-4 focus-within:ring-accent/5 transition-all duration-300 group">
        <Search size={18} className="text-slate-500 group-focus-within:text-accent transition-colors" />
        <input 
          type="text" 
          placeholder={t('search')}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-medium"
        />
        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10 shrink-0">
          <Command size={10} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500">K</span>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-4 relative">
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          {/* Quick Settings Icon with Popover */}
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => { setShowSettings(!showSettings); setShowNotif(false); setShowProfile(false); }}
              className={clsx(
                "relative transition-all p-3 rounded-xl hover:bg-white/10",
                showSettings ? "bg-accent text-primary shadow-lg shadow-accent/20" : "text-slate-400 hover:text-white"
              )}
            >
              <SettingsIcon size={20} />
            </button>

            {/* Quick Settings Dropdown */}
            {showSettings && (
              <div className="absolute top-[calc(100%+15px)] right-0 w-72 glass-card p-6 shadow-2xl border-accent/20 animate-in fade-in zoom-in-95 duration-200">
                 <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-6">{t('settings')}</h4>
                 
                 <div className="space-y-6">
                    {/* Language Toggle */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Languages size={14} />
                          <span>{t('language')}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setLanguage('id')}
                            className={clsx("py-2 rounded-lg text-[10px] font-black transition-all", language === 'id' ? "bg-accent text-primary" : "text-slate-500 hover:text-white")}
                          >ID</button>
                          <button 
                            onClick={() => setLanguage('en')}
                            className={clsx("py-2 rounded-lg text-[10px] font-black transition-all", language === 'en' ? "bg-accent text-primary" : "text-slate-500 hover:text-white")}
                          >EN</button>
                       </div>
                    </div>

                    {/* Currency Toggle */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <DollarSign size={14} />
                          <span>{t('currency')}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setCurrency('IDR')}
                            className={clsx("py-2 rounded-lg text-[10px] font-black transition-all", currency === 'IDR' ? "bg-accent text-primary" : "text-slate-500 hover:text-white")}
                          >IDR</button>
                          <button 
                            onClick={() => setCurrency('USD')}
                            className={clsx("py-2 rounded-lg text-[10px] font-black transition-all", currency === 'USD' ? "bg-accent text-primary" : "text-slate-500 hover:text-white")}
                          >USD</button>
                       </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Palette size={14} />
                          <span>{t('theme')}</span>
                       </div>
                       <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setTheme('light')}
                            className={clsx("flex-1 py-2 rounded-lg flex justify-center transition-all", theme === 'light' ? "bg-accent text-primary shadow-lg" : "text-slate-500 hover:text-white")}
                            title={t('light')}
                          ><Sun size={14} /></button>
                          <button 
                            onClick={() => setTheme('dark')}
                            className={clsx("flex-1 py-2 rounded-lg flex justify-center transition-all", theme === 'dark' ? "bg-accent text-primary shadow-lg" : "text-slate-500 hover:text-white")}
                            title={t('dark')}
                          ><Moon size={14} /></button>
                          <button 
                            onClick={() => setTheme('system')}
                            className={clsx("flex-1 py-2 rounded-lg flex justify-center transition-all", theme === 'system' ? "bg-accent text-primary shadow-lg" : "text-slate-500 hover:text-white")}
                            title={t('system')}
                          ><Monitor size={14} /></button>
                       </div>
                    </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-white/5">
                   <button onClick={() => navigateTo('/settings')} className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-accent transition-all">
                     <span>{t('settings')}</span>
                     <ChevronRight size={14} />
                   </button>
                 </div>
              </div>
            )}
          </div>

          {/* Bell Icon with Popover */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotif(!showNotif); setShowSettings(false); setShowProfile(false); }}
              className={clsx(
                "relative transition-all p-3 rounded-xl hover:bg-white/10",
                showNotif ? "bg-accent text-primary shadow-lg shadow-accent/20" : "text-slate-400 hover:text-white"
              )}
            >
              <Bell size={20} />
              {hasAlerts && (
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b0f1a] animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotif && (
              <div className="absolute top-[calc(100%+15px)] right-0 w-80 glass-card p-6 shadow-2xl border-accent/20 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-xs text-white uppercase tracking-widest">Operational Alerts</h4>
                  <button onClick={() => setShowNotif(false)}><X size={16} className="text-slate-500" /></button>
                </div>
                <div className="space-y-4">
                  {stats?.maintenanceDue > 0 && (
                    <button 
                      onClick={() => navigateTo('/maintenance')}
                      className="w-full text-left flex gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 group cursor-pointer hover:bg-red-500/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle size={18} /></div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-tight">Maintenance Due</div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{stats.maintenanceDue} units need attention</p>
                      </div>
                    </button>
                  )}
                  {stats?.lowStock > 0 && (
                    <button 
                      onClick={() => navigateTo('/inventory')}
                      className="w-full text-left flex gap-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 group cursor-pointer hover:bg-orange-500/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0"><Package size={18} /></div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-tight">Inventory Alert</div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{stats.lowStock} items below min level</p>
                      </div>
                    </button>
                  )}
                  {!hasAlerts && (
                    <div className="py-10 text-center">
                       <div className="text-slate-600 italic uppercase font-black text-[10px] tracking-widest">No urgent alerts</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-10 w-[1px] bg-white/10 mx-2"></div>

        {/* Profile Section with Popover */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowSettings(false); }}
            className="flex items-center gap-4 pl-2 cursor-pointer group"
          >
            <div className="text-right flex flex-col">
              <div className="text-sm font-bold text-white group-hover:text-accent transition-colors">Abadijaya Dev</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Site Manager • South</div>
            </div>
            <div className="relative">
              <div className={clsx(
                "w-11 h-11 rounded-2xl p-[2px] shadow-lg transition-all duration-500",
                showProfile ? "rotate-6 bg-accent" : "bg-gradient-to-br from-accent via-orange-500 to-yellow-500 group-hover:rotate-6 shadow-accent/20"
              )}>
                <div className="w-full h-full rounded-[14px] bg-[#0b0f1a] flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent font-black text-lg font-outfit">
                    AD
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0b0f1a]"></div>
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute top-[calc(100%+25px)] right-0 w-72 glass-card p-6 shadow-2xl border-accent/20 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center gap-4 p-4 mb-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary font-black text-xl">AD</div>
                  <div>
                    <div className="text-sm font-black text-white">Abadijaya Dev</div>
                    <div className="flex items-center gap-1.5 mt-1">
                       <ShieldCheck size={12} className="text-accent" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Site</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <button 
                    onClick={() => navigateTo('/')}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
                  >
                    <LayoutDashboard size={18} className="group-hover:text-accent" />
                    <span className="text-xs font-bold">{t('dashboard')}</span>
                  </button>
                  <button 
                    onClick={() => navigateTo('/profile')}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
                  >
                    <User size={18} className="group-hover:text-accent" />
                    <span className="text-xs font-bold">{t('users')}</span>
                  </button>
                  
                  <div className="h-[1px] bg-white/5 my-4"></div>
                  
                  <button 
                    onClick={() => console.log("Logout triggered")}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all group"
                  >
                    <div className="p-2 bg-rose-500/20 rounded-lg group-hover:rotate-12 transition-transform">
                       <LogOut size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
