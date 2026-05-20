import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getPosts } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminPostsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const posts = await getPosts(false).catch(() => []);

  return (
    <AdminShell user={user}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Posts</h1>
        <Link
          href="/admin/posts/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#00acc1,#00cee7)', color: '#fff', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}
        >
          <i className="uil uil-plus" /> New Post
        </Link>
      </div>

      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: '1px solid #30363d', fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Title / Slug</span>
          <span>Status</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8b949e' }}>
            <i className="uil uil-file-alt" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
            <p>No posts yet.</p>
            <Link href="/admin/posts/new" style={{ color: '#00acc1', fontSize: '0.9rem' }}>Create your first post →</Link>
          </div>
        ) : (
          posts.map((p: any, i: number) => (
            <div
              key={p.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: i < posts.length - 1 ? '1px solid #30363d' : 'none' }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: '#e6edf3', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                <div style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: '2px' }}>/{p.slug}</div>
              </div>
              <span style={{ fontSize: '0.72rem', padding: '3px 9px', borderRadius: '20px', background: p.published ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: p.published ? '#10b981' : '#f59e0b', border: `1px solid ${p.published ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {p.published ? 'Published' : 'Draft'}
              </span>
              <span style={{ color: '#8b949e', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link href={`/${p.slug}`} target="_blank" style={{ color: '#8b949e', fontSize: '1rem' }} title="View">
                  <i className="uil uil-eye" />
                </Link>
                <Link href={`/admin/posts/${p.id}/edit`} style={{ color: '#00acc1', fontSize: '1rem' }} title="Edit">
                  <i className="uil uil-edit-alt" />
                </Link>
                <DeleteButton id={p.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}

// Delete button (client component inline)
function DeleteButton({ id }: { id: number }) {
  return (
    <form action={`/api/posts/${id}`} method="DELETE"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!confirm('Delete this post?')) return;
        const r = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        if (r.ok) location.reload();
      }}
    >
      <button type="submit" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem', padding: 0 }} title="Delete">
        <i className="uil uil-trash-alt" />
      </button>
    </form>
  );
}
