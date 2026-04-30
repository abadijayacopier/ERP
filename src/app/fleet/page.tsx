"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Settings, 
  MapPin, 
  User, 
  Fuel as FuelIcon, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight,
  MoreVertical,
  Trash2,
  RefreshCw,
  Activity,
  Zap,
  ShieldAlert,
  Droplets,
  Gauge,
  ArrowUpRight,
  Eye,
  Pencil,
  Printer,
  Compass,
  Navigation
} from "lucide-react";
import { clsx } from "clsx";
import { Modal, Toast } from "@/components/UIFeedback";
import { showAlert } from "@/lib/swal";
import { apiRequest } from "@/lib/api-client";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

// MOCK DATA FOR FLEET TELEMETRY
const MOCK_FLEET = [
  { id: 1, unit_id: 'EXC-301', unit_type: 'Excavator', model: 'Komatsu PC2000-8', status: 'Running', operator_name: 'Adi Rahman', location: 'PIT A North', fuel_level: 85, hm: 12450.5 },
  { id: 2, unit_id: 'DT-505', unit_type: 'Dump Truck', model: 'CAT 777D', status: 'Running', operator_name: 'Budi Santoso', location: 'PIT B South', fuel_level: 42, hm: 8200.2 },
  { id: 3, unit_id: 'DZ-102', unit_type: 'Bulldozer', model: 'CAT D10T', status: 'Standby', operator_name: 'Agus Mekanik', location: 'ROM Stockpile', fuel_level: 95, hm: 15600.8 },
  { id: 4, unit_id: 'EXC-208', unit_type: 'Excavator', model: 'Hitachi EX1200', status: 'Breakdown', operator_name: 'Unassigned', location: 'Workshop Main', fuel_level: 15, hm: 5400.0 },
  { id: 5, unit_id: 'DT-508', unit_type: 'Dump Truck', model: 'CAT 777D', status: 'Running', operator_name: 'Iwan Perkasa', location: 'PIT A North', fuel_level: 12, hm: 9100.4 }
];

