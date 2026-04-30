"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw, 
  MoreVertical, 
  ShieldCheck, 
  BadgeCheck,
  Building2,
  Calendar,
  Wallet,
  Mail,
  Phone,
  ArrowUpRight,
  ChevronRight,
  Briefcase,
  User
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast, ConfirmModal } from "@/components/UIFeedback";
import { Pagination } from "@/components/UIPagination";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// Mock Data for Employees
const MOCK_EMPLOYEES = [
  { id: 1, employee_id: 'EMP-001', full_name: 'Adi Rahman Samari', position: 'Senior Administrator', department: 'Operations', status: 'Active', basic_salary: 15000000, joined_at: '2023-01-15' },
  { id: 2, employee_id: 'EMP-002', full_name: 'Budi Santoso', position: 'Excavator Operator', department: 'Production', status: 'Active', basic_salary: 8500000, joined_at: '2023-03-20' },
  { id: 3, employee_id: 'EMP-003', full_name: 'Siti Aminah', position: 'Safety Officer', department: 'HSE', status: 'Active', basic_salary: 9000000, joined_at: '2024-02-10' },
  { id: 4, employee_id: 'EMP-004', full_name: 'Agus Mekanik', position: 'Heavy Equipment Technician', department: 'Maintenance', status: 'Active', basic_salary: 9500000, joined_at: '2022-11-05' }
];

