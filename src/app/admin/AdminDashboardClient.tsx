'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, X, Edit, Save, Trash2 } from 'lucide-react';

type MatchConfig = {
  matchNumber: number;
  teams: number[];
};

const INPUT_STYLE = { background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' } as React.CSSProperties;

export default function AdminDashboardClient() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ matchNumber: string, teams: string[] }>({ matchNumber: '', teams: [] });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(() => {
    fetch('/api/scout')
      .then(res => res.json())
      .then(data => {
        if (data.matches) setMatches(data.matches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
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
    if (confirm(`Are you sure you want to completely remove Match ${matchNumber}? This action cannot be undone.`)) {
      await fetch(`/api/scout?matchNumber=${matchNumber}`, { method: 'DELETE' });
      fetchData();
    }
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
      alert('Fill in all fields');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/scout', {
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
        setEditingMatch(null);
        fetchData();
      } else {
        const data = await res.json();
        alert('Error saving match: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: '#e11d48 transparent transparent transparent' }} />
      <div className="text-lg font-black italic uppercase animate-pulse" style={{ color: '#e11d48' }}>Authenticating...</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen" style={{ background: '#0a0a0f', color: '#f1f5f9' }}>
      <div className="w-full px-6 py-8 mx-auto max-w-5xl">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 pb-8" style={{ borderBottom: '2px solid #1e1e2e' }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e11d48' }} />
              <div className="w-6 h-1 rounded-full" style={{ background: '#3b82f6' }} />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">
              Admin <span className="italic" style={{ color: '#e11d48' }}>Dashboard</span>
            </h1>
            <p className="font-bold uppercase tracking-[0.3em] text-xs" style={{ color: '#475569' }}>Match Management Suite</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
            style={{ background: '#13131a', border: '1.5px solid #1e1e2e', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <span>Logout</span><LogOut size={16} strokeWidth={3} />
          </button>
        </header>

        <div className="space-y-6">
          {matches.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-sm">No matches found.</div>
          ) : (
            matches.map(match => (
              <div key={match.matchNumber} className="p-6 rounded-2xl relative" style={{ background: '#13131a', border: '1.5px solid #1e1e2e' }}>
                {editingMatch === match.matchNumber ? (
                   <div className="space-y-4">
                     <div className="flex justify-between items-center mb-4 pb-4" style={{borderBottom: '1.5px solid #1e1e2e'}}>
                       <h3 className="font-black text-xl italic uppercase tracking-tight" style={{color: '#e11d48'}}>Editing Match {match.matchNumber}</h3>
                       <button onClick={() => setEditingMatch(null)} className="p-2 text-gray-400 hover:text-white transition-colors">
                         <X size={20} />
                       </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div>
                         <label className="block text-xs font-black uppercase mb-2 text-gray-400">Match Number</label>
                         <input type="number" required value={editForm.matchNumber} onChange={e => setEditForm({...editForm, matchNumber: e.target.value})} className="w-full p-3 rounded-xl outline-none font-bold text-white mb-4" style={INPUT_STYLE} />
                       </div>
                       
                       <div className="space-y-2 p-4 rounded-xl" style={{ border: '1.5px solid rgba(225,29,72,0.2)'}}>
                         <div className="text-xs font-black uppercase text-red-500 mb-2">Red Alliance</div>
                         {[0,1,2].map(i => (
                           <input key={i} type="number" required value={editForm.teams[i]} onChange={e => handleTeamChange(i, e.target.value)} className="w-full p-2.5 rounded-lg text-sm outline-none font-bold text-center text-white" style={INPUT_STYLE} />
                         ))}
                       </div>

                       <div className="space-y-2 p-4 rounded-xl" style={{ border: '1.5px solid rgba(59,130,246,0.2)'}}>
                         <div className="text-xs font-black uppercase text-blue-500 mb-2">Blue Alliance</div>
                         {[3,4,5].map(i => (
                           <input key={i} type="number" required value={editForm.teams[i]} onChange={e => handleTeamChange(i, e.target.value)} className="w-full p-2.5 rounded-lg text-sm outline-none font-bold text-center text-white" style={INPUT_STYLE} />
                         ))}
                       </div>
                     </div>

                     <div className="pt-4 flex justify-end gap-3 mt-4" style={{borderTop: '1.5px solid #1e1e2e'}}>
                       <button onClick={() => setEditingMatch(null)} className="px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                       <button onClick={saveEdit} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest text-white transition-all active:scale-95" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                         {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                       </button>
                     </div>
                   </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="px-5 py-3 rounded-xl w-32 text-center" style={{ background: 'linear-gradient(135deg, #1e1e2e, #13131a)' }}>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Match</div>
                        <div className="font-black text-2xl italic tracking-tight text-white">{match.matchNumber}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <div className="w-2 h-full bg-red-500 rounded-full" />
                          <div className="flex gap-2">
                            {match.teams.slice(0,3).map(t => <span key={`r-${t}`} className="px-3 py-1 bg-red-500/10 text-red-500 text-sm font-bold rounded-lg border border-red-500/20">{t}</span>)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-2 h-full bg-blue-500 rounded-full" />
                          <div className="flex gap-2">
                            {match.teams.slice(3,6).map(t => <span key={`b-${t}`} className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-bold rounded-lg border border-blue-500/20">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <button onClick={() => startEdit(match)} className="flex items-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        <Edit size={16} /> Edit
                      </button>
                      <button onClick={() => deleteMatch(match.matchNumber)} className="flex items-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                        <Trash2 size={16} /> Remove
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
