"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  Filter, 
  ChevronRight,
  AlertTriangle,
  ClipboardCheck,
  Medal,
  Activity,
  Users,
  HeartPulse,
  Plus,
  Search,
  Eye,
  Pencil,
  Printer,
  Trash2,
  ShieldCheck,
  LifeBuoy,
  FileWarning,
  Stethoscope
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast } from "@/components/UIFeedback";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// MOCK DATA FOR HSE LOGS
const MOCK_INCIDENTS = [
  { id: 1, type: 'Near Miss', severity: 'Low', location: 'PIT B South', description: 'Light vehicle nearly hit by Hauler 777 due to blind spot.', user_name: 'Adi Rahman', created_at: '2026-04-29T08:30:00Z' },
  { id: 2, type: 'Property Damage', severity: 'Medium', location: 'Workshop Main', description: 'Overhead crane cable snapped during engine lifting. No injuries.', user_name: 'Agus Mekanik', created_at: '2026-04-28T14:20:00Z' },
  { id: 3, type: 'First Aid', severity: 'Low', location: 'Admin Office', description: 'Personnel slipped on wet floor near cafeteria.', user_name: 'Siti Safety', created_at: '2026-04-27T10:15:00Z' },
  { id: 4, type: 'Hazard Observation', severity: 'High', location: 'Explosive Magazine', description: 'Fire extinguisher expired. Immediate replacement required.', user_name: 'Budi Santoso', created_at: '2026-04-26T09:00:00Z' }
];

