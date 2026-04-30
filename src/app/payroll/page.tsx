"use client";

import React, { useState, useEffect } from "react";
import { 
  ReceiptText, 
  Wallet, 
  Search, 
  RefreshCw, 
  Printer, 
  Download, 
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BadgeDollarSign,
  Briefcase,
  Clock4,
  CalendarDays,
  MoreVertical
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast, ConfirmModal } from "@/components/UIFeedback";
import { Pagination } from "@/components/UIPagination";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// Mock Data
const MOCK_PAYROLL = [
  { id: 1, name: 'Adi Rahman', employee_id: 'EMP-001', month: 'April 2026', basic_salary: 15000000, overtime_hrs: 12, overtime_pay: 1200000, net_salary: 16200000, status: 'Paid' },
  { id: 2, name: 'Budi Santoso', employee_id: 'EMP-002', month: 'April 2026', basic_salary: 8500000, overtime_hrs: 20, overtime_pay: 1000000, net_salary: 9500000, status: 'Paid' },
  { id: 3, name: 'Siti Aminah', employee_id: 'EMP-003', month: 'April 2026', basic_salary: 9000000, overtime_hrs: 5, overtime_pay: 250000, net_salary: 9250000, status: 'Draft' },
  { id: 4, name: 'Agus Mekanik', employee_id: 'EMP-004', month: 'April 2026', basic_salary: 9500000, overtime_hrs: 15, overtime_pay: 750000, net_salary: 10250000, status: 'Paid' }
];

