'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, X, Edit, Save, Trash2, Zap, ClipboardList } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

type MatchConfig = {
  matchNumber: number;
  teams: number[];
  time?: string;
  qualRound?: string;
};

const INPUT_STYLE = { background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' } as React.CSSProperties;

export default function AdminDashboardClient() {
  const router = useRouter();
  const { showModal } = useModal();
  const [activeTab, setActiveTab] = useState<'normal' | 'live'>('normal');
  const [matches, setMatches] = useState<MatchConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ matchNumber: string, teams: string[] }>({ matchNumber: '', teams: [] });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    const endpoint = activeTab === 'normal' ? '/api/scout' : '/api/live-scout';
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data.matches) setMatches(data.matches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin/login');
  };

  const deleteMatch = async (matchNumber: number) => {
    showModal({
      type: 'confirm',
      title: 'Delete Qual?',
      message: `Are you sure you want to completely remove Qual ${matchNumber}? This action cannot be undone.`,
      onConfirm: async () => {
        const endpoint = activeTab === 'normal' ? `/api/scout?matchNumber=${matchNumber}` : `/api/live-scout?matchNumber=${matchNumber}`;
        const res = await fetch(endpoint, { method: 'DELETE' });
        if (res.ok) {
          showModal({ type: 'success', title: 'Deleted', message: `Qual ${matchNumber} has been removed.` });
          fetchData();
        } else {
          showModal({ type: 'error', title: 'Error', message: 'Failed to delete match.' });
        }
      }
    });
  };

  const deleteAllMatches = async () => {
    showModal({
      type: 'confirm',
      title: 'Wipe All Quals?',
      message: `CRITICAL: This will permanently delete EVERY qualification match in the ${activeTab === 'normal' ? 'Standard' : 'Live'} roster. This cannot be reversed. Continue?`,
      onConfirm: async () => {
        const endpoint = activeTab === 'normal' ? '/api/scout?deleteAll=true' : '/api/live-scout?deleteAll=true';
        const res = await fetch(endpoint, { method: 'DELETE' });
        if (res.ok) {
          showModal({ type: 'success', title: 'Wiped', message: `All ${activeTab === 'normal' ? 'Standard' : 'Live'} matches have been removed.` });
          fetchData();
        } else {
          showModal({ type: 'error', title: 'Error', message: 'Failed to clear matches.' });
        }
      }
    });
  };

  const startEdit = (match: MatchConfig) => {
    setEditingMatch(match.matchNumber);
    setEditForm({
      matchNumber: match.matchNumber.toString(),
      teams: match.teams.map(t => t.toString())
    });
  };

  const handleTeamChange = (index: number, val: string) => {
    const newTeams = [...editForm.teams];
    newTeams[index] = val;
    setEditForm({ ...editForm, teams: newTeams });
  };

  const saveEdit = async () => {
    if (!editForm.matchNumber || editForm.teams.some(t => !t)) {
      showModal({ type: 'warning', title: 'Missing Info', message: 'Please fill in all fields.' });
      return;
    }
    setIsSaving(true);
    try {
      const endpoint = activeTab === 'normal' ? '/api/scout' : '/api/live-scout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EDIT_MATCH',
          oldMatchNumber: editingMatch,
          newMatchNumber: editForm.matchNumber,
          teams: editForm.teams
        })
      });
      if (res.ok) {
        showModal({ type: 'success', title: 'Saved', message: 'Match updates have been saved successfully.' });
        setEditingMatch(null);
        fetchData();
      } else {
        const data = await res.json();
        showModal({ type: 'error', title: 'Save Failed', message: data.error || 'Unknown error occurred.' });
      }
    } catch (err: any) {
      showModal({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && matches.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: '#e11d48 transparent transparent transparent' }} />
      <div className="text-lg font-black italic uppercase animate-pulse" style={{ color: '#e11d48' }}>Loading Data...</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen" style={{ background: '#0a0a0f', color: '#f1f5f9' }}>
      <div className="w-full px-6 py-8 mx-auto max-w-5xl">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 pb-8" style={{ borderBottom: '2px solid #1e1e2e' }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e11d48' }} />
              <div className="w-6 h-1 rounded-full" style={{ background: '#3b82f6' }} />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">
              Admin <span className="italic" style={{ color: '#e11d48' }}>Dashboard</span>
            </h1>
            <p className="font-bold uppercase tracking-[0.3em] text-xs" style={{ color: '#475569' }}>Qualification Management Suite</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#13131a] p-1 rounded-xl border border-[#1e1e2e] mr-4">
              <button 
                onClick={() => setActiveTab('normal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'normal' ? 'bg-[#e11d48] text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <ClipboardList size={14} /> Normal
              </button>
              <button 
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Zap size={14} /> Live
              </button>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
              style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <span>Logout</span><LogOut size={16} strokeWidth={3} />
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeTab === 'normal' ? '#e11d48' : '#f59e0b' }} />
            <h2 className="font-black uppercase tracking-widest text-xs text-gray-400">
              Managing {activeTab === 'normal' ? 'Standard Scouting' : 'Real-Time Qual'} Roster
            </h2>
            {matches.length > 0 && (
              <button 
                onClick={deleteAllMatches}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              >
                <Trash2 size={12} /> Clear All Quals
              </button>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-24 rounded-3xl border-2 border-dashed border-[#1e1e2e]">
              <div className="text-gray-500 font-black uppercase tracking-widest text-sm mb-2">No qual records found.</div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Initialize qualifications from the setup page.</p>
            </div>
          ) : (
            matches.map(match => (
              <div key={match.matchNumber} className="p-6 rounded-2xl relative group overflow-hidden transition-all duration-300" 
                style={{ 
                  background: '#13131a', 
                  border: editingMatch === match.matchNumber ? `1.5px solid ${activeTab === 'normal' ? '#e11d48' : '#f59e0b'}44` : '1.5px solid #1e1e2e',
                  boxShadow: editingMatch === match.matchNumber ? `0 10px 40px -10px ${activeTab === 'normal' ? '#e11d48' : '#f59e0b'}33` : 'none'
                }}>
                {editingMatch === match.matchNumber ? (
                   <div className="space-y-6">
                     <div className="flex justify-between items-center mb-6 pb-4" style={{borderBottom: '1.5px solid #1e1e2e'}}>
                       <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg" style={{ background: activeTab === 'normal' ? 'rgba(225,29,72,0.1)' : 'rgba(245,158,11,0.1)' }}>
                           <Edit size={20} style={{ color: activeTab === 'normal' ? '#e11d48' : '#f59e0b' }} />
                         </div>
                         <h3 className="font-black text-xl italic uppercase tracking-tight" style={{color: activeTab === 'normal' ? '#e11d48' : '#f59e0b'}}>Editing Qual {match.matchNumber}</h3>
                       </div>
                       <button onClick={() => setEditingMatch(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                         <X size={20} />
                       </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div>
                         <label className="block text-[10px] font-black uppercase mb-2 tracking-[0.2em] text-gray-500">Qual Number</label>
                         <input type="number" required value={editForm.matchNumber} onChange={e => setEditForm({...editForm, matchNumber: e.target.value})} className={`w-full p-4 rounded-xl outline-none font-black text-white ${editForm.matchNumber.length > 2 ? 'text-sm' : 'text-lg'} transition-all`} style={INPUT_STYLE} />
                       </div>
                       
                       <div className="space-y-3 p-5 rounded-2xl" style={{ border: '1.5px solid rgba(225,29,72,0.15)', background: 'rgba(225,29,72,0.02)'}}>
                         <div className="text-[10px] font-black uppercase text-red-500 mb-2 tracking-[0.2em] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Red Alliance
                         </div>
                         {[0,1,2].map(i => (
                           <input key={i} type="number" required value={editForm.teams[i]} onChange={e => handleTeamChange(i, e.target.value)} className="w-full p-3 rounded-xl text-md outline-none font-black text-center text-white" style={INPUT_STYLE} />
                         ))}
                       </div>

                       <div className="space-y-3 p-5 rounded-2xl" style={{ border: '1.5px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.02)'}}>
                         <div className="text-[10px] font-black uppercase text-blue-500 mb-2 tracking-[0.2em] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Blue Alliance
                         </div>
                         {[3,4,5].map(i => (
                           <input key={i} type="number" required value={editForm.teams[i]} onChange={e => handleTeamChange(i, e.target.value)} className="w-full p-3 rounded-xl text-md outline-none font-black text-center text-white" style={INPUT_STYLE} />
                         ))}
                       </div>
                     </div>

                     <div className="pt-6 flex justify-end gap-3" style={{borderTop: '1.5px solid #1e1e2e'}}>
                       <button onClick={() => setEditingMatch(null)} className="px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest text-gray-400 hover:text-white transition-colors">Cancel</button>
                       <button onClick={saveEdit} disabled={isSaving} className="flex items-center gap-2 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest text-white transition-all active:scale-95 shadow-xl" style={{ background: activeTab === 'normal' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                         {isSaving ? 'Synchronizing...' : <><Save size={16} /> Save Evolution</>}
                       </button>
                     </div>
                   </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="px-6 py-4 rounded-2xl w-36 text-center border border-[#1e1e2e] shadow-inner" style={{ background: 'linear-gradient(135deg, #1e1e2e, #0d0d14)' }}>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">Qual</div>
                        <div className={`font-black tracking-tighter text-white leading-none ${String(match.matchNumber).length > 3 ? 'text-lg' : String(match.matchNumber).length > 2 ? 'text-xl' : 'text-3xl'} italic transition-all`}>{match.matchNumber}</div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4 group/red">
                          <div className="w-1.5 h-6 bg-red-600 rounded-full group-hover/red:h-8 transition-all" />
                          <div className="flex gap-2">
                            {match.teams.slice(0,3).map(t => <span key={`r-${t}`} className="px-4 py-1.5 bg-red-500/5 text-red-500 text-sm font-black rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors uppercase italic">{t}</span>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group/blue">
                          <div className="w-1.5 h-6 bg-blue-600 rounded-full group-hover/blue:h-8 transition-all" />
                          <div className="flex gap-2">
                            {match.teams.slice(3,6).map(t => <span key={`b-${t}`} className="px-4 py-1.5 bg-blue-500/5 text-blue-500 text-sm font-black rounded-xl border border-blue-500/10 hover:bg-blue-500/10 transition-colors uppercase italic">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(match)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-[#1a1a24] text-gray-400 hover:text-white hover:bg-gray-800 transition-all border border-transparent hover:border-[#1e1e2e]">
                        <Edit size={14} /> Update
                      </button>
                      <button onClick={() => deleteMatch(match.matchNumber)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-rose-500/5 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all">
                        <Trash2 size={14} /> Purge
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
