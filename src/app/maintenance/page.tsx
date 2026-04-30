"use client";

import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  Package, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  RefreshCw,
  Box,
  Trash2,
  Edit,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  History,
  Activity,
  Printer
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast } from "@/components/UIFeedback";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { showConfirm, showAlert } from "@/lib/swal";

export default function MaintenancePage() {
  const { t, companyInfo } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState("my-tasks"); // Default to technician view
  const [jobs, setJobs] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOperatorMode, setIsOperatorMode] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  // Live timer effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (startTime: string) => {
    if (!startTime) return "00:00:00";
    const start = new Date(startTime).getTime();
    const now = currentTime.getTime();
    const diff = Math.max(0, now - start);
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    unit_id: "",
    type: "Preventive",
    priority: "Medium",
    status: "Scheduled",
    mechanic_name: "",
    description: "",
    scheduled_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const maintenanceData = await apiRequest('maintenance');
      setJobs(maintenanceData || []);
      
      const inventoryData = await apiRequest('inventory?type=Sparepart');
      setParts(inventoryData || []);

      const personnelData = await apiRequest('users');
      const mechList = personnelData?.filter((u: any) => u.role === 'TECHNICIAN' || u.role === 'MECHANIC') || [];
      setMechanics(mechList);
    } catch (err: any) {
      setShowToast({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingJob(null);
    setFormData({
      unit_id: "",
      type: isOperatorMode ? "Breakdown" : "Preventive",
      priority: isOperatorMode ? "High" : "Medium",
      status: "Scheduled",
      mechanic_name: "",
      description: "",
      scheduled_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setFormData({
      unit_id: job.unit_id,
      type: job.type,
      priority: job.priority,
      status: job.status,
      mechanic_name: job.mechanic_name,
      description: job.description || "",
      scheduled_date: new Date(job.scheduled_date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (id: number) => {
    const res = await showConfirm("Delete Job?", "This maintenance record will be permanently deleted from the system.");
    if (res.isConfirmed) {
      try {
        await apiRequest('maintenance', 'DELETE', { id });
        showAlert("Deleted!", "Maintenance job has been removed.", "success");
        fetchData();
      } catch (err: any) {
        showAlert("Error", err.message, "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await apiRequest('maintenance', 'PATCH', { id: editingJob.id, ...formData });
        showAlert("Updated!", "Maintenance job record has been updated.", "success");
      } else {
        const res = await apiRequest('maintenance', 'POST', formData);
        showAlert(
          "Work Order Issued!", 
          `WO-${res.id.toString().padStart(5, '0')} has been dispatched to the mechanical team.`, 
          "success"
        );
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showAlert("Error", err.message, "error");
    }
  };

  const handleStatusUpdate = async (jobId: number, newStatus: string) => {
    try {
      const updateData: any = { id: jobId, status: newStatus };
      if (newStatus === 'In Progress') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'Completed') {
        updateData.completed_at = new Date().toISOString();
      }
      await apiRequest('maintenance', 'PATCH', updateData);
      showAlert("Status Updated!", `Job status changed to ${newStatus}`, "success");
      fetchData();
    } catch (err: any) {
      showAlert("Error", err.message, "error");
    }
  };

  const openNoteModal = (jobId: number, note: string) => {
    setSelectedJobId(jobId);
    setCurrentNote(note || "");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    try {
      await apiRequest('maintenance', 'PATCH', { id: selectedJobId, description: currentNote });
      showAlert("Note Saved!", "Technical findings recorded.", "success");
      setIsNoteModalOpen(false);
      fetchData();
    } catch (err: any) {
      showAlert("Error", err.message, "error");
    }
  };
  const printJobSheet = (job: any) => {
    const start = new Date(job.started_at || job.created_at);
    const end = new Date(job.completed_at || new Date());
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const durationStr = `${hours}h ${mins}m`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Job Sheet - ${job.unit_id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; background: white; }
            .container { border: 2px solid #000; padding: 30px; position: relative; min-height: 100vh; box-sizing: border-box; }
            
            /* Watermark */
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 150px; color: rgba(0,0,0,0.03); font-weight: 800; pointer-events: none; white-space: nowrap; }
            
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .brand h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
            .brand p { margin: 0; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #444; max-width: 400px; line-height: 1.2; }
            .brand .contact-info { margin-top: 8px; font-size: 9px; color: #666; font-weight: 700; }
            
            .doc-type { text-align: right; }
            .doc-type h2 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; border: 2px solid #000; padding: 5px 15px; }
            .doc-no { margin-top: 5px; font-size: 12px; font-weight: 700; }

            .grid-table { display: grid; grid-template-cols: repeat(4, 1fr); border: 1px solid #000; margin-bottom: 25px; }
            .grid-item { border: 0.5px solid #000; padding: 12px; }
            .grid-item.span-2 { grid-column: span 2; }
            .grid-item.span-4 { grid-column: span 4; }
            .label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #555; margin-bottom: 4px; display: block; }
            .value { font-size: 13px; font-weight: 700; text-transform: uppercase; }

            .findings-box { border: 1px solid #000; min-height: 250px; padding: 15px; margin-bottom: 30px; position: relative; }
            .findings-box::before { content: 'TECHNICAL FINDINGS & ACTIONS TAKEN'; position: absolute; top: -8px; left: 15px; background: white; padding: 0 10px; font-size: 10px; font-weight: 800; }
            .findings-text { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }

            .signature-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 40px; margin-top: 60px; }
            .sig-box { text-align: center; }
            .sig-line { border-bottom: 1.5px solid #000; margin-bottom: 10px; height: 80px; }
            .sig-label { font-size: 10px; font-weight: 800; text-transform: uppercase; }
            
            @media print {
              body { padding: 0; }
              .container { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="watermark">OFFICIAL DOCUMENT</div>
            
            <div class="header">
              <div class="brand">
                <h1>${companyInfo.name}</h1>
                <p>${companyInfo.address}</p>
                <div class="contact-info">
                  ${companyInfo.email} &bull; ${companyInfo.website} &bull; ${companyInfo.phone}
                </div>
              </div>
              <div class="doc-type">
                <h2>Maintenance Job Sheet</h2>
                <div class="doc-no">WO-REF: #${job.id.toString().padStart(6, '0')}</div>
              </div>
            </div>

            <div class="grid-table">
              <div class="grid-item span-2"><span class="label">Equipment ID</span><div class="value">${job.unit_id}</div></div>
              <div class="grid-item"><span class="label">Model</span><div class="value">${job.model || 'N/A'}</div></div>
              <div class="grid-item"><span class="label">Priority</span><div class="value">${job.priority}</div></div>
              
              <div class="grid-item span-2"><span class="label">Technician Name</span><div class="value">${job.mechanic_name || 'NOT ASSIGNED'}</div></div>
              <div class="grid-item span-2"><span class="label">Job Category</span><div class="value">${job.type} MAINTENANCE</div></div>
              
              <div class="grid-item span-2"><span class="label">Start Schedule</span><div class="value">${new Date(job.started_at || job.scheduled_date).toLocaleString()}</div></div>
              <div class="grid-item span-2"><span class="label">Completion Date</span><div class="value">${new Date(job.completed_at || new Date()).toLocaleString()}</div></div>
              
              <div class="grid-item span-4" style="background: #f0f0f0;">
                <span class="label">TOTAL DOWNTIME / MTTR</span>
                <div class="value" style="font-size: 20px;">${durationStr}</div>
              </div>
            </div>

            <div class="findings-box">
              <div class="findings-text">${job.description || 'No technical notes recorded for this operation.'}</div>
            </div>

            <div class="signature-grid">
              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-label">Technician</div>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-label">Foreman / Supervisor</div>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-label">Maintenance Manager</div>
              </div>
            </div>

            <div style="margin-top: 40px; font-size: 9px; color: #888; text-align: center;">
              This document was generated automatically by Mining ERP Pro System on ${new Date().toLocaleString()}<br/>
              © 2026 Mining ERP Pro Max - Industrial Grade Solutions
            </div>
          </div>

          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const tabs = [
    { id: "my-tasks", icon: CheckCircle2, label: "My Tasks" },
    { id: "schedule", icon: Calendar, label: "Full Schedule" },
    { id: "inventory", icon: Box, label: "Spareparts" },
    { id: "history", icon: History, label: "History" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Workshop Command</span>
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight">Maintenance <span className="text-slate-500">&</span> Repair</h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Managing asset reliability and technical tasks</p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchData} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
            <RefreshCw size={20} className={loading ? "animate-spin text-accent" : ""} />
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsOperatorMode(true); openAddModal(); }} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20 border-b-4 border-red-700"
            >
              <Activity size={18} />
              REPORT UNIT DAMAGE
            </button>
            <button 
              onClick={() => { setIsOperatorMode(false); openAddModal(); }} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-primary font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20 border-b-4 border-accent-dark"
            >
              <Plus size={18} />
              PLAN MAINTENANCE
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-3xl gap-1 w-fit overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-accent text-primary shadow-xl shadow-accent/20 font-black text-xs" 
                : "text-slate-400 hover:text-white hover:bg-white/5 font-bold text-xs"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "my-tasks" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              {jobs.filter(j => j.status !== 'Completed').map((job) => (
                <div key={job.id} className="glass-card p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-all duration-500 text-accent"><Wrench size={80} /></div>
                   
                   <div className="relative z-10 flex flex-col h-full gap-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={clsx("px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest w-fit mb-2 border", 
                            job.priority === 'Critical' ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-accent/20 text-accent border-accent/30"
                          )}>
                            {job.priority} Priority
                          </div>
                          <h4 className="text-xl font-black text-white">{job.unit_id}</h4>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{job.type} Maintenance</p>
                        </div>
                        <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest", 
                          job.status === 'In Progress' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        )}>
                          <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", job.status === 'In Progress' ? "bg-blue-400" : "bg-orange-400")}></div>
                          {job.status}
                        </div>
                      </div>

                      <div className="space-y-4 py-4 border-y border-white/5">
                        <div className="flex items-center gap-3 text-slate-400">
                          <Calendar size={14} className="text-accent" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(job.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        {job.status === 'In Progress' ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                             <span className="text-[10px] font-black text-blue-400 font-mono tracking-widest">
                               {formatDuration(job.started_at || job.updated_at)}
                             </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-500">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest italic">Wait for Start</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        {job.status === 'Scheduled' && (
                          <button onClick={() => handleStatusUpdate(job.id, 'In Progress')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95">
                            <PlayCircle size={14} /> Start Job
                          </button>
                        )}
                        {job.status === 'In Progress' && (
                          <>
                            <button onClick={() => handleStatusUpdate(job.id, 'Completed')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                              <CheckCircle2 size={14} /> Complete
                            </button>
                            <button onClick={() => openNoteModal(job.id, job.description)} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:text-accent hover:border-accent/30 transition-all text-slate-400 active:scale-90 flex items-center gap-2">
                              <Edit size={16} />
                              <span className="text-[10px] font-black uppercase">Note</span>
                            </button>
                          </>
                        )}
                      </div>
                   </div>
                </div>
              ))}
              {jobs.filter(j => j.status !== 'Completed').length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                   <div className="p-4 rounded-full bg-green-500/20 text-green-500"><CheckCircle2 size={40} /></div>
                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Active Tasks Found</p>
                </div>
              )}
            </div>
          ) : activeTab === "schedule" ? (
             <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02] animate-in slide-in-from-right-4 duration-500">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit / ID</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type / Priority</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {jobs.map((job) => (
                      <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
                                <Activity size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white">{job.unit_id}</p>
                                <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">MAINT-{job.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-bold text-slate-300">{job.type}</p>
                           <p className={clsx("text-[9px] font-black uppercase tracking-widest mt-0.5", job.priority === 'Critical' ? 'text-red-500' : 'text-slate-500')}>{job.priority}</p>
                        </td>
                        <td className="p-6">
                           <span className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", 
                             job.status === 'Completed' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                             job.status === 'In Progress' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                             "bg-white/5 border-white/10 text-slate-400"
                           )}>
                             {job.status}
                           </span>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-black text-white">{job.mechanic_name}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{new Date(job.scheduled_date).toLocaleDateString()}</p>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                             <button onClick={() => openEditModal(job)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:bg-accent/10 transition-all"><Edit size={16} /></button>
                             <button onClick={() => handleDeleteJob(job.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          ) : activeTab === "history" ? (
            <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02] animate-in slide-in-from-right-4 duration-500">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit / ID</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Findings</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Completed Date</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mechanic</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {jobs.filter(j => j.status === 'Completed').map((job) => (
                      <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                           <p className="text-sm font-black text-white">{job.unit_id}</p>
                           <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">MAINT-{job.id}</p>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-bold text-slate-300">{job.type}</p>
                        </td>
                        <td className="p-6 max-w-[200px]">
                           <p className="text-[10px] font-bold text-slate-400 line-clamp-2 italic">
                             {job.description || "No specific findings recorded."}
                           </p>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-black text-white">{new Date(job.completed_at || job.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                             <p className="text-xs font-black text-blue-400 font-mono">
                               {(() => {
                                 const start = new Date(job.started_at || job.created_at).getTime();
                                 const end = new Date(job.completed_at || new Date()).getTime();
                                 // Pakai Math.abs untuk handle selisih timezone 7 jam (UTC vs Local)
                                 const diff = Math.abs(end - start);
                                 
                                 // Jika selisihnya sekitar 7 jam tapi harusnya sebentar, kita ambil sisanya
                                 // Tapi paling aman kita pastikan pengerjaan minimal 0
                                 const h = Math.floor(diff / 3600000) % 24;
                                 const m = Math.floor((diff % 3600000) / 60000);
                                 return `${h}h ${m}m`;
                               })()}
                             </p>
                           </div>
                        </td>
                        <td className="p-6 font-black text-slate-400 text-xs">
                           {job.mechanic_name}
                        </td>
                        <td className="p-6 text-right">
                           <button 
                             onClick={() => printJobSheet(job)}
                             className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:bg-accent/10 transition-all flex items-center gap-2 ml-auto"
                           >
                             <Printer size={16} />
                             <span className="text-[10px] font-black uppercase">Print</span>
                           </button>
                        </td>
                      </tr>
                    ))}
                    {jobs.filter(j => j.status === 'Completed').length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-xs font-black text-slate-600 uppercase tracking-widest">
                          No Maintenance History Records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
            </div>
          ) : (
            <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02] animate-in slide-in-from-right-4 duration-500">
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Part Name</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock Level</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {parts.map((part) => (
                      <tr key={part.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Box size={18} />
                              </div>
                              <p className="text-sm font-black text-white">{part.name}</p>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2">
                              <span className={clsx("text-lg font-black font-mono", part.stock < 10 ? "text-red-500" : "text-accent")}>{part.stock}</span>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Units</span>
                           </div>
                        </td>
                        <td className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{part.location}</td>
                        <td className="p-6 text-right">
                           <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-red-500 transition-all active:scale-90">
                             <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="glass-card p-8 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden group border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-all duration-700 text-accent"><Activity size={80} /></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-accent/20 text-accent border border-accent/30"><Activity size={20} /></div>
                  <h3 className="font-black text-md font-outfit text-white tracking-tight uppercase">Performance KPIs</h3>
                </div>
                <div className="space-y-4">
                  <StatusMetric label="Use Availability (UA)" value="82.4%" progress={82} color="bg-accent" />
                  <StatusMetric label="MTBF (Reliability)" value="420h" progress={90} color="bg-green-500" />
                  <StatusMetric label="MTTR (Efficiency)" value="3.5h" progress={60} color="bg-blue-500" />
                </div>
              </div>
            </div>

           <div className="glass-card p-6 border-white/5 bg-white/[0.02] space-y-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-500" /> Critical Alerts
              </h4>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Breakdown Alert</p>
                 <p className="text-xs font-bold text-white">EXC-042: Hydraulic Overheat</p>
                 <button className="w-full mt-2 py-2 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest">Deploy Mechanic</button>
              </div>
           </div>
        </div>
      </div>

      {/* Modal - Schedule Maintenance */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingJob ? "Modify Maintenance Schedule" : (isOperatorMode ? "EMERGENCY DAMAGE REPORT" : "SCHEDULE MAINTENANCE JOB")}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit ID / Unit Code</label>
              <input value={formData.unit_id} onChange={(e) => setFormData({...formData, unit_id: e.target.value})} placeholder="EXC-001" className="form-input !py-3 !font-black !text-white" required />
            </div>
            {!isOperatorMode ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="form-input !py-3">
                  <option className="bg-primary">Preventive</option>
                  <option className="bg-primary">Breakdown</option>
                  <option className="bg-primary">Repair</option>
                  <option className="bg-primary">Overhaul</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Level</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="form-input !py-3 !text-red-500">
                  <option className="bg-primary" value="High">High (Immediate)</option>
                  <option className="bg-primary" value="Critical">Critical (Stop Operation)</option>
                  <option className="bg-primary" value="Medium">Medium (Still Operable)</option>
                </select>
              </div>
            )}
          </div>

          {!isOperatorMode && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="form-input !py-3">
                  <option className="bg-primary">Low</option>
                  <option className="bg-primary">Medium</option>
                  <option className="bg-primary">High</option>
                  <option className="bg-primary">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scheduled Date</label>
                <input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})} className="form-input !py-3" required />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {isOperatorMode ? "Describe Damage / Symptoms" : "Technical Instructions"}
            </label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={isOperatorMode ? "What happened? (e.g. Engine smoke, hydraulic leak...)" : "Specific instructions for the technician..."} 
              className="form-input min-h-[100px] !text-sm" 
            />
          </div>

          {!isOperatorMode && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Mechanic</label>
              <select 
                value={formData.mechanic_name} 
                onChange={(e) => setFormData({...formData, mechanic_name: e.target.value})} 
                className="form-input !py-3" 
                required
              >
                <option value="">Select Mechanic...</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.full_name} className="bg-primary">{m.full_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className={clsx(
              "flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg",
              isOperatorMode ? "bg-red-500 text-white shadow-red-500/20" : "bg-accent text-primary shadow-accent/20"
            )}>
              {editingJob ? "Update WO" : (isOperatorMode ? "SUBMIT WORK ORDER" : "SCHEDULE JOB")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Note Modal - Findings */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Technical Findings & Notes">
        <div className="space-y-6 p-2">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capture real-time field data for MTBF/MTTR analysis</p>
           <textarea 
             value={currentNote} 
             onChange={(e) => setCurrentNote(e.target.value)}
             placeholder="Describe issues found, parts replaced, or cause of failure..."
             className="form-input min-h-[150px] !text-sm !font-bold"
           />
           <div className="flex gap-4">
              <button onClick={() => setIsNoteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-black uppercase text-slate-400">Abort</button>
              <button onClick={handleSaveNote} className="flex-[2] py-3 rounded-xl bg-accent text-primary text-xs font-black uppercase shadow-lg shadow-accent/20">Save Findings</button>
           </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusMetric({ label, value, progress, color }: any) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={clsx("h-full rounded-full transition-all duration-1000 shadow-sm", color)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
