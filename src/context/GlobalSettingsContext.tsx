"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";

type Language = "id" | "en";
type Currency = "IDR" | "USD";
type Theme = "dark" | "light" | "system";

interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  website: string;
  phone: string;
  logo?: string;
}

interface GlobalSettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

// Dictionary
const translations: Record<Language, Record<string, string>> = {
  id: {
    dashboard: "Dasbor Eksekutif",
    monitoring: "Monitoring KPI",
    fleet: "Monitoring Armada",
    maintenance: "Pemeliharaan & Perbaikan",
    inventory: "Sistem Inventaris",
    invoices: "Faktur & Penagihan",
    dsr: "Laporan Shift (DSR)",
    logistics: "Logistik & Bahan Bakar",
    safety: "Keamanan & HSE",
    settings: "Pengaturan Sistem",
    users: "Manajemen Pengguna",
    running: "Berjalan",
    standby: "Siaga",
    breakdown: "Rusak",
    total_production: "Total Produksi",
    efficiency: "Efisiensi Operasional",
    weather: "Kondisi Cuaca",
    search: "Cari data...",
    create_report: "Buat Laporan",
    register_unit: "Daftar Unit Baru",
    satellite_telemetry: "Telemetri Satelit",
    control: "Kontrol",
    real_time_metrics: "Metrik performa & penyebaran aset real-time",
    operational_intelligence: "Intelijen Operasional",
    production_logging: "Pencatatan produksi & pelacakan lingkungan real-time",
    save: "Simpan Perubahan",
    cancel: "Batalkan",
    discard: "Abaikan",
    submit: "Kirim Data",
    language: "Bahasa",
    currency: "Mata Uang",
    theme: "Tema Visual",
    dark: "Mode Gelap",
    light: "Mode Terang",
    system: "Ikuti Sistem",
    indonesian: "Bahasa Indonesia",
    english: "Bahasa Inggris",
    total_receivables: "Total Piutang",
    total_assets: "Total Aset Likuid",
    pending_approval: "Menunggu Persetujuan",
    action_required: "Butuh Tindakan",
    record_transaction: "Catat Transaksi",
    capacity: "Kapasitas Total",
    history: "Riwayat Transaksi",
    fuel_consumption: "Konsumsi BBM",
    replenishment: "Pengisian Ulang",
    stock_level: "Level Stok",
    critical_alert: "Peringatan Kritis",
    schedule_job: "Jadwalkan Servis",
    my_tasks: "Tugas Saya",
    full_schedule: "Jadwal Lengkap",
    spareparts: "Suku Cadang",
    inventory_monitoring: "Monitoring Inventaris",
    logistics_intelligence: "LOGISTICS INTELLIGENCE",
    fleet_health: "Kesehatan Armada",
    availability: "Ketersediaan (MA)",
    production_yield: "Hasil Produksi",
    supervisor: "Pengawas Lapangan"
  },
  en: {
    dashboard: "Executive Dashboard",
    monitoring: "KPI Monitoring",
    fleet: "Fleet Monitoring",
    maintenance: "Maintenance & Repair",
    inventory: "Inventory System",
    invoices: "Invoices & Billing",
    dsr: "Shift Reports (DSR)",
    logistics: "Fuel & Logistics",
    safety: "Safety & HSE",
    settings: "System Settings",
    users: "User Management",
    running: "Running",
    standby: "Standby",
    breakdown: "Breakdown",
    total_production: "Total Production",
    efficiency: "Operational Efficiency",
    weather: "Weather Condition",
    search: "Search data...",
    create_report: "Create Report",
    register_unit: "Register New Unit",
    satellite_telemetry: "Satellite Telemetry",
    control: "Control",
    real_time_metrics: "Real-time asset deployment and performance metrics",
    operational_intelligence: "Operational Intelligence",
    production_logging: "Real-time production logging and environmental tracking",
    save: "Save Changes",
    cancel: "Cancel",
    discard: "Discard",
    submit: "Submit Data",
    language: "Language",
    currency: "Currency",
    theme: "Visual Theme",
    dark: "Dark Mode",
    light: "Light Mode",
    system: "Follow System",
    indonesian: "Indonesian",
    english: "English",
    total_receivables: "Total Receivables",
    total_assets: "Total Liquid Assets",
    pending_approval: "Pending Approval",
    action_required: "Action Required",
    record_transaction: "Record Transaction",
    capacity: "Total Capacity",
    history: "Transaction History",
    fuel_consumption: "Fuel Consumption",
    replenishment: "Replenishment",
    stock_level: "Stock Level",
    critical_alert: "Critical Alert",
    schedule_job: "Schedule Job",
    my_tasks: "My Tasks",
    full_schedule: "Full Schedule",
    spareparts: "Spareparts",
    inventory_monitoring: "Inventory Monitoring",
    logistics_intelligence: "LOGISTICS INTELLIGENCE",
    fleet_health: "Fleet Health",
    availability: "Fleet Availability (MA)",
    production_yield: "Production Yield",
    supervisor: "Site Supervisor"
  }
};

export function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [theme, setTheme] = useState<Theme>("dark");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "MINING ERP PRO",
    address: "Sudirman Central Business District, Jakarta",
    email: "ops@miningerp.pro",
    website: "www.miningerp.pro",
    phone: "+62 21 555 1234"
  });

  // Load from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("erp_lang") as Language;
    const savedCur = localStorage.getItem("erp_cur") as Currency;
    const savedTheme = localStorage.getItem("erp_theme") as Theme;
    const savedCompany = localStorage.getItem("erp_company");

    if (savedLang) setLanguage(savedLang);
    if (savedCur) setCurrency(savedCur);
    if (savedTheme) setTheme(savedTheme);
    
    // Fetch from DB to sync with server-side prints
    const fetchCompany = async () => {
      try {
        const data = await apiRequest('settings/company');
        if (data && data.company_name) {
          setCompanyInfo({
            name: data.company_name,
            address: data.address,
            email: data.email,
            website: data.website,
            phone: data.phone
          });
        }
      } catch (e) {
        console.error("Failed to fetch company profile", e);
      }
    };
    fetchCompany();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("erp_lang", language);
    localStorage.setItem("erp_cur", currency);
    localStorage.setItem("erp_theme", theme);
    localStorage.setItem("erp_company", JSON.stringify(companyInfo));
  }, [language, currency, theme, companyInfo]);

  // Theme Sync
  useEffect(() => {
    const root = window.document.documentElement;
    let effectiveTheme = theme;
    
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    root.setAttribute("data-theme", effectiveTheme);
  }, [theme]);

  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      const usdAmount = amount / 15000;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(usdAmount);
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <GlobalSettingsContext.Provider 
      value={{ 
        language, setLanguage, 
        currency, setCurrency, 
        theme, setTheme,
        companyInfo, setCompanyInfo,
        formatCurrency, t
      }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const context = useContext(GlobalSettingsContext);
  if (context === undefined) {
    throw new Error("useGlobalSettings must be used within a GlobalSettingsProvider");
  }
  return context;
}
