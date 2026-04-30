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
  FileSpreadsheet,
  Download,
  Printer
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
  const { t, companyInfo } = useGlobalSettings();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("Summary");
  const [data, setData] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  
  const fetchKpiData = async () => {
    try {
      setLoading(true);
      // Add a small artificial delay to ensure the "Syncing" animation is satisfyingly visible
      const [response] = await Promise.all([
        apiRequest('kpi/stats'),
        new Promise(resolve => setTimeout(resolve, 1200))
      ]);
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
  const hierarchyData = data?.hierarchy || [];

  // Filter & Pagination Logic
  const filteredFleet = dailyFleet.filter((u: any) => 
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFleet.length / itemsPerPage);
  const paginatedFleet = filteredFleet.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter units for the selected group detail view
  const groupUnits = selectedGroup ? dailyFleet.filter((u: any) => 
    u.model === selectedGroup.sub_group
  ) : [];

  return (
    <div className="min-h-screen p-8 bg-[#0b0f1a] relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-5 mb-3">
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-accent/20 border border-white/10 shrink-0">
              <BarChart3 size={32} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter leading-none">
                {companyInfo.name} <span className="text-accent">KPI MONITORING</span>
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">Operational Performance & Reliability Intelligence</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          {["Summary", "Daily", "Hierarchy"].map((view) => (
            <button 
              key={view}
              onClick={() => {
                setActiveView(view);
                setCurrentPage(1); // Reset page when switching views
                setSearchTerm(""); // Reset search when switching views
              }}
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
          <div className="glass-card min-w-0 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
             <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="text-accent" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight font-outfit">Mega Summary Report</h3>
                </div>
                
                <div className="flex flex-1 max-w-2xl items-center gap-4">
                  <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                      <Filter size={14} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Quick Filter by ID or Model..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all uppercase tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        // Simple CSV Export Logic
                        const headers = ["No", "Unit ID", "Model", "HM Start", "HM Finish", "Work", "Accident", "Wet", "Standby", "Wait Part", "PA%", "MA%", "UA%", "EU%"];
                        const rows = filteredFleet.map((u: any, i: number) => [
                          i + 1, u.id, u.model, u.awal_bulan, u.hm_running, u.work_hours, 
                          u.accident_hours, u.wet_hours, u.standby_hours, u.wait_part_hours,
                          u.pa, u.ma, u.ua, u.eu
                        ]);
                        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute("download", `Mega_Summary_${new Date().toLocaleDateString()}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/20 shrink-0"
                    >
                      <Download size={14} /> Export
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20 shrink-0"
                    >
                      <Printer size={14} /> Print
                    </button>
                    <button 
                      onClick={fetchKpiData} 
                      disabled={loading}
                      className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/10 shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={clsx(loading && "animate-spin text-accent")} />
                    </button>
                  </div>
                </div>
             </div>

             <div className="overflow-x-auto w-full custom-scrollbar max-h-[650px] border-b border-white/5">
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
                  @media print {
                    @page { size: A3 landscape; margin: 10mm; }
                    aside, header, footer, button, .no-print, .pagination-controls, .search-box { display: none !important; }
                    main, .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; }
                    .glass-card { background: white !important; border: 1px solid #ddd !important; box-shadow: none !important; color: black !important; }
                    table { color: black !important; width: 100% !important; min-width: 100% !important; border-collapse: collapse !important; font-size: 7pt !important; }
                    th { background: #f2f2f2 !important; color: black !important; border: 0.5pt solid #000 !important; -webkit-print-color-adjust: exact; }
                    td { border: 0.5pt solid #ccc !important; color: black !important; background: white !important; }
                    .sticky { position: static !important; }
                    .text-white { color: black !important; }
                    .text-slate-400, .text-slate-500 { color: #666 !important; }
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
                 {paginatedFleet.map((u: any, i: number) => (
                   <tr key={i} className="hover:bg-accent/5 transition-colors group border-b border-white/5">
                     <td className="p-4 text-xs font-bold text-slate-500 border-r border-white/5">{(currentPage - 1) * itemsPerPage + i + 1}</td>
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

           {/* Pagination UI for Summary */}
           <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01] rounded-b-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Showing {paginatedFleet.length} of {filteredFleet.length} filtered units
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all border border-white/10"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={clsx(
                        "w-10 h-10 rounded-xl text-xs font-black transition-all border",
                        currentPage === idx + 1 
                          ? "bg-accent text-primary border-accent" 
                          : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                      )}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  {totalPages > 5 && <span className="text-slate-600 px-2">...</span>}
                </div>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all border border-white/10"
                >
                  Next
                </button>
              </div>
           </div>
          </div>
        </div>
      ) : activeView === "Daily" ? (
        <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-[600px]">
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="text-accent" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Daily Performance Status</h3>
              </div>
              
              <div className="flex flex-1 max-w-2xl items-center gap-4 w-full">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                    <Filter size={14} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search Unit ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-all uppercase tracking-widest"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={fetchKpiData} 
                    disabled={loading}
                    className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={clsx(loading && "animate-spin text-accent")} />
                  </button>
                </div>
              </div>
           </div>

           <div className="overflow-x-auto flex-1">
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
                 {paginatedFleet.map((u: any, i: number) => (
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

           {/* Pagination UI */}
           <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Showing {Math.min(itemsPerPage, dailyFleet.length)} of {dailyFleet.length} Units
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-white/10"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={clsx(
                        "w-10 h-10 rounded-xl text-xs font-black transition-all border",
                        currentPage === idx + 1 
                          ? "bg-accent text-primary border-accent shadow-lg shadow-accent/20" 
                          : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                      )}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-white/10"
                >
                  Next
                </button>
              </div>
           </div>
        </div>
      ) : activeView === "Hierarchy" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
          {hierarchyData.map((group: any, idx: number) => (
            <div key={idx} className="glass-card p-8 group hover:border-accent/40 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                  <Box size={24} />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {group.unit_count} Units
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{group.parent_group}</p>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{group.sub_group}</h3>
              <div className="mt-6 pt-6 border-t border-white/5">
                <button 
                  onClick={() => setSelectedGroup(group)}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-2"
                >
                  VIEW GROUP DETAILS <ChevronDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Slide-over for Group Details */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGroup(null)} />
          <div className="relative w-full max-w-2xl bg-[#0b0f1a] border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col h-full">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">{selectedGroup.parent_group}</p>
                <h3 className="text-3xl font-black text-white uppercase font-outfit">{selectedGroup.sub_group}</h3>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
              >
                <RefreshCw size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                {groupUnits.map((unit: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-accent group-hover:bg-accent/10 transition-all">
                          <Gauge size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white uppercase">{unit.id}</h4>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System Connection</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current HM</p>
                        <p className="text-2xl font-black text-white font-mono">{(unit.hm_running || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">PA</p>
                        <p className="text-sm font-black text-green-400">{unit.pa}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">MA</p>
                        <p className="text-sm font-black text-accent">{unit.ma}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">D (%)</p>
                        <p className="text-sm font-black text-red-400">{unit.d_percent}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 border-t border-white/5 bg-white/[0.01]">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs transition-all border border-white/10 hover:bg-accent hover:text-primary hover:border-accent"
              >
                Close Detailed View
              </button>
            </div>
          </div>
        </div>
      )}

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
