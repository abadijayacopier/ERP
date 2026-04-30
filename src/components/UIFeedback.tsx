"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X, Info, Trash2, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={clsx(
      "fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-10 duration-300",
      type === "success" && "bg-green-500/10 border-green-500/20 text-green-400",
      type === "error" && "bg-red-500/10 border-red-500/20 text-red-400",
      type === "info" && "bg-accent/10 border-accent/20 text-accent",
    )}>
      {type === "success" && <CheckCircle2 size={20} />}
      {type === "error" && <AlertCircle size={20} />}
      {type === "info" && <Info size={20} />}
      <span className="text-sm font-bold font-outfit">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-50 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative overflow-hidden">
        {/* Modal Background Polish */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.02]">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-white font-outfit tracking-tight">{title}</h3>
            <div className="w-12 h-1 bg-accent rounded-full mt-1" />
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10 group">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: 'danger' | 'warning';
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", type = "danger" }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0b0f1a] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className={clsx(
          "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-20",
          type === 'danger' ? "bg-red-500" : "bg-orange-500"
        )}></div>

        <div className={clsx(
          "w-24 h-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-lg transform rotate-3",
          type === 'danger' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
        )}>
          {type === 'danger' ? <Trash2 size={44} className="animate-pulse" /> : <AlertTriangle size={44} className="animate-pulse" />}
        </div>
        
        <h3 className="text-3xl font-black text-white font-outfit mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed px-4">{message}</p>
        
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest">Discard</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={clsx(
            "flex-1 px-6 py-4 rounded-2xl font-black shadow-2xl transition-all text-sm uppercase tracking-widest hover:scale-105 active:scale-95",
            type === 'danger' ? "bg-red-600 text-white hover:bg-red-500 shadow-red-600/30" : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30"
          )}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
