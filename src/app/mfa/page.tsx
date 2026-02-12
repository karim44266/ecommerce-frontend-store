import { Suspense } from 'react';
import MfaClient from './mfa-client';

export default function MfaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <MfaClient />
    </Suspense>
  );
}
