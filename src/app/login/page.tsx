"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Lock, User, KeyRound, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = await apiRequest('auth/login', 'POST', { username, password });
      if (userData) {
        login(userData);
      } else {
        setError('Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="mesh-bg opacity-30" />
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-md mx-auto">
          {/* Logo & Header */}
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-accent to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-accent/20">
                <KeyRound size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black font-outfit text-white tracking-tighter mb-2">
              Abadi Jaya <span className="text-accent">ERP</span>
            </h1>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">
              Secure Operations Access
            </p>
          </div>

          {/* Login Form Card */}
          <div className="glass-card p-10 relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm font-bold animate-in zoom-in-95 duration-300">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Operator ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0F1115] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-slate-600"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Security Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0F1115] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-slate-600"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-premium py-4 mt-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Access Terminal</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Protected by Abadi Jaya Dev Security Protocols
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
