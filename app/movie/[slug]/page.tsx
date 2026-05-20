import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import CommentSection from '@/components/CommentSection';
import MoviePlayer from '@/components/MoviePlayer';
import WatcherCount from '@/components/WatcherCount';
import TrailerPlayer from '@/components/TrailerPlayer';
import DownloadButton from '@/components/DownloadButton';
import { getMovieDetailsMemo, getMovieDetailsFresh, getTrending, poster, backdrop } from '@/lib/tmdb';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { id: idStr } = await searchParams;
  const id = idStr ? parseInt(idStr, 10) : null;
  if (!id) return { title: 'Movie — FMoviesz' };
  const data = await getMovieDetailsMemo(id).catch(() => null);
  if (!data) return { title: 'Movie — FMoviesz', robots: { index: false, follow: true } };
  const year = (data.release_date || '').slice(0, 4);
  const title: string = data.title || 'Movie';
  const desc = data.overview
    ? `Watch ${title} (${year}) Full Movie Online Free in HD. ${data.overview.slice(0, 120)}…`
    : `Watch ${title} (${year}) full movie online free in HD quality on FMoviesz.`;
  const posterImg = data.poster_path ? poster(data.poster_path, 'w500') : undefined;
  return {
    title: `Watch ${title} (${year}) Full Movie Online Free HD — FMoviesz`,
    description: desc,
    keywords: `${title}, watch ${title} online, ${title} full movie, ${title} free, ${title} HD, fmovies ${title}, 123movies ${title}, watch ${title} ${year}`,
    openGraph: {
      title: `Watch ${title} (${year}) Full Movie Free — FMoviesz`,
      description: desc,
      images: posterImg ? [{ url: posterImg, width: 500, height: 750, alt: title }] : undefined,
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Watch ${title} (${year}) Free — FMoviesz`,
      description: desc,
      images: posterImg ? [posterImg] : undefined,
    },
    alternates: { canonical: `https://fmoviesz.cyou/movie/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { id: idStr } = await searchParams;
  const id = idStr ? parseInt(idStr, 10) : null;
  if (!id || isNaN(id)) notFound();   // genuinely invalid URL — show 404

  // Fetch movie — Memo shares result with generateMetadata (1 TMDB call, not 2).
  // On failure, retry with timestamped fresh fetch (guaranteed no dedup).
  const is404 = (e: unknown) => e instanceof Error && e.message.includes('→ 404');
  let data = await getMovieDetailsMemo(id!).catch((e) => { if (is404(e)) notFound(); return null; });
  if (!data) {
    await new Promise(r => setTimeout(r, 800));
    data = await getMovieDetailsFresh(id!).catch((e) => { if (is404(e)) notFound(); return null; });
  }
  if (!data) throw new Error(`Failed to load movie ${id}`);

  const trendingRes = await getTrending('movie', 'week').catch(() => ({ results: [] }));

  const title: string = data.title || 'Unknown';
  const year = (data.release_date || '').slice(0, 4);
  const genres: { id: number; name: string }[] = data.genres || [];
  const countries: { iso_3166_1: string; name: string }[] = data.production_countries || [];
  const director = ((data.credits?.crew || []) as any[]).find((c: any) => c.job === 'Director');
  const cast: any[] = ((data.credits?.cast || []) as any[]).slice(0, 8);
  const similar = ((data.similar?.results || data.recommendations?.results || []) as any[]).slice(0, 12);
  const trending: any[] = ((trendingRes.results || []) as any[]).slice(0, 10);

  const rating: number = data.vote_average || 0;
  const voteCount: number = data.vote_count || 0;
  const fullStars = Math.floor(rating / 2);
  const hasHalf = rating / 2 - fullStars >= 0.5;

  const embedId = data.imdb_id || String(id);
  const posterImg = poster(data.poster_path, 'w342');
  const backdropImg = backdrop(data.backdrop_path) || '';

  // Official trailer from TMDB videos
  const trailerKey: string | null = ((data.videos?.results || []) as any[])
    .find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))?.key ?? null;

  // Viewer count — derived from popularity so popular movies show higher numbers
  const watcherBase = Math.max(120, Math.min(9800, Math.floor((data.popularity || 10) * 4.2)));

  const seoTerms = [
    'FMovies', '123movies', 'soap2day', 'GoMovies', 'putlocker',
    'yesmovies', 'watch free', 'full movie HD', 'stream online',
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';
  const pageUrl = `${siteUrl}/movie/${slug}`;

  // ── JSON-LD Movie Schema (Google rich snippets + star ratings) ──
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    description: data.overview || '',
    datePublished: data.release_date || year,
    duration: data.runtime ? `PT${data.runtime}M` : undefined,
    image: posterImg,
    url: pageUrl,
    ...(director && {
      director: { '@type': 'Person', name: director.name },
    }),
    actor: cast.slice(0, 5).map((c: any) => ({ '@type': 'Person', name: c.name })),
    genre: genres.map(g => g.name),
    ...(voteCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        ratingCount: voteCount,
        bestRating: '10',
        worstRating: '1',
      },
    }),
  };

  // ── Breadcrumb schema ──
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Movies', item: `${siteUrl}/fmovies-movie` },
      { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
    ],
  };

  const shareText = encodeURIComponent(`Watch ${title} (${year}) free online — FMoviesz`);
  const shareUrl = encodeURIComponent(pageUrl);

  return (
    <>
      <Script
        id="jsonld-movie"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="jsonld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        {/* Backdrop */}
        {backdropImg && (
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img src={backdropImg} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/70 to-transparent" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
            <a href="/" className="hover:text-[#00acc1] transition">Home</a>
            <span>/</span>
            <a href="/fmovies-movie" className="hover:text-[#00acc1] transition">Movies</a>
            <span>/</span>
            {genres.length > 0 && (
              <>
                <a href={`/genre/${genres[0].name.toLowerCase()}`} className="hover:text-[#00acc1] transition">{genres[0].name}</a>
                <span>/</span>
              </>
            )}
            <span className="text-gray-300 truncate max-w-xs">{title}</span>
          </nav>

          <div className="flex gap-6 lg:gap-8 flex-col lg:flex-row">
            {/* ── Main column ── */}
            <div className="flex-1 min-w-0">

              {/* Poster + Info */}
              <div className="flex gap-5 flex-wrap">
                <div
                  className="relative flex-shrink-0"
                  style={{ marginTop: '0' }}
                >
                  <img
                    src={posterImg}
                    alt={title}
                    className="w-40 md:w-52 rounded-xl shadow-2xl border border-[#30363d] object-cover relative z-10"
                  />
                  <span className="absolute top-2 left-2 bg-[#00acc1] text-white text-[9px] font-extrabold px-2 py-0.5 rounded z-20 tracking-widest">
                    HD
                  </span>
                </div>

                <div className="flex-1 min-w-0 pt-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1">
                    {title}
                  </h1>
                  {/* Live viewer count */}
                  <div className="mb-2">
                    <WatcherCount base={watcherBase} />
                  </div>
                  {data.tagline && (
                    <p className="text-[#00acc1] italic text-sm mb-3">&ldquo;{data.tagline}&rdquo;</p>
                  )}

                  {/* Stars */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-xl leading-none ${s <= fullStars ? 'text-yellow-400' : s === fullStars + 1 && hasHalf ? 'text-yellow-300' : 'text-gray-600'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-yellow-400 font-bold text-sm">{Math.round(rating * 10)}%</span>
                    <span className="text-gray-400 text-sm">{rating.toFixed(1)}/10</span>
                    {voteCount > 0 && <span className="text-gray-500 text-xs">({voteCount.toLocaleString()} votes)</span>}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {year && <span className="bg-[#1c2128] border border-[#30363d] text-gray-300 text-xs px-3 py-1 rounded-full">{year}</span>}
                    {data.runtime > 0 && <span className="bg-[#1c2128] border border-[#30363d] text-gray-300 text-xs px-3 py-1 rounded-full">{data.runtime} min</span>}
                    <span className="bg-[#00acc1] text-white text-xs font-bold px-3 py-1 rounded-full">4K-HD</span>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5 text-sm mb-5">
                    {genres.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-500 w-20 flex-shrink-0">Genre:</span>
                        <div className="flex flex-wrap gap-1">
                          {genres.map((g, i) => (
                            <span key={g.id}>
                              <a href={`/genre/${g.name.toLowerCase()}`} className="text-[#00acc1] hover:underline">{g.name}</a>
                              {i < genres.length - 1 && <span className="text-gray-600">, </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {countries.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-20 flex-shrink-0">Country:</span>
                        <div className="flex gap-1 flex-wrap">
                          {countries.map((c, i) => (
                            <span key={c.iso_3166_1}>
                              <a href={`/country/${c.iso_3166_1.toLowerCase()}`} className="text-[#00acc1] hover:underline">{c.name}</a>
                              {i < countries.length - 1 && <span className="text-gray-600">, </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {director && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-20 flex-shrink-0">Director:</span>
                        <a href={`/person/${encodeURIComponent(director.name.toLowerCase().replace(/\s+/g, '-'))}`} className="text-[#00acc1] hover:underline">{director.name}</a>
                      </div>
                    )}
                    {cast.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-500 w-20 flex-shrink-0">Cast:</span>
                        <div className="flex flex-wrap gap-1">
                          {cast.map((c: any, i: number) => (
                            <span key={c.id}>
                              <a href={`/person/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`} className="text-[#00acc1] hover:underline">{c.name}</a>
                              {i < cast.length - 1 && <span className="text-gray-600">, </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {year && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-20 flex-shrink-0">Release:</span>
                        <a href={`/release/${year}`} className="text-[#00acc1] hover:underline">{year}</a>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20 flex-shrink-0">Quality:</span>
                      <span className="text-white font-semibold">HD</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-5">
                    <a href="#watch" className="flex items-center gap-3 bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-[#00acc1]/20 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      <span>Stream in HD<span className="block text-[10px] font-normal opacity-75">Quality: 4K-HD · Free</span></span>
                    </a>
                    <a href={`/register?movie=${id}`} className="flex items-center gap-3 bg-[#1c2128] hover:bg-[#2d333b] border border-[#30363d] hover:border-[#00acc1] text-white font-bold px-6 py-3 rounded-xl transition text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24"><path d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7z" /></svg>
                      <span>Download in HD<span className="block text-[10px] font-normal opacity-75">Quality: 4K-HD</span></span>
                    </a>
                  </div>

                  {/* Social Share */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-500 text-xs self-center">Share:</span>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">📘 Facebook</a>
                    <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-800 border border-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">𝕏 Twitter</a>
                    <a href={`https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`} target="_blank" rel="noopener noreferrer" className="bg-[#ff4500] hover:bg-[#e03d00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">🔴 Reddit</a>
                    <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="bg-[#25d366] hover:bg-[#1fba59] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">💬 WhatsApp</a>
                    <DownloadButton title={title} />
                  </div>
                </div>
              </div>

              {/* Overview */}
              {data.overview && (
                <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h2 className="text-white font-bold mb-2">Overview</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{data.overview}</p>
                </div>
              )}

              {/* Trailer — keeps users engaged before they hit the main player */}
              {trailerKey && (
                <div className="mt-6">
                  <h2 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-red-500 rounded-full inline-block" />
                    Official Trailer
                  </h2>
                  <TrailerPlayer trailerKey={trailerKey} title={title} posterUrl={backdropImg || posterImg} />
                </div>
              )}

              {/* Ad-gated Player */}
              <div id="watch" className="mt-6 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#30363d] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00acc1] rounded-full animate-pulse"></span>
                  <span className="text-white text-sm font-semibold">Watch {title}</span>
                  <span className="ml-auto bg-[#00acc1] text-white text-[10px] font-bold px-2 py-0.5 rounded">4K-HD</span>
                </div>
                <MoviePlayer
                  embedId={embedId}
                  posterUrl={backdropImg || posterImg}
                  title={title}
                  type="movie"
                />
                {/* ── Tags section below player ── */}
                <div className="px-4 py-3 border-t border-[#30363d]">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mr-1">Tags:</span>
                    {genres.map(g => (
                      <a
                        key={g.id}
                        href={`/genre/${g.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-xs font-medium bg-[#0b0c0e] hover:bg-[#00acc1]/10 border border-[#30363d] hover:border-[#00acc1] text-[#00acc1] px-3 py-1.5 rounded-full transition"
                      >
                        🎬 {g.name} Movies
                      </a>
                    ))}
                    {year && (
                      <a
                        href={`/release/${year}`}
                        className="text-xs font-medium bg-[#0b0c0e] hover:bg-[#00acc1]/10 border border-[#30363d] hover:border-[#00acc1] text-[#00acc1] px-3 py-1.5 rounded-full transition"
                      >
                        📅 {year} Movies
                      </a>
                    )}
                    {countries.slice(0, 2).map(c => (
                      <a
                        key={c.iso_3166_1}
                        href={`/country/${c.iso_3166_1.toLowerCase()}`}
                        className="text-xs font-medium bg-[#0b0c0e] hover:bg-[#00acc1]/10 border border-[#30363d] hover:border-[#00acc1] text-gray-400 hover:text-[#00acc1] px-3 py-1.5 rounded-full transition"
                      >
                        🌍 {c.name}
                      </a>
                    ))}
                    {cast.slice(0, 2).map((c: any) => (
                      <a
                        key={c.id}
                        href={`/person/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="text-xs font-medium bg-[#0b0c0e] hover:bg-[#00acc1]/10 border border-[#30363d] hover:border-[#00acc1] text-gray-400 hover:text-[#00acc1] px-3 py-1.5 rounded-full transition"
                      >
                        👤 {c.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO Keywords (like fmoviess.org style) */}
              <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {seoTerms.map(term => (
                    <span key={term} className="text-xs bg-[#0b0c0e] border border-[#30363d] text-gray-500 px-3 py-1.5 rounded-full">
                      #{title} {term}
                    </span>
                  ))}
                  {genres.map(g => (
                    <span key={g.id} className="text-xs bg-[#0b0c0e] border border-[#30363d] text-gray-500 px-3 py-1.5 rounded-full">
                      #{g.name} movies {year}
                    </span>
                  ))}
                  {cast.slice(0, 3).map((c: any) => (
                    <span key={c.id} className="text-xs bg-[#0b0c0e] border border-[#30363d] text-gray-500 px-3 py-1.5 rounded-full">
                      #{c.name} movies
                    </span>
                  ))}
                </div>
              </div>

              {/* Similar */}
              {similar.length > 0 && (
                <div className="mt-8">
                  <MovieGrid
                    heading="You May Also Like"
                    movies={similar.map((m: any) => ({ ...m, media_type: 'movie' }))}
                  />
                </div>
              )}

              {/* Comments */}
              <CommentSection tmdbId={id} />
            </div>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="text-[#00acc1]">🔥</span> Trending Now
                </h3>
                <div className="space-y-2">
                  {trending.map((m: any, i: number) => (
                    <a
                      key={m.id}
                      href={`/movie/${m.id}-${encodeURIComponent((m.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))}?id=${m.id}`}
                      className="flex gap-3 bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-[#00acc1] rounded-xl p-2 transition group"
                    >
                      <span className="text-gray-600 font-bold text-sm w-5 flex-shrink-0 text-right mt-1">{i + 1}</span>
                      <img src={poster(m.poster_path, 'w92')} alt={m.title} className="w-11 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 text-xs font-semibold group-hover:text-[#00acc1] transition line-clamp-2 leading-tight">{m.title}</p>
                        <p className="text-gray-500 text-xs mt-1">{(m.release_date || '').slice(0, 4)}</p>
                        {m.vote_average > 0 && <p className="text-yellow-400 text-xs">⭐ {m.vote_average.toFixed(1)}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
