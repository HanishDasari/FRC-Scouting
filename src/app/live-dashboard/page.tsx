'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LineChart, Users, CheckCircle, Clock, Download } from 'lucide-react';

export default function LiveDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<{ matches: any[], reports: any[] }>({ matches: [], reports: [] });
  const [loading, setLoading] = useState(true);

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
    if (!data.reports || data.reports.length === 0) { alert('No data available to download.'); return; }
    const headers = Object.keys(data.reports[0]).join(',');
    const rows = data.reports.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `live_scouting_${new Date().toISOString().split('T')[0]}.csv`,
      style: 'display:none'
    });
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
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
        
        <button onClick={downloadData}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
          style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="space-y-6">
        {data.matches.map((match: any) => {
          const mReports = data.reports.filter(r => Number(r.matchNumber) === Number(match.matchNumber));
          return (
            <div key={match.matchNumber} className="p-6 rounded-3xl" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}>
              <div className="flex flex-wrap items-center justify-between mb-4 border-b border-[#1e1e2e] pb-4">
                <h2 className="text-2xl font-black uppercase text-white">Match {match.matchNumber}</h2>
                <div className="flex gap-4 text-sm font-bold" style={{ color: '#64748b' }}>
                  <span className="flex items-center gap-1"><Clock size={16} /> {match.time || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Users size={16} /> {match.qualRound || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-2xl" style={{ background: 'rgba(225,29,72,0.05)', border: '1px solid rgba(225,29,72,0.2)' }}>
                  <h3 className="font-black uppercase text-xs" style={{ color: '#e11d48' }}>Red Alliance</h3>
                  {match.teams.slice(0,3).map((team: number) => {
                    const rep = mReports.find(r => Number(r.teamNumber) === Number(team));
                    return (
                      <div key={team} onClick={() => router.push(`/live-scout?match=${match.matchNumber}&team=${team}`)} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all active:scale-95" style={{ background: '#0a0a0f' }}>
                        <span className="font-bold text-white">{team}</span>
                        {rep ? (
                           <div className="flex items-center gap-3 text-xs font-bold">
                             <span style={{color: '#f59e0b'}}>A: {rep.autonScored}</span>
                             <span style={{color: '#22c55e'}}>T: {rep.scored}</span>
                             {rep.hasHang ? <span className="text-green-400">Hang: Y</span> : <span className="text-red-400">Hang: N</span>}
                           </div>
                        ) : (
                           <span className="text-xs font-bold uppercase" style={{ color: '#64748b' }}>Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 p-4 rounded-2xl" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <h3 className="font-black uppercase text-xs" style={{ color: '#3b82f6' }}>Blue Alliance</h3>
                  {match.teams.slice(3,6).map((team: number) => {
                    const rep = mReports.find(r => Number(r.teamNumber) === Number(team));
                    return (
                      <div key={team} onClick={() => router.push(`/live-scout?match=${match.matchNumber}&team=${team}`)} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all active:scale-95" style={{ background: '#0a0a0f' }}>
                        <span className="font-bold text-white">{team}</span>
                        {rep ? (
                           <div className="flex items-center gap-3 text-xs font-bold">
                             <span style={{color: '#f59e0b'}}>A: {rep.autonScored}</span>
                             <span style={{color: '#22c55e'}}>T: {rep.scored}</span>
                             {rep.hasHang ? <span className="text-green-400">Hang: Y</span> : <span className="text-red-400">Hang: N</span>}
                           </div>
                        ) : (
                           <span className="text-xs font-bold uppercase" style={{ color: '#64748b' }}>Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {data.matches.length === 0 && (
          <div className="text-center p-10 font-bold" style={{ color: '#64748b' }}>No live matches initialized.</div>
        )}
      </div>
    </div>
  );
}
