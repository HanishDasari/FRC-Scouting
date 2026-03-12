'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Users, ClipboardCheck, Info, History, ArrowRight, Trash2, RefreshCcw, Download, Eye } from 'lucide-react';

type ScoutReport = {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  teamNumber: number;
  matchNumber: number;
  ourTeamNumber: string;
  driveTrain: string;
  gameStrategy: string;
  robotWeight: string;
  scoringRange: string;
  hasHang: string;
  shootingAccuracy: string;
};

type MatchConfig = {
  matchNumber: number;
  teams: number[];
};

export default function Dashboard() {
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [match, setMatch] = useState<MatchConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/scout')
      .then(res => res.json())
      .then(data => {
        setReports(data.reports || []);
        setMatch(data.currentMatch || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetMatch = async () => {
    if (!confirm("CRITICAL: This will clear the current roster and drafts. Completed dossiers are saved. CONTINUE?")) return;
    try {
      await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RESET_MATCH' }),
      });
      fetchData();
    } catch (err) {
      alert("Reset failed.");
    }
  };

  const handleDeleteTeam = async (e: React.MouseEvent, teamNumber: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TEAM', teamNumber }),
      });
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export';
  };

  const getTeamStatus = (teamNum: number) => {
    if (!match) return 'NOT_SCOUTED';
    const report = reports.find(r => r.teamNumber === teamNum && r.matchNumber === match.matchNumber);
    if (!report) return 'NOT_SCOUTED';
    if (report.status === 'COMPLETED') return 'COMPLETED';
    return 'IN_PROGRESS';
  };

  const getReport = (teamNum: number) => {
    return reports.find(r => r.teamNumber === teamNum && r.matchNumber === (match?.matchNumber || 0));
  };

  const StatusCard = ({ teamNum, isRed }: { teamNum: number, isRed: boolean }) => {
    const status = getTeamStatus(teamNum);
    const report = getReport(teamNum);

    // Bolder colors as requested
    const cardStyles = {
      NOT_SCOUTED: isRed ? 'bg-red-50 border-red-200 text-red-900 shadow-sm' : 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm',
      IN_PROGRESS: 'bg-yellow-100 border-yellow-400 text-yellow-900 shadow-md animate-pulse',
      COMPLETED: 'bg-green-500 border-green-600 text-white shadow-lg'
    } as any;

    return (
      <div className="relative group/card">
        <Link href={`/scout?team=${teamNum}&match=${match?.matchNumber}${report ? `&id=${report.id}` : ''}`}
          className={`block p-6 rounded-2xl border-4 transition-all active:scale-95 hover:scale-[1.02] ${cardStyles[status]}`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'COMPLETED' ? 'text-white/80' : 'opacity-60'}`}>
              {status === 'COMPLETED' ? 'Dossier Locked' : status === 'IN_PROGRESS' ? 'Scanning...' : 'Awaiting Data'}
            </span>
            {status === 'COMPLETED' && <ClipboardCheck size={18} className="text-white" />}
          </div>

          <div className={`text-4xl font-black italic tracking-tighter mb-2 ${status === 'COMPLETED' ? 'text-white' : 'text-black'}`}>
            #{teamNum}
          </div>

          {report && status === 'COMPLETED' && (
            <div className="text-[10px] font-bold uppercase opacity-80 italic line-clamp-1">
              Ready: {report.driveTrain} | {report.robotWeight}LBS
            </div>
          )}

          {status === 'NOT_SCOUTED' && (
            <div className="text-[10px] font-black uppercase flex items-center gap-1 opacity-40">
              <ArrowRight size={12} /> Start Scouting
            </div>
          )}
        </Link>

        {status !== 'COMPLETED' && (
          <button
            onClick={(e) => handleDeleteTeam(e, teamNum)}
            className="absolute -top-3 -right-3 bg-white border-2 border-red-600 p-2 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl opacity-0 group-hover/card:opacity-100 active:scale-90 z-10"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  if (loading) return <div className="p-12 text-center text-2xl font-black italic animate-pulse">Syncing Intel...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 pb-40 font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 border-b-8 border-black pb-8">
        <div>
          <h1 className="text-7xl font-black italic uppercase tracking-tighter text-black leading-none mb-2">Scouting Core</h1>
          <div className="flex items-center gap-4">
            <div className="bg-black text-white px-3 py-1 text-xs font-black uppercase italic tracking-widest">Live Operations</div>
            <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Strategic Intel Base
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-black uppercase italic transition-all active:scale-95 shadow-lg flex items-center gap-2"
          >
            <Download size={20} /> Export to Sheets
          </button>
          <button
            onClick={handleResetMatch}
            className="bg-white border-4 border-black hover:bg-black hover:text-white text-black px-6 py-4 rounded-xl font-black uppercase italic transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCcw size={18} /> New Match
          </button>
          <Link href="/setup" className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-xl font-black uppercase italic transition-all active:scale-95 shadow-xl flex items-center gap-2">
            <Settings size={20} /> Configure
          </Link>
        </div>
      </div>

      {!match || match.teams.length === 0 ? (
        <div className="bg-white border-8 border-black p-20 rounded-[40px] text-center max-w-3xl mx-auto shadow-2xl">
          <Info className="mx-auto text-black mb-8" size={80} />
          <h2 className="text-5xl font-black uppercase mb-6 tracking-tight">Roster Empty</h2>
          <p className="font-bold text-gray-500 mb-12 leading-relaxed italic text-lg uppercase">The scouting grid needs initialization. Deploy the match roster to begin intelligence gathering.</p>
          <Link href="/setup" className="inline-block bg-black text-white px-12 py-6 rounded-2xl font-black text-xl uppercase italic shadow-2xl hover:scale-105 active:scale-95 transition-all">Setup Roster</Link>
        </div>
      ) : (
        <div className="space-y-20">
          <div className="bg-black text-white inline-flex items-center gap-4 px-10 py-4 rounded-full shadow-2xl">
            <span className="font-black text-2xl uppercase italic tracking-tighter">Current Match: #{match.matchNumber}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Red Alliance */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b-8 border-red-600 pb-2">
                <h2 className="text-4xl font-black uppercase text-red-600 tracking-tighter italic">Red Alliance</h2>
                <div className="h-6 w-1 bg-gray-200 rounded-full"></div>
                <span className="text-xs font-black text-gray-400 uppercase italic">Support Group A</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {match.teams.slice(0, 3).map((num, i) => <StatusCard key={`red-${num}-${i}`} teamNum={num} isRed={true} />)}
              </div>
            </div>

            {/* Blue Alliance */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b-8 border-blue-600 pb-2">
                <h2 className="text-4xl font-black uppercase text-blue-600 tracking-tighter italic">Blue Alliance</h2>
                <div className="h-6 w-1 bg-gray-200 rounded-full"></div>
                <span className="text-xs font-black text-gray-400 uppercase italic">Support Group B</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {match.teams.slice(3, 6).map((num, i) => <StatusCard key={`blue-${num}-${i}`} teamNum={num} isRed={false} />)}
              </div>
            </div>
          </div>

          {/* Recent INTEL SECTION (Simplified version of feed) */}
          <div className="pt-20 border-t-8 border-black">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">Master Database</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">All confirmed dossier entries are logged below.</p>
              </div>
              <div className="text-3xl font-black italic text-black border-4 border-black px-6 py-2">
                {reports.filter(r => r.status === 'COMPLETED').length} Dossiers
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {reports.filter(r => r.status === 'COMPLETED').map(report => (
                <div key={report.id} className="bg-white border-4 border-black p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:bg-black hover:text-white transition-all shadow-xl">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-4xl font-black italic tracking-tighter">#{report.teamNumber}</span>
                      <div className={`h-4 w-1 rounded-full ${reports.indexOf(report) % 2 === 0 ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                      <span className="text-[10px] font-black uppercase opacity-60 italic">Match {report.matchNumber}</span>
                    </div>
                    <div className="text-xs font-bold uppercase italic opacity-80">
                      {report.driveTrain} • {report.robotWeight}LBS • {report.hasHang === 'YES' ? 'Climb Ready' : 'No Climb'}
                    </div>
                  </div>
                  <Link
                    href={`/scout?id=${report.id}`}
                    className="bg-black text-white group-hover:bg-white group-hover:text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase italic transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    Open Dossier <Eye size={14} />
                  </Link>
                </div>
              ))}

              {reports.filter(r => r.status === 'COMPLETED').length === 0 && (
                <div className="lg:col-span-2 text-center py-20 bg-gray-50 border-4 border-dashed border-gray-200 rounded-[40px]">
                  <div className="text-5xl font-black italic uppercase opacity-10 tracking-widest leading-none">Database Offline</div>
                  <p className="mt-4 text-gray-400 font-bold uppercase italic tracking-widest text-xs">Awaiting first dossier submission</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
