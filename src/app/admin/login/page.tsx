'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md p-8 rounded-3xl" style={{ background: '#13131a', border: '1.5px solid #1e1e2e', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(225,29,72,0.15)' }}>
            <Lock size={32} style={{ color: '#e11d48' }} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Admin System</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: '#64748b' }}>Restricted Access</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg mb-6 text-sm font-bold text-center" style={{ background: 'rgba(225,29,72,0.1)', color: '#e11d48', border: '1px solid rgba(225,29,72,0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-2" style={{ color: '#64748b' }}>Username</label>
            <input
              type="text" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full p-4 rounded-xl outline-none font-bold text-white transition-all"
              style={{ background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' }}
              onFocus={e => e.target.style.borderColor = '#e11d48'}
              onBlur={e => e.target.style.borderColor = '#1e1e2e'}
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-black uppercase mb-2" style={{ color: '#64748b' }}>Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl outline-none font-bold text-white transition-all"
              style={{ background: '#0d0d14', border: '1.5px solid #1e1e2e', color: '#f1f5f9' }}
              onFocus={e => e.target.style.borderColor = '#e11d48'}
              onBlur={e => e.target.style.borderColor = '#1e1e2e'}
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center items-center gap-2 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 10px 30px rgba(225,29,72,0.35)' }}>
            {loading ? 'Authenticating...' : <><LogIn size={20} /> Authorize</>}
          </button>
        </form>
      </div>
    </div>
  );
}
