'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ChevronLeft, Activity, Info, Zap, AlertTriangle, Save } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const INPUT_CLS = 'w-full p-4 rounded-xl font-medium outline-none text-white transition-all focus:ring-2 focus:ring-accent/50';
const INPUT_STYLE = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties;
const LABEL_CLS = 'block text-[10px] font-bold uppercase tracking-wider mb-2 text-muted';

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-3xl glass-card relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />
      <label className="text-xs font-black uppercase tracking-widest text-accent/80 group-hover:text-accent transition-colors">{label}</label>
      <div className="flex items-center gap-8">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl font-black hover:bg-white/10 active:scale-90 transition-all border-white/5">
          -
        </button>
        <div className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {value}
        </div>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl font-black hover:bg-white/10 active:scale-90 transition-all border-white/5 text-accent">
          +
        </button>
      </div>
    </div>
  );
}

function YesNo({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl glass-card">
      <label className="font-bold uppercase text-[11px] tracking-wider text-white/90">{label}</label>
      <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
        {[true, false].map(v => (
          <button key={String(v)} type="button" onClick={() => set(v)}
            className="px-6 py-2 rounded-lg font-black uppercase text-[10px] transition-all"
            style={value === v
              ? { background: v ? '#10b981' : '#e11d48', color: '#fff' }
              : { color: 'rgba(255,255,255,0.3)' }}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
          <Icon className="text-accent" size={18} />
        </div>
        <h2 className="text-lg font-black uppercase italic tracking-tight text-white/90">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-5">
        {children}
      </div>
    </div>
  );
}

type TabType = 'info' | 'scoring' | 'endgame';

export default function LiveScoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('scoring'); // Default to scoring for speed

  const [formData, setFormData] = useState({
    id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
    scouterName: '',
    teamNumber: searchParams.get('team') || '',
    matchNumber: searchParams.get('match') || '',
    scored: 0,
    autonScored: 0,
    hasHang: false,
    comments: '',
    dirty: false
  });

  useEffect(() => {
    const tNum = searchParams.get('team');
    const mNum = searchParams.get('match');
    const initialTab = searchParams.get('tab') as TabType;

    if (initialTab && ['info', 'scoring', 'endgame'].includes(initialTab)) {
      setActiveTab(initialTab);
    }

    if (!tNum || !mNum) return;

    fetch('/api/live-scout')
      .then(r => r.json())
      .then(d => {
        if (!d || !d.reports) return;
        const existing = d.reports.find((r: any) => 
          Number(r.teamNumber) === Number(tNum) && 
          Number(r.matchNumber) === Number(mNum)
        );
        if (existing) {
          setFormData({
            id: existing.id,
            scouterName: existing.scouterName || '',
            teamNumber: existing.teamNumber.toString(),
            matchNumber: existing.matchNumber.toString(),
            scored: existing.scored || 0,
            autonScored: existing.autonScored || 0,
            hasHang: !!existing.hasHang,
            comments: existing.comments || '',
            dirty: false
          });
          setSyncStatus('saved');
        }
      })
      .catch(err => console.error('Failed to load existing data', err));
  }, [searchParams]);

  useEffect(() => {
    if (!formData.dirty) return;
    setSyncStatus('saving');
    const t = setTimeout(() => {
      fetch('/api/live-scout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, type: 'REPORT' }) })
        .then(res => {
          if (res.ok) setSyncStatus('saved');
          else setSyncStatus('error');
        })
        .catch(() => setSyncStatus('error'));
      setFormData(prev => ({ ...prev, dirty: false }));
    }, 1000);
    return () => clearTimeout(t);
  }, [formData]);

  const update = (obj: any) => setFormData(p => ({ ...p, ...obj, dirty: true }));

  const handleSave = async () => {
    if (!formData.scouterName || !formData.teamNumber) { 
      showModal({ type: 'warning', title: 'Incomplete', message: 'Please fill out scouter name and team number!' }); 
      setActiveTab('info');
      return; 
    }
    setLoading(true);
    try {
      const res = await fetch('/api/live-scout', { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ ...formData, type: 'REPORT' }) 
      });
      if (res.ok) {
        showModal({ 
          type: 'success', 
          title: 'Submitted', 
          message: 'Real-time scouting report SUBMITTED!', 
          onConfirm: () => router.push('/live-dashboard') 
        });
      } else {
         const d = await res.json();
         showModal({ type: 'error', title: 'Sync Failed', message: d.error || 'Failed to sync' });
      }
    } catch { 
      showModal({ type: 'error', title: 'Error', message: 'Error syncing data.' }); 
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto pb-40 pt-6 px-4">
      {/* Header Area */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2.5 rounded-xl glass hover:bg-white/5 transition-all active:scale-95 text-white/70">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Live Scout</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Real-Time Data Injection</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {syncStatus && (
              <div className="px-3 py-1 rounded-full glass border-white/5 flex items-center gap-2">
                 <div className={`w-1 h-1 rounded-full ${syncStatus === 'saving' ? 'bg-amber-500 animate-pulse' : syncStatus === 'saved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: syncStatus === 'saving' ? 'var(--accent)' : syncStatus === 'saved' ? '#10b981' : 'var(--primary)' }}>
                   {syncStatus === 'saving' ? 'Injecting...' : syncStatus === 'saved' ? 'Synced' : 'Link Failure'}
                 </span>
              </div>
            )}
            <Activity className="text-accent/20" size={24} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-card">
          {(['info', 'scoring', 'endgame'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                const params = new URLSearchParams(searchParams.toString());
                params.set('tab', tab);
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-tight transition-all active:scale-95`}
              style={activeTab === tab ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--muted)' }}
            >
              {tab === 'info' ? 'Header' : tab === 'scoring' ? 'Action' : 'Endgame'}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden min-h-[400px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {activeTab === 'info' && (
          <Section title="Metadata" icon={Info}>
            <div className="space-y-6">
              <div>
                <label className={LABEL_CLS}>Operator Identity</label>
                <input type="text" placeholder="Enter your name" value={formData.scouterName} onChange={e => update({scouterName: e.target.value})} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Target Team</label>
                  <input type="number" placeholder="Team #" value={formData.teamNumber} onChange={e => update({teamNumber: e.target.value})} className={INPUT_CLS} style={INPUT_STYLE} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Event Match</label>
                  <input type="number" placeholder="Match #" value={formData.matchNumber} onChange={e => update({matchNumber: e.target.value})} className={INPUT_CLS} style={INPUT_STYLE} />
                </div>
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'scoring' && (
          <Section title="Real-Time Scoring" icon={Zap}>
            <div className="space-y-10 py-4">
              <ScoreInput label="Auton Cycles" value={formData.autonScored} onChange={v => update({autonScored: v})} />
              <ScoreInput label="Teleop Cycles" value={formData.scored} onChange={v => update({scored: v})} />
            </div>
          </Section>
        )}

        {activeTab === 'endgame' && (
          <Section title="Final Status" icon={AlertTriangle}>
            <div className="space-y-6">
              <YesNo label="Successful Hang?" value={formData.hasHang} set={v => update({hasHang: v})} />
              <div>
                <label className={LABEL_CLS}>Observational Notes</label>
                <textarea rows={6} value={formData.comments} onChange={e => update({comments: e.target.value})}
                  placeholder="Note any critical failures or exemplary plays..." 
                  className={`${INPUT_CLS} resize-none`} style={INPUT_STYLE} />
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-[60]">
        <div className="glass p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-2">
          <button onClick={handleSave} disabled={loading}
            className="w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white shadow-[0_8px_25px_var(--accent-glow)] transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d97706)' }}>
            <Activity size={16} /> {loading ? 'Transmitting...' : 'Finalize Transmission'}
          </button>
        </div>
      </div>
    </div>
  );
}
