import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lovat Scouting | 6905',
  description: 'FRC Scouting platform for Team 6905, tailored for the 2026 Rebuilt game.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          .nav-link { color: #64748b; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; transition: color 0.2s; }
          .nav-link:hover { color: #e11d48; }
        `}</style>
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <nav style={{ background: '#0d0d14', borderBottom: '1px solid #1e1e2e' }} className="text-white p-4 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <span style={{ color: '#e11d48' }}>6905</span><span className="text-white">Scout</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/scout" className="nav-link">Scout</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1" style={{ background: '#0a0a0f' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
