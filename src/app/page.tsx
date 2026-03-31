'use client';

import Link from 'next/link';
import { Users, LayoutDashboard, Activity, LineChart, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 py-20 overflow-hidden">
      {/* Glassy Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="relative z-10 max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass border-primary/10 mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Online: Albany 2026</span>
          </div>
      <h1 className="text-7xl sm:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] text-white animate-in fade-in zoom-in duration-1000 text-center">
        6905<br />
        <span className="text-primary tracking-tight">SCOUTING</span>
      </h1>
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-muted pt-4">
            Advanced Intelligence Framework • Team 6905
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {/* Prescouting Card */}
          <div className="glass-card p-10 rounded-[3rem] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8">
                <Users className="text-primary" size={28} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">Prescouting</h2>
              <p className="text-sm text-muted font-medium mb-10 leading-relaxed">
                Strategic data collection and alliance management for upcoming qualifications.
              </p>
              <div className="mt-auto flex flex-col gap-3">
                <Link href="/setup" className="flex items-center justify-between p-4 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Initialize Roster <ChevronRight size={14} />
                </Link>
                <Link href="/dashboard" className="flex items-center justify-between p-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                  Access Dashboard <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Real-Time Card */}
          <div className="glass-card p-10 rounded-[3rem] group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/20 transition-all duration-700" />
             <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 mb-8">
                <Activity className="text-accent" size={28} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">Real Time Match Scouting</h2>
              <p className="text-sm text-muted font-medium mb-10 leading-relaxed">
                High-speed match observation and real-time performance telemetry.
              </p>
              <div className="mt-auto flex flex-col gap-3">
                <Link href="/live-scout-setup" className="flex items-center justify-between p-4 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Initialize <ChevronRight size={14} />
                </Link>
                <Link href="/live-dashboard" className="flex items-center justify-between p-4 rounded-2xl bg-cyan-600 text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
                  Match Scouting Dashboard <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-20 text-center opacity-20">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Built for the Drive Team and Strategy Lead</span>
        </div>
      </div>
    </div>
  );
}
