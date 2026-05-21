import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPosts } from '@/lib/db';
import type { Post } from '@/types';

export const metadata: Metadata = {
  title: 'Blog — Movie News, Reviews & Streaming Guides | FMoviesz',
  description: 'Read the latest movie reviews, streaming guides, upcoming releases and TV series news on FMoviesz Blog.',
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = (await getPosts(true).catch(() => [])) as Post[];

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#e6edf3', marginBottom: '0.4rem' }}>
          Blog
        </h1>
        <p style={{ color: '#8b949e', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
          Movie reviews, streaming guides, upcoming releases & TV news.
        </p>

        {posts.length === 0 ? (
          <p style={{ color: '#8b949e', textAlign: 'center', marginTop: '4rem' }}>No posts yet. Check back soon!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                style={{ textDecoration: 'none', display: 'block', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00acc1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363d'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                {/* Thumbnail */}
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #1c2128 0%, #0d1117 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="uil uil-image" style={{ fontSize: '2.5rem', color: '#30363d' }} />
                  </div>
                )}

                <div style={{ padding: '1rem' }}>
                  {post.category && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#00acc1', marginBottom: '0.4rem', display: 'inline-block' }}>
                      {post.category}
                    </span>
                  )}
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e6edf3', lineHeight: 1.4, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.title}
                  </h2>
                  {post.meta_description && (
                    <p style={{ fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      {post.meta_description}
                    </p>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#6e7681', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {post.author && <span>{post.author}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
