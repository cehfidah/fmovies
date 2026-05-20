import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY || '';

async function searchPerson(name: string) {
  const res = await fetch(
    `${TMDB_BASE}/search/person?api_key=${KEY}&query=${encodeURIComponent(name)}&page=1`,
    { next: { revalidate: 86400 } }
  );
  const data = await res.json();
  return (data.results || [])[0] || null;
}

async function getPersonMovies(personId: number) {
  const res = await fetch(
    `${TMDB_BASE}/person/${personId}/combined_credits?api_key=${KEY}`,
    { next: { revalidate: 86400 } }
  );
  return res.json();
}

async function getPersonDetails(personId: number) {
  const res = await fetch(
    `${TMDB_BASE}/person/${personId}?api_key=${KEY}`,
    { next: { revalidate: 86400 } }
  );
  return res.json();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${name} Movies & TV Shows — FMoviesz`,
    description: `Watch all ${name} movies and TV shows online free in HD on FMoviesz. Browse the complete filmography of ${name}.`,
    keywords: `${name} movies, watch ${name} online, ${name} filmography, ${name} full movies free`,
    alternates: { canonical: `https://fmoviesz.cyou/person/${slug}` },
  };
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const person = await searchPerson(name).catch(() => null);
  if (!person) notFound();

  const [credits, details] = await Promise.all([
    getPersonMovies(person.id).catch(() => ({ cast: [], crew: [] })),
    getPersonDetails(person.id).catch(() => ({})),
  ]);

  const allMovies = [
    ...(credits.cast || []),
    ...(credits.crew || []),
  ]
    .filter((m: any) => m.media_type === 'movie' && m.poster_path && m.vote_count > 5)
    .filter((m: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === m.id) === i)
    .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 30);

  const allTV = [
    ...(credits.cast || []),
    ...(credits.crew || []),
  ]
    .filter((m: any) => m.media_type === 'tv' && m.poster_path)
    .filter((m: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === m.id) === i)
    .slice(0, 12);

  const profileImg = person.profile_path
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-[#00acc1]">Home</a>
            <span>/</span>
            <span className="text-gray-300">{name}</span>
          </nav>

          {/* Person header */}
          <div className="flex gap-6 flex-wrap mb-8">
            {profileImg && (
              <img
                src={profileImg}
                alt={name}
                className="w-32 h-44 rounded-xl object-cover border border-[#30363d] shadow-xl flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-extrabold text-white mb-2">{name}</h1>
              {details.known_for_department && (
                <p className="text-[#00acc1] text-sm mb-2">{details.known_for_department}</p>
              )}
              {details.birthday && (
                <p className="text-gray-400 text-sm mb-1">Born: {details.birthday}</p>
              )}
              {details.place_of_birth && (
                <p className="text-gray-400 text-sm mb-3">{details.place_of_birth}</p>
              )}
              {details.biography && (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{details.biography}</p>
              )}
            </div>
          </div>

          {/* Movies */}
          {allMovies.length > 0 && (
            <MovieGrid
              heading={`${name} — Movies`}
              movies={allMovies.map((m: any) => ({ ...m, media_type: 'movie' }))}
            />
          )}

          {/* TV */}
          {allTV.length > 0 && (
            <div className="mt-8">
              <MovieGrid
                heading={`${name} — TV Shows`}
                movies={allTV.map((m: any) => ({ ...m, media_type: 'tv', title: m.name }))}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
