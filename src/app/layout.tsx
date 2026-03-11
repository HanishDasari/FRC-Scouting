import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lovat Scouting | 6905',
  description: 'FRC Scouting platform for Team 6905, tailored for the 2026 Rebuilt game.',
  manifest: '/manifest.json', // Allows PWA installation
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <nav className="bg-black text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <span className="text-primary">6905</span> Scout
            </Link>
            <div className="flex gap-4">
              <Link href="/scout" className="hover:text-primary transition font-medium">Scout</Link>
              <Link href="/dashboard" className="hover:text-primary transition font-medium">Dashboard</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 container mx-auto p-4 sm:p-6 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
