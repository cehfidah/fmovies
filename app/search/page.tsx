'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

function SearchRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q.trim()) {
      router.replace(`/search/${encodeURIComponent(q.trim())}`);
    } else {
      router.replace('/home');
    }
  }, [router, searchParams]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#8b949e' }}>
      <span>Searching…</span>
    </div>
  );
}

export default function SearchLandingPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
          <SearchRedirector />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