export default function HRPage() {
  const { t, formatCurrency } = useGlobalSettings();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    full_name: "",
    position: "",
    department: "Production",
    basic_salary: 5000000,
    overtime_rate: 50000
  });

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('hr');
      if (data && data.length > 0) {
        setEmployees(data);
      } else {
        setEmployees(MOCK_EMPLOYEES);
      }
    } catch (err) {
      setEmployees(MOCK_EMPLOYEES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.employee_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newEmp = { ...formData, id: Date.now(), status: 'Active', joined_at: new Date().toISOString() };
      setEmployees([newEmp, ...employees]);
      setShowToast({ msg: "Employee Registered Successfully", type: "success" });
      setIsModalOpen(false);
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    try {
      setLoading(true);
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      setShowToast({ msg: "Personnel Terminated from Active Force", type: "success" });
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setShowToast({ msg: "Protocol Failure: Termination Aborted", type: "error" });
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
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('hr')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('employee_management')}
          </h1>
          <p className="text-slate-400 font-medium text-lg italic">Strategic Human Capital Operations</p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={fetchEmployees} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <div className={loading ? "animate-pulse" : ""}>
              <RefreshCw size={24} className={loading ? "animate-spin text-accent" : ""} />
            </div>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
            <UserPlus size={22} />
            <span className="text-sm">HIRE NEW TALENT</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HRCard label="Total Force" value={employees.length.toString()} sub="Personnel" icon={Users} color="text-blue-400" accent="bg-blue-500" />
        <HRCard label="Active Status" value={employees.filter(e => e.status === 'Active').length.toString()} sub="On Duty" icon={ShieldCheck} color="text-green-400" accent="bg-green-500" />
        <HRCard label="Avg Tenure" value="2.4" sub="Years" icon={Calendar} color="text-amber-400" accent="bg-amber-500" />
        <HRCard label="Payroll Mass" value="M" sub="Budget Q2" icon={Wallet} color="text-purple-400" accent="bg-purple-500" />
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
        <div className="p-8 border-b border-white/5 bg-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent">
                 <BadgeCheck size={26} />
              </div>
              <div>
                 <h3 className="font-black text-xl font-outfit text-white">Personnel Database</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Verified Mining Workforce</p>
              </div>
           </div>
           <div className="relative w-full md:w-96 no-print">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or department..." 
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Position & Dept</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Basic Salary</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-700 uppercase tracking-[0.4em] text-xs">Accessing Personnel Vault...</td></tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">No personnel found</td></tr>
              ) : paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-accent/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-accent group-hover:scale-110 transition-all duration-500">
                          <User size={18} />
                       </div>
                       <div>
                         <p className="text-sm font-black text-white">{emp.full_name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{emp.employee_id}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <Briefcase size={14} className="text-accent" />
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{emp.position}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{emp.department}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      emp.status === 'Active' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-slate-500/10 border-white/10 text-slate-500"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <button onClick={() => setSelectedEmployee(emp)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                          <ArrowUpRight size={16} />
                       </button>
                       <button onClick={() => { setEmployeeToDelete(emp); setIsDeleteModalOpen(true); }} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 transition-all">
                          <MoreVertical size={16} />
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
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* DOSSIER MODAL */}
      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Personnel Operational Dossier">
        {selectedEmployee && (
          <div className="space-y-8 p-2 animate-in fade-in zoom-in-95 duration-500">
             <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl">
                <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-accent/20">
                   {selectedEmployee.full_name.charAt(0)}
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white font-outfit tracking-tight">{selectedEmployee.full_name}</h2>
                   <p className="text-sm font-bold text-accent uppercase tracking-[0.2em]">{selectedEmployee.employee_id}</p>
                   <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                         <Building2 size={12}/> {selectedEmployee.department}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase">
                         <ShieldCheck size={12}/> {selectedEmployee.status}
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <DossierItem label="Current Position" value={selectedEmployee.position} icon={Briefcase} />
                <DossierItem label="Base Compensation" value={formatCurrency(selectedEmployee.basic_salary)} icon={Wallet} />
                <DossierItem label="Enlistment Date" value={new Date(selectedEmployee.joined_at).toLocaleDateString()} icon={Calendar} />
                <DossierItem label="Security Clearance" value="LEVEL 04 - FIELD OPS" icon={ShieldCheck} />
             </div>

             <div className="flex gap-4 pt-4">
                <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs hover:bg-white/10 transition-all">EDIT PROFILE</button>
                <button onClick={() => setSelectedEmployee(null)} className="flex-1 py-4 rounded-2xl bg-accent text-white font-black text-xs hover:scale-105 active:scale-95 transition-all">CLOSE DOSSIER</button>
             </div>
          </div>
        )}
      </Modal>

      {/* TERMINATION MODAL */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title="Personnel Termination"
        message={`Are you absolutely sure you want to terminate ${employeeToDelete?.full_name} from active duty? This protocol will revoke all access keys.`}
        confirmLabel="TERMINATE"
        type="danger"
      />

      {/* ADD EMPLOYEE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="HR Protocol: Hire New Talent">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee ID</label>
                <input value={formData.employee_id} readOnly className="form-input opacity-50 cursor-not-allowed" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="e.g. John Doe" className="form-input" required />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</label>
                <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="form-input">
                   <option value="Production">PRODUCTION</option>
                   <option value="Maintenance">MAINTENANCE</option>
                   <option value="HSE">SAFETY & HSE</option>
                   <option value="Logistics">LOGISTICS</option>
                   <option value="Admin">ADMINISTRATION</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Position</label>
                <input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="e.g. Foreman" className="form-input" required />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Basic Salary (IDR)</label>
                <input type="number" value={formData.basic_salary} onChange={(e) => setFormData({...formData, basic_salary: parseInt(e.target.value)})} className="form-input" required />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overtime Rate / Hr</label>
                <input type="number" value={formData.overtime_rate} onChange={(e) => setFormData({...formData, overtime_rate: parseInt(e.target.value)})} className="form-input" required />
             </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl border border-white/10 text-white font-black text-xs hover:bg-white/5 transition-all">ABORT</button>
            <button type="submit" disabled={loading} className="flex-[2] px-8 py-4 rounded-2xl bg-accent text-white font-black text-xs hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-3">
              {loading ? <RefreshCw className="animate-spin" size={18}/> : <UserPlus size={18}/>}
              REGISTER PERSONNEL
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DossierItem({ label, value, icon: Icon }: any) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
       <div className="p-2.5 rounded-xl bg-white/5 text-slate-500">
          <Icon size={18} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-black text-white">{value}</p>
       </div>
    </div>
  );
}

function HRCard({ label, value, sub, icon: Icon, color, accent }: any) {
  return (
    <div className="glass-card p-8 flex flex-col justify-between group hover:border-accent/30 transition-all duration-700 relative overflow-hidden">
      <div className={clsx("absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-125", color)}>
        <Icon size={140} />
      </div>
      <div className={clsx("p-4 rounded-2xl bg-white/5 border border-white/10 w-fit group-hover:scale-110 transition-transform mb-6 shadow-2xl relative z-10", color)}>
        <Icon size={24} />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
           <span className="text-4xl font-black text-white font-outfit tracking-tighter">{value}</span>
           <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse shadow-lg", accent)}></div>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase mt-2 tracking-tighter border-t border-white/5 pt-2">{sub}</div>
      </div>
    </div>
  );
}
