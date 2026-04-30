"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Mountain, 
  LayoutDashboard, 
  Truck, 
  FileText, 
  Fuel, 
  ShieldAlert, 
  Wrench,
  Database,
  ReceiptText,
  Settings,
  LogOut,
  ChevronRight,
  User,
  BarChart3
} from "lucide-react";
import { clsx } from "clsx";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// Define menu items with required roles and translation keys
const navItems = [
  { label: "Executive Dashboard", tKey: "dashboard", href: "/", icon: LayoutDashboard, roles: ["EXECUTIVE", "ADMIN", "MANAGER"] },
  { label: "KPI Monitoring", tKey: "monitoring", href: "/monitoring", icon: BarChart3, roles: ["EXECUTIVE", "ADMIN", "MANAGER"] },
  { label: "Fleet Monitoring", tKey: "fleet", href: "/fleet", icon: Truck, roles: ["EXECUTIVE", "ADMIN", "MANAGER"] },
  { label: "Maintenance & Repair", tKey: "maintenance", href: "/maintenance", icon: Wrench, roles: ["EXECUTIVE", "ADMIN", "MANAGER", "TECHNICIAN", "HSE"] },
  { label: "Inventory System", tKey: "inventory", href: "/inventory", icon: Database, roles: ["EXECUTIVE", "ADMIN", "MANAGER", "TECHNICIAN"] },
  { label: "Invoices & Billing", tKey: "invoices", href: "/invoices", icon: ReceiptText, roles: ["EXECUTIVE", "ADMIN", "MANAGER"] },
  { label: "Shift Reports (DSR)", tKey: "dsr", href: "/dsr", icon: FileText, roles: ["EXECUTIVE", "ADMIN", "MANAGER", "HSE"] },
  { label: "Fuel & Logistics", tKey: "logistics", href: "/logistics", icon: Fuel, roles: ["EXECUTIVE", "ADMIN", "MANAGER"] },
  { label: "Safety & HSE", tKey: "safety", href: "/safety", icon: ShieldAlert, roles: ["EXECUTIVE", "ADMIN", "MANAGER", "HSE", "TECHNICIAN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useGlobalSettings();
  const [settings, setSettings] = useState<any>(null);
  const [userRole, setUserRole] = useState("ADMIN");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiRequest('settings');
        if (data && data.company_name) {
          setSettings(data);
        }
      } catch (err) {
        console.warn("Failed to fetch sidebar settings");
      }
    };
    fetchSettings();
    
    const savedRole = localStorage.getItem('mock_user_role');
    if (savedRole) setUserRole(savedRole);

    window.addEventListener('settingsUpdated', fetchSettings);
    return () => window.removeEventListener('settingsUpdated', fetchSettings);
  }, []);

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-[280px] flex flex-col fixed h-[calc(100vh-2rem)] z-50 m-4 rounded-3xl border border-white/10 glass-card overflow-hidden shadow-2xl transition-all duration-500">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3 relative overflow-hidden border-b border-white/5">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-accent/20 relative z-10 overflow-hidden border border-white/10">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Mountain size={26} />
          )}
        </div>

        <div className="flex flex-col relative z-10 flex-1 overflow-hidden">
          <span className="font-outfit font-black text-lg tracking-tight text-white leading-none truncate uppercase">
            {settings?.company_name?.split(' ')[0] || "MINE"}<span className="text-accent">{settings?.company_name?.split(' ')[1] || "ERP"}</span>
          </span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 truncate">
            {settings?.company_name?.split(' ').slice(2).join(' ') || "Contractor Pro"}
          </span>
        </div>
      </div>

      {/* User Info & Role Badge with Emulation */}
      <div className="px-6 py-4 mx-4 rounded-2xl bg-white/5 border border-white/10 my-6 flex flex-col gap-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
              <User size={18} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-white uppercase truncate">Administrator</span>
              <span className={clsx(
                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md w-fit border mt-1",
                userRole === 'ADMIN' ? "bg-accent/10 border-accent/20 text-accent" :
                userRole === 'TECHNICIAN' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                userRole === 'OPERATOR' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                "bg-purple-500/10 border-purple-500/20 text-purple-400"
              )}>
                {userRole} AUTHORITY
              </span>
            </div>
         </div>
         
         <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Emulate Role:</p>
            <div className="flex gap-2">
               {["ADMIN", "OPERATOR", "TECHNICIAN"].map((role) => (
                 <button 
                   key={role}
                   onClick={() => {
                     setUserRole(role);
                     localStorage.setItem('mock_user_role', role);
                     window.location.reload(); // Hard reload to reset all states
                   }}
                   className={clsx(
                     "flex-1 py-1.5 rounded-lg text-[8px] font-black border transition-all",
                     userRole === role 
                      ? "bg-accent text-primary border-accent" 
                      : "bg-white/5 text-slate-500 border-white/10 hover:text-white"
                   )}
                 >
                   {role}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 custom-scrollbar overflow-y-auto py-2">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4 opacity-50">Operations Control</div>
        <ul className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={clsx(
                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98] group relative overflow-hidden",
                    isActive 
                      ? "bg-accent text-primary font-bold shadow-lg shadow-accent/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <item.icon size={20} className={clsx(isActive ? "text-primary" : "text-slate-500 group-hover:text-accent transition-colors")} />
                    <span className="text-sm tracking-tight">{t(item.tKey)}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="relative z-10" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-4 bg-white/5 border-t border-white/10 space-y-2">
        {(userRole === 'ADMIN' || userRole === 'EXECUTIVE') && (
          <Link 
            href="/settings"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98] group",
              pathname === "/settings" 
                ? "bg-accent text-primary font-bold shadow-lg shadow-accent/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings size={20} className={pathname === "/settings" ? "text-primary" : "text-slate-500 group-hover:text-accent"} />
            <span className="text-sm font-bold">{t('settings')}</span>
          </Link>
        )}
        
        <div className="p-4 bg-rose-500/5 rounded-2xl border border-red-500/10 flex items-center justify-between group cursor-pointer hover:bg-red-500/10 transition-all active:scale-95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:rotate-12 transition-transform">
              <LogOut size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white uppercase tracking-tight">Logout</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">End Session</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
