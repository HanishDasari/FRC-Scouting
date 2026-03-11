'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Plus, Minus, CheckCircle, Clock, ChevronLeft } from 'lucide-react';

function ScoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [formData, setFormData] = useState({
    id: '', 
    status: 'IN_PROGRESS',
    scouterName: '',
    matchNumber: searchParams.get('match') || '',
    teamNumber: searchParams.get('team') || '',
    autoL1: 0, autoL2: 0, autoL3: 0, autoMiss: 0,
    leaveLine: false,
    teleopL1: 0, teleopL2: 0, teleopL3: 0, teleopMiss: 0,
    cycleSpeed: 'AVERAGE',
    driverSkill: 3,
    defense: 3,
    climbStatus: 'NONE',
    notes: ''
  });

  // 1. Initial Load: Either fetch existing or generate new ID
  useEffect(() => {
    const reportId = searchParams.get('id');
    if (reportId) {
      fetch('/api/scout')
        .then(res => res.json())
        .then(data => {
          const existing = data.reports.find((r: any) => r.id === reportId);
          if (existing) {
            setFormData(existing);
          }
          setIsInitializing(false);
        })
        .catch(() => setIsInitializing(false));
    } else {
      setFormData(prev => ({
        ...prev,
        id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
      }));
      setIsInitializing(false);
    }
  }, [searchParams]);

  // 2. Auto-Save Logic: Debounced save as IN_PROGRESS
  useEffect(() => {
    // Don't auto-save while loading initial data or if final submission done
    if (isInitializing || formData.status === 'COMPLETED' || !formData.id) return;
    
    // Only auto-save if we have the critical fields
    if (!formData.matchNumber || !formData.teamNumber) return;

    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, status: 'IN_PROGRESS' }),
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [formData, isInitializing]);

  const increment = (field: keyof typeof formData) => {
    if (typeof formData[field] === 'number') {
      setFormData(prev => ({ ...prev, [field]: (prev[field] as number) + 1 }));
    }
  };

  const decrement = (field: keyof typeof formData) => {
    if (typeof formData[field] === 'number') {
      setFormData(prev => ({ ...prev, [field]: Math.max(0, (prev[field] as number) - 1) }));
    }
  };

  const handleSave = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!formData.scouterName || !formData.matchNumber || !formData.teamNumber) {
      alert("Please fill out scouter name, match, and team numbers!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status }),
      });
      if (res.ok) {
        if (status === 'COMPLETED') {
          setFormData(prev => ({ ...prev, status: 'COMPLETED' }));
          alert("Scouting report SUBMITTED!");
          router.push('/dashboard');
        } else {
          alert("Draft saved manually.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error syncing data.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) return <div className="p-12 text-center text-2xl font-black italic animate-pulse">Initializing Strategy Interface...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b-4 border-black pb-4 mt-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Strategic Scout</h1>
        </div>
        <div className="flex gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${formData.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
            {formData.status === 'IN_PROGRESS' ? <><Clock size={12} /> Editing Draft</> : <><CheckCircle size={12} /> Completed</>}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Phase 0: Match Info */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">Scouter</label>
              <input type="text" placeholder="Your Name" value={formData.scouterName}
                onChange={e => setFormData({ ...formData, scouterName: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">Match #</label>
              <input type="number" value={formData.matchNumber}
                readOnly={!!searchParams.get('match')}
                onChange={e => setFormData({ ...formData, matchNumber: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-black bg-gray-50 text-black text-2xl" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">Team #</label>
              <input type="number" value={formData.teamNumber}
                readOnly={!!searchParams.get('team')}
                onChange={e => setFormData({ ...formData, teamNumber: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-black bg-gray-50 text-black text-2xl" />
            </div>
          </div>
        </div>

        {/* Phase 1: Autonomous */}
        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-black pb-2">Autonomous</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { k: 'autoL1', l: 'L1', c: 'bg-red-500' },
              { k: 'autoL2', l: 'L2', c: 'bg-red-600' },
              { k: 'autoL3', l: 'L3', c: 'bg-red-700' },
              { k: 'autoMiss', l: 'Miss', c: 'bg-black' }
            ].map(f => (
              <div key={f.k} className={`${f.c} p-4 rounded-2xl text-white text-center flex flex-col items-center gap-2 shadow-lg`}>
                <span className="font-black text-xs uppercase opacity-80">{f.l}</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => decrement(f.k as any)} className="bg-white/20 p-2 rounded-full active:scale-75 transition-all"><Minus size={16} /></button>
                  <span className="text-3xl font-black">{(formData as any)[f.k]}</span>
                  <button onClick={() => increment(f.k as any)} className="bg-white/20 p-2 rounded-full active:scale-75 transition-all"><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <input type="checkbox" id="leave" checked={formData.leaveLine} onChange={e => setFormData({ ...formData, leaveLine: e.target.checked })} className="w-6 h-6 accent-primary" />
            <label htmlFor="leave" className="font-black uppercase text-sm italic">Exited Start Zone (Leave)</label>
          </div>
        </div>

        {/* Phase 2: Teleop Strategic */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-xl">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-black pb-2">Teleop & Strategy</h2>

          <div className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-3 text-center">Cycle Speed</label>
              <div className="flex gap-2">
                {['SLOW', 'AVERAGE', 'FAST'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFormData({ ...formData, cycleSpeed: s })}
                    className={`flex-1 p-4 rounded-xl font-black uppercase text-sm border-2 transition-all ${formData.cycleSpeed === s ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Driver Skill (1-5)</label>
                <input type="range" min="1" max="5" value={formData.driverSkill} onChange={e => setFormData({ ...formData, driverSkill: parseInt(e.target.value) })} className="w-full accent-primary h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mt-2"><span>Rookie</span><span>Elite</span></div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Defensive Play</label>
                <input type="range" min="1" max="5" value={formData.defense} onChange={e => setFormData({ ...formData, defense: parseInt(e.target.value) })} className="w-full accent-black h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mt-2"><span>Passive</span><span>Lockdown</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200">
          <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic">Strategist Notes (How do they score? Weaknesses?)</label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-black outline-none font-medium bg-white text-black"
            placeholder="e.g. Can score L3 but slow. Very fast intake on floor pieces..."
          />
        </div>

        {/* Submission Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-gray-100 p-4 flex gap-4 z-50">
          <button
            onClick={() => handleSave('IN_PROGRESS')}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-black uppercase p-4 rounded-2xl transition-all active:scale-95 text-sm"
          >
            {loading ? '...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('COMPLETED')}
            disabled={loading}
            className="flex-[2] bg-primary hover:bg-primary-dark text-white font-black uppercase p-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Syncing...' : <><CheckCircle size={20} /> Submit & Close</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black animate-pulse">Initializing Interface...</div>}>
      <ScoutForm />
    </Suspense>
  );
}
