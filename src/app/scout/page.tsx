'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, ChevronLeft } from 'lucide-react';

const CARD = { background: '#13131a', border: '1.5px solid #1e1e2e' } as React.CSSProperties;
const INPUT_CLS = 'w-full p-4 rounded-2xl font-bold outline-none text-white';
const INPUT_STYLE = { background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' } as React.CSSProperties;
const LABEL_CLS = 'block text-xs font-black uppercase mb-2' as const;

function Chips({ field, options, label, value, set }: { field: string; options: string[]; label: string; value: string; set: (f: string, v: any) => void }) {
  return (
    <div>
      <label className={LABEL_CLS} style={{ color: '#64748b' }}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => set(field, o)}
            className="px-4 py-2 rounded-xl font-black uppercase text-xs transition-all"
            style={value === o
              ? { background: '#e11d48', color: '#fff', border: '1.5px solid #e11d48' }
              : { background: '#0d0d14', color: '#64748b', border: '1.5px solid #1e1e2e' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ field, label, value, set }: { field: string; label: string; value: boolean; set: (f: string, v: any) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl" style={CARD}>
      <label className="font-black uppercase text-sm text-white">{label}</label>
      <div className="flex gap-2">
        {['YES', 'NO'].map(v => {
          const isVal = value === (v === 'YES');
          return (
            <button key={v} type="button" onClick={() => set(field, v === 'YES')}
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

function Section({ title, children, accent = '#e11d48' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="p-6 rounded-3xl space-y-5" style={CARD}>
      <h2 className="text-base font-black uppercase italic pb-3" style={{ borderBottom: `1.5px solid ${accent}33`, color: accent }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

import { useModal } from '@/context/ModalContext';

function ScoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [formData, setFormData] = useState({
    id: '',
    status: 'IN_PROGRESS',
    scouterName: '',
    teamNumber: searchParams.get('team') || '',
    matchNumber: searchParams.get('match') || '',
    gameStrategy: '',
    drivetrainType: '',
    robotWeight: '',
    scoringRange: '',
    storageCapacity: '',
    outtakeType: '',
    driverExperience: '',
    autoDescription: '',
    autoStartPositions: '',
    autoAccuracy: '',
    hasHang: false,
    shootingAccuracy: '',
    cycleTime: '',
    intakeType: '',
    avgFuelScored: '',
    hasVision: false,
    hasMajorIssues: false,
    commonIssue: '',
  });

  useEffect(() => {
    const reportId = searchParams.get('id');
    if (reportId) {
      fetch('/api/scout')
        .then(r => r.json())
        .then(data => {
          const existing = data.reports.find((r: any) => r.id === reportId);
          if (existing) setFormData(existing);
          setIsInitializing(false);
        })
        .catch(() => setIsInitializing(false));
    } else {
      setFormData(prev => ({ ...prev, id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36) }));
      setIsInitializing(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isInitializing || formData.status === 'COMPLETED' || !formData.id || !formData.matchNumber || !formData.teamNumber) return;
    const t = setTimeout(async () => {
      try {
        await fetch('/api/scout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, status: 'IN_PROGRESS' }) });
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, [formData, isInitializing]);

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!formData.scouterName || !formData.teamNumber) { 
      showModal({ type: 'warning', title: 'Incomplete', message: 'Please fill out scouter name and team number!' }); 
      return; 
    }
    setLoading(true);
    try {
      const res = await fetch('/api/scout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, status }) });
      if (res.ok && status === 'COMPLETED') {
        setFormData(prev => ({ ...prev, status: 'COMPLETED' }));
        showModal({ 
          type: 'success', 
          title: 'Submitted', 
          message: 'Scouting report SUBMITTED!', 
          onConfirm: () => router.push('/dashboard') 
        });
      } else if (!res.ok) {
        const d = await res.json();
        showModal({ type: 'error', title: 'Submission Failed', message: d.error || `Server error: ${res.status}` });
      }
    } catch { 
      showModal({ type: 'error', title: 'Error', message: 'Error syncing data.' }); 
    } finally { setLoading(false); }
  };

  if (isInitializing) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="text-xl font-black italic uppercase animate-pulse" style={{ color: '#e11d48' }}>Initializing...</div>
    </div>
  );



  return (
    <div className="max-w-3xl mx-auto pb-32 px-4" style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between pt-4 pb-4" style={{ borderBottom: '1.5px solid #1e1e2e' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full transition-all active:scale-90" style={{ background: '#13131a' }}>
            <ChevronLeft size={26} color="#f1f5f9" />
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Prescout</h1>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1"
          style={formData.status === 'IN_PROGRESS'
            ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
            : { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
          {formData.status === 'IN_PROGRESS' ? <><Clock size={11} /> Draft</> : <><CheckCircle size={11} /> Submitted</>}
        </div>
      </div>

      <div className="space-y-5">
        <Section title="Scout Info" accent="#f59e0b">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { field: 'scouterName', label: 'Your Name', placeholder: 'Scouter Name', type: 'text' },
              { field: 'teamNumber', label: 'Team #', placeholder: 'e.g. 254', type: 'number' },
              { field: 'matchNumber', label: 'Qual #', placeholder: 'e.g. 1', type: 'number' },
            ].map(({ field, label, placeholder, type }) => (
              <div key={field}>
                <label className={LABEL_CLS} style={{ color: '#64748b' }}>{label}</label>
                <input type={type} placeholder={placeholder} value={(formData as any)[field]}
                  onChange={e => set(field, e.target.value)}
                  className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Robot Info" accent="#e11d48">
          <Chips field="gameStrategy" label="Game Strategy / Role" options={['Offensive', 'Defense', 'Hybrid', 'Support']} value={formData.gameStrategy} set={set} />
          <Chips field="drivetrainType" label="Drive Train Type" options={['Swerve', 'Tank', 'Mecanum', 'Other']} value={formData.drivetrainType} set={set} />
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Robot Weight (lbs)</label>
            <input type="text" placeholder="e.g. 120 lbs" value={formData.robotWeight} onChange={e => set('robotWeight', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
          <Chips field="scoringRange" label="Scoring Range" options={['Short', 'Mid Field', 'Long']} value={formData.scoringRange} set={set} />
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Storage Capacity (# of game pieces)</label>
            <input type="text" placeholder="e.g. 2 notes" value={formData.storageCapacity} onChange={e => set('storageCapacity', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Outtake Type</label>
            <input type="text" placeholder="e.g. Roller, Catapult..." value={formData.outtakeType} onChange={e => set('outtakeType', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
          <Chips field="intakeType" label="Intake Type" options={['Ground', 'Human Player', 'Both']} value={formData.intakeType} set={set} />
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Driver Experience</label>
            <input type="text" placeholder="e.g. 2 years, first season..." value={formData.driverExperience} onChange={e => set('driverExperience', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
        </Section>

        <Section title="Autonomous" accent="#3b82f6">
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>What is their auto?</label>
            <textarea rows={2} value={formData.autoDescription} onChange={e => set('autoDescription', e.target.value)}
              placeholder="e.g. Leaves the line and scores 1 note..." className="w-full p-4 rounded-2xl font-bold outline-none text-white resize-none"
              style={{ ...INPUT_STYLE }} />
          </div>
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Starting positions for auto</label>
            <input type="text" placeholder="e.g. Left, Center, Right" value={formData.autoStartPositions} onChange={e => set('autoStartPositions', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
          <Chips field="autoAccuracy" label="Auto Accuracy" options={['Low', 'Medium', 'High', 'Consistent']} value={formData.autoAccuracy} set={set} />
        </Section>

        <Section title="Teleop & Performance" accent="#22c55e">
          <YesNo field="hasHang" label="Do they have hang (climb)?" value={formData.hasHang} set={set} />
          <Chips field="shootingAccuracy" label="Shooting Accuracy" options={['Low', 'Medium', 'High', 'Very High']} value={formData.shootingAccuracy} set={set} />
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Cycle Time (approx.)</label>
            <input type="text" placeholder="e.g. ~15 sec" value={formData.cycleTime} onChange={e => set('cycleTime', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Average Fuel Scored Per Match</label>
            <input type="text" placeholder="e.g. ~8 notes" value={formData.avgFuelScored} onChange={e => set('avgFuelScored', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
        </Section>

        <Section title="Tech & Reliability" accent="#f59e0b">
          <YesNo field="hasVision" label="Do they have vision?" value={formData.hasVision} set={set} />
          <YesNo field="hasMajorIssues" label="Major electrical/mechanical issues?" value={formData.hasMajorIssues} set={set} />
          <div>
            <label className={LABEL_CLS} style={{ color: '#64748b' }}>Most common issue</label>
            <input type="text" placeholder="e.g. Belt slipping, connection drops..." value={formData.commonIssue} onChange={e => set('commonIssue', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
          </div>
        </Section>

        {/* Submit bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 flex z-50" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1e1e2e' }}>
          <button onClick={() => handleSave('COMPLETED')} disabled={loading}
            className="w-full font-black uppercase p-5 rounded-2xl text-lg text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 10px 40px rgba(225,29,72,0.4)' }}>
            {loading ? 'Syncing...' : <><CheckCircle size={22} /> Finalize &amp; Submit</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f', color: '#e11d48' }}><div className="font-black animate-pulse uppercase">Loading...</div></div>}>
      <ScoutForm />
    </Suspense>
  );
}
