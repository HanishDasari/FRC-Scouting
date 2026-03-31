'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Users, ClipboardCheck, Info, X, Download, Plus, Search, Activity } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

type ScoutReport = {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  teamNumber: number;
  matchNumber: number;
  scouterName: string;
  // ... other fields
  createdAt: string;
};

type MatchConfig = {
  matchNumber: number;
  teams: number[];
};

export default function Dashboard() {
  const router = useRouter();
  const { showModal } = useModal();
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [matches, setMatches] = useState<MatchConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(() => {
    fetch('/api/scout')
      .then(res => res.json())
      .then(data => {
        if (data.reports) setReports(data.reports);
        if (data.matches) setMatches(data.matches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const downloadData = () => {
    window.location.href = '/api/export?type=prescout';
  };

  const deleteDraft = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    showModal({
      type: 'confirm', title: 'Delete Draft?', message: 'Remove this report from the system?',
      onConfirm: async () => {
        await fetch(`/api/scout?id=${id}`, { method: 'DELETE' });
        fetchData();
      }
    });
  };

  const getTeamStatus = (teamNum: number) => {
    const r = reports.filter(r => r.teamNumber === teamNum);
    if (r.length === 0) return 'NOT_SCOUTED';
    return r.some(r => r.status === 'COMPLETED') ? 'COMPLETED' : 'IN_PROGRESS';
  };

  const getReportId = (teamNum: number) => reports.find(r => r.teamNumber === teamNum)?.id || null;

  const StatusCard = ({ teamNum, isRed, matchNumber }: { teamNum: number; isRed: boolean; matchNumber: number }) => {
    const status = getTeamStatus(teamNum);
    const reportId = getReportId(teamNum);
    const color = status === 'COMPLETED' ? '#10b981' : status === 'IN_PROGRESS' ? '#3b82f6' : 'var(--primary)';
    const label = status === 'COMPLETED' ? 'Secure' : status === 'IN_PROGRESS' ? 'Scting' : 'Await';

    return (
      <div onClick={() => router.push(`/scout?team=${teamNum}&match=${matchNumber}${reportId ? `&id=${reportId}` : ''}`)}
        className="cursor-pointer group relative p-6 rounded-3xl glass-card border-white/5 hover:border-white/20 transition-all active:scale-95">
        
        {status === 'IN_PROGRESS' && reportId && (
          <button onClick={e => deleteDraft(e, reportId)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white z-20 shadow-lg scale-0 group-hover:scale-100 transition-transform">
            <X size={14} strokeWidth={3} />
          </button>
        )}

        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: isRed ? '#e11d48' : '#3b82f6' }}>
              {isRed ? 'Red' : 'Blue'} Alliance
            </span>
            <span className="text-3xl font-black italic tracking-tighter text-white">{teamNum}</span>
          </div>
          <div className="p-2 rounded-xl" style={{ background: `${color}15` }}>
            <Activity size={16} style={{ color }} />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Syncing Grid</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Strategic Overlook</span>
             <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[8px] font-black uppercase text-primary">Live</div>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
            Prescout <span className="text-primary italic">Status</span>
          </h1>
          <p className="text-xs font-bold text-muted uppercase tracking-[0.2em]">Raiders Intelligence Interface • V2.5</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input type="text" placeholder="Search parameters..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl glass border-white/5 font-bold text-xs outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <button onClick={downloadData} className="p-4 rounded-2xl glass border-white/5 hover:bg-white/5 text-muted hover:text-white transition-all active:scale-95">
            <Download size={18} />
          </button>
          <Link href="/setup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Plus size={16} /> Configure Qual
          </Link>
        </div>
      </div>

      {/* Content Area */}
      {matches.length === 0 ? (
        <div className="py-40 flex flex-col items-center text-center">
           <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6 border border-white/5">
             <Info className="text-muted" size={32} />
           </div>
           <h2 className="text-2xl font-black uppercase italic text-white mb-2">No Active Records</h2>
           <p className="text-xs font-bold text-muted uppercase tracking-widest mb-10">System is ready for initialization.</p>
           <Link href="/setup" className="px-10 py-5 rounded-2xl glass border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all">
             Begin Setup
           </Link>
        </div>
      ) : (
        <div className="space-y-32">
          {matches.filter(match => {
            if (!search) return true;
            const s = search.toLowerCase().replace('match ', '').replace('team ', '').trim();
            return match.matchNumber.toString().includes(s) || 
                   match.teams.some(t => t.toString().includes(s));
          }).map(match => (
            <section key={match.matchNumber} className="relative">
              <div className="absolute -top-24 -left-10 text-[18rem] font-black italic text-white/[0.02] select-none pointer-events-none tracking-tighter">
                {match.matchNumber < 10 ? `0${match.matchNumber}` : match.matchNumber}
              </div>
              
              <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <div className="px-6 py-2 rounded-xl glass border-white/10">
                  <span className="text-xl font-black italic uppercase tracking-tighter text-white/90">Qualification {match.matchNumber}</span>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary glow-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] !text-primary">Strike Team • Red</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {match.teams.slice(0, 3).map((num, i) => <StatusCard key={`r-${num}`} teamNum={num} isRed={true} matchNumber={match.matchNumber} />)}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary glow-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] !text-[#3b82f6]">Opposition • Blue</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {match.teams.slice(3, 6).map((num, i) => <StatusCard key={`b-${num}`} teamNum={num} isRed={false} matchNumber={match.matchNumber} />)}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Legend Footer */}
      <div className="mt-40 pt-10 border-t border-white/5 flex flex-wrap justify-between items-center gap-10">
        <div className="flex gap-10">
          {[
            { color: 'var(--primary)', label: 'Dormant', desc: 'Pre-Scan Required' },
            { color: 'var(--secondary)', label: 'Active', desc: 'Transmission in Progress' },
            { color: '#10b981', label: 'Secured', desc: 'Report Encrypted' }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-lg" style={{ background: item.color }} />
              <div>
                <div className="text-[10px] font-black uppercase text-white tracking-widest">{item.label}</div>
                <div className="text-[8px] font-bold uppercase text-muted tracking-wide mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right">
          <div className="text-xs font-black uppercase italic tracking-tighter text-white">Raiders Intelligence Node Alpha</div>
          <div className="text-[8px] font-black uppercase tracking-[0.5em] text-primary mt-1">Authorized Strategic Access Only</div>
        </div>
      </div>
    </div>
  );
}
