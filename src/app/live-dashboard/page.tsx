'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LineChart, Users, CheckCircle, Clock, Download } from 'lucide-react';

import { useModal } from '@/context/ModalContext';

export default function LiveDashboardPage() {
  const router = useRouter();
  const { showModal } = useModal();
  const [data, setData] = useState<{ matches: any[], reports: any[] }>({ matches: [], reports: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(() => {
    fetch('/api/live-scout')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const downloadData = () => {
    window.location.href = '/api/export?type=live';
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="text-xl font-black italic uppercase animate-pulse" style={{ color: '#06b6d4' }}>Loading Real-Time Data...</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4" style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5" style={{ borderBottom: '1.5px solid #1e1e2e' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-3 rounded-full transition-all active:scale-90" style={{ background: '#13131a' }}>
            <ChevronLeft size={24} color="#f1f5f9" />
          </button>
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <LineChart style={{ color: '#06b6d4' }} size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Real-Time Status</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#22c55e' }}>Live · 5s Sync</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <input type="text" placeholder="Search team or match..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl outline-none text-white text-xs font-bold transition-all"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}
              onFocus={e => e.target.style.borderColor='#06b6d4'}
              onBlur={e => e.target.style.borderColor='#1e1e2e'} />
            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
          </div>
          <button onClick={downloadData}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
            style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {data.matches.filter(match => {
          if (!search) return true;
          const s = search.toLowerCase().replace('match ', '').replace('team ', '').trim();
          return match.matchNumber.toString().includes(s) || 
                 match.teams.some((t: any) => t.toString().includes(s));
        }).map((match: any) => {
          const mReports = data.reports.filter(r => Number(r.matchNumber) === Number(match.matchNumber));
          const matchNumStr = String(match.matchNumber);
          const fontSize = matchNumStr.length > 3 ? 'text-4xl lg:text-5xl' : matchNumStr.length > 2 ? 'text-5xl lg:text-6xl' : 'text-6xl lg:text-7xl';

          return (
            <div key={match.matchNumber} className="flex flex-col lg:flex-row gap-6 p-8 rounded-[2.5rem]" style={{ background: '#13131a', border: '1.5px solid #1e1e2e', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5)' }}>
              {/* Left Side: Match Info Impact */}
              <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-center p-6 lg:p-8 rounded-3xl lg:w-48 shrink-0" style={{ background: 'linear-gradient(135deg, #1e1e2e, #13131a)', border: '1.5px solid #2d2d3d' }}>
                <div className="text-center lg:text-left overflow-hidden">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-cyan-500/70">Qual</div>
                  <div className={`${fontSize} font-black italic tracking-tighter text-white leading-none transition-all duration-300`}>
                    {match.matchNumber}
                  </div>
                </div>
                <div className="mt-0 lg:mt-6 text-right lg:text-left">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-cyan-500/70 flex items-center gap-1"><Clock size={10} /> Time</div>
                  <div className="text-xl lg:text-2xl font-black text-white italic">
                    {match.time || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Right Side: Alliance Grids */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  {/* Red Alliance */}
                  <div className="space-y-2 p-5 rounded-3xl" style={{ background: 'rgba(225,29,72,0.03)', border: '1.5px solid rgba(225,29,72,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-black uppercase text-[10px] tracking-widest" style={{ color: '#e11d48' }}>Red Alliance</h3>
                       <div className="w-8 h-1 rounded-full" style={{ background: '#e11d48' }} />
                    </div>
                    {match.teams.slice(0,3).map((team: number) => {
                      const rep = mReports.find(r => Number(r.teamNumber) === Number(team));
                      return (
                        <div key={team} onClick={() => router.push(`/live-scout?match=${match.matchNumber}&team=${team}`)} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all active:scale-95 group" style={{ background: '#0a0a0f', border: '1px solid #1e1e2e' }}>
                          <span className="font-black text-lg text-white group-hover:text-[#e11d48] transition-colors">{team}</span>
                          {rep ? (
                             <div className="flex items-center gap-3 text-[11px] font-black uppercase">
                               <span style={{color: '#f59e0b'}}>Auton: {rep.autonScored}</span>
                               <span style={{color: '#22c55e'}}>Tele: {rep.scored}</span>
                               {rep.hasHang ? <span className="text-green-400">Hang: Y</span> : <span className="text-red-400">Hang: N</span>}
                             </div>
                          ) : (
                             <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#334155' }}>Awaiting...</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Blue Alliance */}
                  <div className="space-y-2 p-5 rounded-3xl" style={{ background: 'rgba(59,130,246,0.03)', border: '1.5px solid rgba(59,130,246,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-black uppercase text-[10px] tracking-widest" style={{ color: '#3b82f6' }}>Blue Alliance</h3>
                       <div className="w-8 h-1 rounded-full" style={{ background: '#3b82f6' }} />
                    </div>
                    {match.teams.slice(3,6).map((team: number) => {
                      const rep = mReports.find(r => Number(r.teamNumber) === Number(team));
                      return (
                        <div key={team} onClick={() => router.push(`/live-scout?match=${match.matchNumber}&team=${team}`)} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all active:scale-95 group" style={{ background: '#0a0a0f', border: '1px solid #1e1e2e' }}>
                          <span className="font-black text-lg text-white group-hover:text-[#3b82f6] transition-colors">{team}</span>
                          {rep ? (
                             <div className="flex items-center gap-3 text-[11px] font-black uppercase">
                               <span style={{color: '#f59e0b'}}>Auton: {rep.autonScored}</span>
                               <span style={{color: '#22c55e'}}>Tele: {rep.scored}</span>
                               {rep.hasHang ? <span className="text-green-400">Hang: Y</span> : <span className="text-red-400">Hang: N</span>}
                             </div>
                          ) : (
                             <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#334155' }}>Awaiting...</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {data.matches.length > 0 && data.matches.filter(match => {
          if (!search) return true;
          const s = search.toLowerCase().replace('match ', '').replace('team ', '').trim();
          return match.matchNumber.toString().includes(s) || 
                 match.teams.some((t: any) => t.toString().includes(s));
        }).length === 0 && (
          <div className="text-center py-20 font-black uppercase tracking-widest text-muted text-sm italic">
            No active search results for "{search}"
          </div>
        )}
        {data.matches.length === 0 && (
          <div className="text-center p-10 font-bold" style={{ color: '#64748b' }}>No live matches initialized.</div>
        )}
      </div>
    </div>
  );
}
