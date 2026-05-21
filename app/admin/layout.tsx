import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Fmovies',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#0b0c0e', color: '#e6edf3' }}>
      {children}
    </div>
  );
}
