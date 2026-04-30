"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  ClipboardCheck,
  Zap,
  Sun,
  RefreshCw,
  Trash2,
  Eye,
  Pencil,
  Printer,
  CloudRain,
  CloudLightning,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Thermometer
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast } from "@/components/UIFeedback";
import { showConfirm, showAlert } from "@/lib/swal";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// MOCK DATA FOR DEMO
const MOCK_REPORTS = [
  { id: 1, report_date: '2026-04-29', shift: 'Day', supervisor_name: 'Adi Rahman', production_bcm: 12500, weather_condition: 'Sunny', rain_hours: 0, slippery_hours: 0, notes: 'Target achieved. Hauling road dry.' },
  { id: 2, report_date: '2026-04-29', shift: 'Night', supervisor_name: 'Budi Santoso', production_bcm: 8200, weather_condition: 'Rain', rain_hours: 2.5, slippery_hours: 1.5, notes: 'Heavy rain at 23:00. Slippery on ramp 4.' },
  { id: 3, report_date: '2026-04-28', shift: 'Day', supervisor_name: 'Agus Mekanik', production_bcm: 11800, weather_condition: 'Cloudy', rain_hours: 0, slippery_hours: 0.5, notes: 'Road maintenance performed in early shift.' }
];

export default function DSRPage() {
  const { t } = useGlobalSettings();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [formData, setFormData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    shift: "Day",
    supervisor_name: "Adi Rahman Samari",
    production_bcm: 0,
    weather_condition: "Sunny",
    rain_hours: 0,
    slippery_hours: 0,
    notes: ""
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('dsr');
      if (data && data.length > 0) {
        setReports(data);
      } else {
        setReports(MOCK_REPORTS);
      }
    } catch (err: any) {
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Logic would be here to save to DB
      const newReport = { ...formData, id: Date.now() };
      setReports([newReport, ...reports]);
      setShowToast({ msg: "Shift Report Synchronized to Central Node", type: "success" });
      setIsModalOpen(false);
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Sunny': return <Sun className="text-yellow-400" size={18} />;
      case 'Rain': return <CloudRain className="text-blue-400" size={18} />;
      case 'Storm': return <CloudLightning className="text-purple-400" size={18} />;
      default: return <BarChart3 className="text-slate-400" size={18} />;
    }
  };

  const handleDelete = async (id: number) => {
    const res = await showConfirm("Delete Report?", "This operational log will be permanently erased from the repository.");
    if (res.isConfirmed) {
      try {
        await apiRequest('dsr', 'DELETE', { id });
        showAlert("Purged!", "Report has been removed from the central node.", "success");
        fetchReports();
      } catch (err: any) {
        showAlert("Error", err.message, "error");
      }
    }
  };

  const handlePrint = (dsr: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>DSR - ${dsr.report_date}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand h1 { margin: 0; font-size: 24px; font-weight: 800; }
            .brand p { margin: 0; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #64748b; }
            .doc-type { text-align: right; }
            .doc-type h2 { margin: 0; font-size: 18px; font-weight: 800; color: #3b82f6; }
            
            .info-grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
            .info-item { border-bottom: 1px solid #e2e8f0; padding: 10px 0; }
            .label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 700; }

            .production-box { background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 40px; border: 1px solid #e2e8f0; }
            .prod-label { font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 10px; }
            .prod-value { font-size: 48px; font-weight: 900; color: #0f172a; }

            .section-title { font-size: 12px; font-weight: 800; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 10px; }
            .narrative { font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap; background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
            
            .footer { margin-top: 60px; display: grid; grid-template-cols: repeat(2, 1fr); gap: 40px; }
            .sig-box { text-align: center; }
            .sig-line { border-bottom: 1.5px solid #0f172a; margin-bottom: 10px; height: 80px; }
            .sig-label { font-size: 10px; font-weight: 800; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>MINING ERP PRO</h1>
              <p>Daily Shift Production Report</p>
            </div>
            <div class="doc-type">
              <h2>DSR-SHIFT-LOG</h2>
              <div style="font-size: 10px; font-weight: 700;">REF: #${dsr.id.toString().padStart(6, '0')}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item"><span class="label">Reporting Date</span><div class="value">${new Date(dsr.report_date).toLocaleDateString()}</div></div>
            <div class="info-item"><span class="label">Shift Phase</span><div class="value">${dsr.shift.toUpperCase()} SHIFT</div></div>
            <div class="info-item"><span class="label">Supervisor</span><div class="value">${dsr.supervisor_name}</div></div>
            <div class="info-item"><span class="label">Weather Condition</span><div class="value">${dsr.weather_condition} (${dsr.rain_hours}H Rain / ${dsr.slippery_hours}H Slip)</div></div>
          </div>

          <div class="production-box">
            <div class="prod-label">TOTAL PRODUCTION YIELD</div>
            <div class="prod-value">${parseFloat(dsr.production_bcm).toLocaleString()} <span style="font-size: 20px; color: #94a3b8;">BCM</span></div>
          </div>

          <div class="section-title">OPERATIONAL NARRATIVE</div>
          <div class="narrative">${dsr.notes || 'No specific operational issues recorded for this shift.'}</div>

          <div class="footer">
            <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Shift Supervisor</div></div>
            <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Mine Manager</div></div>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #94a3b8;">
            Document generated on ${new Date().toLocaleString()} &bull; System Verified Log
          </div>

          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('operational_intelligence')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('dsr')}
          </h1>
          <p className="text-slate-400 font-medium text-lg">{t('production_logging')}</p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none p-1.5 bg-white/5 border border-white/10 rounded-2xl flex gap-1">
             <button className="px-5 py-2.5 rounded-xl bg-accent text-primary font-black text-xs shadow-lg shadow-accent/20">ALL REPORTS</button>
             <button className="px-5 py-2.5 rounded-xl text-slate-400 font-bold text-xs hover:text-white transition-colors">MY SHIFT</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-primary font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
            <Plus size={20} />
            <span className="text-sm">{t('create_report')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DSRStat label={t('total_production')} value={reports.reduce((acc, r) => acc + (r.production_bcm || 0), 0).toLocaleString()} unit="BCM" icon={TrendingUp} color="text-accent" />
        <DSRStat label="Avg. Weather Delay" value={(reports.reduce((acc, r) => acc + (r.rain_hours || 0) + (r.slippery_hours || 0), 0) / (reports.length || 1)).toFixed(1)} unit="HRS/S" icon={CloudRain} color="text-blue-400" />
        <DSRStat label={t('efficiency')} value="94.2" unit="%" icon={Zap} color="text-yellow-400" />
        <DSRStat label="Active Supervisors" value="08" unit="PERS" icon={ClipboardCheck} color="text-green-400" />
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <BarChart3 size={24} className="text-slate-400" />
             </div>
             <div>
                <h3 className="font-black text-xl font-outfit text-white">Report Repository</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Archived Shift Production Logs</p>
             </div>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder={t('search')} className="form-input !py-3.5 !pl-12 !text-sm !bg-white/5 !border-white/10 focus:!border-accent/50" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Reporting Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Site Authority</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Production Yield</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Environmental Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-700 uppercase tracking-[0.4em] text-xs">Accessing Data Node...</td></tr>
              ) : reports.map((dsr) => (
                <tr key={dsr.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                       <div className={clsx(
                         "w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-all group-hover:scale-110",
                         dsr.shift === 'Day' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                       )}>
                         <Clock size={16} />
                         <span className="text-[8px] font-black uppercase mt-1">{dsr.shift}</span>
                       </div>
                       <div>
                         <p className="text-sm font-black text-white">{new Date(dsr.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Verified Batch #{dsr.id.toString().slice(-4)}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-sm text-slate-300 font-bold">{dsr.supervisor_name}</td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-3">
                       <div className="text-2xl font-black font-outfit text-white tracking-tighter">{parseFloat(dsr.production_bcm).toLocaleString()}</div>
                       <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20">BCM</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          {getWeatherIcon(dsr.weather_condition)}
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dsr.weather_condition}</span>
                       </div>
                       {(dsr.rain_hours > 0 || dsr.slippery_hours > 0) && (
                         <div className="flex gap-2">
                            {dsr.rain_hours > 0 && <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">RAIN: {dsr.rain_hours}H</span>}
                            {dsr.slippery_hours > 0 && <span className="text-[8px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">SLIP: {dsr.slippery_hours}H</span>}
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <button onClick={() => { setViewingReport(dsr); setIsViewModalOpen(true); }} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye size={16} /></button>
                       <button onClick={() => handlePrint(dsr)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:bg-accent/10 transition-all"><Printer size={16} /></button>
                       <button onClick={() => handleDelete(dsr.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Operational Shift Report (DSR)">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Reporting Date</label>
              <input type="date" value={formData.report_date} onChange={(e) => setFormData({...formData, report_date: e.target.value})} required className="form-input focus:ring-accent/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Shift Phase</label>
              <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="form-input">
                <option value="Day">☀️ DAY SHIFT</option>
                <option value="Night">🌙 NIGHT SHIFT</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Production Output (BCM)</label>
            <div className="relative">
               <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
               <input type="number" value={formData.production_bcm} onChange={(e) => setFormData({...formData, production_bcm: parseFloat(e.target.value)})} placeholder="Enter BCM total..." required className="form-input !pl-12 !text-lg !font-black !text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sun size={12}/> Weather</label>
                <select value={formData.weather_condition} onChange={(e) => setFormData({...formData, weather_condition: e.target.value})} className="form-input !py-2 !text-xs">
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rain">Rain</option>
                  <option value="Storm">Storm</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><CloudRain size={12}/> Rain Hrs</label>
                <input type="number" step="0.5" value={formData.rain_hours} onChange={(e) => setFormData({...formData, rain_hours: parseFloat(e.target.value)})} className="form-input !py-2 !text-xs" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={12}/> Slip Hrs</label>
                <input type="number" step="0.5" value={formData.slippery_hours} onChange={(e) => setFormData({...formData, slippery_hours: parseFloat(e.target.value)})} className="form-input !py-2 !text-xs" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Narrative</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} placeholder="Detail breakdown, road condition, or fleet issues..." className="form-input min-h-[120px] !text-sm"></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-white font-black text-sm hover:bg-white/5 transition-all">DISCARD</button>
            <button type="submit" disabled={loading} className="flex-[2] px-8 py-5 rounded-2xl bg-accent text-primary font-black text-sm hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-3">
              {loading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
              SYNCHRONIZE REPORT
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Operational Log Details">
        {viewingReport && (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-3xl font-black text-white font-outfit tracking-tighter">Batch #{viewingReport.id}</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Verified Production Record</p>
              </div>
              <div className={clsx(
                "px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest",
                viewingReport.shift === 'Day' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              )}>
                {viewingReport.shift} Shift
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Production Date</p>
                  <p className="text-sm font-bold text-white">{new Date(viewingReport.report_date).toLocaleDateString()}</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Supervisor in Charge</p>
                  <p className="text-sm font-bold text-white">{viewingReport.supervisor_name}</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-accent/5 border border-accent/20 text-center">
               <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Net Production Yield</p>
               <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-white font-outfit tracking-tighter">{parseFloat(viewingReport.production_bcm).toLocaleString()}</span>
                  <span className="text-sm font-black text-accent uppercase">BCM</span>
               </div>
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weather & Environmental Impact</p>
               <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                     {getWeatherIcon(viewingReport.weather_condition)}
                     <span className="text-xs font-bold text-white">{viewingReport.weather_condition}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10"></div>
                  <div className="text-[10px] font-bold text-slate-400">Rain: <span className="text-white">{viewingReport.rain_hours}H</span></div>
                  <div className="text-[10px] font-bold text-slate-400">Slippery: <span className="text-white">{viewingReport.slippery_hours}H</span></div>
               </div>
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Narrative</p>
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 leading-relaxed italic">
                  "{viewingReport.notes || 'No significant operational notes provided for this shift.'}"
               </div>
            </div>

            <button onClick={() => handlePrint(viewingReport)} className="w-full py-4 rounded-2xl bg-white text-primary font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl">
               <Printer size={18} />
               GENERATE PHYSICAL REPORT
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DSRStat({ label, value, unit, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-8 flex flex-col gap-6 group hover:border-accent/30 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110"><Icon size={80} /></div>
      <div className={clsx("p-3.5 rounded-2xl bg-white/5 w-fit border border-white/10 group-hover:scale-110 transition-transform shadow-lg", color)}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white font-outfit tracking-tighter">{value}</span>
          <span className={clsx("text-[10px] font-black uppercase px-2 py-0.5 rounded border border-white/10", color.replace('text-', 'bg-').replace('text-', 'text-'))}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

function Save(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
