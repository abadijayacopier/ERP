"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Pencil,
  Trash2,
  Printer,
  Building,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  DollarSign,
  Download,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast, ConfirmModal } from "@/components/UIFeedback";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

export default function InvoicesPage() {
  const { t, formatCurrency } = useGlobalSettings();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [formData, setFormData] = useState({
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    client_name: "",
    project_name: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_amount: 0,
    status: "Draft"
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printUrl, setPrintUrl] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean, id: number | null}>({
    isOpen: false,
    id: null
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('invoices');
      setInvoices(data);
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiRequest(`invoices?id=${editingId}`, 'PATCH', formData);
        setShowToast({ msg: "Invoice updated successfully!", type: "success" });
      } else {
        await apiRequest('invoices', 'POST', formData);
        setShowToast({ msg: "Invoice created successfully!", type: "success" });
      }
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchInvoices();
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    }
  };

  const handleEdit = (inv: any) => {
    setEditingId(inv.id);
    setFormData({
      invoice_number: inv.invoice_number,
      client_name: inv.client_name,
      project_name: inv.project_name,
      issue_date: new Date(inv.issue_date).toISOString().split('T')[0],
      due_date: new Date(inv.due_date).toISOString().split('T')[0],
      total_amount: parseFloat(inv.total_amount),
      status: inv.status
    });
    setIsEditModalOpen(true);
  };

  const handleView = (inv: any) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
  };

  const handlePrint = (id: number) => {
    setPrintUrl(`/api/invoices/print?id=${id}`);
    setIsPrintModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`invoices?id=${id}`, 'DELETE');
      setShowToast({ msg: "Financial record erased successfully", type: "success" });
      fetchInvoices();
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    }
  };

  const totalReceivables = invoices.reduce((acc, inv) => acc + (inv.status !== 'Paid' ? parseFloat(inv.total_amount) : 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.status === 'Paid' ? parseFloat(inv.total_amount) : 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">{t('invoices')}</span>
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight">{t('invoices')} <span className="text-slate-500">&</span> Billing</h1>
          <p className="text-slate-400 mt-1 font-medium">Tracking production invoices and contractor payments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchInvoices} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent text-primary font-black hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
            <Plus size={20} />
            <span className="text-sm">{t('create_report')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-10 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
            <DollarSign size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-green-500/20 text-green-400 border border-green-500/30"><DollarSign size={24} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">{t('total_assets')}</span>
              </div>
              <h3 className="text-6xl font-black font-outfit text-white tracking-tighter">{formatCurrency(totalPaid)}</h3>
              <p className="text-slate-500 text-sm font-medium">Successfully settled and verified transactions</p>
            </div>
            <div className="h-20 w-px bg-white/10 hidden md:block" />
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">{t('total_receivables')}</span>
              <h4 className="text-4xl font-black font-outfit text-white tracking-tighter">{formatCurrency(totalReceivables)}</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">In Transit / Unpaid</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-10 flex flex-col justify-center border-orange-500/20 bg-orange-500/5 group">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 group-hover:rotate-12 transition-transform"><Clock size={24} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{t('action_required')}</span>
           </div>
           <h3 className="text-5xl font-black font-outfit text-white mb-2">12</h3>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-tight">{t('pending_approval')}<br/>site manager approval</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden group">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-lg font-outfit text-white tracking-tight">Billing Records</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder={t('search')} className="form-input !py-2 !pl-10 !text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest text-xs">Accessing Financial Vault...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice Details</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client / Project</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic opacity-30 uppercase text-[10px] font-black tracking-widest">No billing records found</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-all group/row">
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-white group-hover/row:text-accent transition-colors flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          {inv.invoice_number}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                           <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 text-slate-500 rounded-md uppercase tracking-widest">Due</span>
                           <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(inv.due_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-300">{inv.client_name}</div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter mt-0.5">{inv.project_name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-black font-outfit text-white">{formatCurrency(inv.total_amount)}</div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 transition-all duration-300">
                           <button onClick={() => handleView(inv)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:border-accent/30 transition-all" title="View Invoice"><Eye size={16} /></button>
                           <button onClick={() => handleEdit(inv)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all" title="Edit Invoice"><Pencil size={16} /></button>
                           <button onClick={() => handlePrint(inv.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-orange-400 hover:border-orange-400/30 transition-all" title="Print Invoice"><Printer size={16} /></button>
                           <button onClick={() => setConfirmDelete({ isOpen: true, id: inv.id })} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all" title="Delete Record"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Invoice">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice Number</label>
              <input type="text" value={formData.invoice_number} readOnly className="form-input opacity-50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="form-input">
                <option value="Draft" className="bg-[#0b0f1a]">Draft</option>
                <option value="Sent" className="bg-[#0b0f1a]">Sent</option>
                <option value="Paid" className="bg-[#0b0f1a]">Paid</option>
                <option value="Overdue" className="bg-[#0b0f1a]">Overdue</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Entity</label>
            <input type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} placeholder="Company name..." required className="form-input" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Name</label>
            <input type="text" value={formData.project_name} onChange={(e) => setFormData({...formData, project_name: e.target.value})} placeholder="Site/Project ID..." required className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Issue Date</label>
              <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} required className="form-input" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</label>
              <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required className="form-input" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount ($)</label>
            <input type="number" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} placeholder="0.00" required className="form-input" />
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Discard</button>
            <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-accent text-primary font-black hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all">Generate Invoice</button>
          </div>
        </form>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingId(null); }} title="Edit Existing Invoice">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice Number</label>
              <input type="text" value={formData.invoice_number} readOnly className="form-input opacity-50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="form-input">
                <option value="Draft" className="bg-[#0b0f1a]">Draft</option>
                <option value="Sent" className="bg-[#0b0f1a]">Sent</option>
                <option value="Paid" className="bg-[#0b0f1a]">Paid</option>
                <option value="Overdue" className="bg-[#0b0f1a]">Overdue</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Entity</label>
            <input type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} placeholder="Company name..." required className="form-input" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Name</label>
            <input type="text" value={formData.project_name} onChange={(e) => setFormData({...formData, project_name: e.target.value})} placeholder="Site/Project ID..." required className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Issue Date</label>
              <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} required className="form-input" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</label>
              <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required className="form-input" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount ($)</label>
            <input type="number" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} placeholder="0.00" required className="form-input" />
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingId(null); }} className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Update Invoice</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Erase Financial Data?"
        message="Warning: This billing record will be removed from the financial ledger. This action cannot be undone."
        confirmLabel="Erase Permanently"
      />

      {/* Invoice Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Invoice Specification">
        {selectedInvoice && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document No.</span>
                <h4 className="text-3xl font-black text-white font-outfit tracking-tighter">{selectedInvoice.invoice_number}</h4>
              </div>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Entity</span>
                <p className="text-lg font-bold text-white leading-tight">{selectedInvoice.client_name}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">{selectedInvoice.project_name}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</span>
                <p className="text-3xl font-black text-accent font-outfit tracking-tighter">${parseFloat(selectedInvoice.total_amount).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Issuance Date</span>
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <Clock size={14} className="text-slate-500" />
                  {new Date(selectedInvoice.issue_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Deadline</span>
                <div className="flex items-center gap-2 text-rose-400 font-bold justify-end">
                  <Clock size={14} className="text-rose-500" />
                  {new Date(selectedInvoice.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={() => { setIsDetailModalOpen(false); handlePrint(selectedInvoice.id); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
                <Printer size={18} />
                Print Document
              </button>
              <button onClick={() => { setIsDetailModalOpen(false); handleEdit(selectedInvoice); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-accent text-primary font-black hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all">
                <Pencil size={18} />
                Modify Data
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Print Preview Modal */}
      <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title="Print Preview">
        <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-white">
          <iframe src={printUrl} className="w-full h-full border-none" title="Invoice Print Preview" />
        </div>
        <div className="mt-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Click the print button inside the preview to finalize document
        </div>
      </Modal>
    </div>
  );
}

function InvoiceStat({ label, value, unit, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-8 flex flex-col justify-between group hover:border-accent/30 transition-all duration-500 relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={120} />
      </div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={clsx("p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform", color)}>
          <Icon size={24} />
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-slate-500">$</span>
          <span className="text-3xl font-black text-white font-outfit tracking-tight">{value}</span>
          {unit && <span className="text-[10px] font-bold text-slate-600 ml-1 uppercase">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    'Paid': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Sent': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Draft': 'bg-slate-500/10 text-slate-400 border-white/10',
    'Overdue': 'bg-red-500/10 text-red-400 border-red-500/20'
  };
  
  return (
    <div className={clsx("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", colors[status] || colors.Draft)}>
      <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", status === 'Paid' ? 'bg-green-500' : status === 'Overdue' ? 'bg-red-500' : 'bg-slate-400')}></div>
      {status}
    </div>
  );
}
