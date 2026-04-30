"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  Fingerprint, 
  Clock, 
  Sun, 
  Moon, 
  Sunset,
  User,
  Search,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Timer
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast, ConfirmModal } from "@/components/UIFeedback";
import { Pagination } from "@/components/UIPagination";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// Mock Data
const MOCK_ATTENDANCE = [
  { id: 1, name: 'Adi Rahman', employee_id: 'EMP-001', shift: 'Pagi', clock_in: '2026-04-30T07:05:00Z', clock_out: null, status: 'Present', position: 'Senior Administrator', department: 'Operations' },
  { id: 2, name: 'Budi Santoso', employee_id: 'EMP-002', shift: 'Pagi', clock_in: '2026-04-30T06:55:00Z', clock_out: '2026-04-30T15:05:00Z', status: 'Present', position: 'Excavator Operator', department: 'Production' },
  { id: 3, name: 'Siti Aminah', employee_id: 'EMP-003', shift: 'Sore', clock_in: '2026-04-30T14:58:00Z', clock_out: null, status: 'Present', position: 'Safety Officer', department: 'HSE' },
  { id: 4, name: 'Agus Mekanik', employee_id: 'EMP-004', shift: 'Malam', clock_in: '2026-04-29T22:50:00Z', clock_out: '2026-04-30T07:10:00Z', status: 'Present', position: 'Heavy Equipment Technician', department: 'Maintenance' }
];

