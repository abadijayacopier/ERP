"use client";

import React, { useState, useEffect } from "react";
import { 
  Printer, 
  MessageCircle, 
  Cloud, 
  ShieldCheck, 
  Activity, 
  Settings as SettingsIcon, 
  Layout, 
  Bot, 
  Terminal,
  Users,
  Edit,
  Globe,
  DollarSign,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Plus,
  Trash2,
  X,
  Save,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Database
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast } from "@/components/UIFeedback";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { showConfirm, showAlert } from "@/lib/swal";

export default function SettingsPage() {
  const { language, setLanguage, currency, setCurrency, theme, setTheme, companyInfo, setCompanyInfo, t } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState("Users");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Personnel Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    username: "",
    full_name: "",
    role: "TECHNICIAN",
    department: "SITE OPERATIONS",
    is_active: 1
  });

  const [systemStats, setSystemStats] = useState({
    dbLatency: "12ms",
    serverUtil: 34,
    apiUptime: 99.9,
    version: "v2.4.0-pro-max"
  });

  const MOCK_USERS = [
    { id: 1, username: 'adi_rahman', full_name: 'Adi Rahman Samari', role: 'ADMIN', department: 'MANAGEMENT', is_active: 1 },
    { id: 2, username: 'budi_ops', full_name: 'Budi Santoso', role: 'EXECUTIVE', department: 'SITE OPERATIONS', is_active: 1 },
    { id: 3, username: 'agus_fix', full_name: 'Agus Mekanik', role: 'TECHNICIAN', department: 'MAINTENANCE', is_active: 1 },
    { id: 4, username: 'siti_hse', full_name: 'Siti Safety', role: 'HSE', department: 'SAFETY', is_active: 1 }
  ];

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        dbLatency: `${Math.floor(Math.random() * 5) + 10}ms`,
        serverUtil: Math.floor(Math.random() * 10) + 30
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest('users');
      if (data && data.length > 0) setUsers(data);
      else setUsers(MOCK_USERS);
    } catch (err) {
      setUsers(MOCK_USERS);
    }
  };

  // CRUD Handlers
  const openAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      username: "",
      full_name: "",
      role: "TECHNICIAN",
      department: "SITE OPERATIONS",
      is_active: 1
    });
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      department: user.department || "SITE OPERATIONS",
      is_active: user.is_active
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    const result = await showConfirm(
      "Purge Personnel?",
      "This action will permanently remove the personnel from the digital directory."
    );

    if (result.isConfirmed) {
      setUsers(users.filter(u => u.id !== id));
      showAlert("Purged!", "Personnel record has been removed.", "success");
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
      showAlert("Updated!", `Personnel ${userFormData.full_name} record has been updated.`, "success");
    } else {
      const newUser = { ...userFormData, id: Date.now() };
      setUsers([newUser, ...users]);
      showAlert("Enrolled!", `New personnel ${userFormData.full_name} has been registered.`, "success");
    }
    setIsUserModalOpen(false);
  };

  const handleSaveCompany = async () => {
    try {
      setLoading(true);
      await apiRequest('settings/company', 'POST', companyInfo);
      showAlert("Identity Secured!", "Company profile has been synchronized with the database and all reports.", "success");
    } catch (err: any) {
      showAlert("Sync Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "Users", icon: Users, label: t('users') },
    { id: "Company", icon: Globe, label: "Company Profile" },
    { id: "Appearance", icon: Palette, label: t('theme') },
    { id: "Security", icon: ShieldCheck, label: "Security" },
    { id: "Integrations", icon: Terminal, label: "Integrations" },
  ];

  // Search & Filter Logic
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {showToast && (
        <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Control Center</span>
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight">Console <span className="text-slate-500">&</span> Control</h1>
        </div>

        <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300",
                activeTab === tab.id ? "bg-accent text-primary font-black" : "text-slate-400 font-bold hover:text-white"
              )}
            >
              <tab.icon size={18} />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {activeTab === "Users" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-accent/20 text-accent"><Users size={24} /></div>
                  <h3 className="text-xl font-black font-outfit text-white">Personnel Directory</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                      <Layout size={14} className="rotate-90" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Search Personnel..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all uppercase tracking-widest w-64"
                    />
                  </div>
                  <button 
                    onClick={openAddUser}
                    className="px-6 py-3 rounded-2xl bg-accent text-primary font-black text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    <UserPlus size={16} />
                    ADD PERSONNEL
                  </button>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-white/[0.02]">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center font-black text-accent text-xs">
                              {user.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">{user.full_name}</p>
                              <p className="text-[10px] font-bold text-slate-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1.5 rounded-full text-[9px] font-black bg-accent/10 border border-accent/20 text-accent uppercase">{user.role}</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                             <button onClick={() => openEditUser(user)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-accent hover:bg-accent/10 transition-all"><Edit size={16} /></button>
                             <button onClick={() => handleDeleteUser(user.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* PAGINATION UI */}
                <div className="p-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/[0.01]">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Record <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-white">{filteredUsers.length}</span> Active Personnel
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={clsx(
                            "w-10 h-10 rounded-xl text-[10px] font-black transition-all border",
                            currentPage === page 
                              ? "bg-accent text-primary border-accent shadow-lg shadow-accent/20" 
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
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Company" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
               <div className="glass-card p-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-accent/20 text-accent"><Globe size={32} /></div>
                    <div>
                      <h3 className="text-2xl font-black font-outfit text-white">Company Identity</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Global branding & contact information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization Name</label>
                      <input 
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        className="form-input !text-xl !font-black !text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Email</label>
                      <input 
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                        className="form-input"
                        placeholder="ops@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Website</label>
                      <input 
                        value={companyInfo.website}
                        onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                        className="form-input"
                        placeholder="www.company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Support Line</label>
                      <input 
                        value={companyInfo.phone}
                        onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                        className="form-input"
                        placeholder="+62 ..."
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Headquarters Address</label>
                      <textarea 
                        value={companyInfo.address}
                        onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                        className="form-input min-h-[100px]"
                        placeholder="Full legal address..."
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleSaveCompany}
                      disabled={loading}
                      className="px-10 py-4 rounded-2xl bg-accent text-primary font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 flex items-center gap-3 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {loading ? "SYNCING..." : "SAVE IDENTITY"}
                    </button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Language Card */}
                  <div className="glass-card p-8 space-y-6">
                     <div className="flex items-center gap-3">
                        <Globe className="text-accent" />
                        <h3 className="font-black font-outfit text-white uppercase tracking-tight">{t('language')}</h3>
                     </div>
                     <div className="space-y-2">
                        <PreferenceItem label={t('indonesian')} active={language === 'id'} onClick={() => setLanguage('id')} />
                        <PreferenceItem label={t('english')} active={language === 'en'} onClick={() => setLanguage('en')} />
                     </div>
                  </div>

                  {/* Currency Card */}
                  <div className="glass-card p-8 space-y-6">
                     <div className="flex items-center gap-3">
                        <DollarSign className="text-accent" />
                        <h3 className="font-black font-outfit text-white uppercase tracking-tight">{t('currency')}</h3>
                     </div>
                     <div className="space-y-2">
                        <PreferenceItem label="Rupiah (IDR)" active={currency === 'IDR'} onClick={() => setCurrency('IDR')} />
                        <PreferenceItem label="US Dollar (USD)" active={currency === 'USD'} onClick={() => setCurrency('USD')} />
                     </div>
                  </div>
               </div>

               {/* Theme Card */}
               <div className="glass-card p-8 space-y-8">
                  <div className="flex items-center gap-3">
                     <Palette className="text-accent" />
                     <h3 className="font-black font-outfit text-white uppercase tracking-tight">{t('theme')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <ThemeItem 
                       icon={Sun} 
                       label={t('light')} 
                       active={theme === 'light'} 
                       onClick={() => setTheme('light')} 
                       desc="Crisp pearl white interface"
                     />
                     <ThemeItem 
                       icon={Moon} 
                       label={t('dark')} 
                       active={theme === 'dark'} 
                       onClick={() => setTheme('dark')} 
                       desc="Obsidian depth for focus"
                     />
                     <ThemeItem 
                       icon={Monitor} 
                       label={t('system')} 
                       active={theme === 'system'} 
                       onClick={() => setTheme('system')} 
                       desc="Follow device settings"
                     />
                  </div>
               </div>
            </div>
          )}

          {activeTab === "Security" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                <IntegrationCard title="Security" description="AES-256" icon={ShieldCheck} status="SECURE" statusColor="text-slate-400">
                   <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                     <span className="text-[10px] font-black text-slate-400 uppercase">2FA Protection</span>
                     <div className="w-10 h-5 bg-accent/20 rounded-full relative p-1"><div className="w-3 h-3 bg-accent rounded-full translate-x-5"></div></div>
                   </div>
                </IntegrationCard>
             </div>
          )}

          {activeTab === "Integrations" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                <IntegrationCard title="Printer" description="DOT MATRIX LPT1" icon={Printer} status="CONNECTED" statusColor="text-green-400">
                   <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase">Test Print</button>
                </IntegrationCard>
                <IntegrationCard title="WhatsApp" description="AUTO ALERTS" icon={MessageCircle} status="STANDBY" statusColor="text-orange-400">
                   <input type="password" placeholder="API Key" className="form-input !py-2 text-xs w-full" />
                </IntegrationCard>
             </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Activity size={120} /></div>
            <div className="relative z-10 space-y-8">
              <h3 className="font-black text-lg font-outfit text-white tracking-tight">System Status</h3>
              <div className="space-y-6">
                <StatusRow label="Latency" value={systemStats.dbLatency} progress={20} color="bg-green-500" />
                <StatusRow label="Util" value={`${systemStats.serverUtil}%`} progress={systemStats.serverUtil} color="bg-blue-500" />
              </div>
              <div className="pt-4 border-t border-white/5 space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Live Site Activity</p>
                   <div className="space-y-3">
                      <ActivityEvent icon={ShieldCheck} label="Firewall Active" time="NOW" color="text-emerald-500" />
                      <ActivityEvent icon={Users} label="Personnel Sync" time="2m ago" color="text-blue-500" />
                      <ActivityEvent icon={Database} label="Logistics Backup" time="14m ago" color="text-slate-500" />
                   </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-[9px] text-slate-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-20"><Terminal size={14} /></div>
                    <p className="text-accent font-black mb-1 tracking-tighter">SITE_ID: ABADIJAYA-S-001</p>
                    <p className="truncate">AUTH_TOKEN: 7fb...91a2</p>
                    <p className="text-[8px] mt-2 opacity-40">SYSTEM READY: ALL MODULES NOMINAL</p>
                 </div>

                 <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Build Version: {systemStats.version}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Management Modal */}
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        title={editingUser ? "Modify Personnel Data" : "New Personnel Enrollment"}
      >
        <form onSubmit={handleSaveUser} className="space-y-6 p-2">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Identification Name</label>
             <input 
               value={userFormData.full_name} 
               onChange={(e) => setUserFormData({...userFormData, full_name: e.target.value})} 
               placeholder="e.g. John Doe" 
               className="form-input !text-lg !font-black !text-white" 
               required 
             />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Username</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-black">@</span>
                   <input 
                     value={userFormData.username} 
                     onChange={(e) => setUserFormData({...userFormData, username: e.target.value})} 
                     placeholder="username" 
                     className="form-input !pl-8 !text-sm" 
                     required 
                   />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Role</label>
                <select 
                  value={userFormData.role} 
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})} 
                  className="form-input !text-xs font-black"
                >
                   <option value="ADMIN">ADMIN</option>
                   <option value="EXECUTIVE">EXECUTIVE</option>
                   <option value="OPERATOR">OPERATOR</option>
                   <option value="TECHNICIAN">TECHNICIAN</option>
                   <option value="HSE">HSE OFFICER</option>
                </select>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Department</label>
             <input 
               value={userFormData.department} 
               onChange={(e) => setUserFormData({...userFormData, department: e.target.value})} 
               placeholder="e.g. MAINTENANCE" 
               className="form-input !text-sm" 
               required 
             />
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/5">
             <button 
               type="button" 
               onClick={() => setIsUserModalOpen(false)} 
               className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-slate-400 font-black text-xs hover:bg-white/5 transition-all"
             >
               ABORT
             </button>
             <button 
               type="submit" 
               className="flex-[2] px-6 py-4 rounded-2xl bg-accent text-primary font-black text-xs hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-3"
             >
               <Save size={18}/>
               {editingUser ? "UPDATE RECORD" : "INITIALIZE PERSONNEL"}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PreferenceItem({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
        active ? "bg-accent/10 border-accent/30 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
      )}
    >
      <span className="text-sm font-bold">{label}</span>
      {active && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-primary"><Check size={12} /></div>}
    </button>
  );
}

