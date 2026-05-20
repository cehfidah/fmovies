'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  user: { id: number; username: string };
  children: React.ReactNode;
}

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'uil-apps' },
  { href: '/admin/posts', label: 'Posts', icon: 'uil-file-alt' },
  { href: '/admin/posts/new', label: 'New Post', icon: 'uil-plus-circle' },
];

export default function AdminShell({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <Link href="/admin" style={{ display: 'block', marginBottom: '2rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg,#00acc1,#00cee7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FMovies
          </span>
          <div style={{ fontSize: '0.7rem', color: '#8b949e', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</div>
        </Link>

        {/* Nav */}
        <nav>
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`admin-nav-link ${pathname === n.href ? 'active' : ''}`}
            >
              <i className={`uil ${n.icon}`} style={{ fontSize: '1.1rem' }} />
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #30363d' }}>
          <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="uil uil-user-circle" style={{ fontSize: '1.1rem' }} />
            {user.username}
          </div>
          <Link href="/" target="_blank" className="admin-nav-link" style={{ marginBottom: '2px' }}>
            <i className="uil uil-external-link-alt" style={{ fontSize: '1rem' }} /> View Site
          </Link>
          <button onClick={handleLogout} className="admin-nav-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#f87171' }}>
            <i className="uil uil-sign-out-alt" style={{ fontSize: '1rem' }} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
