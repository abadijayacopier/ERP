"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Truck, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  Users, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  Search, 
  Bell, 
  Plus, 
  Wrench,
  DollarSign
} from "lucide-react";
import { clsx } from "clsx";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

export default function Dashboard() {
  const { t, formatCurrency } = useGlobalSettings();
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "1Y">("7D");
  const [userRole, setUserRole] = useState("ADMIN");

  const chartData = {
    "7D": [40, 25, 60, 35, 80, 82, 55],
    "30D": [40, 25, 60, 35, 80, 82, 55, 78, 45, 85, 83, 50],
    "1Y": [60, 75, 85, 70, 90, 85, 80, 75, 70, 85, 95, 80]
  };

  const fetchData = async () => {
    try {
      const data = await apiRequest('dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const savedRole = localStorage.getItem('mock_user_role');
    if (savedRole) setUserRole(savedRole);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">{userRole} CONSOLE</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            Operation <span className="text-gradient">Pulse</span>
          </h1>
          <p className="text-slate-400 mt-2 font-bold flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Site Monitoring System Live: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-3">
           <button onClick={fetchData} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all">
              <RefreshCw size={18} className={!stats ? "animate-spin text-accent" : ""} />
           </button>
           <button className="btn-premium flex items-center gap-2 transition-all duration-500">
              <Plus size={18} />
              <span>{t('create_report')}</span>
           </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label={t('fleet')} 
          value={stats?.fleet?.find((f: any) => f.status === 'Running')?.count || 0} 
          sub="Total: 55 Units" 
          icon={Truck} 
          color="text-accent" 
          trend="+4.2%"
        />
        <StatCard 
          label={t('total_production')} 
          value={stats ? `${(stats.production / 1000).toFixed(1)}K` : "0"} 
          sub="BCM this month" 
          icon={TrendingUp} 
          color="text-accent" 
          trend="+12.5%"
        />
        <StatCard 
          label="Monthly OpEx" 
          value={formatCurrency(1250000000)} // Mock: 1.25B IDR
          sub="Operational Costs" 
          icon={DollarSign} 
          color="text-yellow-500" 
          trend="Budget OK"
          isCurrency
        />
        <StatCard 
          label={t('efficiency')} 
          value="92.4%" 
          sub="Availability (MA)" 
          icon={BarChart3} 
          color="text-emerald-400" 
          trend="+2.1%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <BarChart3 size={200} />
          </div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <BarChart3 size={20} />
                 </div>
                 <h3 className="text-2xl font-black font-outfit text-white tracking-tight">Production Trajectory</h3>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-[52px]">Global site output statistics</p>
            </div>
            
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {(["7D", "30D", "1Y"] as const).map((range) => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all",
                    timeRange === range ? "bg-accent text-primary shadow-lg shadow-accent/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4 h-48 relative">
            {chartData[timeRange].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                <div 
                  className={clsx(
                    "w-full rounded-2xl transition-all duration-700 relative",
                    h > 70 ? "bg-accent shadow-[0_0_25px_rgba(var(--accent-rgb),0.3)]" : "bg-white/10"
                  )}
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[9px] font-black text-slate-600 group-hover/bar:text-slate-400 transition-colors uppercase">
                  {timeRange === '7D' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `W${i+1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Truck size={24} />
               </div>
               <h3 className="text-2xl font-black font-outfit text-white tracking-tight">{t('fleet')} Pulse</h3>
            </div>
            
            <div className="space-y-8 relative z-10">
              <FleetBar label="Excavators" current={stats?.fleetTypes?.find((f: any) => f.unit_type === 'Excavator')?.count || 0} total={10} color="bg-accent" />
              <FleetBar label="Dump Trucks" current={stats?.fleetTypes?.find((f: any) => f.unit_type === 'Dump Truck')?.count || 0} total={30} color="bg-accent opacity-80" />
              <FleetBar label="Service Units" current={stats?.fleetTypes?.find((f: any) => !['Excavator', 'Dump Truck'].includes(f.unit_type))?.count || 0} total={15} color="bg-accent opacity-60" />
            </div>
          </div>
          
          <div className="mt-4 pt-8 relative z-10">
            <Link href="/maintenance" className="block w-full">
              <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-accent/30 transition-all flex items-center justify-center gap-3 group">
                <span>Workshop Status</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, trend, isCurrency }: any) {
  return (
    <div className="glass-card p-8 group hover:border-accent/20 transition-all duration-500 relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
        <Icon size={80} />
      </div>
      <div className="flex justify-between items-start relative z-10 mb-6">
        <div className={clsx("p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors duration-500", color)}>
          <Icon size={24} />
        </div>
        <div className={clsx(
          "text-[10px] font-black px-2.5 py-1 rounded-lg border",
          trend.includes('+') ? "bg-accent/10 text-accent border-accent/20" : "bg-white/5 text-slate-500 border-white/10"
        )}>
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</h4>
        <div className={clsx("font-black text-white font-outfit tracking-tighter", isCurrency ? "text-2xl" : "text-4xl")}>{value}</div>
        <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}

function FleetBar({ label, current, total, color }: any) {
  const percent = (current / total) * 100;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-500">{label}</span>
        <span className="text-white">{current} / {total}</span>
      </div>
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
        <div 
          className={clsx("h-full rounded-full transition-all duration-1000 relative", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
