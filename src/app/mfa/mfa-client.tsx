'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type MfaResponse = {
  accessToken: string;
};

export default function MfaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokenAndLoadUser } = useAuth();
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const email = useMemo(() => {
    const queryEmail = searchParams.get('email');
    return queryEmail || sessionStorage.getItem('mfa_email') || '';
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiPost<MfaResponse>('/auth/mfa/verify', { email, otp });
      if (response.accessToken) {
        await setTokenAndLoadUser(response.accessToken);
        sessionStorage.removeItem('mfa_email');
        router.replace('/');
        return;
      }

      setError('Unable to verify the code.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Verify your code</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code sent to {email || 'your email'}.
        </p>
        {error && (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="otp">
              Verification code
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  );
}
