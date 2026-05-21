'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/types';

const CATEGORIES = [
  'Movie Review',
  'TV Series Review',
  'Upcoming Movies',
  'Streaming News',
  'Top Lists',
  'Actor/Director Spotlight',
];

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
  const [title, setTitle]         = useState(post?.title || '');
  const [slug, setSlug]           = useState(post?.slug || '');
  const [metaDesc, setMetaDesc]   = useState(post?.meta_description || '');
  const [metaKeys, setMetaKeys]   = useState(post?.meta_keywords || '');
  const [featImg, setFeatImg]     = useState(post?.featured_image || '');
  const [content, setContent]     = useState(post?.content || '');
  const [published, setPublished] = useState(post?.published ?? false);
  const [category, setCategory]   = useState((post as any)?.category || '');
  const [tags, setTags]           = useState((post as any)?.tags || '');
  const [author, setAuthor]       = useState((post as any)?.author || 'FMoviesz Editorial');
  const [slugManual, setSlugManual] = useState(mode === 'edit');

  // AI state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMovie, setAiMovie]         = useState('');
  const [aiCategory, setAiCategory]   = useState('Movie Review');
  const [aiYear, setAiYear]           = useState(new Date().getFullYear().toString());
  const [aiExtra, setAiExtra]         = useState('');
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState('');

  // Link helper state
  const [showLinkHelper, setShowLinkHelper] = useState(false);
  const [linkAnchor, setLinkAnchor]         = useState('');
  const [linkTarget, setLinkTarget]         = useState('/fmovies-movie');
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

    const body = { title, slug, content, meta_description: metaDesc, meta_keywords: metaKeys || tags, featured_image: featImg, published, category, tags, author };

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

  async function handleAiGenerate() {
    if (!aiMovie.trim()) { setAiError('Enter a movie or show title first.'); return; }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle: aiMovie, category: aiCategory, year: aiYear, extraContext: aiExtra }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error || 'Generation failed'); return; }
      setTitle(data.title || '');
      setSlug(data.slug || toSlug(data.title || aiMovie));
      setSlugManual(true);
      setMetaDesc(data.meta_description || '');
      setMetaKeys(data.meta_keywords || '');
      setTags(data.tags || '');
      setContent(data.content || '');
      setCategory(data.category || aiCategory);
      setAuthor(data.author || 'FMoviesz Editorial');
      // Use the actual TMDB poster returned by the server
      if (data.featured_image) setFeatImg(data.featured_image);
      setShowAiPanel(false);
      setTab('write');
    } catch {
      setAiError('Network error during generation.');
    } finally {
      setAiLoading(false);
    }
  }

  function insertInternalLink() {
    if (!linkAnchor.trim()) return;
    setContent(prev => prev + `<a href="${linkTarget}">${linkAnchor}</a>`);
    setLinkAnchor('');
    setShowLinkHelper(false);
  }

  const inputStyle = { width: '100%', background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8b949e', marginBottom: '0.35rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
  const btnSm: React.CSSProperties = { background: '#1c2128', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: '7px', padding: '0.4rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{success}</div>}

      {/* ── AI Generator Panel ── */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowAiPanel(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🤖</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e6edf3' }}>AI Blog Generator (ChatGPT)</span>
            <span style={{ fontSize: '0.7rem', color: '#00acc1', background: 'rgba(0,172,193,0.12)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>GPT-4o-mini · auto-fetches TMDB poster</span>
          </div>
          <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{showAiPanel ? '▲ collapse' : '▼ expand'}</span>
        </div>
        {showAiPanel && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {aiError && <div style={{ color: '#f87171', fontSize: '0.82rem', background: 'rgba(239,68,68,0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>{aiError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Movie / Show Title *</label>
                <input type="text" value={aiMovie} onChange={e => setAiMovie(e.target.value)} placeholder="e.g. Mission Impossible 8" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input type="text" value={aiYear} onChange={e => setAiYear(e.target.value)} placeholder="2025" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={aiCategory} onChange={e => setAiCategory(e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Extra Context (optional)</label>
                <input type="text" value={aiExtra} onChange={e => setAiExtra(e.target.value)} placeholder="Director, cast, synopsis hint…" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="button" onClick={handleAiGenerate} disabled={aiLoading} style={{ background: 'linear-gradient(135deg,#7c3aed,#9f67fa)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 700, fontSize: '0.9rem', cursor: aiLoading ? 'not-allowed' : 'pointer', opacity: aiLoading ? 0.7 : 1 }}>
                {aiLoading ? '⏳ Generating…' : '✨ Generate with AI'}
              </button>
              <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>Fills all fields + pulls movie poster from TMDB automatically</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title * <span style={{ fontWeight: 400, textTransform: 'none', color: '#8b949e' }}>{title.length}/60</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Post title (50-60 chars for SEO)…" style={{ ...inputStyle, fontSize: '1.05rem', fontWeight: 600 }} />
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
              <button type="button" onClick={() => { setSlug(toSlug(title)); setSlugManual(false); }} style={btnSm} title="Regenerate slug from title">↺</button>
            </div>
          </div>

          {/* Content editor */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ ...labelStyle, marginBottom: 0, alignSelf: 'center' }}>Content (HTML)</label>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(['write', 'preview'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setTab(t)} style={{ padding: '3px 10px', borderRadius: '5px', border: '1px solid #30363d', background: tab === t ? '#00acc1' : '#1c2128', color: tab === t ? '#fff' : '#8b949e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
                <button type="button" onClick={() => setShowLinkHelper(v => !v)} style={{ ...btnSm, fontSize: '0.72rem' }}>🔗 Link Helper</button>
              </div>
            </div>

            {/* Internal link builder */}
            {showLinkHelper && (
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={labelStyle}>Anchor Text</label>
                  <input type="text" value={linkAnchor} onChange={e => setLinkAnchor(e.target.value)} placeholder="watch movies online" style={{ ...inputStyle, fontSize: '0.82rem' }} />
                </div>
                <div style={{ flex: 1, minWidth: '190px' }}>
                  <label style={labelStyle}>Target URL</label>
                  <input type="text" value={linkTarget} onChange={e => setLinkTarget(e.target.value)} placeholder="/fmovies-movie" style={{ ...inputStyle, fontSize: '0.82rem' }} />
                </div>
                <button type="button" onClick={insertInternalLink} style={{ ...btnSm, background: '#00acc1', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}>Insert</button>
                <div style={{ flex: '0 0 100%', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {['/fmovies-movie', '/fmovies-series', '/trending', '/top-imdb', '/filter'].map(p => (
                    <button key={p} type="button" onClick={() => setLinkTarget(p)} style={{ ...btnSm, fontSize: '0.68rem', padding: '2px 6px' }}>{p}</button>
                  ))}
                </div>
              </div>
            )}

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

          {/* Classification */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e6edf3' }}>Classification</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                <option value="">— Select category —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="watch free movies, stream hd, fmovies" style={inputStyle} />
              {tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((t: string, i: number) => (
                    <span key={i} style={{ background: 'rgba(0,172,193,0.1)', border: '1px solid rgba(0,172,193,0.25)', color: '#00cee7', borderRadius: '20px', fontSize: '0.7rem', padding: '2px 8px' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="FMoviesz Editorial" style={inputStyle} />
            </div>
          </div>

          {/* SEO */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e6edf3' }}>SEO</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Meta Description <span style={{ fontWeight: 400, textTransform: 'none', color: metaDesc.length > 160 ? '#f87171' : '#8b949e' }}>{metaDesc.length}/160</span></label>
              <textarea
                value={metaDesc}
                onChange={e => setMetaDesc(e.target.value)}
                placeholder="155–160 chars for best SEO"
                maxLength={300}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontSize: '0.82rem' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Keywords</label>
              <input type="text" value={metaKeys} onChange={e => setMetaKeys(e.target.value)} placeholder="fmovies, free movies, stream" style={inputStyle} />
            </div>
          </div>

          {/* Featured Image */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e6edf3' }}>Featured Image</h3>
            <p style={{ color: '#8b949e', fontSize: '0.72rem', marginBottom: '0.5rem', marginTop: 0 }}>Auto-filled from TMDB when using AI Generator.</p>
            <input type="url" value={featImg} onChange={e => setFeatImg(e.target.value)} placeholder="https://image.tmdb.org/t/p/w780/…" style={inputStyle} />
            {featImg && (
              <img src={featImg} alt="Featured" style={{ width: '100%', borderRadius: '6px', marginTop: '0.75rem', objectFit: 'cover', maxHeight: '160px' }} onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>

          {/* SEO Checklist */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#e6edf3' }}>SEO Checklist</h3>
            {[
              { label: 'Title 50-60 chars', ok: title.length >= 50 && title.length <= 65 },
              { label: 'Meta desc 140-160 chars', ok: metaDesc.length >= 140 && metaDesc.length <= 165 },
              { label: 'Has category', ok: !!category },
              { label: 'Has 5+ tags', ok: tags.split(',').filter((t: string) => t.trim()).length >= 5 },
              { label: 'Has featured image', ok: !!featImg },
              { label: 'Content >1000 words', ok: content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length >= 1000 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ color: item.ok ? '#10b981' : '#4b5563' }}>{item.ok ? '✓' : '○'}</span>
                <span style={{ fontSize: '0.75rem', color: item.ok ? '#c9d1d9' : '#6b7280' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
