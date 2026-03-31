import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '6905 Scouting',
  description: 'FRC Scouting platform for Team 6905, tailored for the 2026 Rebuilt game.',
};

import { ModalProvider } from '@/context/ModalContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          .nav-link { color: #64748b; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; transition: color 0.2s; }
          .nav-link:hover { color: #e11d48; }
        `}</style>
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden`}>
        <ModalProvider>
          <nav className="glass sticky top-0 z-[70] px-6 py-4 border-b border-white/5">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <img src="/shark_logo.png" alt="6905" className="h-6 w-auto object-contain brightness-110" />
                </div>
                <div className="flex flex-col -gap-1">
                  <span className="text-lg font-black uppercase italic tracking-tighter leading-none">
                    <span className="text-white">6905</span> <span className="text-primary">Scouting</span>
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted">Arc Raiders</span>
                </div>
              </Link>

              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/20 border border-white/5 overflow-x-auto no-scrollbar">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Prescout', href: '/dashboard' },
                  { name: 'Live', href: '/live-dashboard' },
                  { name: 'Setup', href: '/setup' },
                  { name: 'Admin', href: '/admin' }
                ].map(item => (
                  <Link key={item.name} href={item.href} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <main className="relative z-10">
            {children}
          </main>
        </ModalProvider>
      </body>
    </html>
  );
}
