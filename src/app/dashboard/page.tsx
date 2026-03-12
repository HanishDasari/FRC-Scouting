'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Users, ClipboardCheck, Info } from 'lucide-react';

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
  const [match, setMatch] = useState<MatchConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scout')
      .then(res => res.json())
      .then(data => {
        if (data.reports) setReports(data.reports);
        if (data.currentMatch) setMatch(data.currentMatch);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTeamStatus = (teamNum: number) => {
    if (!match) return 'NOT_SCOUTED';
    const teamReports = reports.filter(r => r.teamNumber === teamNum && r.matchNumber === match.matchNumber);
    if (teamReports.length === 0) return 'NOT_SCOUTED';
    if (teamReports.some(r => r.status === 'COMPLETED')) return 'COMPLETED';
    return 'IN_PROGRESS';
  };

  const getReportId = (teamNum: number) => {
    const report = reports.find(r => r.teamNumber === teamNum && r.matchNumber === (match?.matchNumber || 0));
    return report?.id || null;
  };

  const StatusCard = ({ teamNum, isRed }: { teamNum: number, isRed: boolean }) => {
    const status = getTeamStatus(teamNum);
    const reportId = getReportId(teamNum);
    const colors = {
      NOT_SCOUTED: 'bg-red-500 border-red-700 text-white',
      IN_PROGRESS: 'bg-blue-500 border-blue-700 text-white',
      COMPLETED: 'bg-green-500 border-green-700 text-white'
    } as any;

    return (
      <Link href={`/scout?team=${teamNum}&match=${match?.matchNumber}${reportId ? `&id=${reportId}` : ''}`} className={`block p-6 rounded-2xl border-b-8 shadow-lg transition-all active:scale-95 ${colors[status]}`}>
        <div className="text-sm font-black uppercase opacity-70 mb-1">{isRed ? 'Red' : 'Blue'} Alliance</div>
        <div className="text-4xl font-black italic tracking-tighter mb-4">{teamNum}</div>
        <div className="flex items-center gap-2 font-black uppercase text-xs">
          {status === 'NOT_SCOUTED' && 'Needed'}
          {status === 'IN_PROGRESS' && 'In Progress'}
          {status === 'COMPLETED' && 'Completed'}
          <ClipboardCheck size={16} />
        </div>
      </Link>
    );
  };

  if (loading) return <div className="p-12 text-center text-2xl font-black italic animate-pulse">Synchronizing Strategist Data...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary">Scouting Control</h1>
          <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Alliance Status Dashboard</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Link href="/setup" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-xl font-black uppercase hover:bg-gray-900 transition-all shadow-lg active:scale-95">
            <Users size={20} /> Setup Match
          </Link>
        </div>
      </div>

      {!match || match.teams.length === 0 ? (
        <div className="bg-red-50 border-4 border-red-200 p-8 rounded-3xl text-center">
          <Info className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-black uppercase mb-2">No Match Configured</h2>
          <p className="font-medium text-gray-600 mb-6">Setup the current match roster to begin tracking alliance status.</p>
          <Link href="/setup" className="inline-block bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase shadow-lg shadow-red-200 active:scale-95 transition-all">Setup Match Now</Link>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-2xl border-2 border-gray-200 inline-block px-10">
            <span className="font-black text-2xl uppercase italic">Match {match.matchNumber}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase text-red-600 tracking-tighter border-b-4 border-red-600 inline-block pb-1">Red Alliance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {match.teams.slice(0, 3).map((num, i) => <StatusCard key={`red-${num}-${i}`} teamNum={num} isRed={true} />)}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase text-blue-600 tracking-tighter border-b-4 border-blue-600 inline-block pb-1">Blue Alliance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {match.teams.slice(3, 6).map((num, i) => <StatusCard key={`blue-${num}-${i}`} teamNum={num} isRed={false} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-16 bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-100 flex flex-wrap gap-8 justify-center items-center">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div> <span className="font-black uppercase text-xs">Needed</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div> <span className="font-black uppercase text-xs">In Progress</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div> <span className="font-black uppercase text-xs">Scouted</span></div>
      </div>
    </div>
  );
}
