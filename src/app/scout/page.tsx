import { Suspense } from 'react';
import ScoutForm from './ScoutForm';

export default function ScoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f', color: '#e11d48' }}><div className="font-black animate-pulse uppercase">Loading...</div></div>}>
      <ScoutForm />
    </Suspense>
  );
}
