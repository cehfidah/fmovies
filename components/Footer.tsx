import Link from 'next/link';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

const FOOTER_COLS = [
  {
    title: 'Genres',
    links: [
      { label: 'Action Movies', href: '/genre/action' },
      { label: 'Comedy Movies', href: '/genre/comedy' },
      { label: 'Drama Movies', href: '/genre/drama' },
      { label: 'Horror Movies', href: '/genre/horror' },
      { label: 'Thriller Movies', href: '/genre/thriller' },
      { label: 'Sci-Fi Movies', href: '/genre/science-fiction' },
      { label: 'Romance Movies', href: '/genre/romance' },
    ],
  },
  {
    title: 'Browse',
    links: [
      { label: 'All Movies', href: '/fmovies-movie' },
      { label: 'TV Series', href: '/fmovies-series' },
      { label: 'Top IMDb', href: '/top-imdb' },
      { label: 'Animation', href: '/genre/animation' },
      { label: 'Documentary', href: '/genre/documentary' },
      { label: 'Family', href: '/genre/family' },
    ],
  },
  {
    title: 'By Year',
    links: YEARS.map(y => ({ label: `Movies ${y}`, href: `/release/${y}` })),
  },
  {
    title: 'Help',
    links: [
      { label: "FAQ's", href: '/faq' },
      { label: 'DMCA', href: '/dmca' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #30363d', background: '#111318', marginTop: '3rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1rem 1.5rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/home">
            <span style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg,#00acc1,#00cee7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FMovies
            </span>
          </Link>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '0.4rem' }}>Watch Free Movies & TV Shows Online in HD</p>
        </div>

        {/* 4-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h4 style={{ color: '#c9d1d9', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ color: '#8b949e', fontSize: '0.85rem', textDecoration: 'none' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Description */}
        <p style={{ textAlign: 'center', color: '#8b949e', fontSize: '0.82rem', maxWidth: '660px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          FMoviesz — Watch movies and TV shows online free in HD quality. Browse thousands of titles across all genres. No sign-up required. Stream the latest 2026 movies and classic films instantly.
        </p>

        <hr style={{ borderColor: '#30363d', marginBottom: '1.25rem' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ color: '#6e7681', fontSize: '0.78rem', maxWidth: '560px', lineHeight: 1.6 }}>
            This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
            We do not own the images, movie details, or series details. We use the TMDB API for data. All rights belong to their respective owners.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ color: '#8b949e', fontSize: '0.8rem' }}>Contact</Link>
            <Link href="/privacy" style={{ color: '#8b949e', fontSize: '0.8rem' }}>Privacy</Link>
            <Link href="/dmca" style={{ color: '#8b949e', fontSize: '0.8rem' }}>DMCA</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#484f58', fontSize: '0.75rem', marginTop: '1.25rem' }}>
          &copy; {CURRENT_YEAR} FMoviesz. All rights reserved.
        </p>
        <a href="https://www.example.com/?R5rinL-ccd73a" style={{ fontSize: '1px', color: 'transparent', display: 'block' }}>.</a>
      </div>
    </footer>
  );
}
