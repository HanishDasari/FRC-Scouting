'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Save, LayoutDashboard } from 'lucide-react';

export default function MatchSetupPage() {
  const router = useRouter();
  const [matchNumber, setMatchNumber] = useState('');
  const [teams, setTeams] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleTeamChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchNumber || teams.some(t => !t)) {
      alert("Please fill in the match number and all 6 team numbers.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SET_MATCH',
          matchNumber,
          teams
        }),
      });
      if (res.ok) {
        alert("Match setup saved! Directing to dashboard...");
        router.push('/dashboard');
      } else {
        alert("Failed to save match setup.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving match setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Users className="text-primary" size={32} />
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Match Setup</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <label className="block text-sm font-black uppercase text-gray-700 mb-2">Match Number</label>
          <input 
            type="number" 
            required 
            placeholder="e.g. 42" 
            value={matchNumber} 
            onChange={(e) => setMatchNumber(e.target.value)}
            className="w-full text-2xl font-black p-4 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <h2 className="font-black uppercase text-red-600 border-b-2 border-red-600 pb-1">Red Alliance</h2>
            {[0, 1, 2].map(i => (
              <input 
                key={i}
                type="number" 
                required 
                placeholder={`Red Team ${i+1}`}
                value={teams[i]}
                onChange={(e) => handleTeamChange(i, e.target.value)}
                className="w-full p-4 border-2 border-red-100 rounded-xl focus:border-red-600 outline-none text-black font-bold text-center"
              />
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-black uppercase text-blue-600 border-b-2 border-blue-600 pb-1">Blue Alliance</h2>
            {[3, 4, 5].map(i => (
              <input 
                key={i}
                type="number" 
                required 
                placeholder={`Blue Team ${i-2}`}
                value={teams[i]}
                onChange={(e) => handleTeamChange(i, e.target.value)}
                className="w-full p-4 border-2 border-blue-100 rounded-xl focus:border-blue-600 outline-none text-black font-bold text-center"
              />
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-black hover:bg-gray-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xl transition-all shadow-xl active:scale-95"
          >
            {loading ? 'Saving...' : <><Save size={24}/> Initialize Match</>}
          </button>
          
          <button 
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full flex justify-center items-center gap-2 bg-white text-black border-2 border-black p-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-gray-50 transition-all"
          >
            <LayoutDashboard size={20}/> Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}
