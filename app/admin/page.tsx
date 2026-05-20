import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getPosts } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminDashboard() {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const posts = await getPosts(false).catch(() => []);
  const published = posts.filter((p: any) => p.published).length;
  const drafts = posts.filter((p: any) => !p.published).length;

  return (
    <AdminShell user={user}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '2rem' }}>Welcome back, {user.username}!</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Posts', value: posts.length, icon: 'uil-file-alt', color: '#00acc1' },
            { label: 'Published', value: published, icon: 'uil-check-circle', color: '#10b981' },
            { label: 'Drafts', value: drafts, icon: 'uil-edit-alt', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{s.label}</span>
                <i className={`uil ${s.icon}`} style={{ color: s.color, fontSize: '1.3rem' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e6edf3' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <Link
            href="/admin/posts/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#00acc1,#00cee7)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
          >
            <i className="uil uil-plus" /> New Post
          </Link>
          <a
            href="/"
            target="_blank"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#1c2128', border: '1px solid #30363d', color: '#c9d1d9', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}
          >
            <i className="uil uil-external-link-alt" /> View Site
          </a>
        </div>

        {/* Recent posts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Posts</h2>
            <Link href="/admin/posts" style={{ color: '#00acc1', fontSize: '0.85rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', overflow: 'hidden' }}>
            {posts.slice(0, 5).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>
                No posts yet. <Link href="/admin/posts/new" style={{ color: '#00acc1' }}>Create your first post →</Link>
              </div>
            ) : (
              posts.slice(0, 5).map((p: any, i: number) => (
                <div
                  key={p.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderBottom: i < Math.min(posts.length, 5) - 1 ? '1px solid #30363d' : 'none', flexWrap: 'wrap', gap: '0.5rem' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: '#e6edf3', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: '2px' }}>/{p.slug}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px', background: p.published ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: p.published ? '#10b981' : '#f59e0b', border: `1px solid ${p.published ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, fontWeight: 600 }}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    <Link href={`/admin/posts/${p.id}/edit`} style={{ color: '#8b949e', fontSize: '1rem' }}>
                      <i className="uil uil-edit-alt" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
