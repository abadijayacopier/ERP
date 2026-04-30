"use client";

import React, { useState, useEffect } from "react";
import { 
  Fuel, 
  RefreshCw, 
  Plus, 
  Filter, 
  TrendingDown, 
  TrendingUp,
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  ChevronRight,
  Search,
  Droplets,
  Eye,
  Pencil,
  Printer,
  Trash2,
  Clock
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast, ConfirmModal } from "@/components/UIFeedback";
import { apiRequest } from "@/lib/api-client";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const mockTrendData = [
  { day: 'Mon', usage: 1200 },
  { day: 'Tue', usage: 1900 },
  { day: 'Wed', usage: 1500 },
  { day: 'Thu', usage: 2200 },
  { day: 'Fri', usage: 1800 },
  { day: 'Sat', usage: 2400 },
  { day: 'Sun', usage: 2100 },
];

export default function LogisticsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [tanks, setTanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printUrl, setPrintUrl] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    item_id: "",
    transaction_type: "Out",
    quantity: 0,
    reference_id: "",
    user_name: ""
  });

  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean, id: number | null}>({
    isOpen: false,
    id: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, tanksData] = await Promise.all([
        apiRequest('logistics'),
        apiRequest('inventory?type=Fuel')
      ]);
      setLogs(logsData);
      setTanks(tanksData);
      if (tanksData.length > 0 && !formData.item_id) {
        setFormData(prev => ({ ...prev, item_id: tanksData[0].id }));
      }
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
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
      if (editingId) {
        await apiRequest(`logistics?id=${editingId}`, 'PATCH', formData);
        setShowToast({ msg: "Log updated successfully!", type: "success" });
      } else {
        await apiRequest('logistics', 'POST', formData);
        setShowToast({ msg: "Fuel log recorded successfully!", type: "success" });
      }
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    }
  };

  const handleView = (tx: any) => {
    setSelectedLog(tx);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (tx: any) => {
    setEditingId(tx.id);
    setFormData({
      item_id: tx.item_id,
      transaction_type: tx.transaction_type,
      quantity: parseFloat(tx.quantity),
      reference_id: tx.reference_id,
      user_name: tx.user_name
    });
    setIsEditModalOpen(true);
  };

  const handlePrint = (id: number) => {
    setPrintUrl(`/api/logistics/print?id=${id}`);
    setIsPrintModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`logistics?id=${id}`, 'DELETE');
      setShowToast({ msg: "Transaction purged from logistics vault", type: "success" });
      fetchData();
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      {/* Header Section */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Energy Supply Chain</span>
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight">Fuel <span className="text-slate-500">&</span> Logistics</h1>
          <p className="text-slate-400 mt-1 font-medium">Monitoring site energy consumption and tank replenishment</p>
        </div>

        <div className="flex gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={fetchData} className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5">
            <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-accent text-primary font-black hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={20} />
            <span className="text-sm">Record Transaction</span>
          </button>
        </div>
      </section>

      {/* Bento Grid Stats Monitoring */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-accent/10 to-transparent border-accent/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Fuel size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-accent/20 text-accent"><Activity size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Total Site Capacity</span>
            </div>
            <h3 className="text-5xl font-black font-outfit text-white mb-2">45,000 <span className="text-xl text-slate-500 italic">LTR</span></h3>
            <p className="text-slate-400 text-sm font-medium">Distributed across 4 main storage tanks</p>
          </div>
        </div>
        
        {tanks.length > 0 ? tanks.slice(0, 2).map((tank) => (
          <TankCard key={tank.id} name={tank.item_name} current={parseFloat(tank.stock_quantity)} capacity={parseFloat(tank.min_stock_level) * 2} />
        )) : (
          [1,2].map(i => <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />)
        )}
      </section>

      {/* Logs Table */}
      <section className="glass-card overflow-hidden group">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg font-outfit text-white tracking-tight">Transaction History</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Search ref id / operator..." className="form-input !py-2 !pl-10 !text-xs" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest text-xs">Synchronizing Logistics Database...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Volume</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 italic opacity-30 uppercase text-[10px] font-black tracking-widest">No logistics records found</td>
                  </tr>
                ) : (
                  logs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-all group/row">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover/row:text-accent transition-colors border border-white/10">
                            <Target size={14} />
                          </div>
                          <span className="text-xs font-black font-mono text-slate-300 uppercase tracking-tight">{tx.reference_id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={clsx(
                          "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border", 
                          tx.transaction_type === 'Out' 
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        )}>
                          {tx.transaction_type === 'Out' ? 'CONSUMPTION' : 'REPLENISH'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-lg font-black text-white font-outfit">{parseFloat(tx.quantity).toLocaleString()}</span>
                        <span className="ml-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">LTR</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-300">{tx.user_name}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 w-fit px-2 py-0.5 rounded-md mb-1">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-all duration-300">
                           <button onClick={() => handleView(tx)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:border-accent/30 transition-all" title="View Transaction"><Eye size={16} /></button>
                           <button onClick={() => handleEdit(tx)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all" title="Edit Log"><Pencil size={16} /></button>
                           <button onClick={() => handlePrint(tx.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-orange-400 hover:border-orange-400/30 transition-all" title="Print Slip"><Printer size={16} /></button>
                           <button onClick={() => setConfirmDelete({ isOpen: true, id: tx.id })} className="p-2.5 rounded-xl bg-white/5 border border-red-500/10 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all" title="Delete Log"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Entry Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Fuel Transaction">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Tank</label>
            <select value={formData.item_id} onChange={(e) => setFormData({...formData, item_id: e.target.value})} className="form-input">
              {tanks.map(t => <option key={t.id} value={t.id} className="bg-[#0b0f1a]">{t.item_name} (Sisa: {t.stock_quantity} L)</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume (Liters)</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})} placeholder="0.00" className="form-input" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Type</label>
              <select value={formData.transaction_type} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})} className="form-input">
                <option value="Out" className="bg-[#0b0f1a]">Consumption (Issue)</option>
                <option value="In" className="bg-[#0b0f1a]">Refill (Purchase)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref ID (Unit/PO)</label>
              <input value={formData.reference_id} onChange={(e) => setFormData({...formData, reference_id: e.target.value})} placeholder="EXC-001" className="form-input" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator Name</label>
              <input value={formData.user_name} onChange={(e) => setFormData({...formData, user_name: e.target.value})} placeholder="Full name..." className="form-input" required />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-accent text-primary font-black hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">Save Log</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingId(null); }} title="Edit Fuel Transaction">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Tank</label>
            <select value={formData.item_id} onChange={(e) => setFormData({...formData, item_id: e.target.value})} className="form-input">
              {tanks.map(t => <option key={t.id} value={t.id} className="bg-[#0b0f1a]">{t.item_name}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume (Liters)</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})} className="form-input" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Type</label>
              <select value={formData.transaction_type} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})} className="form-input">
                <option value="Out" className="bg-[#0b0f1a]">Consumption (Issue)</option>
                <option value="In" className="bg-[#0b0f1a]">Refill (Purchase)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref ID (Unit/PO)</label>
              <input value={formData.reference_id} onChange={(e) => setFormData({...formData, reference_id: e.target.value})} className="form-input" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator Name</label>
              <input value={formData.user_name} onChange={(e) => setFormData({...formData, user_name: e.target.value})} className="form-input" required />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Update Record</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Destroy Record?"
        message="This action is irreversible. The transaction data will be purged from the logistics vault forever."
        confirmLabel="Destroy Now"
      />

      {/* Logistics Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Logistics Specification">
        {selectedLog && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Ref</span>
                <h4 className="text-3xl font-black text-white font-outfit tracking-tighter">{selectedLog.reference_id}</h4>
              </div>
              <div className={clsx(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                selectedLog.transaction_type === 'Out' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              )}>
                {selectedLog.transaction_type === 'Out' ? 'Consumption' : 'Replenishment'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator in Charge</span>
                <p className="text-lg font-bold text-white leading-tight">{selectedLog.user_name}</p>
                <div className="flex items-center gap-2 mt-2 text-slate-500 font-bold text-[10px] uppercase">
                  <Clock size={12} />
                  {new Date(selectedLog.created_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transferred Volume</span>
                <p className="text-4xl font-black text-white font-outfit tracking-tighter">{parseFloat(selectedLog.quantity).toLocaleString()} <span className="text-lg text-slate-500">LTR</span></p>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Source Inventory</span>
                  <span className="text-white font-black">{selectedLog.item_name}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Authorization Status</span>
                  <span className="text-emerald-500 font-black flex items-center gap-2 italic">
                    <Activity size={14} />
                    Verified & Recorded
                  </span>
               </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={() => { setIsDetailModalOpen(false); handlePrint(selectedLog.id); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
                <Printer size={18} />
                Print Slip
              </button>
              <button onClick={() => { setIsDetailModalOpen(false); handleEdit(selectedLog); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                <Pencil size={18} />
                Edit Log
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Print Preview Modal */}
      <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title="Fuel Slip Preview">
        <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-white">
          <iframe src={printUrl} className="w-full h-full border-none" title="Fuel Slip Print Preview" />
        </div>
        <div className="mt-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Verify transaction details before physical printing
        </div>
      </Modal>
    </div>
  );
}

function TankCard({ name, current, capacity }: any) {
  const percent = Math.min(Math.round((current / capacity) * 100), 100);
  const isCritical = percent < 20;

  return (
    <div className="glass-card p-8 space-y-6 relative overflow-hidden group border-b-4" style={{ borderBottomColor: isCritical ? '#f43f5e' : '#3b82f6' }}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{name}</h4>
          <div className="text-3xl font-black text-white font-outfit tracking-tighter">
            {current.toLocaleString()} <span className="text-sm text-slate-500">L</span>
          </div>
        </div>
        <div className={clsx(
          "p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-500",
          isCritical ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
        )}>
          <Droplets size={20} />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-500">Inventory Level</span>
          <span className={clsx(isCritical ? "text-rose-500" : "text-white")}>{percent}%</span>
        </div>
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
          <div 
            className={clsx(
              "h-full rounded-full transition-all duration-1000 relative shadow-lg",
              isCritical ? "bg-rose-500" : "bg-blue-500"
            )}
            style={{ width: `${percent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          <span>0 L</span>
          <span>MAX: {capacity.toLocaleString()} L</span>
        </div>
      </div>
    </div>
  );
}
