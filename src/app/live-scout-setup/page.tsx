'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Save, LayoutDashboard, ListPlus } from 'lucide-react';

const INPUT_STYLE = { background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' } as React.CSSProperties;

import { useModal } from '@/context/ModalContext';

export default function LiveScoutSetupPage() {
  const router = useRouter();
  const { showModal } = useModal();
  const [matchNumber, setMatchNumber] = useState('');
  const [time, setTime] = useState('');
  const [qualRound, setQualRound] = useState('');
  const [teams, setTeams] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'single'|'mass'>('single');
  const [massText, setMassText] = useState('');

  const handleTeamChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchNumber || teams.some(t => !t)) {
      showModal({ type: 'warning', title: 'Missing Info', message: 'Please fill in the match number and all 6 team numbers.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/live-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SET_MATCH', matchNumber, time, qualRound, teams }),
      });
      const data = await res.json();
      if (res.ok) {
        showModal({ type: 'success', title: 'Match Saved', message: 'Match setup saved!' });
        setTimeout(() => router.push('/live-dashboard'), 2000);
      } else {
        showModal({ type: 'error', title: 'Save Failed', message: `Failed to save: ${data.error || res.status}` });
      }
    } catch (err: any) { 
      showModal({ type: 'error', title: 'Error', message: `Error: ${err.message}` }); 
    } finally { setLoading(false); }
  };

  const handleMassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!massText.trim()) { 
      showModal({ type: 'warning', title: 'Empty Input', message: 'Please enter at least one match.' }); 
      return; 
    }
    setLoading(true);
    const lines = massText.split('\n').map(l => l.trim()).filter(Boolean);
    let successCount = 0;
    try {
      for (const line of lines) {
        const parts = line.split(/[\s,]+/).filter(Boolean);
        if (parts.length >= 9) {
          await fetch('/api/live-scout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               type: 'SET_MATCH', 
               matchNumber: parts[0], 
               time: parts[1], 
               qualRound: parts[2], 
               teams: parts.slice(3,9) 
            }),
          });
          successCount++;
        }
      }
      showModal({ type: 'success', title: 'Success', message: `Successfully saved ${successCount} matches!` });
      setMassText('');
      setTimeout(() => router.push('/live-dashboard'), 2000);
    } catch (err: any) { 
      showModal({ type: 'error', title: 'Error', message: `Error: ${err.message}` }); 
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4" style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <div className="flex items-center justify-between gap-3 mb-10 pb-5" style={{ borderBottom: '1.5px solid #1e1e2e' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Users style={{ color: '#f59e0b' }} size={28} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Live Match Setup</h1>
        </div>
        
        <div className="flex bg-[#13131a] p-1 rounded-xl border border-[#1e1e2e]">
           <button onClick={() => setMode('single')} type="button" className="px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all" style={mode === 'single' ? { background: '#f59e0b', color: 'white' } : { color: '#64748b' }}>Single</button>
           <button onClick={() => setMode('mass')} type="button" className="px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all" style={mode === 'mass' ? { background: '#3b82f6', color: 'white' } : { color: '#64748b' }}>Mass</button>
        </div>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}>
            <div>
              <label className="block text-xs font-black uppercase mb-2" style={{ color: '#64748b' }}>Match (#)</label>
              <input type="number" required placeholder="e.g. 42" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} className="w-full text-base font-black p-4 rounded-xl outline-none text-white" style={INPUT_STYLE} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2" style={{ color: '#64748b' }}>Time</label>
              <input type="text" placeholder="e.g. 10:30AM" value={time} onChange={e => setTime(e.target.value)} className="w-full text-base font-black p-4 rounded-xl outline-none text-white" style={INPUT_STYLE} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2" style={{ color: '#64748b' }}>Qual Round</label>
              <input type="text" placeholder="e.g. Q1" value={qualRound} onChange={e => setQualRound(e.target.value)} className="w-full text-base font-black p-4 rounded-xl outline-none text-white" style={INPUT_STYLE} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 p-5 rounded-2xl" style={{ background: '#13131a', border: '1.5px solid rgba(225,29,72,0.25)' }}>
              <h2 className="font-black uppercase text-sm pb-2" style={{ color: '#e11d48', borderBottom: '1px solid rgba(225,29,72,0.2)' }}>Red Alliance</h2>
              {[0, 1, 2].map(i => (
                <input
                  key={i} type="number" required placeholder={`Red Team ${i + 1}`}
                  value={teams[i]} onChange={e => handleTeamChange(i, e.target.value)}
                  className="w-full p-4 rounded-xl outline-none font-bold text-center text-white"
                  style={{ ...INPUT_STYLE, border: '1.5px solid rgba(225,29,72,0.2)' }}
                />
              ))}
            </div>

            <div className="space-y-3 p-5 rounded-2xl" style={{ background: '#13131a', border: '1.5px solid rgba(59,130,246,0.25)' }}>
              <h2 className="font-black uppercase text-sm pb-2" style={{ color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.2)' }}>Blue Alliance</h2>
              {[3, 4, 5].map(i => (
                <input
                  key={i} type="number" required placeholder={`Blue Team ${i - 2}`}
                  value={teams[i]} onChange={e => handleTeamChange(i, e.target.value)}
                  className="w-full p-4 rounded-xl outline-none font-bold text-center text-white"
                  style={{ ...INPUT_STYLE, border: '1.5px solid rgba(59,130,246,0.2)' }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 10px 30px rgba(245,158,11,0.35)' }}>
              {loading ? 'Saving...' : <><Save size={22} /> Initialize Real-Time Match</>}
            </button>
            <button type="button" onClick={() => router.push('/live-dashboard')}
              className="w-full flex justify-center items-center gap-2 p-5 rounded-2xl font-black uppercase tracking-widest text-base transition-all active:scale-95"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}>
              <LayoutDashboard size={20} /> Back to Real-Time Status
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleMassSubmit} className="space-y-5">
          <div className="p-5 rounded-2xl space-y-3" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}>
            <label className="block text-xs font-black uppercase" style={{ color: '#64748b' }}>Format per line: MatchNum Time QualRound Red1 Red2 Red3 Blue1 Blue2 Blue3</label>
            <textarea
              required rows={8}
              placeholder={'1 10:00AM Q1 254 118 1678 1323 3310 4414\n2 10:15AM Q2 1690 2056 2910 1671 503 604'}
              value={massText} onChange={e => setMassText(e.target.value)}
              className="w-full text-xs sm:text-sm font-bold p-4 rounded-xl outline-none text-white font-mono resize-none leading-relaxed whitespace-pre"
              style={INPUT_STYLE}
            />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 10px 30px rgba(59,130,246,0.35)' }}>
              {loading ? 'Processing...' : <><ListPlus size={22} /> Process All Matches</>}
            </button>
            <button type="button" onClick={() => router.push('/live-dashboard')}
              className="w-full flex justify-center items-center gap-2 p-5 rounded-2xl font-black uppercase tracking-widest text-base transition-all active:scale-95"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}>
              <LayoutDashboard size={20} /> Back to Real-Time Status
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
