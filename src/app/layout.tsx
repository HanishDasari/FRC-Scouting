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
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden`}>
        <ModalProvider>
          <nav style={{ background: '#0d0d14', borderBottom: '1px solid #1e1e2e' }} className="text-white p-4 sticky top-0 z-50">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-y-3">
              <Link href="/" className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 mt-1 mb-1">
                <img src="/shark_logo.png" alt="6905 Logo" className="h-8 w-auto object-contain" />
                <span className="text-white">6905</span><span style={{ color: '#e11d48' }}>Scouting</span>
              </Link>
              <div className="flex gap-4">
                <Link href="/dashboard" className="nav-link">Pit Scouting</Link>
                <Link href="/live-dashboard" className="nav-link">Match Scouting</Link>
                <Link href="/admin" className="nav-link">Admin</Link>
              </div>
            </div>
          </nav>
          <main className="flex-1" style={{ background: '#0a0a0f' }}>
            {children}
          </main>
        </ModalProvider>
      </body>
    </html>
  );
}
