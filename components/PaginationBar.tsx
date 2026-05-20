'use client';
import { useRouter } from 'next/navigation';

interface Props {
  current: number;
  total: number;
  basePath: string;
  paramName?: string;
}

export default function PaginationBar({ current, total, basePath, paramName = 'page' }: Props) {
  const router = useRouter();
  if (total <= 1) return null;

  const sep = basePath.includes('?') ? '' : '?';
  const getHref = (p: number) => `${basePath}${sep}${paramName}=${p}`;

  const pages: (number | '...')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return (
    <div className="pagination" style={{ marginTop: '2.5rem' }}>
      <a href={getHref(Math.max(1, current - 1))} className={`page-btn ${current === 1 ? 'disabled' : ''}`}>
        ← Prev
      </a>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} className="page-btn" style={{ cursor: 'default' }}>…</span>
        ) : (
          <a key={p} href={getHref(p)} className={`page-btn ${p === current ? 'active' : ''}`}>
            {p}
          </a>
        )
      )}
      <a href={getHref(Math.min(total, current + 1))} className={`page-btn ${current === total ? 'disabled' : ''}`}>
        Next →
      </a>
    </div>
  );
}
