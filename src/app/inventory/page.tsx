"use client";

import React, { useState, useEffect } from "react";
import { 
  Droplets, 
  Package, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight,
  AlertTriangle,
  Trash2,
  Settings,
  Database,
  ShieldAlert,
  ChevronRight,
  Eye,
  Pencil,
  Warehouse,
  Zap,
  BarChart3,
  Box,
  Truck,
  Flame,
  QrCode
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast } from "@/components/UIFeedback";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// MOCK DATA FOR INVENTORY
const MOCK_ITEMS = [
  { id: 1, name: 'Solar B35 (High Speed Diesel)', category: 'Fuel', stock: 45000, min_stock: 15000, unit: 'Liters', location: 'Tank Farm Zone A', type: 'General' },
  { id: 2, name: 'Lubricant Shell Tellus S2 V46', category: 'Oil', stock: 850, min_stock: 1000, unit: 'Liters', location: 'Lube Store', type: 'General' },
  { id: 3, name: 'Tire Michelin 27.00R49', category: 'Tires', stock: 12, min_stock: 4, unit: 'Units', location: 'Tire Bay 2', type: 'Sparepart' },
  { id: 4, name: 'Oil Filter CAT 1R-0749', category: 'Filters', stock: 45, min_stock: 100, unit: 'Pcs', location: 'Main Warehouse B4', type: 'Sparepart' },
  { id: 5, name: 'Hydraulic Hose 1/2" R2AT', category: 'Hoses', stock: 150, min_stock: 50, unit: 'Meters', location: 'Hose Workshop', type: 'Sparepart' }
];

