'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ChevronLeft, Activity } from 'lucide-react';

const CARD = { background: '#13131a', border: '1.5px solid #1e1e2e' } as React.CSSProperties;
const INPUT_CLS = 'w-full p-4 rounded-2xl font-bold outline-none text-white';
const INPUT_STYLE = { background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' } as React.CSSProperties;
const LABEL_CLS = 'block text-xs font-black uppercase mb-2' as const;

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className={LABEL_CLS} style={{ color: '#64748b' }}>{label}</label>
      <input
        type="number"
        min="0"
        value={value || ''}
        placeholder="0"
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full text-center p-6 rounded-2xl font-black text-5xl outline-none text-white focus:ring-4 focus:ring-[#f59e0b]/50 transition-all"
        style={INPUT_STYLE}
      />
    </div>
  );
}

function YesNo({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl" style={CARD}>
      <label className="font-black uppercase text-sm text-white">{label}</label>
      <div className="flex gap-2">
        {['YES', 'NO'].map(v => {
          const isVal = value === (v === 'YES');
          return (
            <button key={v} type="button" onClick={() => set(v === 'YES')}
              className="px-5 py-2 rounded-xl font-black uppercase text-xs transition-all"
              style={isVal
                ? { background: v === 'YES' ? '#22c55e' : '#e11d48', color: '#fff', border: `1.5px solid ${v === 'YES' ? '#22c55e' : '#e11d48'}` }
                : { background: '#0d0d14', color: '#475569', border: '1.5px solid #1e1e2e' }}>
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, children, accent = '#f59e0b' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="p-6 rounded-3xl space-y-5" style={CARD}>
      <h2 className="text-base font-black uppercase italic pb-3" style={{ borderBottom: `1.5px solid ${accent}33`, color: accent }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function LiveScoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

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

  // Load existing data on mount
  useEffect(() => {
    const tNum = searchParams.get('team');
    const mNum = searchParams.get('match');
    if (!tNum || !mNum) return;

    fetch('/api/live-scout')
      .then(r => r.json())
      .then(d => {
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
    if (!formData.scouterName || !formData.teamNumber) { alert('Please fill out scouter name and team number!'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/live-scout', { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ ...formData, type: 'REPORT' }) 
      });
      if (res.ok) {
        router.push('/live-dashboard');
      } else {
         const d = await res.json();
         alert(d.error || 'Failed to sync');
      }
    } catch { alert('Error syncing data.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 px-4" style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <div className="mb-8 flex items-center justify-between pt-4 pb-4" style={{ borderBottom: '1.5px solid #1e1e2e' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/')} className="p-2 rounded-full transition-all active:scale-90" style={{ background: '#13131a' }}>
            <ChevronLeft size={26} color="#f1f5f9" />
          </button>
          <Activity className="ml-2" color="#f59e0b" size={28} />
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Real-Time Scout</h1>
        </div>
        {syncStatus && (
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#13131a', border: '1px solid #1e1e2e' }}>
             <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'saving' ? 'bg-amber-500 animate-pulse' : syncStatus === 'saved' ? 'bg-green-500' : 'bg-red-500'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: syncStatus === 'saving' ? '#f59e0b' : syncStatus === 'saved' ? '#22c55e' : '#ef4444' }}>
               {syncStatus === 'saving' ? 'Saving...' : syncStatus === 'saved' ? 'Saved' : 'Error'}
             </span>
           </div>
        )}
      </div>

      <div className="space-y-5">
        <Section title="Scout Info" accent="#3b82f6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div>
                <label className={LABEL_CLS} style={{ color: '#64748b' }}>Your Name</label>
                <input type="text" placeholder="Scouter Name" value={formData.scouterName} onChange={e => update({scouterName: e.target.value})} className={INPUT_CLS} style={INPUT_STYLE} />
             </div>
             <div>
                <label className={LABEL_CLS} style={{ color: '#64748b' }}>Team #</label>
                <input type="number" placeholder="e.g. 254" value={formData.teamNumber} onChange={e => update({teamNumber: e.target.value})} className={INPUT_CLS} style={INPUT_STYLE} />
             </div>
             <div>
                <label className={LABEL_CLS} style={{ color: '#64748b' }}>Match #</label>
                <input type="number" placeholder="e.g. 1" value={formData.matchNumber} onChange={e => update({matchNumber: e.target.value})} className={INPUT_CLS} style={INPUT_STYLE} />
             </div>
          </div>
        </Section>

        <Section title="Scoring" accent="#f59e0b">
          <ScoreInput label="Auton Points Scored" value={formData.autonScored} onChange={v => update({autonScored: v})} />
          <ScoreInput label="Teleop Times Scored" value={formData.scored} onChange={v => update({scored: v})} />
        </Section>

        <Section title="Endgame & Notes" accent="#e11d48">
          <YesNo label="Did the robot hang?" value={formData.hasHang} set={v => update({hasHang: v})} />
          <div>
             <label className={LABEL_CLS} style={{ color: '#64748b' }}>Comments</label>
             <textarea rows={4} value={formData.comments} onChange={e => update({comments: e.target.value})}
               placeholder="e.g. robot worked pretty fast, mechanical part of robot stopped working, or the robot didnt move at all" 
               className="w-full p-4 rounded-2xl font-bold outline-none text-white resize-none" style={INPUT_STYLE} />
          </div>
        </Section>

        <div className="fixed bottom-0 left-0 right-0 p-4 flex z-50" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1e1e2e' }}>
          <button onClick={handleSave} disabled={loading}
            className="w-full font-black uppercase p-5 rounded-2xl text-lg text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 10px 40px rgba(245,158,11,0.4)' }}>
            {loading ? 'Submitting...' : <><CheckCircle size={22} /> Finalize &amp; Submit</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveScoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f', color: '#f59e0b' }}><div className="font-black animate-pulse uppercase">Loading...</div></div>}>
      <LiveScoutForm />
    </Suspense>
  );
}