export default function FleetPage() {
  const { t } = useGlobalSettings();
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [showToast, setShowToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [formData, setFormData] = useState({
    unit_id: "",
    model: "",
    category: "EXCAVATOR",
    serial_number: "",
    engine_serial_number: "",
    status: "Standby",
    location: "Workshop",
    fuel_level: 100,
    hm: 0,
    fuel: 0,
    photo_url: "",
    latitude: null as number | null,
    longitude: null as number | null
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getGPSLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsGettingLocation(false);
          showAlert("Location Captured!", `Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`, "success");
        },
        (error) => {
          setIsGettingLocation(false);
          showAlert("GPS Error", "Please enable location services.", "error");
        }
      );
    } else {
      setIsGettingLocation(false);
      showAlert("Not Supported", "Browser does not support GPS.", "error");
    }
  };

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('fleet');
      if (data && data.length > 0) {
        setFleet(data);
      } else {
        setFleet(MOCK_FLEET);
      }
    } catch (err: any) {
      setFleet(MOCK_FLEET);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit = { ...formData, id: Date.now() };
    setFleet([newUnit, ...fleet]);
    setShowToast({ msg: `Unit ${formData.unit_id} Initialized`, type: "success" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-accent rounded-full"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('satellite_telemetry')}</span>
          </div>
          <h1 className="text-5xl font-black font-outfit text-white tracking-tighter leading-none">
            {t('fleet')} <span className="text-slate-600">&</span> {t('control')}
          </h1>
          <p className="text-slate-400 font-medium text-lg">{t('real_time_metrics')}</p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={fetchFleet} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={24} className={loading ? "animate-spin text-accent" : ""} />
          </button>
          <button onClick={() => { setEditingUnit(null); setIsModalOpen(true); }} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-primary font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
            <Plus size={22} />
            <span className="text-sm uppercase tracking-widest">{t('register_unit')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FleetStat label={t('running')} count={fleet.filter(f => f.status === 'Running').length} color="text-green-400" bg="bg-green-400/5" icon={Zap} />
        <FleetStat label={t('standby')} count={fleet.filter(f => f.status === 'Standby').length} color="text-yellow-400" bg="bg-yellow-400/5" icon={Clock} />
        <FleetStat label={t('breakdown')} count={fleet.filter(f => f.status === 'Breakdown').length} color="text-red-400" bg="bg-red-400/5" icon={ShieldAlert} />
        <div className="glass-card p-8 flex flex-col justify-between border-accent/20 bg-accent/10 relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform"><Activity size={100}/></div>
           <div className="flex justify-between items-start relative z-10">
             <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{t('efficiency')}</span>
             <Activity size={20} className="text-accent" />
           </div>
           <div className="mt-4 relative z-10">
              <div className="text-4xl font-black text-white font-outfit tracking-tighter">
                {fleet.length ? Math.round((fleet.filter(f => f.status === 'Running').length / fleet.length) * 100) : 0}%
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Utilization Factor</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden border-white/5 bg-white/[0.02]">
           <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400"><Navigation size={24} /></div>
                 <div>
                    <h3 className="font-black text-xl font-outfit text-white">Asset Telemetry</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Feed from Site Nodes</p>
                 </div>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="text" placeholder={t('search')} className="form-input !py-3 !pl-12 !bg-white/5 !border-white/10" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Fuel</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hour Meter (HM)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fleet.map((unit) => (
                    <tr key={unit.id} className="group hover:bg-white/[0.03] transition-all">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 overflow-hidden group-hover:border-accent/30 transition-all">
                              {unit.photo_url ? (
                                <img src={unit.photo_url} alt="unit" className="w-full h-full object-cover" />
                              ) : (
                                <Truck size={20} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-base font-black text-white font-outfit">{unit.unit_id}</p>
                                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-white/5 text-slate-400 border border-white/10 uppercase tracking-tighter">{unit.category || 'GENERAL'}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{unit.model}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col items-center gap-2">
                           <div className="text-sm font-black text-white">{unit.fuel_level}%</div>
                           <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <div className={clsx("h-full", unit.fuel_level < 20 ? "bg-red-500 animate-pulse" : "bg-accent")} style={{width: `${unit.fuel_level}%`}}></div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                          <div className="flex items-center gap-2">
                             <Gauge size={14} className="text-slate-600" />
                             <span className="text-sm font-black text-white font-mono">{Number(unit.hm || 0).toLocaleString()}</span>
                          </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
                           <MapPin size={14} className="text-slate-600" />
                           {unit.location}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setSelectedUnit(unit); setIsStickerOpen(true); }}
                             className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-accent hover:bg-accent hover:text-primary transition-all"
                             title="Print Sticker"
                           >
                             <Printer size={18}/>
                           </button>
                           <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all">
                             <ChevronRight size={18}/>
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-10 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden group border-accent/20">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Compass size={120} /></div>
             <h3 className="font-black text-xl font-outfit text-white tracking-tight mb-8">Asset Radar Map</h3>
             <div className="aspect-square bg-primary/40 border border-white/10 rounded-3xl relative overflow-hidden p-4 grid grid-cols-5 grid-rows-5 gap-2">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,170,0.05),transparent)]"></div>
             </div>
             <p className="text-[10px] text-slate-500 font-black uppercase mt-6 text-center tracking-widest animate-pulse">Live Visual Positioning Active</p>
          </div>

          <div className="glass-card p-10 bg-white/[0.02]">
             <h3 className="font-black text-xl font-outfit text-white tracking-tight mb-6">Action Quick-Sync</h3>
             <div className="space-y-3">
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"><Gauge size={16}/> Bulk HM Update</button>
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"><MapPin size={16}/> Re-Zone Fleet</button>
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-red-400"><ShieldAlert size={16}/> Emergency Stop All</button>
             </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUnit ? "Edit Fleet Unit" : "Add New Fleet Unit"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit ID</label>
              <input value={formData.unit_id} onChange={(e) => setFormData({...formData, unit_id: e.target.value})} placeholder="e.g. EXC-001" className="form-input !py-3" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model</label>
              <input value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} placeholder="e.g. PC-200" className="form-input !py-3" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="form-input !py-3">
                <option value="EXCAVATOR" className="bg-primary">EXCAVATOR</option>
                <option value="DUMP TRUCK" className="bg-primary">DUMP TRUCK</option>
                <option value="DOZER" className="bg-primary">DOZER</option>
                <option value="GRADER" className="bg-primary">GRADER</option>
                <option value="LIGHT VEHICLE" className="bg-primary">LIGHT VEHICLE</option>
                <option value="DRILL" className="bg-primary">DRILL</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Serial Number</label>
              <input value={formData.serial_number} onChange={(e) => setFormData({...formData, serial_number: e.target.value})} placeholder="Chassis S/N..." className="form-input !py-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine Serial Number</label>
              <input value={formData.engine_serial_number} onChange={(e) => setFormData({...formData, engine_serial_number: e.target.value})} placeholder="Engine S/N..." className="form-input !py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial HM</label>
              <input type="number" value={formData.hm} onChange={(e) => setFormData({...formData, hm: Number(e.target.value)})} className="form-input !py-3" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Photo</label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input value={formData.photo_url} onChange={(e) => setFormData({...formData, photo_url: e.target.value})} placeholder="Image URL..." className="form-input !py-3 mb-2" />
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-all">
                  <Plus size={14}/> Take Photo / Upload
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // In a real app, you'd upload this to a server
                      // For now, we'll just show it's selected
                      showAlert("Photo Ready", "Image captured successfully (Simulation)", "success");
                    }
                  }} />
                </label>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                {formData.photo_url ? <img src={formData.photo_url} className="w-full h-full object-cover" /> : <Truck size={24} className="text-slate-700"/>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Geotagging (GPS)</label>
            <button type="button" onClick={getGPSLocation} disabled={isGettingLocation} className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500/20 transition-all disabled:opacity-50">
              <MapPin size={16} className={isGettingLocation ? "animate-bounce" : ""}/>
              {isGettingLocation ? "Capturing Satellite..." : (formData.latitude ? `LOKASI TERKUNCI: ${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}` : "Tag GPS Location")}
            </button>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-4 rounded-2xl bg-accent text-primary font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20">
              {editingUnit ? "Update Unit" : "Add Unit"}
            </button>
          </div>
        </form>
      </Modal>

      {/* STICKER MODAL A3 LANDSCAPE */}
      <Modal isOpen={isStickerOpen} onClose={() => setIsStickerOpen(false)} title="Unit Asset Sticker (A3 Landscape)">
        <div className="space-y-6">
          <div id="sticker-print-area" className="bg-white p-8 border-4 border-black rounded-[2rem] w-full aspect-[1.414] flex flex-col justify-between text-black relative">
            {/* CORNER BORDERS */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-8 border-l-8 border-black"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-8 border-r-8 border-black"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-8 border-l-8 border-black"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-8 border-r-8 border-black"></div>

            <div className="flex justify-between items-start pt-12 px-6">
              <div className="space-y-6">
                <h1 className="text-9xl font-black font-outfit tracking-tighter leading-none">{selectedUnit?.unit_id}</h1>
                <p className="text-4xl font-bold uppercase tracking-[0.2em] text-slate-500">{selectedUnit?.model}</p>
                <div className="pt-12 grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="text-xl font-black uppercase text-slate-400 tracking-widest">Serial Number Unit</p>
                    <p className="text-4xl font-black font-mono">{selectedUnit?.serial_number || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black uppercase text-slate-400 tracking-widest">Engine Serial Number</p>
                    <p className="text-4xl font-black font-mono">{selectedUnit?.engine_serial_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-10 px-8 flex justify-between items-end border-t-8 border-black pt-10">
              <div className="space-y-2">
                <p className="text-3xl font-black uppercase tracking-[0.2em]">Mining ERP Pro Max</p>
                <p className="text-xl font-bold text-slate-500 italic">Official Asset Identification Sticker</p>
                <p className="text-2xl font-black uppercase pt-4">Category: {selectedUnit?.category || 'HEAVY EQUIPMENT'}</p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="p-2 bg-white border-4 border-black rounded-2xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/maintenance?unit=${selectedUnit?.unit_id}`} 
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan Digital Twin</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setIsStickerOpen(false)} className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-white font-black text-sm hover:bg-white/5 transition-all uppercase tracking-widest">Close</button>
            <button 
              onClick={() => {
                const printContent = document.getElementById('sticker-print-area');
                const win = window.open('', '', 'width=1200,height=800');
                if (win) {
                  win.document.write(`
                    <html>
                      <head>
                        <title>Print Sticker - ${selectedUnit?.unit_id}</title>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
                        <style>
                          body { margin: 0; padding: 0; background: white; font-family: 'Inter', sans-serif; overflow: hidden; }
                          @page { size: A3 landscape; margin: 0; }
                          #sticker { 
                            width: 420mm; 
                            height: 297mm; 
                            padding: 20mm; 
                            box-sizing: border-box; 
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          }
                          .sticker-box { 
                            border: 12px solid black; 
                            border-radius: 50px; 
                            width: 100%;
                            height: 100%; 
                            display: flex; 
                            flex-direction: column; 
                            justify-content: space-between; 
                            padding: 60px;
                            position: relative;
                            box-sizing: border-box;
                          }
                          .qr-box { border: 10px solid black; border-radius: 30px; padding: 20px; display: inline-block; background: white; }
                        </style>
                      </head>
                      <body>
                        <div id="sticker">
                          <div class="sticker-box">
                            <div style="padding-top: 20px;">
                                <h1 style="font-size: 180px; margin: 0; font-weight: 900; letter-spacing: -8px; line-height: 0.8;">${selectedUnit?.unit_id}</h1>
                                <p style="font-size: 50px; margin: 30px 0; color: #666; font-weight: 900; text-transform: uppercase; letter-spacing: 10px;">${selectedUnit?.model}</p>
                                
                                <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 60px; margin-top: 80px;">
                                  <div>
                                    <p style="font-size: 25px; margin: 0; color: #999; font-weight: 900; text-transform: uppercase;">Serial Number Unit</p>
                                    <p style="font-size: 50px; margin: 0; font-weight: 900;">${selectedUnit?.serial_number || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p style="font-size: 25px; margin: 0; color: #999; font-weight: 900; text-transform: uppercase;">Engine Serial Number</p>
                                    <p style="font-size: 50px; margin: 0; font-weight: 900;">${selectedUnit?.engine_serial_number || 'N/A'}</p>
                                  </div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 10px solid black; padding-top: 40px; margin-bottom: 20px;">
                              <div>
                                <p style="font-size: 40px; margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: 4px;">MINING ERP PRO MAX</p>
                                <p style="font-size: 20px; margin: 5px 0; color: #666; font-style: italic;">Official Asset Identification Sticker</p>
                                <p style="font-size: 30px; margin-top: 20px; font-weight: 900; text-transform: uppercase;">CATEGORY: ${selectedUnit?.category || 'HEAVY EQUIPMENT'}</p>
                              </div>
                              
                              <div style="text-align: center;">
                                <div class="qr-box">
                                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin)}/maintenance?unit=${selectedUnit?.unit_id}" style="width: 140px; height: 140px;" />
                                </div>
                                <p style="font-size: 12px; margin-top: 10px; font-weight: 900; letter-spacing: 2px; color: #999;">SCAN DIGITAL TWIN</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <script>window.onload = () => { window.print(); window.close(); }</script>
                      </body>
                    </html>
                  `);
                  win.document.close();
                }
              }}
              className="flex-[2] px-8 py-5 rounded-2xl bg-accent text-primary font-black text-sm hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-3"
            >
              <Printer size={20}/> PRINT A3 STICKER
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FleetStat({ label, count, color, bg, icon: Icon }: any) {
  return (
    <div className={clsx("glass-card p-10 flex flex-col gap-6 group hover:border-white/20 transition-all duration-500 relative overflow-hidden", bg)}>
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110"><Icon size={100} /></div>
      <div className="flex justify-between items-start">
        <div className={clsx("p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl", color)}>
          <Icon size={28} />
        </div>
        <ArrowUpRight size={20} className="text-slate-700 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className={clsx("text-5xl font-black font-outfit tracking-tighter leading-none", color)}>{count}</div>
      </div>
    </div>
  );
}
