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
    ourTeamNumber: '',
    matchNumber: searchParams.get('match') || '',
    teamNumber: searchParams.get('team') || '',
    gameStrategy: '',
    driveTrain: 'SWERVE',
    robotWeight: '',
    scoringRange: 'ALL',
    storageCapacity: '',
    outtakeType: '',
    driverExperience: '',
    autonomousCapabilities: '',
    autoStartPositions: '',
    autoAccuracy: '',
    hasHang: 'NO',
    shootingAccuracy: '',
    cycleTime: '',
    intakeType: 'BOTH',
    avgFuelScored: '',
    hasVision: 'NO',
    majorIssues: '',
    commonIssue: ''
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

  const handleSave = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    const { ourTeamNumber, matchNumber, teamNumber } = formData;
    if (!ourTeamNumber?.toString().trim() || !matchNumber?.toString().trim() || !teamNumber?.toString().trim()) {
      alert("Please fill out Our Team Number, Match #, and Team #!");
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
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to sync data'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error syncing data.");
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = formData.status === 'COMPLETED';

  const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic">{children}</label>
  );

  if (isInitializing) return <div className="p-12 text-center text-2xl font-black italic animate-pulse">Initializing Strategy Interface...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-64 px-4 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b-4 border-black pb-4 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-black">Strategic Dossier</h1>
        </div>
        <div className="flex gap-2">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${formData.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
            {formData.status === 'IN_PROGRESS' ? <><Clock size={12} /> Live Draft</> : <><CheckCircle size={12} /> Permanent Record</>}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {isReadOnly && (
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl flex items-center gap-3 text-green-800">
            <CheckCircle className="text-green-600" />
            <span className="font-bold text-sm">This report has been submitted and is now immutable.</span>
          </div>
        )}

        {/* Section 1: Identity */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-xl">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-primary pb-2">Robot Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <InputLabel>Our Team #</InputLabel>
              <input type="text" placeholder="e.g. 6905" value={formData.ourTeamNumber}
                disabled={isReadOnly}
                onChange={e => setFormData({ ...formData, ourTeamNumber: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black px-4 disabled:opacity-50" />
            </div>
            <div>
              <InputLabel>Match #</InputLabel>
              <input type="number" value={formData.matchNumber}
                disabled={isReadOnly}
                readOnly={!!searchParams.get('match') && !isReadOnly}
                onChange={e => setFormData({ ...formData, matchNumber: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-black bg-gray-50 text-black text-2xl disabled:opacity-50" />
            </div>
            <div>
              <InputLabel>Team #</InputLabel>
              <input type="number" value={formData.teamNumber}
                disabled={isReadOnly}
                readOnly={!!searchParams.get('team') && !isReadOnly}
                onChange={e => setFormData({ ...formData, teamNumber: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-black bg-gray-50 text-black text-2xl disabled:opacity-50" />
            </div>
          </div>
        </div>

        {/* Section 2: Physical Specs */}
        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-black pb-2">Physical Specs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <InputLabel>Drive Train Type</InputLabel>
              <select
                disabled={isReadOnly}
                value={formData.driveTrain}
                onChange={e => setFormData({ ...formData, driveTrain: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-white text-black disabled:opacity-50"
              >
                <option value="SWERVE">Swerve</option>
                <option value="TANK">Tank</option>
                <option value="MECANUM">Mecanum</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <InputLabel>Robot Weight (lbs)</InputLabel>
              <input type="text" placeholder="e.g. 120 lbs" value={formData.robotWeight}
                disabled={isReadOnly}
                onChange={e => setFormData({ ...formData, robotWeight: e.target.value })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-white text-black disabled:opacity-50" />
            </div>
          </div>
        </div>

        {/* Section 3: Performance & Strategy */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-xl">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-primary pb-2">Strategy & Performance</h2>
          <div className="space-y-6">
            <div>
              <InputLabel>Primary Role / Strategy</InputLabel>
              <textarea placeholder="Offensive, Defense, etc. What role do they play best?" value={formData.gameStrategy}
                disabled={isReadOnly}
                onChange={e => setFormData({ ...formData, gameStrategy: e.target.value })}
                rows={2} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-medium focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <InputLabel>Scoring Range</InputLabel>
                <select value={formData.scoringRange} onChange={e => setFormData({ ...formData, scoringRange: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50">
                  <option value="SHORT">Short Range</option>
                  <option value="MID">Mid Field</option>
                  <option value="LONG">Long Range</option>
                  <option value="ALL">Versatile (All)</option>
                </select>
              </div>
              <div>
                <InputLabel>Cycle Time</InputLabel>
                <input type="text" placeholder="How long is their cycle time?" value={formData.cycleTime}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, cycleTime: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <InputLabel>Storage Capacity</InputLabel>
                <input type="text" placeholder="How many game pieces?" value={formData.storageCapacity}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, storageCapacity: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
              </div>
              <div>
                <InputLabel>Avg Fuel Scored / Match</InputLabel>
                <input type="text" placeholder="Average fuel per match?" value={formData.avgFuelScored}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, avgFuelScored: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Mechanisms */}
        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-black pb-2">Mechanisms</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <InputLabel>Intake Type</InputLabel>
                <select value={formData.intakeType} onChange={e => setFormData({ ...formData, intakeType: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-white text-black disabled:opacity-50">
                  <option value="GROUND">Ground Only</option>
                  <option value="HUMAN">Human Player Only</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <div>
                <InputLabel>Outtake Type</InputLabel>
                <input type="text" placeholder="How do they score?" value={formData.outtakeType}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, outtakeType: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-white text-black disabled:opacity-50" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <InputLabel>Has Vision?</InputLabel>
                <div className="flex bg-white rounded-xl overflow-hidden border-2 border-gray-100">
                  {['YES', 'NO'].map(v => (
                    <button key={v} onClick={() => !isReadOnly && setFormData({ ...formData, hasVision: v })}
                      disabled={isReadOnly}
                      className={`flex-1 p-3 font-black text-xs transition-all ${formData.hasVision === v ? 'bg-black text-white' : 'text-gray-400'} disabled:opacity-50`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <InputLabel>Can Hang?</InputLabel>
                <div className="flex bg-white rounded-xl overflow-hidden border-2 border-gray-100">
                  {['YES', 'NO'].map(v => (
                    <button key={v} onClick={() => !isReadOnly && setFormData({ ...formData, hasHang: v })}
                      disabled={isReadOnly}
                      className={`flex-1 p-3 font-black text-xs transition-all ${formData.hasHang === v ? 'bg-black text-white' : 'text-gray-400'} disabled:opacity-50`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <InputLabel>Shooting Accuracy</InputLabel>
                <input type="text" placeholder="%" value={formData.shootingAccuracy}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, shootingAccuracy: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-white text-black disabled:opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Autonomous */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-xl">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-primary pb-2">Autonomous</h2>
          <div className="space-y-6">
            <div>
              <InputLabel>Capabilities (Move? Score?)</InputLabel>
              <textarea placeholder="What can they do in auto?" value={formData.autonomousCapabilities}
                disabled={isReadOnly}
                onChange={e => setFormData({ ...formData, autonomousCapabilities: e.target.value })}
                rows={2} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-medium focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <InputLabel>Start Positions</InputLabel>
                <input type="text" placeholder="Where can they run auto from?" value={formData.autoStartPositions}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, autoStartPositions: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
              </div>
              <div>
                <InputLabel>Auto Accuracy</InputLabel>
                <input type="text" placeholder="How accurate is the auto?" value={formData.autoAccuracy}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, autoAccuracy: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold focus:border-black outline-none bg-gray-50 text-black disabled:opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Reliability & Experience */}
        <div className="bg-black p-6 rounded-3xl border-2 border-gray-800 shadow-2xl text-white">
          <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-primary pb-2 text-white">Reliability</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic">Driver Experience</label>
                <input type="text" placeholder="How long driving?" value={formData.driverExperience}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, driverExperience: e.target.value })}
                  className="w-full p-4 border-2 border-gray-800 rounded-2xl font-bold focus:border-primary outline-none bg-gray-900 text-white disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic">Major Issues?</label>
                <input type="text" placeholder="Electrical/Mechanical?" value={formData.majorIssues}
                  disabled={isReadOnly}
                  onChange={e => setFormData({ ...formData, majorIssues: e.target.value })}
                  className="w-full p-4 border-2 border-gray-800 rounded-2xl font-bold focus:border-primary outline-none bg-gray-900 text-white disabled:opacity-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic text-primary">Most Common Issue</label>
              <textarea placeholder="What fails most often?" value={formData.commonIssue}
                disabled={isReadOnly}
                onChange={e => setFormData({ ...formData, commonIssue: e.target.value })}
                rows={2} className="w-full p-4 border-2 border-gray-800 rounded-2xl font-medium focus:border-primary outline-none bg-gray-900 text-white disabled:opacity-50" />
            </div>
          </div>
        </div>

        {/* Submission Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t-2 border-gray-100 p-6 flex gap-4 z-50">
          {!isReadOnly ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-black text-white font-black uppercase p-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> Return to Intelligence Base
            </button>
          )}
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