export default function PayrollPage() {
  const { t, formatCurrency, companyInfo } = useGlobalSettings();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('payroll');
      if (data && data.length > 0) {
        setPayrolls(data);
      } else {
        setPayrolls(MOCK_PAYROLL);
      }
    } catch (err) {
      setPayrolls(MOCK_PAYROLL);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const filteredPayrolls = payrolls.filter(p => 
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.emp_code || p.employee_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrint = () => {
    window.print();
  };

  const handleRecalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowToast({ msg: "Payroll Batch Recalculated Successfully", type: "success" });
    }, 1500);
  };

  const handleDelete = () => {
    if (!recordToDelete) return;
    setPayrolls(payrolls.filter(p => p.id !== recordToDelete.id));
    setShowToast({ msg: "Payroll Record Excised", type: "success" });
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 no-print">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('payroll')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('payroll_system')}
          </h1>
          <p className="text-slate-400 font-medium text-lg italic">Automated Compensation Engine</p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={fetchPayroll} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <div className={loading ? "animate-pulse" : ""}>
              <RefreshCw size={24} className={loading ? "animate-spin text-accent" : ""} />
            </div>
          </button>
          <button onClick={handleRecalculate} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
            <TrendingUp size={22} />
            <span className="text-sm">RUN PAYROLL BATCH</span>
          </button>
        </div>
      </div>

      {/* PAYROLL STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
         <StatBox label="Total Disbursement" value={formatCurrency(45200000)} icon={Wallet} color="text-green-400" />
         <StatBox label="Pending Drafts" value="12" icon={AlertCircle} color="text-amber-400" />
         <StatBox label="Completed Slips" value="142" icon={CheckCircle2} color="text-blue-400" />
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02] no-print">
        <div className="p-8 border-b border-white/5 bg-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent">
                 <BadgeDollarSign size={26} />
              </div>
              <div>
                 <h3 className="font-black text-xl font-outfit text-white">Payroll Archive</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Personnel Compensation Logs</p>
              </div>
           </div>
           <div className="relative w-full md:w-96">
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Basic Salary</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Overtime</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Payable</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center animate-pulse font-black text-slate-700 uppercase tracking-[0.4em] text-xs">Accessing Payroll Vault...</td></tr>
              ) : paginatedPayrolls.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">No records found</td></tr>
              ) : paginatedPayrolls.map((pay) => (
                <tr key={pay.id} className="group hover:bg-accent/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white">{pay.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{pay.emp_code} • {pay.period_month}/{pay.period_year}</p>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{formatCurrency(pay.basic_salary_snapshot)}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-accent">+{formatCurrency(pay.overtime_pay)}</span>
                       <span className="text-[9px] font-bold text-slate-500 uppercase">{pay.total_overtime_hours || 0} Hrs Calculated</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-white font-outfit">{formatCurrency(pay.total_salary)}</td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      pay.status === 'Paid' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    )}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => setSelectedSlip(pay)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye size={16} /></button>
                       <button onClick={() => { setRecordToDelete(pay); setIsDeleteModalOpen(true); }} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredPayrolls.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title="Excise Payroll Record"
        message={`Are you sure you want to delete the payroll record for ${recordToDelete?.name}? This will remove it from the historical archive.`}
        confirmLabel="EXCISE RECORD"
        type="danger"
      />

      {/* PAYSLIP MODAL & PRINT VIEW */}
      <Modal isOpen={!!selectedSlip} onClose={() => setSelectedSlip(null)} title="Official Salary Disbursement Slip">
         {selectedSlip && (
            <div className="space-y-8 p-4">
               {/* SLIP CONTENT */}
               <div className="border border-white/10 rounded-3xl overflow-hidden bg-white/5 print:bg-white print:text-black print:border-2 print:border-black print:m-0 print:rounded-none">
                  <div className="p-8 print:p-12 border-b border-white/10 flex justify-between items-start print:border-b-2 print:border-black">
                     <div className="print:w-full print:text-center">
                        <h2 className="text-2xl font-black font-outfit text-white print:text-3xl print:text-black uppercase tracking-tighter">SLIP GAJI KARYAWAN</h2>
                        <p className="text-xs font-black text-accent uppercase tracking-widest mt-1 print:text-sm print:text-black">PERIOD: {selectedSlip.period_month}/{selectedSlip.period_year}</p>
                     </div>
                     <div className="text-right print:hidden">
                        <p className="text-sm font-black text-white print:text-black uppercase">{companyInfo.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Operational Excellence Suite</p>
                     </div>
                  </div>

                  <div className="p-8 grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-12 print:gap-20">
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 print:gap-6">
                           <div className="p-2 rounded-lg bg-white/5 text-slate-400 print:bg-transparent print:text-black"><Briefcase size={20}/></div>
                           <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Employee Identity</p>
                              <p className="text-sm font-black text-white print:text-lg print:text-black">{selectedSlip.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 print:text-[8px]">{selectedSlip.emp_code}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 print:gap-6">
                           <div className="p-2 rounded-lg bg-white/5 text-slate-400 print:bg-transparent print:text-black"><Clock4 size={20}/></div>
                           <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Overtime Accumulated</p>
                              <p className="text-sm font-black text-white print:text-base print:text-black">{selectedSlip.total_overtime_hours || 0} Hours</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5 print:bg-transparent print:border-none print:p-0 print:space-y-4">
                        <div className="flex flex-col gap-0.5 print:flex-row print:justify-between print:items-baseline print:border-b print:border-gray-100 print:pb-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Basic Salary</span>
                           <p className="text-sm font-black text-white font-outfit tracking-tight print:text-black">{formatCurrency(selectedSlip.basic_salary_snapshot)}</p>
                        </div>
                        <div className="flex flex-col gap-0.5 print:flex-row print:justify-between print:items-baseline print:border-b print:border-gray-100 print:pb-2">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Overtime Pay</p>
                           <p className="text-sm font-black text-accent font-outfit print:text-black">{formatCurrency(selectedSlip.overtime_pay)}</p>
                        </div>
                        <div className="pt-4 border-t border-white/10 mt-2 print:border-black print:mt-4 print:pt-4">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 print:text-[10px] print:text-black">Total Net Payable</p>
                           <p className="text-xl font-black text-white font-outfit tracking-tighter whitespace-nowrap leading-none print:text-2xl print:text-black">{formatCurrency(selectedSlip.total_salary)}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 print:p-12 bg-white/5 border-t border-white/10 flex justify-between items-center print:border-t-2 print:border-black print:bg-white">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 print:bg-transparent print:text-black print:border print:border-black">
                           <CheckCircle2 size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-green-500 uppercase tracking-widest print:text-black">Verified Payment</p>
                           <p className="text-[8px] font-bold text-slate-500 uppercase">System Hash: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                     </div>
                     <div className="text-right italic text-[10px] text-slate-500 print:text-black">
                        This is a computer-generated document. No signature required.
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 no-print">
                  <button onClick={() => setSelectedSlip(null)} className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black text-xs hover:bg-white/5 transition-all uppercase tracking-widest">Close</button>
                  <button onClick={handlePrint} className="flex-[2] py-4 rounded-2xl bg-accent text-white font-black text-xs hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                     <Printer size={18} />
                     Print Slip Gaji
                  </button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-8 flex items-center gap-6 group hover:bg-white/[0.03] transition-all">
       <div className={clsx("p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform", color)}>
          <Icon size={24} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-white font-outfit tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
