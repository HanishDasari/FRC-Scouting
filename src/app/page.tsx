import Link from 'next/link';
import { Users, ClipboardList, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
      <div className="mb-12">
        <h1 className="text-6xl sm:text-8xl font-black uppercase italic tracking-tighter mb-4 leading-none">
          <span className="text-primary tracking-widest">6905</span><br />STRAT
        </h1>
        <p className="text-xl text-gray-500 font-bold uppercase tracking-widest">FRC Albany 2026 | Rebuilt</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/setup" className="flex flex-col items-center justify-center p-8 bg-black hover:bg-gray-900 transition-all rounded-3xl shadow-2xl border-2 border-transparent hover:border-primary text-white group active:scale-95">
          <Users className="mb-4 group-hover:text-primary transition-colors" size={48} />
          <span className="text-2xl font-black uppercase tracking-widest">Match Setup</span>
          <span className="text-xs text-gray-400 mt-2 font-bold uppercase">Configure 6-Team Roster</span>
        </Link>

        <Link href="/scout" className="flex flex-col items-center justify-center p-8 bg-white hover:bg-gray-50 transition-all rounded-3xl shadow-2xl border-2 border-gray-100 hover:border-primary text-black group active:scale-95">
          <ClipboardList className="mb-4 group-hover:text-primary transition-colors" size={48} />
          <span className="text-2xl font-black uppercase tracking-widest">Scout</span>
          <span className="text-xs text-gray-500 mt-2 font-bold uppercase">Record Strategy Intel</span>
        </Link>

        <Link href="/dashboard" className="flex flex-col items-center justify-center p-8 bg-white hover:bg-gray-50 transition-all rounded-3xl shadow-2xl border-2 border-gray-100 hover:border-primary text-black group active:scale-95">
          <LayoutDashboard className="mb-4 group-hover:text-primary transition-colors" size={48} />
          <span className="text-2xl font-black uppercase tracking-widest">Status</span>
          <span className="text-xs text-gray-500 mt-2 font-bold uppercase">Live Alliance Tracking</span>
        </Link>
      </div>

      <div className="mt-16 text-xs font-black uppercase text-gray-300 tracking-[0.2em]">
        Built for the Drive Team and Strategy Lead
      </div>
    </div>
  );
}
