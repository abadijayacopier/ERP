"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Activity, 
  ChevronDown,
  Filter,
  RefreshCw,
  Layers,
  Wrench,
  Gauge,
  Database,
  Calendar,
  Box,
  FileSpreadsheet
} from "lucide-react";
import { clsx } from "clsx";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// Metric Card Component
const MetricCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="glass-card p-6 flex items-center gap-6 group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
    <div className={clsx("absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500", color)}>
      <Icon size={120} />
    </div>
    <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg", color.replace('text', 'bg').replace('500', '500/10'), color)}>
      <Icon size={32} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white font-outfit tracking-tighter">{value}</h3>
        <span className="text-sm font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  </div>
);

export default function MonitoringPage() {
  const { t } = useGlobalSettings();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("Summary");
  const [data, setData] = useState<any>(null);
  
  const fetchKpiData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('kpi/stats');
      if (response) {
        setData(response);
      }
    } catch (err) {
      console.error("Failed to fetch KPI data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
    const interval = setInterval(fetchKpiData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <p className="text-accent font-black tracking-widest animate-pulse uppercase text-xs">Synchronizing KPI Nodes...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || { pa: 0, ma: 0, ua: 0, eu: 0, mttr: 0, mtbf: 0 };
  const paretoData = data?.pareto || [];
  const downUnits = data?.downUnits || [];
  const dailyFleet = data?.dailyFleet || [];

  return (
    <div className="min-h-screen p-8 bg-[#0b0f1a]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-4xl font-black text-white font-outfit tracking-tight uppercase">KPI SYSTEM MONITORING</h1>
          </div>
          <p className="text-slate-400 font-medium">Mine Operational Performance & Equipment Availability Control</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          {["Summary", "Daily", "Hierarchy"].map((view) => (
            <button 
              key={view}
              onClick={() => setActiveView(view)}
              className={clsx(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeView === view ? "bg-accent text-primary shadow-lg shadow-accent/20" : "text-slate-400 hover:text-white"
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {activeView === "Summary" ? (
        <div className="grid grid-cols-1 w-full">
          <div className="glass-card min-w-0 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="text-accent" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight font-outfit">Mega Summary Report</h3>
                </div>
                <button onClick={fetchKpiData} className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                  <RefreshCw size={14} /> Sync Database
                </button>
             </div>

             <div className="overflow-x-auto w-full custom-scrollbar max-h-[650px] border-b border-white/5 rounded-br-2xl">
               <style jsx>{`
                 .custom-scrollbar::-webkit-scrollbar {
                   height: 14px;
                   display: block !important;
                 }
                 .custom-scrollbar::-webkit-scrollbar-track {
                   background: rgba(255, 255, 255, 0.05);
                   border-radius: 10px;
                 }
                 .custom-scrollbar::-webkit-scrollbar-thumb {
                   background: #facc15;
                   border-radius: 10px;
                   border: 3px solid #0b0f1a;
                 }
                 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                   background: #eab308;
                 }
               `}</style>
               <table className="text-left border-collapse min-w-[3000px] bg-black/20">
               <thead className="sticky top-0 z-20">
                 <tr className="bg-[#facc15]">
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10">No</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 sticky left-0 bg-[#facc15] z-30">Unit Code</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10">Model</th>
                   <th colSpan={2} className="p-2 text-[10px] font-black text-primary uppercase tracking-center border-b border-r border-black/10 text-center italic">Hour Meter Reading</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-red-700 uppercase tracking-widest border-r border-black/10 text-center">Work</th>
                   <th colSpan={4} className="p-2 text-[10px] font-black text-primary uppercase tracking-center border-b border-r border-black/10 text-center">Loss Time / Delay</th>
                   <th colSpan={4} className="p-2 text-[10px] font-black text-primary uppercase tracking-center border-b border-r border-black/10 text-center">Availability & Utility (%)</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 text-center">MTTR</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 text-center">MTBF</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 text-center">D (%)</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 text-center">Sched. Event (%)</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 text-center">Unschd. Event (%)</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest border-r border-black/10 text-center">Sched. Dur (%)</th>
                   <th rowSpan={2} className="p-4 text-[10px] font-black text-primary uppercase tracking-widest text-center">Unschd. Dur (%)</th>
                 </tr>
                 <tr className="bg-[#fde047]">
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">Start</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/10 text-center">Finish</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">Accident</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">Wet</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">Standby</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/10 text-center">Wait Part</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">PA</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">MA</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/5 text-center">UA</th>
                   <th className="p-2 text-[9px] font-black text-primary border-r border-black/10 text-center">EU</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5 bg-black/20">
                 {dailyFleet.map((u: any, i: number) => (
                   <tr key={i} className="hover:bg-accent/5 transition-colors group border-b border-white/5">
                     <td className="p-4 text-xs font-bold text-slate-500 border-r border-white/5">{i + 1}</td>
                     <td className="p-4 text-sm font-black text-white sticky left-0 bg-[#0b0f1a] z-10 border-r border-white/5">{u.id}</td>
                     <td className="p-4 text-xs font-bold text-slate-400 border-r border-white/5">{u.model}</td>
                     <td className="p-4 text-xs font-mono text-slate-300 text-center border-r border-white/5 bg-white/[0.01]">{(u.awal_bulan || 0).toLocaleString()}</td>
                     <td className="p-4 text-xs font-mono text-slate-300 text-center border-r border-white/5 bg-white/[0.01]">{(u.hm_running || 0).toLocaleString()}</td>
                     <td className="p-4 text-sm font-black text-accent text-center border-r border-white/5 bg-accent/5">{Number(u.work_hours || 0).toFixed(2)}</td>
                     <td className="p-4 text-xs font-mono text-red-400/80 text-center border-r border-white/5">{Number(u.accident_hours || 0).toFixed(2)}</td>
                     <td className="p-4 text-xs font-mono text-blue-400/80 text-center border-r border-white/5">{Number(u.wet_hours || 0).toFixed(2)}</td>
                     <td className="p-4 text-xs font-mono text-orange-400/80 text-center border-r border-white/5">{Number(u.standby_hours || 0).toFixed(2)}</td>
                     <td className="p-4 text-xs font-mono text-slate-500 text-center border-r border-white/5">{Number(u.wait_part_hours || 0).toFixed(2)}</td>
                     <td className="p-4 text-xs font-mono text-green-400 text-center border-r border-white/5 font-black">{u.pa}%</td>
                     <td className="p-4 text-xs font-mono text-accent text-center border-r border-white/5 font-black">{u.ma}%</td>
                     <td className="p-4 text-xs font-mono text-blue-400 text-center border-r border-white/5 font-black">{u.ua}%</td>
                     <td className="p-4 text-xs font-mono text-purple-400 text-center border-r border-white/5 font-black">{u.eu}%</td>
                     <td className="p-4 text-xs font-mono text-slate-400 text-center border-r border-white/5">{Number(metrics.mttr || 0).toFixed(1)}</td>
                     <td className="p-4 text-xs font-mono text-slate-400 text-center border-r border-white/5">{Number(metrics.mtbf || 0).toFixed(1)}</td>
                     <td className="p-4 text-xs font-mono text-red-400 font-black text-center border-r border-white/5">{Number(u.d_percent || 0).toFixed(1)}%</td>
                     <td className="p-4 text-xs font-mono text-slate-400 text-center border-r border-white/5">{Number(u.sched_event_percent || 0).toFixed(1)}%</td>
                     <td className="p-4 text-xs font-mono text-orange-400 font-bold text-center border-r border-white/5">{Number(u.unschd_event_percent || 0).toFixed(1)}%</td>
                     <td className="p-4 text-xs font-mono text-slate-400 text-center border-r border-white/5">{Number(u.sched_dur_percent || 0).toFixed(1)}%</td>
                     <td className="p-4 text-xs font-mono text-orange-400 font-bold text-center">{Number(u.unschd_dur_percent || 0).toFixed(1)}%</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
          </div>
        </div>
      ) : activeView === "Daily" ? (
        <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="text-accent" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Daily Performance Status</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10"><Filter size={18} /></button>
                <button onClick={fetchKpiData} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10"><RefreshCw size={18} /></button>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-white/5">
                 <tr>
                   <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">ID UNIT</th>
                   <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10 text-right">AWAL BULAN</th>
                   <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10 text-right">HM RUNNING</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-white/10 text-right text-red-400">BD</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-white/10 text-right text-accent">RUNNING</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {dailyFleet.map((u: any, i: number) => (
                   <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                     <td className="p-4 text-sm font-black text-white group-hover:text-accent transition-colors">{u.id}</td>
                     <td className="p-4 text-sm font-mono text-slate-400 text-right">{(u.awal_bulan || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                     <td className="p-4 text-sm font-mono text-slate-300 text-right font-black">{(u.hm_running || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                     <td className="p-4 text-sm font-mono text-red-400/80 text-right font-bold">{(u.bd_hours || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                     <td className="p-4 text-sm font-mono text-accent text-right font-black">{(u.work_hours || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      ) : activeView === "Hierarchy" ? (
        <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Layers className="text-[#facc15]" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Component Hierarchy Database</h3>
              </div>
           </div>

           <div className="overflow-x-auto rounded-xl border border-white/10">
             <table className="w-full text-left min-w-[800px] border-collapse bg-black/20">
               <thead className="bg-[#facc15]">
                 <tr>
                   <th className="p-4 text-[10px] font-black text-black uppercase tracking-widest border-r border-black/10">Component</th>
                   <th className="p-4 text-[10px] font-black text-black uppercase tracking-widest border-r border-black/10">Component Section</th>
                   <th className="p-4 text-[10px] font-black text-black uppercase tracking-widest border-r border-black/10">Sub Component</th>
                   <th className="p-4 text-[10px] font-black text-black uppercase tracking-widest">Description Problem</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {data?.hierarchy?.map((h: any, i: number) => (
                   <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                     <td className="p-4 text-xs font-black text-[#facc15] border-r border-white/5 uppercase">{h.component}</td>
                     <td className="p-4 text-xs font-bold text-white border-r border-white/5">{h.component_section}</td>
                     <td className="p-4 text-xs text-slate-300 border-r border-white/5">{h.sub_component}</td>
                     <td className="p-4 text-xs text-slate-400 italic">{h.problem_description}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      ) : null}

      {/* Main KPI Overview (Always visible in Summary if not in specialized views) */}
      {activeView === "Summary" && (
        <div className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Physical Availability" value={metrics.pa} unit="%" icon={Gauge} color="text-green-500" />
            <MetricCard title="Mechanical Availability" value={metrics.ma} unit="%" icon={Wrench} color="text-accent" />
            <MetricCard title="Utilization of Avail" value={metrics.ua} unit="%" icon={Activity} color="text-blue-500" />
            <MetricCard title="Effective Utilization" value={metrics.eu} unit="%" icon={TrendingUp} color="text-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8">
                <h3 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3"><Layers className="text-accent" /> Pareto by Component</h3>
                <div className="space-y-6">
                  {paretoData.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase">
                        <span className="text-slate-300">{item.component}</span>
                        <span className="text-accent">{item.frequency} Times</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.min((item.frequency / 10) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8 bg-accent/5 border-accent/20">
                <h3 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3"><Clock className="text-accent" /> Reliability Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2">MTTR</p>
                    <h4 className="text-4xl font-black text-white font-outfit">{(metrics.mttr || 0).toFixed(1)} <span className="text-lg text-slate-400">Hrs</span></h4>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2">MTBF</p>
                    <h4 className="text-4xl font-black text-white font-outfit">{(metrics.mtbf || 0).toFixed(1)} <span className="text-lg text-slate-400">Hrs</span></h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Section (Always at bottom) */}
      <div className="mt-8">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Database className="text-accent" size={20} />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Live System Activity Log</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.activities || []).map((log: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Activity size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-white uppercase truncate">{log.user_name}</span>
                    <span className="text-[10px] font-bold text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-1">{log.action}</p>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {log.module}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
