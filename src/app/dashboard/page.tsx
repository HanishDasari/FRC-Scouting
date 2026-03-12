'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Users, ClipboardCheck, Info, X } from 'lucide-react';

type ScoutReport = {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  teamNumber: number;
  matchNumber: number;
  scouterName: string;
  autoL1: number; autoL2: number; autoL3: number;
  teleopL1: number; teleopL2: number; teleopL3: number;
  climbStatus: string;
};

type MatchConfig = {
  matchNumber: number;
  teams: number[];
};

export default function Dashboard() {
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [matches, setMatches] = useState<MatchConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/scout')
      .then(res => res.json())
      .then(data => {
        if (data.reports) setReports(data.reports);
        if (data.matches) setMatches(data.matches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteMatch = async (matchNumber: number) => {
    if (confirm(`Delete Match ${matchNumber}?`)) {
      await fetch(`/api/scout?matchNumber=${matchNumber}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const getTeamStatus = (teamNum: number, matchNumber: number) => {
    const teamReports = reports.filter(r => r.teamNumber === teamNum && r.matchNumber === matchNumber);
    if (teamReports.length === 0) return 'NOT_SCOUTED';
    if (teamReports.some(r => r.status === 'COMPLETED')) return 'COMPLETED';
    return 'IN_PROGRESS';
  };

  const getReportId = (teamNum: number, matchNumber: number) => {
    const report = reports.find(r => r.teamNumber === teamNum && r.matchNumber === matchNumber);
    return report?.id || null;
  };

  const deleteDraft = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this draft?")) {
      await fetch(`/api/scout?id=${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const StatusCard = ({ teamNum, isRed, matchNumber }: { teamNum: number, isRed: boolean, matchNumber: number }) => {
    const status = getTeamStatus(teamNum, matchNumber);
    const reportId = getReportId(teamNum, matchNumber);
    const colors = {
      NOT_SCOUTED: 'bg-red-500 border-red-700 text-white',
      IN_PROGRESS: 'bg-blue-500 border-blue-700 text-white',
      COMPLETED: 'bg-green-500 border-green-700 text-white'
    } as any;

    return (
      <Link 
        href={`/scout?team=${teamNum}&match=${matchNumber}${reportId ? `&id=${reportId}` : ''}`} 
        className={`group relative overflow-hidden block p-6 rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] active:scale-95 ${colors[status]}`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-500" />
        
        {status === 'IN_PROGRESS' && reportId && (
          <button 
            onClick={(e) => deleteDraft(e, reportId)}
            className="absolute top-4 right-4 p-2 bg-red-600 rounded-full text-white shadow-lg z-20 hover:scale-110 transition-transform active:scale-90"
            title="Delete Draft"
          >
            <X size={16} strokeWidth={3} />
          </button>
        )}

        <div className="relative z-10">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">{isRed ? 'Red' : 'Blue'} Alliance</div>
          <div className="text-4xl font-black italic tracking-tighter mb-2 drop-shadow-sm">{teamNum}</div>
          <div className="flex items-center gap-2 font-black uppercase text-[11px] tracking-wider">
            <span className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
              {status === 'NOT_SCOUTED' && 'Awaiting'}
              {status === 'IN_PROGRESS' && 'Scouting'}
              {status === 'COMPLETED' && 'Secure'}
            </span>
            <ClipboardCheck size={14} className="opacity-80" />
          </div>
        </div>
      </Link>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-xl font-black italic tracking-tighter uppercase animate-pulse">Syncing Grid...</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="w-full px-8 py-10">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20 border-b-[3px] border-black pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-3 bg-red-600 rounded-full" />
              <div className="w-8 h-3 bg-blue-600 rounded-full" />
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
              Strategic <span className="text-transparent border-t-4 border-black inline-block pt-1" style={{ WebkitTextStroke: '2px black' }}>Overview</span>
            </h1>
            <p className="font-bold text-gray-400 uppercase tracking-[0.4em] text-xs">FRC Scouting Control System / V2.0</p>
          </div>
          <div className="flex gap-4">
            <Link href="/setup" className="group relative flex items-center justify-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm overflow-hidden transition-all hover:pr-14 active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
              <span className="relative z-10 flex items-center gap-3"><Users size={20} /> New Match</span>
              <div className="absolute right-0 top-0 bottom-0 w-0 bg-white/20 group-hover:w-12 transition-all duration-300 flex items-center justify-center">
                <Settings size={20} className="animate-spin-slow" />
              </div>
            </Link>
          </div>
        </header>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-gray-100 rounded-[3rem]">
            <Info className="text-gray-200 mb-8" size={120} strokeWidth={1} />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">No Active Records</h2>
            <p className="font-bold text-gray-400 mb-10 max-w-sm text-center uppercase text-xs tracking-widest">The scouting grid is currently dormant. Initialize a match to begin data ingestion.</p>
            <Link href="/setup" className="bg-black text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Setup Match</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-32">
            {matches.map((match) => (
              <section key={match.matchNumber} className="relative group">
                {/* Background numbers */}
                <div className="absolute -top-20 -left-10 text-[20rem] font-black text-gray-50/50 -z-10 leading-none select-none pointer-events-none">
                  {match.matchNumber < 10 ? `0${match.matchNumber}` : match.matchNumber}
                </div>

                <div className="flex justify-between items-end mb-12 relative z-10">
                  <div className="inline-flex items-center gap-6">
                    <div className="bg-black text-white px-8 py-3 rounded-2xl shadow-2xl transform -skew-x-12">
                      <span className="font-black text-3xl uppercase italic tracking-tight inline-block transform skew-x-12">Match {match.matchNumber}</span>
                    </div>
                    <div className="h-[2px] w-32 bg-black/10 sm:block hidden" />
                  </div>
                  
                  <button 
                    onClick={() => deleteMatch(match.matchNumber)}
                    className="flex items-center gap-2 bg-white border-[3px] border-black p-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none"
                    title="Terminate Match Data"
                  >
                    <span>Remove</span>
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-2 h-8 bg-red-600 rounded-full" />
                      <h2 className="text-lg font-black uppercase tracking-[0.3em] text-red-600">Primary Alliance</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      {match.teams.slice(0, 3).map((num, i) => <StatusCard key={`red-${num}-${i}`} teamNum={num} isRed={true} matchNumber={match.matchNumber} />)}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-2 h-8 bg-blue-600 rounded-full" />
                      <h2 className="text-lg font-black uppercase tracking-[0.3em] text-blue-600">Opposition Alliance</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      {match.teams.slice(3, 6).map((num, i) => <StatusCard key={`blue-${num}-${i}`} teamNum={num} isRed={false} matchNumber={match.matchNumber} />)}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Legend */}
        <footer className="mt-40 border-t-[3px] border-black pt-12 flex flex-col md:flex-row justify-between items-center gap-10 pb-20">
          <div className="flex flex-wrap gap-12 justify-center items-center">
            <div className="group flex items-center gap-4 cursor-help">
              <div className="w-6 h-6 rounded-lg bg-red-500 shadow-[0_5px_15px_-5px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black uppercase text-xs">Dormant</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase whitespace-nowrap">Needs Scouting</span>
              </div>
            </div>
            <div className="group flex items-center gap-4 cursor-help">
              <div className="w-6 h-6 rounded-lg bg-blue-500 shadow-[0_5px_15px_-5px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black uppercase text-xs">Active</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase whitespace-nowrap">Data Stream Open</span>
              </div>
            </div>
            <div className="group flex items-center gap-4 cursor-help">
              <div className="w-6 h-6 rounded-lg bg-green-500 shadow-[0_5px_15px_-5px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black uppercase text-xs">Secured</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase whitespace-nowrap">Report Finalized</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-black italic uppercase tracking-tighter">Strategist Control Panel</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Authorized Personnel Only</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
