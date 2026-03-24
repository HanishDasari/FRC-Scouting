'use client';

import Link from 'next/link';
import { Users, ClipboardList, LayoutDashboard, Activity, LineChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-4 overflow-hidden">
      {/* Giant 6905 watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="text-[28vw] font-black italic leading-none tracking-tighter"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1px rgba(225,29,72,0.12)',
            background: 'linear-gradient(135deg, rgba(225,29,72,0.07) 0%, rgba(245,158,11,0.05) 100%)',
            WebkitBackgroundClip: 'text',
            filter: 'blur(0px)',
            userSelect: 'none',
          }}
        >
          6905
        </span>
      </div>

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-1" style={{ background: 'linear-gradient(90deg, #e11d48, transparent)' }} />
          <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: '#e11d48' }}>FRC Albany 2026</span>
          <div className="w-12 h-1" style={{ background: 'linear-gradient(90deg, transparent, #e11d48)' }} />
        </div>
        <h1 className="text-6xl sm:text-8xl font-black uppercase italic tracking-tighter mb-3 leading-none">
          <span style={{ color: '#e11d48' }}>6905</span>
          <br />
          <span className="text-white">SCOUTING</span>
        </h1>
        <p className="text-sm font-bold uppercase tracking-[0.4em]" style={{ color: '#64748b' }}>
          Raiders of the Arc
        </p>
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-12">
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.3))' }} />
            <h2 className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: '#e11d48' }}>Prescouting Operations</h2>
            <div className="h-[2px] flex-1" style={{ background: 'linear-gradient(90deg, rgba(225,29,72,0.3), transparent)' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              href="/setup"
              className="group flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 active:scale-95 text-center"
              style={{
                background: 'linear-gradient(135deg, #1a0a12 0%, #13131a 100%)',
                borderColor: 'rgba(225,29,72,0.3)',
                boxShadow: '0 0 0 0 rgba(225,29,72,0)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(225,29,72,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(225,29,72,0)')}
            >
              <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(225,29,72,0.15)' }}>
                <Users size={36} style={{ color: '#e11d48' }} />
              </div>
              <span className="text-xl font-black uppercase tracking-widest text-white mb-1">Prescout Match Setup</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Configure 6-Team Roster</span>
            </Link>

            <Link
              href="/dashboard"
              className="group flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 active:scale-95 text-center"
              style={{
                background: 'linear-gradient(135deg, #0a131a 0%, #13131a 100%)',
                borderColor: 'rgba(59,130,246,0.3)',
                boxShadow: '0 0 0 0 rgba(59,130,246,0)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(59,130,246,0)')}
            >
              <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <LayoutDashboard size={36} style={{ color: '#3b82f6' }} />
              </div>
              <span className="text-xl font-black uppercase tracking-widest text-white mb-1">Prescout Status</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Live Alliance Tracking</span>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3))' }} />
            <h2 className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: '#f59e0b' }}>Real-Time Intelligence</h2>
            <div className="h-[2px] flex-1" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              href="/live-scout-setup"
              className="group flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 active:scale-95 text-center"
              style={{
                background: 'linear-gradient(135deg, #1f1406 0%, #13131a 100%)',
                borderColor: 'rgba(245,158,11,0.3)',
                boxShadow: '0 0 0 0 rgba(245,158,11,0)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(245,158,11,0)')}
            >
              <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <Users size={36} style={{ color: '#f59e0b' }} />
              </div>
              <span className="text-xl font-black uppercase tracking-widest text-white mb-1">Live Match Setup</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Configure Timed Matches</span>
            </Link>

            <Link
              href="/live-dashboard"
              className="group flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 active:scale-95 text-center"
              style={{
                background: 'linear-gradient(135deg, #021217 0%, #13131a 100%)',
                borderColor: 'rgba(6,182,212,0.3)',
                boxShadow: '0 0 0 0 rgba(6,182,212,0)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(6,182,212,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(6,182,212,0)')}
            >
              <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(6,182,212,0.12)' }}>
                <LineChart size={36} style={{ color: '#06b6d4' }} />
              </div>
              <span className="text-xl font-black uppercase tracking-widest text-white mb-1">Real-Time Status</span>
              <span className="text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#64748b' }}>Real-Time Match Leaderboard</span>
            </Link>
          </div>
        </section>
      </div>

      <div className="relative z-10 mt-14 text-xs font-black uppercase tracking-[0.3em]" style={{ color: '#1e293b' }}>
        Built for the Drive Team and Strategy Lead
      </div>
    </div>
  );
}
