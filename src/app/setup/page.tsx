'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Save, LayoutDashboard, ListPlus } from 'lucide-react';

const INPUT_STYLE = { background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' } as React.CSSProperties;

import { useModal } from '@/context/ModalContext';

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
      showModal({ type: 'warning', title: 'Missing Info', message: 'Please fill in the match number and all 6 team numbers.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SET_MATCH', matchNumber, teams }),
      });
      const data = await res.json();
      if (res.ok) {
        showModal({ type: 'success', title: 'Match Saved', message: 'Match setup saved! Directing to dashboard...' });
        setTimeout(() => window.location.href = '/dashboard', 2000);
      } else {
        showModal({ type: 'error', title: 'Save Failed', message: `Failed to save: ${data.error || res.status}` });
      }
    } catch (err: any) { 
      showModal({ type: 'error', title: 'Error', message: `Error: ${err.message}` }); 
    } finally { setLoading(false); }
  };

  const saveMass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!massText.trim()) { 
      showModal({ type: 'warning', title: 'Empty Input', message: 'Please enter at least one match.' }); 
      return; 
    }
    setLoading(true);
    try {
      const lines = massText.trim().split('\n');
      let successCount = 0;
      let failCount = 0;
      let errors: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 7) {
          const m = parts[0];
          const ts = parts.slice(1, 7);
          try {
            const res = await fetch('/api/scout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'SET_MATCH', matchNumber: m, teams: ts }),
            });
            if (res.ok) {
              successCount++;
            } else {
              const d = await res.json();
              failCount++;
              errors.push(`Qual ${m}: ${d.error || res.status}`);
            }
          } catch (err) {
            failCount++;
            errors.push(`Qual ${m}: Connection error`);
          }
        }
      }
      
      if (failCount === 0) {
        showModal({ type: 'success', title: 'Import Complete', message: `Successfully saved all ${successCount} matches!` });
        setMassText('');
      } else {
        showModal({ 
          type: 'warning', 
          title: 'Import Finished with Errors', 
          message: `Saved ${successCount} matches, but ${failCount} failed.\n\nErrors:\n${errors.join('\n')}` 
        });
      }
    } catch (err: any) { 
      showModal({ type: 'error', title: 'Error', message: `Error processing mass import: ${err.message}` }); 
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4" style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <div className="flex items-center justify-between gap-3 mb-10 pb-5" style={{ borderBottom: '1.5px solid #1e1e2e' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(225,29,72,0.15)' }}>
            <Users style={{ color: '#e11d48' }} size={28} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Prescout Qual Setup</h1>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-[#13131a] p-1 rounded-xl border border-[#1e1e2e]">
           <button onClick={() => setMode('single')} type="button" className="px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all" style={mode === 'single' ? { background: '#e11d48', color: 'white' } : { color: '#64748b' }}>Single</button>
           <button onClick={() => setMode('mass')} type="button" className="px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all" style={mode === 'mass' ? { background: '#3b82f6', color: 'white' } : { color: '#64748b' }}>Mass</button>
        </div>
      </div>

      {mode === 'single' ? (
        <form onSubmit={saveSetup} className="space-y-5">
          <div className="p-5 rounded-2xl" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}>
            <label className="block text-xs font-black uppercase mb-2" style={{ color: '#64748b' }}>Qual Number</label>
            <input
              type="number" required placeholder="e.g. 42" value={matchNumber}
              onChange={e => setMatchNumber(e.target.value)}
              className={`w-full ${matchNumber.length > 2 ? 'text-xl' : 'text-2xl'} font-black p-4 rounded-xl outline-none text-white transition-all`}
              style={INPUT_STYLE}
            />
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
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 10px 30px rgba(225,29,72,0.35)' }}>
              {loading ? 'Saving...' : <><Save size={22} /> Initialize Qualification</>}
            </button>
            <button type="button" onClick={() => router.push('/dashboard')}
              className="w-full flex justify-center items-center gap-2 p-5 rounded-2xl font-black uppercase tracking-widest text-base transition-all active:scale-95"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}>
              <LayoutDashboard size={20} /> Back to Prescout Status
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={saveMass} className="space-y-5">
          <div className="p-5 rounded-2xl space-y-3" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}>
            <label className="block text-xs font-black uppercase" style={{ color: '#64748b' }}>Format per line: QualNum Red1 Red2 Red3 Blue1 Blue2 Blue3</label>
            <textarea
              required rows={8}
              placeholder={'1 254 118 1678 1323 3310 4414\n2 1690 2056 2910 1671 503 604\n3 6905 111 27 67 1114 2056'}
              value={massText} onChange={e => setMassText(e.target.value)}
              className="w-full text-xs sm:text-sm font-bold p-4 rounded-xl outline-none text-white font-mono resize-none leading-relaxed"
              style={INPUT_STYLE}
            />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 10px 30px rgba(59,130,246,0.35)' }}>
              {loading ? 'Processing...' : <><ListPlus size={22} /> Process All Quals</>}
            </button>
            <button type="button" onClick={() => router.push('/dashboard')}
              className="w-full flex justify-center items-center gap-2 p-5 rounded-2xl font-black uppercase tracking-widest text-base transition-all active:scale-95"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}>
              <LayoutDashboard size={20} /> Back to Prescout Status
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
