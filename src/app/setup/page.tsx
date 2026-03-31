'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Save, LayoutDashboard, ListPlus, ChevronLeft } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const INPUT_CLS = 'w-full p-4 rounded-xl font-bold outline-none text-white transition-all focus:ring-2 focus:ring-primary/50';
const INPUT_STYLE = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties;
const LABEL_CLS = 'block text-[10px] font-bold uppercase tracking-widest mb-2 text-muted';

export default function MatchSetupPage() {
  const router = useRouter();
  const { showModal } = useModal();
  const [matchNumber, setMatchNumber] = useState('');
  const [teams, setTeams] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'single'|'mass'>('single');
  const [massText, setMassText] = useState('');

  const handleTeamChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const saveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchNumber || teams.some(t => !t)) {
      showModal({ type: 'warning', title: 'Incomplete', message: 'Please specify the match and all 6 team identifiers.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SET_MATCH', matchNumber, teams }),
      });
      if (res.ok) {
        showModal({ type: 'success', title: 'Link Established', message: 'Qualification parameters synchronized.', onConfirm: () => router.push('/dashboard') });
      } else {
        showModal({ type: 'error', title: 'Sync Error', message: 'Failed to communicate with the intelligence node.' });
      }
    } catch { 
      showModal({ type: 'error', title: 'Terminal Error', message: 'A critical failure occurred during transmission.' }); 
    } finally { setLoading(false); }
  };

  const saveMass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!massText.trim()) { 
      showModal({ type: 'warning', title: 'Input Required', message: 'No data found for processing.' }); 
      return; 
    }
    setLoading(true);
    try {
      const lines = massText.trim().split('\n');
      let successCount = 0;
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 7) {
          await fetch('/api/scout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'SET_MATCH', matchNumber: parts[0], teams: parts.slice(1, 7) }),
          });
          successCount++;
        }
      }
      showModal({ type: 'success', title: 'Batch Complete', message: `${successCount} qualifications integrated into the grid.`, onConfirm: () => router.push('/dashboard') });
    } catch { 
      showModal({ type: 'error', title: 'Processing Failure', message: 'Error during mass data ingestion.' }); 
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl glass hover:bg-white/5 transition-all text-white/70">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Config Setup</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary glow-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Prescout Parameters</span>
              </div>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
             <button onClick={() => setMode('single')} className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-tight transition-all ${mode === 'single' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted'}`}>Single</button>
             <button onClick={() => setMode('mass')} className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-tight transition-all ${mode === 'mass' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-muted'}`}>Mass</button>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {mode === 'single' ? (
          <form onSubmit={saveSetup} className="space-y-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className={LABEL_CLS}>Mission Identifier</label>
              <input type="number" required placeholder="Qual #" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} className={`${INPUT_CLS} text-2xl tracking-tighter`} style={INPUT_STYLE} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strike Team • Red</h2>
                </div>
                {[0, 1, 2].map(i => (
                  <input key={i} type="number" required placeholder={`Team ${i + 1}`} value={teams[i]} onChange={e => handleTeamChange(i, e.target.value)} className={INPUT_CLS} style={{ ...INPUT_STYLE, border: '1px solid rgba(225,29,72,0.1)' }} />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-secondary" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Opposition • Blue</h2>
                </div>
                {[3, 4, 5].map(i => (
                  <input key={i} type="number" required placeholder={`Team ${i - 2}`} value={teams[i]} onChange={e => handleTeamChange(i, e.target.value)} className={INPUT_CLS} style={{ ...INPUT_STYLE, border: '1px solid rgba(59,130,246,0.1)' }} />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
               {loading ? 'Initializing...' : <><Save size={18} /> Deploy to Grid</>}
            </button>
          </form>
        ) : (
          <form onSubmit={saveMass} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className={LABEL_CLS}>Batch Data Stream</label>
                <div className="text-[8px] font-bold text-muted uppercase tracking-widest">Qual# R1 R2 R3 B1 B2 B3</div>
              </div>
              <textarea required rows={10} value={massText} onChange={e => setMassText(e.target.value)}
                placeholder={'1 254 118 1678 1323 3310 4414\n2 1690 2056 2910 1671 503 604'}
                className={`${INPUT_CLS} font-mono text-xs resize-none leading-relaxed opacity-80 focus:opacity-100`} style={INPUT_STYLE} />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 rounded-[2rem] bg-secondary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
               {loading ? 'Processing Stream...' : <><ListPlus size={18} /> Ingest Data Batch</>}
            </button>
          </form>
        )}
      </div>

      <div className="mt-12 text-center">
         <button onClick={() => router.push('/dashboard')} className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
            Return to Command Center
         </button>
      </div>
    </div>
  );
}
