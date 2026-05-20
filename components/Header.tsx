'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { poster } from '@/lib/tmdb';

interface Suggestion {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

const GENRES = [
  'Action','Adventure','Animation','Comedy','Crime','Documentary','Drama',
  'Family','Fantasy','History','Horror','Music','Mystery','Romance',
  'Science Fiction','Thriller','War','Western',
];

const COUNTRIES = [
  { label: 'United States', slug: 'united-states' },
  { label: 'United Kingdom', slug: 'united-kingdom' },
  { label: 'India', slug: 'india' },
  { label: 'South Korea', slug: 'south-korea' },
  { label: 'Japan', slug: 'japan' },
  { label: 'France', slug: 'france' },
  { label: 'Germany', slug: 'germany' },
  { label: 'China', slug: 'china' },
  { label: 'Spain', slug: 'spain' },
  { label: 'Italy', slug: 'italy' },
  { label: 'Canada', slug: 'canada' },
  { label: 'Australia', slug: 'australia' },
];

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&quick=1`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results?.slice(0, 8) || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      // Only close dropdowns when clicking OUTSIDE the nav area
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search/${encodeURIComponent(query.trim())}`);
    }
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, zIndex: 50,
    background: '#161b22', border: '1px solid #30363d', borderRadius: '8px',
    padding: '0.5rem 0', minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    columns: 2, columnGap: 0,
  };

  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/fmovies-movie', label: 'Movies' },
    { href: '/fmovies-series', label: 'TV Series' },
    { href: '/top-imdb', label: 'Top IMDb' },
    { href: '/trending', label: 'Trending' },
  ];

  return (
    <header style={{ background: '#111318', borderBottom: '1px solid #30363d', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '60px' }}>
        {/* Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#00acc1,#00cee7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FMovies
          </span>
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} style={{ display: 'flex', gap: '0.1rem', marginLeft: '0.25rem' }} className="hidden md:flex">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="nav-tab"
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', color: '#8b949e', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {l.label}
            </Link>
          ))}

          {/* Genre dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setOpenDropdown('genre')}
              onMouseLeave={() => setOpenDropdown(null)}
              onClick={() => setOpenDropdown(d => d === 'genre' ? null : 'genre')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', color: '#8b949e', fontSize: '0.82rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              Genre <i className="uil uil-angle-down" style={{ fontSize: '0.9rem' }} />
            </button>
            {openDropdown === 'genre' && (
              <div style={dropdownStyle}
                onMouseEnter={() => setOpenDropdown('genre')}
                onMouseLeave={() => setOpenDropdown(null)}>
                {GENRES.map(g => (
                  <Link key={g} href={`/genre/${g.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{ display: 'block', padding: '0.4rem 1rem', color: '#c9d1d9', fontSize: '0.82rem', whiteSpace: 'nowrap', breakInside: 'avoid' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#c9d1d9')}
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Country dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setOpenDropdown('country')}
              onMouseLeave={() => setOpenDropdown(null)}
              onClick={() => setOpenDropdown(d => d === 'country' ? null : 'country')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', color: '#8b949e', fontSize: '0.82rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              Country <i className="uil uil-angle-down" style={{ fontSize: '0.9rem' }} />
            </button>
            {openDropdown === 'country' && (
              <div style={{ ...dropdownStyle, columns: 1, minWidth: '180px' }}
                onMouseEnter={() => setOpenDropdown('country')}
                onMouseLeave={() => setOpenDropdown(null)}>
                {COUNTRIES.map(c => (
                  <Link key={c.slug} href={`/country/${c.slug}`}
                    style={{ display: 'block', padding: '0.4rem 1rem', color: '#c9d1d9', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#c9d1d9')}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Search */}
        <div ref={wrapperRef} style={{ flex: 1, maxWidth: '480px', marginLeft: 'auto', position: 'relative' }}>
          <form onSubmit={handleSubmit} className="search-form" style={{ borderRadius: '8px' }}>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
              placeholder="Search movies and series…"
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            <button type="submit" aria-label="Search">
              <i className="uil uil-search" />
            </button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map(s => {
                const title = s.title || s.name || 'Unknown';
                const year = (s.release_date || s.first_air_date || '').slice(0, 4);
                const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${year}`;
                const href = s.media_type === 'tv' ? `/tv/${slug}?id=${s.id}` : `/movie/${slug}?id=${s.id}`;
                return (
                  <Link
                    key={s.id}
                    href={href}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', transition: 'background 0.15s' }}
                    onClick={() => setShowSuggestions(false)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c2128')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={poster(s.poster_path, 'w92')} alt={title} width={28} height={42} style={{ borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#e6edf3' }}>{title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>{s.media_type === 'tv' ? 'TV Series' : 'Movie'} {year && `• ${year}`}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          style={{ marginLeft: '0.5rem', background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1.4rem', display: 'flex' }}
          className="flex md:hidden"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Menu"
        >
          <i className={`uil ${mobileMenu ? 'uil-times' : 'uil-bars'}`} />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileMenu && (
        <nav style={{ borderTop: '1px solid #30363d', background: '#111318', padding: '0.5rem 1rem 1rem' }}>
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileMenu(false)}
              style={{ display: 'block', padding: '0.6rem 0.75rem', color: '#8b949e', fontSize: '0.9rem', borderRadius: '6px' }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ padding: '0.6rem 0.75rem', color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>Genre</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0 0.75rem 0.5rem' }}>
            {GENRES.map(g => (
              <Link key={g} href={`/genre/${g.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMobileMenu(false)}
                style={{ fontSize: '0.78rem', color: '#8b949e', padding: '3px 8px', border: '1px solid #30363d', borderRadius: '4px' }}>
                {g}
              </Link>
            ))}
          </div>
          <div style={{ padding: '0.6rem 0.75rem', color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Country</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0 0.75rem 0.5rem' }}>
            {COUNTRIES.map(c => (
              <Link key={c.slug} href={`/country/${c.slug}`}
                onClick={() => setMobileMenu(false)}
                style={{ fontSize: '0.78rem', color: '#8b949e', padding: '3px 8px', border: '1px solid #30363d', borderRadius: '4px' }}>
                {c.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