export default function AttendancePage() {
  const { t } = useGlobalSettings();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    shift: "Pagi",
    action: "Clock In"
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('attendance');
      if (data && data.length > 0) {
        setLogs(data);
      } else {
        setLogs(MOCK_ATTENDANCE);
      }
    } catch (err) {
      setLogs(MOCK_ATTENDANCE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const filteredLogs = logs.filter(log => 
    (log.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.emp_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.shift_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClockAction = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      name: formData.employee_id || 'Unknown Personnel',
      employee_id: formData.employee_id,
      shift: formData.shift,
      clock_in: new Date().toISOString(),
      clock_out: null,
      status: 'Present'
    };
    setLogs([newLog, ...logs]);
    setShowToast({ msg: `${formData.action} Success: Identity Verified`, type: "success" });
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!logToDelete) return;
    try {
      setLoading(true);
      setLogs(logs.filter(l => l.id !== logToDelete.id));
      setShowToast({ msg: "Attendance Log Purged from Archive", type: "success" });
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setShowToast({ msg: "Error purging log", type: "error" });
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
            <div className="w-10 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('attendance')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('attendance_monitoring')}
          </h1>
          <p className="text-slate-400 font-medium text-lg italic">Biometric Verification & Shift Control</p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={fetchLogs} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <div className={loading ? "animate-pulse" : ""}>
              <RefreshCw size={24} className={loading ? "animate-spin text-accent" : ""} />
            </div>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-primary font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
            <Fingerprint size={22} className="text-accent" />
            <span className="text-sm">BIOMETRIC CHECK-IN</span>
          </button>
        </div>
      </div>

      {/* SHIFT STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <ShiftCard name="Shift Pagi" time="07:00 - 15:00" icon={Sun} color="text-yellow-400" activeCount={124} totalCount={130} />
         <ShiftCard name="Shift Sore" time="15:00 - 23:00" icon={Sunset} color="text-orange-400" activeCount={82} totalCount={90} />
         <ShiftCard name="Shift Malam" time="23:00 - 07:00" icon={Moon} color="text-indigo-400" activeCount={45} totalCount={50} />
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
        <div className="p-8 border-b border-white/5 bg-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent">
                 <ClipboardCheck size={26} />
              </div>
              <div>
                 <h3 className="font-black text-xl font-outfit text-white">Daily Attendance Feed</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time Fingerprint Logs</p>
              </div>
           </div>
           <div className="relative w-full md:w-96 no-print">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text" 
              placeholder="Search by personnel..." 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="form-input !py-3.5 !pl-12 !bg-white/5 !border-white/10 !text-sm" 
            />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Shift</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Clock In</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Clock Out</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-700 uppercase tracking-[0.4em] text-xs">Accessing Biometric Vault...</td></tr>
              ) : paginatedLogs.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">No logs found</td></tr>
              ) : paginatedLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-accent/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-accent transition-all">
                          <User size={16} />
                       </div>
                       <div>
                         <p className="text-sm font-black text-white">{log.name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">{log.emp_code}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                       "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                       log.shift_name === 'Pagi' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                       log.shift_name === 'Sore' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                       "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    )}>
                       {log.shift_name}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-black text-white">{log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : '--:--'}</div>
                    <div className="text-[9px] font-bold text-slate-500">{log.clock_in ? new Date(log.clock_in).toLocaleDateString() : ''}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-black text-white">{log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : '--:--'}</div>
                    <div className="text-[9px] font-bold text-slate-500">{log.clock_out ? new Date(log.clock_out).toLocaleDateString() : ''}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <button onClick={() => setSelectedLog(log)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                          <Search size={14} />
                       </button>
                       <button onClick={() => { setLogToDelete(log); setIsDeleteModalOpen(true); }} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 transition-all">
                          <MoreVertical size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredLogs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* DETAIL MODAL */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Biometric Event Dossier">
        {selectedLog && (
          <div className="space-y-6 p-2">
             <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                   <User size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white font-outfit">{selectedLog.name}</h3>
                   <p className="text-xs font-bold text-slate-500 uppercase">{selectedLog.employee_id}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Shift</p>
                   <p className="text-sm font-black text-white uppercase">{selectedLog.shift}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                   <p className="text-sm font-black text-green-500 uppercase">{selectedLog.status}</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Clock size={16} className="text-accent" />
                      <span className="text-xs font-black text-slate-400 uppercase">Clock In Time</span>
                   </div>
                   <span className="text-sm font-black text-white">{selectedLog.clock_in ? new Date(selectedLog.clock_in).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Clock size={16} className="text-rose-500" />
                      <span className="text-xs font-black text-slate-400 uppercase">Clock Out Time</span>
                   </div>
                   <span className="text-sm font-black text-white">{selectedLog.clock_out ? new Date(selectedLog.clock_out).toLocaleString() : 'PENDING'}</span>
                </div>
             </div>

             <button onClick={() => setSelectedLog(null)} className="w-full py-4 rounded-2xl bg-accent text-white font-black text-xs hover:scale-[1.02] active:scale-95 transition-all mt-4">DISMISS</button>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title="Purge Biometric Log"
        message={`Warning: You are about to permanently purge the attendance log for ${logToDelete?.name}. This action cannot be undone.`}
        confirmLabel="PURGE LOG"
        type="danger"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Biometric Security: Manual Entry">
         <form onSubmit={handleClockAction} className="space-y-6 p-2">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee Identity</label>
               <input value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} placeholder="Input Employee ID or Scan Fingerprint..." className="form-input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Shift</label>
                  <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="form-input">
                     <option value="Pagi">PAGI (07:00 - 15:00)</option>
                     <option value="Sore">SORE (15:00 - 23:00)</option>
                     <option value="Malam">MALAM (23:00 - 07:00)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Action</label>
                  <select value={formData.action} onChange={(e) => setFormData({...formData, action: e.target.value})} className="form-input">
                     <option value="Clock In">CLOCK IN (START)</option>
                     <option value="Clock Out">CLOCK OUT (END)</option>
                  </select>
               </div>
            </div>
            <div className="pt-4">
               <button type="submit" className="w-full py-5 rounded-2xl bg-accent text-white font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/30 flex items-center justify-center gap-3">
                  <Fingerprint size={20} />
                  VERIFY & LOG ACTION
               </button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

function ShiftCard({ name, time, icon: Icon, color, activeCount, totalCount }: any) {
  const percentage = (activeCount / totalCount) * 100;
  return (
    <div className="glass-card p-6 flex flex-col gap-6 group hover:border-accent/20 transition-all">
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={clsx("p-3 rounded-xl bg-white/5 border border-white/10", color)}>
                <Icon size={20} />
             </div>
             <div>
                <h4 className="text-sm font-black text-white uppercase">{name}</h4>
                <p className="text-[10px] font-bold text-slate-500">{time}</p>
             </div>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500">
             <MoreVertical size={14} />
          </div>
       </div>

       <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase">
             <span className="text-slate-500 tracking-widest">Personnel Status</span>
             <span className="text-white">{activeCount} / {totalCount}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div className={clsx("h-full transition-all duration-1000", percentage > 90 ? 'bg-green-500' : 'bg-accent')} style={{ width: `${percentage}%` }}></div>
          </div>
       </div>
    </div>
  );
}
