'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TVError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    console.error('[TV page error]', error.message);
  }, [error]);

  function handleRetry() {
    setClicked(true);
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ color: '#e6edf3', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Couldn&apos;t load this TV show
      </h2>
      <p style={{ color: '#8b949e', maxWidth: '400px', marginBottom: '1.5rem' }}>
        There was a temporary issue fetching show data. This usually fixes itself — try refreshing.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleRetry}
          disabled={isPending || clicked}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            padding: '10px 24px', borderRadius: '8px', cursor: isPending ? 'wait' : 'pointer',
            fontWeight: 700, fontSize: '0.9rem', opacity: isPending ? 0.75 : 1,
          }}
        >
          {isPending ? 'Retrying…' : 'Try Again'}
        </button>
        <Link href="/home" style={{
          background: 'var(--surface)', color: '#c9d1d9',
          border: '1px solid var(--border)',
          padding: '10px 24px', borderRadius: '8px',
          fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
        }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
