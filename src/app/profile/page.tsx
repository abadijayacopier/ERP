"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Shield, 
  Mail, 
  Phone, 
  Briefcase, 
  Hash, 
  Calendar, 
  Lock, 
  Key, 
  Activity,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { clsx } from "clsx";
import { Toast } from "@/components/UIFeedback";

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<"Details" | "Security" | "Activity">("Details");
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [user, setUser] = useState({
    full_name: "Abadijaya Dev",
    email: "abadijaya@mine-erp.pro",
    phone: "+62 811 5555 9999",
    role: "Site Manager",
    employee_id: "EMP-SITE-2024-001",
    department: "Operations",
    joined_date: "Jan 12, 2024"
  });

  const handleSave = () => {
    setShowToast({ msg: "Profile saved successfully!", type: "success" });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      {/* Header Profile */}
      <div className="relative h-64 w-full rounded-[3rem] overflow-hidden group border border-white/10">
         {/* Cover Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-accent via-indigo-600 to-purple-800 opacity-80 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
         
         <div className="absolute bottom-0 left-0 w-full p-10 flex flex-col md:flex-row items-end gap-8 translate-y-4">
            <div className="relative group/avatar">
               <div className="w-40 h-40 rounded-[2.5rem] bg-[#0b0f1a] border-8 border-[#0b0f1a] shadow-2xl overflow-hidden relative z-10 transition-transform duration-500 group-hover/avatar:scale-105">
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent font-black text-5xl font-outfit">
                    AD
                  </div>
               </div>
               <button className="absolute bottom-2 right-2 z-20 p-3 rounded-2xl bg-accent text-primary shadow-xl hover:scale-110 transition-all opacity-0 group-hover/avatar:opacity-100">
                  <Camera size={20} />
               </button>
            </div>
            
            <div className="flex-1 pb-4">
               <h1 className="text-4xl font-black text-white font-outfit tracking-tighter drop-shadow-lg">{user.full_name}</h1>
               <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                     <Shield size={14} className="text-accent" />
                     <span className="text-xs font-black text-white uppercase tracking-widest">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                     <Hash size={14} className="text-slate-300" />
                     <span className="text-xs font-bold text-white uppercase tracking-widest">{user.employee_id}</span>
                  </div>
               </div>
            </div>

            <button onClick={handleSave} className="btn-premium flex items-center gap-2 mb-4">
               <Save size={18} />
               <span>Save Changes</span>
            </button>
         </div>
      </div>

      {/* Tabs Control */}
      <div className="flex justify-center">
         <div className="bg-white/5 p-1.5 rounded-3xl border border-white/10 flex gap-2">
            {(["Details", "Security", "Activity"] as const).map((section) => (
              <button 
                key={section}
                onClick={() => setActiveSection(section)}
                className={clsx(
                  "px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all",
                  activeSection === section ? "bg-accent text-primary shadow-xl shadow-accent/20" : "text-slate-500 hover:text-white"
                )}
              >
                {section}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Left Side: Detail Cards */}
         <div className="lg:col-span-8 space-y-8">
            {activeSection === "Details" && (
               <div className="glass-card p-10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <h3 className="md:col-span-2 text-xl font-bold text-white mb-2 font-outfit border-b border-white/5 pb-4">Personal Information</h3>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} /> Full Legal Name
                     </label>
                     <input value={user.full_name} onChange={(e) => setUser({...user, full_name: e.target.value})} className="form-input" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} /> Work Email Address
                     </label>
                     <input value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} className="form-input" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} /> Secure Phone Number
                     </label>
                     <input value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} className="form-input" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={12} /> Primary Department
                     </label>
                     <input value={user.department} readOnly className="form-input opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Employment Tenure
                     </label>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold">
                        Member since {user.joined_date} (Active Operative)
                     </div>
                  </div>
               </div>
            )}

            {activeSection === "Security" && (
               <div className="glass-card p-10 space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div>
                     <h3 className="text-xl font-bold text-white mb-2 font-outfit">Security Credentials</h3>
                     <p className="text-xs text-slate-500">Ensure your account is protected with enterprise-grade security</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 group hover:border-accent/30 transition-all">
                           <div className="flex justify-between items-center mb-6">
                              <div className="p-3 rounded-xl bg-accent/10 text-accent"><Lock size={20} /></div>
                              <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">ACTIVE</span>
                           </div>
                           <h4 className="text-sm font-bold text-white mb-2">Two-Factor Auth</h4>
                           <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tight">Security level: Very High. Your identity is verified via mobile token.</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Keyphrase</label>
                           <div className="relative">
                              <input type="password" value="********" readOnly className="form-input pr-12" />
                              <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Security Key</label>
                           <input type="password" placeholder="Enter new password" className="form-input" />
                        </div>
                        <button className="w-full py-4 rounded-2xl bg-white/5 border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">
                           Synchronize New Key
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {activeSection === "Activity" && (
               <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="p-8 border-b border-white/10 bg-white/5">
                     <h3 className="text-xl font-bold text-white font-outfit">Personal Audit Trail</h3>
                     <p className="text-xs text-slate-500">Logs of your interactions with the ERP system</p>
                  </div>
                  <div className="p-8">
                     <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                        <ActivityItem action="Updated Fuel Stock" time="2 hours ago" module="Logistics" detail="Added 5,000L to Main Site Tank" />
                        <ActivityItem action="Registered New Fleet" time="Yesterday" module="Fleet" detail="Created entry for EXC-205 Komatsu" />
                        <ActivityItem action="Generated Invoice" time="2 days ago" module="Billing" detail="Issued INV-2024-089 to client" />
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Right Side: Quick Info */}
         <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
               <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-accent" size={16} /> Account Health
               </h4>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Status</span>
                     <span className="text-xs font-bold text-emerald-500">100% Complete</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[100%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="flex items-start gap-3">
                        <AlertCircle className="text-accent shrink-0 mt-0.5" size={14} />
                        <p className="text-[10px] text-slate-400 leading-relaxed">Your account is fully verified. No further action is required at this time.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 group">
               <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Device Auth</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent/30 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Activity size={18} /></div>
                        <div>
                           <div className="text-xs font-bold text-white">Windows Desktop</div>
                           <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Current Session</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ActivityItem({ action, time, module, detail }: any) {
  return (
    <div className="relative pl-12 group">
       <div className="absolute left-3 top-1.5 w-4 h-4 rounded-full bg-[#0b0f1a] border-2 border-accent z-10 transition-transform group-hover:scale-125"></div>
       <div className="flex justify-between items-start mb-1">
          <span className="text-sm font-bold text-white">{action}</span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{time}</span>
       </div>
       <div className="text-[10px] font-black text-accent uppercase tracking-tighter mb-1">{module}</div>
       <p className="text-xs text-slate-400 leading-relaxed">{detail}</p>
    </div>
  );
}
