'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/types';

interface Props {
  mode: 'create' | 'edit';
  post?: Post;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 100);
}

export default function PostForm({ mode, post }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [metaDesc, setMetaDesc] = useState(post?.meta_description || '');
  const [metaKeys, setMetaKeys] = useState(post?.meta_keywords || '');
  const [featImg, setFeatImg] = useState(post?.featured_image || '');
  const [content, setContent] = useState(post?.content || '');
  const [published, setPublished] = useState(post?.published ?? false);
  const [slugManual, setSlugManual] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  // Auto-generate slug from title (only if not manually set)
  useEffect(() => {
    if (!slugManual && title) setSlug(toSlug(title));
  }, [title, slugManual]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const body = { title, slug, content, meta_description: metaDesc, meta_keywords: metaKeys, featured_image: featImg, published };

    try {
      let res;
      if (mode === 'create') {
        res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch(`/api/posts/${post!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (res.ok) {
        setSuccess(mode === 'create' ? 'Post created successfully!' : 'Post updated successfully!');
        if (mode === 'create') {
          setTimeout(() => router.push(`/admin/posts/${data.id}/edit`), 1200);
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { width: '100%', background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8b949e', marginBottom: '0.35rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Post title…" style={{ ...inputStyle, fontSize: '1.05rem', fontWeight: 600 }} />
          </div>

          {/* Slug */}
          <div>
            <label style={labelStyle}>Slug *</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#8b949e', fontSize: '0.85rem', flexShrink: 0 }}>fmoviesz.cyou/</span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                required
                placeholder="url-slug"
                style={{ ...inputStyle, flex: 1 }}
                pattern="[a-z0-9\-]+"
                title="Only lowercase letters, numbers, and hyphens"
              />
            </div>
          </div>

          {/* Content editor */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0, alignSelf: 'center' }}>Content (HTML)</label>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                {(['write', 'preview'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setTab(t)} style={{ padding: '3px 10px', borderRadius: '5px', border: '1px solid #30363d', background: tab === t ? '#00acc1' : '#1c2128', color: tab === t ? '#fff' : '#8b949e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {tab === 'write' ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="<h2>Heading</h2><p>Write your content in HTML…</p>"
                style={{ ...inputStyle, minHeight: '380px', resize: 'vertical', fontFamily: 'Consolas, monospace', fontSize: '0.85rem', lineHeight: 1.5 }}
              />
            ) : (
              <div
                className="article-content"
                style={{ minHeight: '380px', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '1rem' }}
                dangerouslySetInnerHTML={{ __html: content || '<p style="color:#8b949e">Nothing to preview yet.</p>' }}
              />
            )}
            <p style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: '0.35rem' }}>
              Supports full HTML. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;, &lt;img&gt;, etc.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Publish box */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e6edf3' }}>Publish</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#00acc1' }} />
              <span style={{ fontSize: '0.875rem', color: '#c9d1d9' }}>Published</span>
              <span style={{ fontSize: '0.72rem', color: published ? '#10b981' : '#f59e0b', marginLeft: 'auto' }}>{published ? 'Live' : 'Draft'}</span>
            </label>
            <button
              type="submit"
              disabled={saving}
              style={{ width: '100%', background: 'linear-gradient(135deg,#00acc1,#00cee7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create Post' : 'Save Changes'}
            </button>
            {mode === 'edit' && (
              <a href={`/${slug}`} target="_blank" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', color: '#8b949e', fontSize: '0.8rem', textDecoration: 'none' }}>
                View post ↗
              </a>
            )}
          </div>

          {/* SEO */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e6edf3' }}>SEO</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Meta Description</label>
              <textarea
                value={metaDesc}
                onChange={e => setMetaDesc(e.target.value)}
                placeholder="Short description for search engines (150–160 chars)"
                maxLength={300}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontSize: '0.82rem' }}
              />
              <div style={{ color: '#8b949e', fontSize: '0.72rem', textAlign: 'right' }}>{metaDesc.length}/300</div>
            </div>
            <div>
              <label style={labelStyle}>Keywords</label>
              <input
                type="text"
                value={metaKeys}
                onChange={e => setMetaKeys(e.target.value)}
                placeholder="fmovies, free movies, stream"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e6edf3' }}>Featured Image</h3>
            <input
              type="url"
              value={featImg}
              onChange={e => setFeatImg(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={inputStyle}
            />
            {featImg && (
              <img src={featImg} alt="Featured" style={{ width: '100%', borderRadius: '6px', marginTop: '0.75rem', objectFit: 'cover', maxHeight: '120px' }} onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