export default function InventoryPage() {
  const { t } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState<"General" | "Sparepart">("General");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [formData, setFormData] = useState({
    item_name: "",
    category: "Fuel",
    stock_quantity: 0,
    unit: "Liters",
    min_stock_level: 0,
    location: ""
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('inventory');
      if (data && data.length > 0) {
        setItems(data.filter((i: any) => i.type === activeTab));
      } else {
        setItems(MOCK_ITEMS.filter(i => i.type === activeTab));
      }
    } catch (err: any) {
      setItems(MOCK_ITEMS.filter(i => i.type === activeTab));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeTab]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { ...formData, id: Date.now(), stock: formData.stock_quantity, min_stock: formData.min_stock_level, name: formData.item_name, type: activeTab };
    setItems([newItem, ...items]);
    setShowToast({ msg: "Resource Catalog Updated", type: "success" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('logistics_intelligence')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('digital')} <span className="text-slate-600">{t('warehouse')}</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">{t('inventory_monitoring')}</p>
        </div>

        <div className="flex gap-4 p-1.5 bg-white/5 border border-white/10 rounded-3xl w-full xl:w-auto">
          <button 
            onClick={() => setActiveTab("General")}
            className={clsx(
              "flex-1 xl:flex-none px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 tracking-widest",
              activeTab === "General" ? "bg-accent text-primary shadow-xl" : "text-slate-500 hover:text-white"
            )}
          >
            <Flame size={16}/> BULK RESOURCE
          </button>
          <button 
            onClick={() => setActiveTab("Sparepart")}
            className={clsx(
              "flex-1 xl:flex-none px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 tracking-widest",
              activeTab === "Sparepart" ? "bg-accent text-primary shadow-xl" : "text-slate-500 hover:text-white"
            )}
          >
            <Settings size={16}/> MECHANICAL PARTS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InventoryStat label="Category Value" value={items.length.toString()} unit="SKU" icon={Database} color="text-blue-400" />
        <InventoryStat label="Critical Alerts" value={items.filter(i => i.stock <= i.min_stock).length.toString()} unit="LOW" icon={ShieldAlert} color="text-red-400" pulse />
        <div className="glass-card p-10 bg-accent/5 border-accent/20 flex flex-col justify-between group overflow-hidden relative">
           <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform"><Warehouse size={100}/></div>
           <div className="flex justify-between items-start relative z-10">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">Inventory Ops</span>
              <button onClick={() => setIsModalOpen(true)} className="p-3 bg-accent text-primary rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-accent/20">
                <Plus size={24} />
              </button>
           </div>
           <div className="mt-4 relative z-10">
              <div className="text-2xl font-black text-white font-outfit tracking-tight">Register New SKU</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Add assets to digital registry</p>
           </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
        <div className="p-8 border-b border-white/5 bg-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400">
                 <Box size={24} />
              </div>
              <div>
                 <h3 className="font-black text-xl font-outfit text-white uppercase tracking-tight">{activeTab} Inventory</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Stock Availability Status</p>
              </div>
           </div>
           <div className="relative w-full md:w-96 group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/search:text-accent transition-colors" size={18} />
            <input type="text" placeholder={`Search ${activeTab.toLowerCase()} stock...`} className="form-input !py-3.5 !pl-12 !bg-white/5 !border-white/10 !text-sm" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Inventory</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Safety Threshold</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bin Location</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-24 text-center animate-pulse font-black text-slate-700 uppercase tracking-[0.4em] text-xs">Synchronizing Warehouse Data...</td></tr>
              ) : items.map((item) => {
                const isLow = item.stock <= item.min_stock;
                const percent = Math.min(100, (item.stock / (item.min_stock * 2.5)) * 100);
                
                return (
                  <tr key={item.id} className={clsx("group transition-all", isLow ? "bg-red-500/[0.02] hover:bg-red-500/[0.04]" : "hover:bg-white/[0.03]")}>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                         <div className={clsx(
                           "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                           isLow ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-slate-400 group-hover:text-accent"
                         )}>
                           {activeTab === 'General' ? <Droplets size={22} /> : <Package size={22} />}
                         </div>
                         <div>
                            <p className="text-base font-black text-white group-hover:text-accent transition-colors">{item.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{item.category}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="w-full max-w-[200px] space-y-3">
                          <div className="flex justify-between items-end">
                             <span className={clsx("text-2xl font-black font-outfit tracking-tighter", isLow ? "text-red-400" : "text-white")}>
                               {item.stock.toLocaleString()}
                             </span>
                             <span className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded">{item.unit}</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                             <div 
                               className={clsx("h-full rounded-full transition-all duration-1000", isLow ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/40" : "bg-accent")} 
                               style={{width: `${percent}%`}}
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-3">
                          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-slate-300 font-mono">
                             {item.min_stock.toLocaleString()}
                          </div>
                          {isLow && <span className="text-[8px] font-black bg-red-500 text-white px-2 py-1 rounded shadow-lg shadow-red-500/20 uppercase tracking-widest animate-bounce">Low Stock</span>}
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                             <QrCode size={14} className="text-slate-600" />
                          </div>
                          {item.location}
                       </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-accent hover:bg-accent/10 transition-all"><Eye size={16}/></button>
                          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"><Pencil size={16}/></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Register ${activeTab} Resource`}>
        <form onSubmit={handleAddItem} className="space-y-8 p-2">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Name / Nomenclature</label>
              <input value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} placeholder="Full technical name..." className="form-input !text-lg !font-black !text-white" required />
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                 <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="form-input">
                    {activeTab === "General" ? (
                      <>
                        <option>Fuel</option>
                        <option>Oil & Lube</option>
                        <option>Explosive</option>
                        <option>PPE</option>
                      </>
                    ) : (
                      <>
                        <option>Filters</option>
                        <option>Tires</option>
                        <option>Engine Parts</option>
                        <option>Transmission</option>
                        <option>Hoses</option>
                      </>
                    )}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Measurement Unit</label>
                 <input value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="Liters, Pcs, etc." className="form-input" required />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Quantity</label>
                 <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: parseFloat(e.target.value)})} className="form-input" required />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Safety Stock Limit</label>
                 <input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: parseFloat(e.target.value)})} className="form-input" required />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bin Location / Warehouse Zone</label>
              <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. WH-01 Bin A-4" className="form-input" required />
           </div>
           <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-white font-black text-sm hover:bg-white/5 transition-all">DISCARD</button>
              <button type="submit" className="flex-[2] px-8 py-5 rounded-2xl bg-accent text-primary font-black text-sm hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-3">
                 <Zap size={20}/> COMMIT TO STOCK
              </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}

function InventoryStat({ label, value, unit, icon: Icon, color, pulse }: any) {
  return (
    <div className="glass-card p-10 flex flex-col gap-6 group hover:border-white/20 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110"><Icon size={100} /></div>
      <div className="flex justify-between items-start">
        <div className={clsx("p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl", color)}>
          <Icon size={28} />
        </div>
        <ArrowUpRight size={20} className="text-slate-700 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="flex items-baseline gap-3">
           <span className={clsx("text-5xl font-black text-white font-outfit tracking-tighter leading-none", pulse && "animate-pulse")}>{value}</span>
           <span className="text-[10px] font-black text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded">{unit}</span>
        </div>
      </div>
    </div>
  );
}
