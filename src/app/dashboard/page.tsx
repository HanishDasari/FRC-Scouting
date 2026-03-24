'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Users, ClipboardCheck, Info, X, Download } from 'lucide-react';

type ScoutReport = {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  teamNumber: number;
  matchNumber: number;
  scouterName: string;
  gameStrategy: string;
  drivetrainType: string;
  hasHang: boolean;
  hasVision: boolean;
  hasMajorIssues: boolean;
  shootingAccuracy: string;
  autoAccuracy: string;
};

type MatchConfig = {
  matchNumber: number;
  teams: number[];
};

const S = {
  card: { background: '#13131a', border: '1.5px solid #1e1e2e' } as React.CSSProperties,
  input: 'w-full p-4 rounded-2xl font-bold outline-none' as const,
};

import { useModal } from '@/context/ModalContext';

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
    // Poll every 5 seconds for real-time sync
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const downloadData = () => {
    if (!reports || reports.length === 0) { 
      showModal({ type: 'warning', title: 'No Data', message: 'No data available to download.' }); 
      return; 
    }
    const headers = Object.keys(reports[0]).join(',');
    const rows = reports.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `scouting_${new Date().toISOString().split('T')[0]}.csv`,
      style: 'display:none'
    });
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // Delete functionality moved to Admin Portal

  const getTeamStatus = (teamNum: number) => {
    const r = reports.filter(r => r.teamNumber === teamNum);
    if (r.length === 0) return 'NOT_SCOUTED';
    if (r.some(r => r.status === 'COMPLETED')) return 'COMPLETED';
    return 'IN_PROGRESS';
  };

  const getReportId = (teamNum: number) =>
    reports.find(r => r.teamNumber === teamNum)?.id || null;

  const deleteDraft = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    showModal({
      type: 'confirm',
      title: 'Delete Draft?',
      message: 'Are you sure you want to delete this draft? This cannot be undone.',
      onConfirm: async () => {
        await fetch(`/api/scout?id=${id}`, { method: 'DELETE' });
        showModal({ type: 'success', title: 'Deleted', message: 'Draft has been removed.' });
        fetchData();
      }
    });
  };

  const StatusCard = ({ teamNum, isRed, matchNumber }: { teamNum: number; isRed: boolean; matchNumber: number }) => {
    const status = getTeamStatus(teamNum);
    const reportId = getReportId(teamNum);
    const colors = {
      NOT_SCOUTED: { bg: 'rgba(225,29,72,0.15)', border: 'rgba(225,29,72,0.4)', accent: '#e11d48', label: 'Awaiting' },
      IN_PROGRESS:  { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', accent: '#3b82f6', label: 'Scouting' },
      COMPLETED:    { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', accent: '#22c55e', label: 'Secure' },
    }[status];

    return (
      <div
        onClick={() => router.push(`/scout?team=${teamNum}&match=${matchNumber}${reportId ? `&id=${reportId}` : ''}`)}
        className="cursor-pointer group relative block p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
        style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, boxShadow: `0 0 20px ${colors.bg}` }}
      >
        {status === 'IN_PROGRESS' && reportId && (
          <button
            onClick={e => deleteDraft(e, reportId)}
            className="absolute top-3 right-3 p-1.5 rounded-full z-20 transition-transform hover:scale-110 active:scale-90"
            style={{ background: '#e11d48' }}
          >
            <X size={14} color="white" strokeWidth={3} />
          </button>
        )}
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: colors.accent }}>
          {isRed ? 'Red' : 'Blue'} Alliance
        </div>
        <div className="text-4xl font-black italic tracking-tighter mb-2 text-white">{teamNum}</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${colors.accent}22`, color: colors.accent }}>
            {colors.label}
          </span>
          <ClipboardCheck size={12} style={{ color: colors.accent }} />
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: '#e11d48 transparent transparent transparent' }} />
      <div className="text-lg font-black italic uppercase animate-pulse" style={{ color: '#e11d48' }}>Syncing Grid...</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden" style={{ background: '#0a0a0f', color: '#f1f5f9' }}>
      <div className="w-full px-4 sm:px-6 py-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 pb-8" style={{ borderBottom: '2px solid #1e1e2e' }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e11d48' }} />
              <div className="w-6 h-1 rounded-full" style={{ background: '#3b82f6' }} />
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">
              Prescout <span className="italic" style={{ color: '#e11d48' }}>Qual Status</span>
            </h1>
            <p className="font-bold uppercase tracking-[0.3em] text-xs" style={{ color: '#475569' }}>FRC Scouting Control System · V2.0</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            <button onClick={downloadData}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <Download size={18} /> Export CSV
            </button>
            <Link href="/setup"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 text-white"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 10px 30px rgba(225,29,72,0.3)' }}
            >
              <Users size={18} /> New Qual
              <Settings size={16} className="opacity-60" />
            </Link>
          </div>
        </header>

        {/* Live indicator & Search */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#22c55e' }}>Live · Syncing every 5s</span>
          </div>
          <input type="text" placeholder="Search saved teams..." value={search} onChange={e => setSearch(e.target.value)} className="p-3 rounded-xl outline-none text-white text-sm font-bold w-full sm:w-64 transition-all" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }} onFocus={e => e.target.style.borderColor='#e11d48'} onBlur={e => e.target.style.borderColor='#1e1e2e'} />
        </div>

        {search ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.flatMap(m => m.teams.map((t, index) => ({ teamNum: t, matchNumber: m.matchNumber, isRed: index < 3 })))
              .filter(t => String(t.teamNum).includes(search))
              .map((r, i) => (
              <StatusCard key={`${r.teamNum}-${r.matchNumber}-${i}`} teamNum={r.teamNum} matchNumber={r.matchNumber} isRed={r.isRed} />
            ))}
            {matches.flatMap(m => m.teams).filter(t => String(t).includes(search)).length === 0 && <div className="text-[#475569] font-bold uppercase text-xs tracking-widest col-span-full">No results found.</div>}
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl" style={{ border: '2px dashed #1e1e2e' }}>
            <Info className="mb-6" size={80} style={{ color: '#1e1e2e' }} strokeWidth={1} />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-3 text-white">No Active Records</h2>
            <p className="font-bold mb-8 max-w-xs text-center uppercase text-xs tracking-widest" style={{ color: '#475569' }}>
              Initialize a qualification to begin prescouting.
            </p>
            <Link href="/setup"
              className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 10px 30px rgba(225,29,72,0.3)' }}
            >
              Setup Qual
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {matches.map(match => (
              <section key={match.matchNumber} className="relative">
                {/* Ghost number */}
                <div className="absolute -top-16 -left-6 text-[16rem] font-black italic leading-none select-none pointer-events-none" style={{ color: 'rgba(225,29,72,0.04)' }}>
                  {match.matchNumber < 10 ? `0${match.matchNumber}` : match.matchNumber}
                </div>

                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="px-6 py-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 8px 24px rgba(225,29,72,0.3)' }}>
                        <span className="font-black text-2xl uppercase italic tracking-tight text-white">Qual {match.matchNumber}</span>
                      </div>
                    </div>
                  </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-7 rounded-full" style={{ background: '#e11d48' }} />
                      <h2 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: '#e11d48' }}>Primary Alliance</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {match.teams.slice(0, 3).map((num, i) => <StatusCard key={`r-${num}-${i}`} teamNum={num} isRed={true} matchNumber={match.matchNumber} />)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-7 rounded-full" style={{ background: '#3b82f6' }} />
                      <h2 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: '#3b82f6' }}>Opposition Alliance</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {match.teams.slice(3, 6).map((num, i) => <StatusCard key={`b-${num}-${i}`} teamNum={num} isRed={false} matchNumber={match.matchNumber} />)}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer legend */}
        <footer className="mt-32 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 pb-16" style={{ borderTop: '1.5px solid #1e1e2e' }}>
          <div className="flex flex-wrap gap-8 justify-center">
            {[
              { color: '#e11d48', label: 'Dormant', sub: 'Needs Scouting' },
              { color: '#3b82f6', label: 'Active',  sub: 'Data Stream Open' },
              { color: '#22c55e', label: 'Secured', sub: 'Report Finalized' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg" style={{ background: item.color, boxShadow: `0 4px 12px ${item.color}44` }} />
                <div>
                  <div className="font-black uppercase text-xs text-white">{item.label}</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight" style={{ color: '#475569' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right">
            <div className="text-sm font-black italic uppercase tracking-tighter" style={{ color: '#e11d48' }}>6905 Strategist Panel</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#1e293b' }}>Authorized Personnel Only</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
