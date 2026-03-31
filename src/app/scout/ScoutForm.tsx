'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, ChevronLeft, Info, Cpu, Zap, Activity, AlertTriangle, Save } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const INPUT_CLS = 'w-full p-4 rounded-xl font-medium outline-none text-white transition-all focus:ring-2 focus:ring-primary/50';
const INPUT_STYLE = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties;
const LABEL_CLS = 'block text-[10px] font-bold uppercase tracking-wider mb-2 text-muted';

function Chips({ field, options, label, value, set }: { field: string; options: string[]; label: string; value: string; set: (f: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <label className={LABEL_CLS}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => set(field, o)}
            className="px-4 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-tight transition-all active:scale-95"
            style={value === o
              ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ field, label, value, set }: { field: string; label: string; value: boolean; set: (f: string, v: any) => void }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl glass-card">
      <label className="font-bold uppercase text-[11px] tracking-wider text-white/90">{label}</label>
      <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
        {[true, false].map(v => (
          <button key={String(v)} type="button" onClick={() => set(field, v)}
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
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="text-primary" size={18} />
        </div>
        <h2 className="text-lg font-black uppercase italic tracking-tight text-white/90">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-5">
        {children}
      </div>
    </div>
  );
}

type TabType = 'info' | 'robot' | 'auto' | 'teleop' | 'reliability';

export default function ScoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showModal } = useModal();
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const [formData, setFormData] = useState({
    id: '',
    status: 'IN_PROGRESS',
    scouterName: '',
    teamNumber: '',
    matchNumber: '',
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
    dirty: false
  });

  useEffect(() => {
    const reportId = searchParams.get('id');
    const tNum = searchParams.get('team');
    const mNum = searchParams.get('match');
    const initialTab = searchParams.get('tab') as TabType;

    if (initialTab && ['info', 'robot', 'auto', 'teleop', 'reliability'].includes(initialTab)) {
      setActiveTab(initialTab);
    }

    fetch('/api/scout')
      .then(r => r.json())
      .then(data => {
        if (!data || !data.reports) {
          setIsInitializing(false);
          return;
        }
        let existing = null;
        try {
          if (reportId) {
            existing = data.reports.find((r: any) => r.id === reportId);
          } else if (tNum && mNum) {
            existing = data.reports.find((r: any) => 
              String(r.teamNumber) === String(tNum) && 
              String(r.matchNumber) === String(mNum) &&
              r.status === 'IN_PROGRESS'
            );
          }
        } catch (e) {
          console.error(e);
        }

        if (existing) {
          setFormData({ ...existing, dirty: false });
          setSyncStatus('saved');
        } else {
          setFormData(prev => ({ 
            ...prev, 
            id: reportId || Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
            teamNumber: tNum || '',
            matchNumber: mNum || '',
            dirty: false
          }));
        }
        setIsInitializing(false);
      })
      .catch(() => setIsInitializing(false));
  }, [searchParams]);

  useEffect(() => {
    if (isInitializing || formData.status === 'COMPLETED' || !formData.id || !formData.matchNumber || !formData.teamNumber || !formData.dirty) return;
    setSyncStatus('saving');
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/scout', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ...formData, status: 'IN_PROGRESS' }) 
        });
        if (res.ok) setSyncStatus('saved');
        else setSyncStatus('error');
      } catch {
        setSyncStatus('error');
      }
      setFormData(prev => ({ ...prev, dirty: false }));
    }, 1500);
    return () => clearTimeout(t);
  }, [formData, isInitializing]);

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value, dirty: true }));

  const handleSave = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!formData.scouterName || !formData.teamNumber) { 
      showModal({ type: 'warning', title: 'Incomplete', message: 'Please fill out scouter name and team number!' }); 
      return; 
    }
    setLoading(true);
    setSyncStatus('saving');
    try {
      const res = await fetch('/api/scout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, status }) });
      if (res.ok) {
        setSyncStatus('saved');
        if (status === 'COMPLETED') {
          setFormData(prev => ({ ...prev, status: 'COMPLETED', dirty: false }));
          showModal({ 
            type: 'success', 
            title: 'Submitted', 
            message: 'Scouting report SUBMITTED!', 
            onConfirm: () => router.push('/dashboard') 
          });
        }
      } else {
        setSyncStatus('error');
      }
    } catch { 
      setSyncStatus('error');
      showModal({ type: 'error', title: 'Error', message: 'Error syncing data.' }); 
    } finally { setLoading(false); }
  };

  if (isInitializing) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Initializing System</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-40 pt-6 px-4">
      {/* Header Area */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl glass hover:bg-white/5 transition-all active:scale-95 text-white/70">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Prescout</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Field Operations</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {syncStatus && (
              <div className="px-3 py-1 rounded-full glass border-white/5 flex items-center gap-2">
                 <div className={`w-1 h-1 rounded-full ${syncStatus === 'saving' ? 'bg-amber-500 animate-pulse' : syncStatus === 'saved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: syncStatus === 'saving' ? 'var(--accent)' : syncStatus === 'saved' ? '#10b981' : 'var(--primary)' }}>
                   {syncStatus === 'saving' ? 'Syncing...' : syncStatus === 'saved' ? 'Synced' : 'Sync Error'}
                 </span>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${formData.status === 'IN_PROGRESS' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
               {formData.status === 'IN_PROGRESS' ? 'Draft' : 'Finalized'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-card overflow-x-auto no-scrollbar">
          {(['info', 'robot', 'auto', 'teleop', 'reliability'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                const params = new URLSearchParams(searchParams.toString());
                params.set('tab', tab);
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={`flex-1 min-w-[80px] py-3 rounded-xl font-black uppercase text-[10px] tracking-tight transition-all active:scale-95 whitespace-nowrap`}
              style={activeTab === tab ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--muted)' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {activeTab === 'info' && (
          <Section title="General" icon={Info}>
            <div className="space-y-6">
              <div>
                <label className={LABEL_CLS}>Scouter Identity</label>
                <input type="text" placeholder="Enter your name" value={formData.scouterName} onChange={e => set('scouterName', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Team Identifier</label>
                  <input type="number" placeholder="Team #" value={formData.teamNumber} onChange={e => set('teamNumber', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Qualification</label>
                  <input type="number" placeholder="Qual #" value={formData.matchNumber} onChange={e => set('matchNumber', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
                </div>
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'robot' && (
          <Section title="Chassis & Hardware" icon={Cpu}>
            <Chips field="drivetrainType" label="Drive System" options={['Swerve', 'Tank', 'Mecanum', 'Other']} value={formData.drivetrainType} set={set} />
            <Chips field="gameStrategy" label="Primary Role" options={['Offensive', 'Defense', 'Hybrid', 'Support']} value={formData.gameStrategy} set={set} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Operational Weight</label>
                <input type="text" placeholder="e.g. 120 lbs" value={formData.robotWeight ?? ''} onChange={e => set('robotWeight', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_CLS}>Storage Capacity</label>
                <input type="text" placeholder="e.g. 2 notes" value={formData.storageCapacity ?? ''} onChange={e => set('storageCapacity', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Mechanism / Outtake</label>
                <input type="text" placeholder="e.g. Roller, Catapult" value={formData.outtakeType ?? ''} onChange={e => set('outtakeType', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_CLS}>Experience Level</label>
                <input type="text" placeholder="e.g. Veteran, Rookie" value={formData.driverExperience ?? ''} onChange={e => set('driverExperience', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
            </div>
            <Chips field="intakeType" label="Intake Source" options={['Ground', 'Human Player', 'Both']} value={formData.intakeType} set={set} />
          </Section>
        )}

        {activeTab === 'auto' && (
          <Section title="Autonomous Logic" icon={Zap}>
            <div>
              <label className={LABEL_CLS}>Routine Description</label>
              <textarea rows={3} value={formData.autoDescription ?? ''} onChange={e => set('autoDescription', e.target.value)}
                placeholder="Describe their starting routine..." className={`${INPUT_CLS} resize-none`} style={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_CLS}>Origin Positions</label>
              <input type="text" placeholder="e.g. L, C, R" value={formData.autoStartPositions ?? ''} onChange={e => set('autoStartPositions', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
            </div>
            <Chips field="autoAccuracy" label="Execution Accuracy" options={['Low', 'Medium', 'High', 'Consistent']} value={formData.autoAccuracy} set={set} />
            <Chips field="scoringRange" label="Scoring Distance" options={['Short', 'Mid Field', 'Long']} value={formData.scoringRange} set={set} />
          </Section>
        )}

        {activeTab === 'teleop' && (
          <Section title="Performance Metrics" icon={Activity}>
            <YesNo field="hasHang" label="Integrated Climber?" value={formData.hasHang} set={set} />
            <Chips field="shootingAccuracy" label="Shot Precision" options={['Low', 'Medium', 'High', 'Elite']} value={formData.shootingAccuracy} set={set} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Cycle Rhythm</label>
                <input type="text" placeholder="e.g. ~12s" value={formData.cycleTime ?? ''} onChange={e => set('cycleTime', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_CLS}>Average Scoring</label>
                <input type="text" placeholder="e.g. 10 notes" value={formData.avgFuelScored ?? ''} onChange={e => set('avgFuelScored', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'reliability' && (
          <Section title="Status & Concerns" icon={AlertTriangle}>
            <div className="space-y-4">
              <YesNo field="hasVision" label="Optical Processing?" value={formData.hasVision} set={set} />
              <YesNo field="hasMajorIssues" label="Critical Instability?" value={formData.hasMajorIssues} set={set} />
            </div>
            <div>
              <label className={LABEL_CLS}>Identified Failures</label>
              <textarea rows={3} placeholder="Belt slips, radio drops, etc..." value={formData.commonIssue ?? ''} onChange={e => set('commonIssue', e.target.value)} className={`${INPUT_CLS} resize-none`} style={INPUT_STYLE} />
            </div>
          </Section>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-[60]">
        <div className="glass p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-2">
          <button onClick={() => handleSave('IN_PROGRESS')} disabled={loading}
            className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/50 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
            <Save size={14} /> Draft
          </button>
          <button onClick={() => handleSave('COMPLETED')} disabled={loading}
            className="flex-[2] py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white shadow-[0_8px_25px_var(--primary-glow)] transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--primary), #be123c)' }}>
            <CheckCircle size={16} /> {loading ? 'Syncing...' : 'Finalize & Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