function ThemeItem({ icon: Icon, label, active, onClick, desc }: any) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "flex-1 flex flex-col items-center gap-4 p-8 rounded-3xl border transition-all duration-500",
        active ? "bg-accent/10 border-accent/30 shadow-xl shadow-accent/10" : "bg-white/5 border-white/5 hover:bg-white/10"
      )}
    >
      <div className={clsx("p-4 rounded-2xl transition-all", active ? "bg-accent text-primary shadow-lg" : "bg-white/5 text-slate-500")}>
        <Icon size={28} />
      </div>
      <div className="text-center">
        <p className={clsx("text-sm font-black uppercase tracking-widest", active ? "text-white" : "text-slate-400")}>{label}</p>
        <p className="text-[10px] font-bold text-slate-600 mt-1">{desc}</p>
      </div>
    </button>
  );
}

function IntegrationCard({ title, description, icon: Icon, status, statusColor, children }: any) {
  return (
    <div className="glass-card p-8 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10"><Icon size={24} /></div>
        <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase", statusColor)}>
          <div className={clsx("w-1.5 h-1.5 rounded-full", statusColor.replace('text-', 'bg-'))}></div>
          {status}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-black font-outfit text-white tracking-tight">{title}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase mt-1">{description}</p>
      </div>
      <div className="pt-4 border-t border-white/5">{children}</div>
    </div>
  );
}

function StatusRow({ label, value, progress, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
        <span className="text-xs font-black text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={clsx("h-full rounded-full", color)} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function ActivityEvent({ icon: Icon, label, time, color }: any) {
  return (
    <div className="flex items-center justify-between group/event">
       <div className="flex items-center gap-3">
          <div className={clsx("p-1.5 rounded-lg bg-white/5 transition-colors group-hover/event:bg-white/10", color)}>
             <Icon size={12} />
          </div>
          <span className="text-[10px] font-bold text-slate-300 group-hover/event:text-white transition-colors">{label}</span>
       </div>
       <span className="text-[9px] font-black text-slate-600 italic tracking-widest">{time}</span>
    </div>
  );
}
