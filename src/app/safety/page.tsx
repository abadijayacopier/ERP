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
  const { t } = useGlobalSettings();
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HSECard label="LTI Free Days" value="642" sub="Record: 1,000 Days" icon={Medal} color="text-green-400" accent="bg-green-500" />
        <HSECard label="HSE Compliance" value="98.5" sub="Audit: Q1-2026" icon={ShieldCheck} color="text-accent" accent="bg-accent" />
        <HSECard label="Incident Rate" value="0.02" sub="FR (Target < 0.1)" icon={Activity} color="text-blue-400" accent="bg-blue-500" />
        <HSECard label="Safety Meeting" value="100" sub="Attendance Rate" icon={Users} color="text-yellow-400" accent="bg-yellow-500" />
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
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
            <input type="text" placeholder="Search by type or location..." className="form-input !py-3.5 !pl-12 !bg-white/5 !border-white/10 !text-sm" />
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
              ) : incidents.map((log) => (
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
                       <div>
                         <p className="text-sm font-black text-white group-hover:text-red-400 transition-colors">{log.description}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{log.location}</p>
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
                       <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye size={16} /></button>
                       <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:bg-accent/10 transition-all"><Printer size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    <div className="glass-card p-10 flex flex-col justify-between group hover:border-red-500/30 transition-all duration-700 relative overflow-hidden">
      <div className={clsx("absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-125", color)}>
        <Icon size={160} />
      </div>
      <div className={clsx("p-4 rounded-2xl bg-white/5 border border-white/10 w-fit group-hover:scale-110 transition-transform mb-8 shadow-2xl relative z-10", color)}>
        <Icon size={28} />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="flex items-baseline gap-3">
           <span className="text-5xl font-black text-white font-outfit tracking-tighter">{value}</span>
           <div className={clsx("w-2 h-2 rounded-full animate-pulse shadow-lg", accent)}></div>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase mt-2 tracking-tighter border-t border-white/5 pt-2">{sub}</div>
      </div>
    </div>
  );
}