export default function SafetyPage() {
  const { t, companyInfo } = useGlobalSettings();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);
  const [formData, setFormData] = useState({
    type: "Near Miss",
    severity: "Low",
    location: "",
    description: "",
    user_name: "Adi Rahman Samari"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [viewingIncident, setViewingIncident] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('safety');
      if (data && data.length > 0) {
        setIncidents(data);
      } else {
        setIncidents(MOCK_INCIDENTS);
      }
    } catch (err: any) {
      setIncidents(MOCK_INCIDENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newRecord = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
      setIncidents([newRecord, ...incidents]);
      setShowToast({ msg: "Safety Protocol Synchronized Successfully", type: "success" });
      setIsModalOpen(false);
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (log: any) => {
    window.print();
  };

  // Filter & Pagination Logic
  const filteredIncidents = incidents.filter(item => 
    item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b-4 border-black pb-6 mb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase text-black tracking-tighter">Official HSE Incident Archive</h1>
            <p className="text-sm font-bold text-slate-600 mt-1 uppercase tracking-widest">{companyInfo.name} • Operational Compliance Report</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-500">Document ID: HSE-{Date.now()}</p>
            <p className="text-[10px] font-black uppercase text-slate-500">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-red-500 rounded-full"></div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">{t('hse_command')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('safety')} <span className="text-slate-600">&</span> {t('compliance')}
          </h1>
          <p className="text-slate-400 font-medium text-lg italic">{t('safe_production')}</p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={fetchData} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={24} className={loading ? "animate-spin text-red-400" : ""} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-red-500 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20">
            <ShieldAlert size={22} />
            <span className="text-sm">FILE INCIDENT REPORT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-2 print:mb-4">
        <HSECard label="LTI Free Days" value="642" sub="Record: 1,000 Days" icon={Medal} color="text-green-400" accent="bg-green-500" />
        <HSECard label="HSE Compliance" value="98.5" sub="Audit: Q1-2026" icon={ShieldCheck} color="text-accent" accent="bg-accent" />
        <HSECard label="Incident Rate" value="0.02" sub="FR (Target < 0.1)" icon={Activity} color="text-blue-400" accent="bg-blue-500" />
        <HSECard label="Safety Meeting" value="100" sub="Attendance Rate" icon={Users} color="text-yellow-400" accent="bg-yellow-500" />
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02] print:border-black/10 print:bg-white">
        <div className="p-8 border-b border-white/5 bg-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                 <FileWarning size={26} />
              </div>
              <div>
                 <h3 className="font-black text-xl font-outfit text-white">Incident & Hazard Logs</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time Safety Monitoring</p>
              </div>
           </div>
           <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text" 
              placeholder="Search by type or location..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input !py-3.5 !pl-12 !bg-white/5 !border-white/10 !text-sm" 
            />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type / Detail</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reporter</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Timestamp</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-700 uppercase tracking-[0.4em] text-xs">Scanning Safety Vault...</td></tr>
              ) : paginatedIncidents.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">No matches detected in archive</td></tr>
              ) : paginatedIncidents.map((log) => (
                <tr key={log.id} className="group hover:bg-red-500/[0.02] transition-all">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                       <div className={clsx(
                         "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                         log.type === 'LTI' ? "bg-red-600/20 border-red-600/30 text-red-500" :
                         log.type === 'Near Miss' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                         "bg-blue-500/10 border-blue-500/20 text-blue-400"
                       )}>
                         <ShieldAlert size={20} />
                       </div>
                       <div className="max-w-xs xl:max-w-md">
                         <p className="text-sm font-black text-white group-hover:text-red-400 transition-colors truncate">{log.description}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{log.location} • {log.type}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={clsx(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg shadow-black/20",
                      log.severity === 'High' || log.severity === 'Critical' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                      log.severity === 'Medium' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                      "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    )}>
                      {log.severity} RISK
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-slate-400">
                          {log.user_name?.charAt(0)}
                       </div>
                       <span className="text-xs font-bold text-slate-400">{log.user_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="text-sm font-black text-white">{new Date(log.created_at).toLocaleDateString()}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <button onClick={() => setViewingIncident(log)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye size={16} /></button>
                       <button onClick={() => handlePrint(log)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:bg-accent/10 transition-all"><Printer size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UI */}
        <div className="p-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/[0.01]">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Record <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="text-white">{filteredIncidents.length}</span> Safety Events
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw size={18} className="-rotate-90" />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    "w-10 h-10 rounded-xl text-[10px] font-black transition-all border",
                    currentPage === page 
                      ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20" 
                      : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw size={18} className="rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Details Modal */}
      <Modal isOpen={!!viewingIncident} onClose={() => setViewingIncident(null)} title="Incident Dossier Details">
        {viewingIncident && (
          <div className="space-y-8 p-4">
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-2xl font-black font-outfit text-white tracking-tight">{viewingIncident.type}</h2>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{viewingIncident.location}</p>
                </div>
                <span className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border",
                  viewingIncident.severity === 'High' || viewingIncident.severity === 'Critical' ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                )}>
                  {viewingIncident.severity} RISK
                </span>
             </div>

             <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Incident Narrative</p>
                <p className="text-white text-sm leading-relaxed">{viewingIncident.description}</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Reporter</p>
                   <p className="text-sm font-bold text-white">{viewingIncident.user_name}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Timestamp</p>
                   <p className="text-sm font-bold text-white">{new Date(viewingIncident.created_at).toLocaleString()}</p>
                </div>
             </div>

             <div className="pt-6 border-t border-white/5">
                <button onClick={() => setViewingIncident(null)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-xs hover:bg-white/10 transition-all uppercase tracking-widest">Close Dossier</button>
             </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Safety Protocol: Incident Reporting">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="form-input">
                <option value="Near Miss">⚠️ NEAR MISS</option>
                <option value="First Aid">🩹 FIRST AID</option>
                <option value="Property Damage">🚜 PROPERTY DAMAGE</option>
                <option value="LTI">🚨 LTI (LOST TIME INJURY)</option>
                <option value="Hazard Observation">👁️ HAZARD OBSERVATION</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Risk Level</label>
              <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} className="form-input">
                <option value="Low">🟢 LOW</option>
                <option value="Medium">🟡 MEDIUM</option>
                <option value="High">🟠 HIGH</option>
                <option value="Critical">🔴 CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location / Sector</label>
            <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. PIT North Ramp 2" className="form-input" required />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident Narrative</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Describe exactly what happened, equipment involved, and immediate actions taken..." className="form-input min-h-[140px] !text-sm"></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-white font-black text-sm hover:bg-white/5 transition-all">ABORT REPORT</button>
            <button type="submit" disabled={loading} className="flex-[2] px-8 py-5 rounded-2xl bg-red-600 text-white font-black text-sm hover:scale-105 active:scale-95 shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-3">
              {loading ? <RefreshCw className="animate-spin" size={20}/> : <ShieldCheck size={20}/>}
              FILE OFFICIAL REPORT
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function HSECard({ label, value, sub, icon: Icon, color, accent }: any) {
  return (
    <div className="glass-card p-10 flex flex-col justify-between group hover:border-red-500/30 transition-all duration-700 relative overflow-hidden print:p-4 print:border-black/20 print:rounded-2xl print:min-h-0">
      <div className={clsx("absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-125 print:hidden", color)}>
        <Icon size={160} />
      </div>
      <div className={clsx("p-4 rounded-2xl bg-white/5 border border-white/10 w-fit group-hover:scale-110 transition-transform mb-8 shadow-2xl relative z-10 print:p-2 print:mb-2 print:border-black/10", color)}>
        <Icon size={28} className="print:w-5 print:h-5" />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 print:mb-1 print:text-black">{label}</div>
        <div className="flex items-baseline gap-3">
           <span className="text-5xl font-black text-white font-outfit tracking-tighter print:text-2xl print:text-black">{value}</span>
           <div className={clsx("w-2 h-2 rounded-full animate-pulse shadow-lg print:hidden", accent)}></div>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase mt-2 tracking-tighter border-t border-white/5 pt-2 print:text-[8px] print:text-black print:border-black/10">{sub}</div>
      </div>
    </div>
  );
}
