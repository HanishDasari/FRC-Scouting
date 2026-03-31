'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Save, ChevronLeft, Link as LinkIcon } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const INPUT_CLS = 'w-full p-4 rounded-xl font-bold outline-none text-white transition-all focus:ring-2 focus:ring-accent/50';
const INPUT_STYLE = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties;
const LABEL_CLS = 'block text-[10px] font-bold uppercase tracking-widest mb-2 text-muted';

export default function LiveScoutSetupPage() {
  const router = useRouter();
  const { showModal } = useModal();
  const [matchNumber, setMatchNumber] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const saveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchNumber || !teamNumber) {
      showModal({ type: 'warning', title: 'Incomplete', message: 'Specify both match and team identifiers for real-time tracking.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/live-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SET_MATCH', matchNumber, teams: [teamNumber] }),
      });
      if (res.ok) {
        showModal({ type: 'success', title: 'Telemetry Ready', message: 'Link established with the target team.', onConfirm: () => router.push(`/live-scout?team=${teamNumber}&match=${matchNumber}`) });
      } else {
        showModal({ type: 'error', title: 'Sync Error', message: 'Failed to establish real-time link.' });
      }
    } catch { 
      showModal({ type: 'error', title: 'Terminal Error', message: 'Critical failure during telemetry initialization.' }); 
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2.5 rounded-xl glass hover:bg-white/5 transition-all text-white/70">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Live Initialization</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent glow-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Real-Time Data Feed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        <form onSubmit={saveSetup} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <label className={LABEL_CLS}>Qualification Mission</label>
            <input type="number" required placeholder="Match #" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} className={`${INPUT_CLS} text-2xl tracking-tighter focus:ring-accent/30`} style={INPUT_STYLE} />
          </div>

          <div>
            <label className={LABEL_CLS}>Target Team Identifier</label>
            <input type="number" required placeholder="Team #" value={teamNumber} onChange={e => setTeamNumber(e.target.value)} className={`${INPUT_CLS} text-4xl font-black italic tracking-tighter text-accent`} style={INPUT_STYLE} />
          </div>

          <div className="p-5 rounded-2xl glass border-accent/10 flex items-start gap-4">
             <div className="p-2 rounded-lg bg-accent/20">
                <LinkIcon size={16} className="text-accent" />
             </div>
             <p className="text-[10px] font-bold text-muted uppercase tracking-wider leading-relaxed">
                Initializing a live link will override any existing unsynced data for this team-match pairing.
             </p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-[2rem] bg-accent text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
             {loading ? 'Initializing Stream...' : <><Activity size={18} /> Establish Live Link</>}
          </button>
        </form>
      </div>

      <div className="mt-12 text-center">
         <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
            Return to Command Center
         </button>
      </div>
    </div>
  );
}
