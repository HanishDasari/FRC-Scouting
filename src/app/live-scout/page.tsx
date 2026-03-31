import { Suspense } from 'react';
import LiveScoutForm from './LiveScoutForm';

export default function LiveScoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f', color: '#f59e0b' }}><div className="font-black animate-pulse uppercase">Loading...</div></div>}>
      <LiveScoutForm />
    </Suspense>
  );
}
