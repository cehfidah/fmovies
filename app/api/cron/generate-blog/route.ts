import { NextRequest, NextResponse } from 'next/server';
import { createPost, getPostBySlug } from '@/lib/db';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'FMoviesz';
const TMDB_KEY = process.env.TMDB_API_KEY;

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 120);
}

/** Fetch upcoming + now-playing movies from TMDB */
async function fetchCandidateMovies(): Promise<{ title: string; year: string; overview: string; poster: string | null; isTV: boolean }[]> {
  if (!TMDB_KEY) return [];
  const base = 'https://api.themoviedb.org/3';
  const headers = { Authorization: `Bearer ${TMDB_KEY}` };

  const [upcoming, nowPlaying, airingTV] = await Promise.allSettled([
    fetch(`${base}/movie/upcoming?language=en-US&page=1`, { headers }).then(r => r.json()),
    fetch(`${base}/movie/now_playing?language=en-US&page=1`, { headers }).then(r => r.json()),
    fetch(`${base}/tv/on_the_air?language=en-US&page=1`, { headers }).then(r => r.json()),
  ]);

  const movies: { title: string; year: string; overview: string; poster: string | null; isTV: boolean }[] = [];

  const addMovies = (result: PromiseSettledResult<any>, isTV: boolean) => {
    if (result.status === 'fulfilled') {
      for (const item of (result.value?.results || []).slice(0, 10)) {
        const title = item.title || item.name || '';
        const date = item.release_date || item.first_air_date || '';
        if (title) {
          movies.push({ title, year: date.slice(0, 4), overview: item.overview || '', poster: item.poster_path || null, isTV });
        }
      }
    }
  };

  addMovies(upcoming, false);
  addMovies(nowPlaying, false);
  addMovies(airingTV, true);

  return movies;
}

/** Generate a blog post for one movie using OpenAI */
async function generatePost(movie: { title: string; year: string; overview: string; poster: string | null; isTV: boolean }, apiKey: string): Promise<Record<string, string> | null> {
  const category = movie.isTV ? 'TV Series Review' : 'Movie Review';
  const currentYear = new Date().getFullYear();
  const systemPrompt = `You are an expert SEO content writer for ${SITE_NAME} (${SITE}), a free movie streaming website. Output only valid JSON, no markdown fences.`;

  const userPrompt = `Write a complete SEO blog post for:
Title: "${movie.title}"
Type: ${movie.isTV ? 'TV Series' : 'Movie'}
Year: ${movie.year || currentYear}
Synopsis: ${movie.overview.slice(0, 300) || 'N/A'}

Return ONLY JSON:
{
  "title": "50-60 char SEO title including movie name and year",
  "slug": "url-slug-lowercase-hyphens-only",
  "meta_description": "155-160 char description, no em-dashes",
  "tags": "5 comma-separated lowercase tags",
  "content": "full HTML body 1200-1500 words with <h2>, <h3>, internal link to /${movie.isTV ? 'fmovies-series' : 'fmovies-movie'}, CTA mentioning ${SITE_NAME}, and FAQ section using <div class='faq-section'><h2>FAQ</h2><div class='faq-item'><h3>Q?</h3><p>A.</p></div></div>"
}

Rules: no em-dashes anywhere, helpful conversational tone, second person, 1-2% keyword density.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 3500,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

/**
 * GET /api/cron/generate-blog
 * Called daily by a cron job (Vercel cron or external scheduler).
 * Generates one blog post per run for a new/upcoming movie not already in DB.
 * Protect with CRON_SECRET header.
 */
export async function GET(req: NextRequest) {
  // Require cron secret to prevent abuse
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.JWT_SECRET;
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 });
  }

  try {
    const candidates = await fetchCandidateMovies();
    if (candidates.length === 0) {
      return NextResponse.json({ ok: false, message: 'No candidate movies found from TMDB' });
    }

    // Try each candidate until we find one without an existing post
    let generated = null;
    let chosenMovie = null;

    for (const movie of candidates) {
      const candidateSlug = toSlug(`watch ${movie.title} ${movie.year || ''} online free`);
      const existing = await getPostBySlug(candidateSlug).catch(() => null);
      if (existing) continue;

      // Also check the basic slug
      const basicSlug = toSlug(movie.title);
      const existing2 = await getPostBySlug(basicSlug).catch(() => null);
      if (existing2) continue;

      generated = await generatePost(movie, apiKey);
      if (generated) { chosenMovie = movie; break; }
    }

    if (!generated || !chosenMovie) {
      return NextResponse.json({ ok: false, message: 'All candidate movies already have posts or AI generation failed' });
    }

    const slug = (generated.slug || toSlug(generated.title || chosenMovie.title))
      .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 200);

    // Check slug uniqueness one more time
    const existingSlug = await getPostBySlug(slug).catch(() => null);
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const post = await createPost({
      title: (generated.title || chosenMovie.title).slice(0, 500),
      slug: finalSlug,
      content: generated.content || '',
      meta_description: (generated.meta_description || '').slice(0, 300),
      meta_keywords: (generated.tags || '').slice(0, 500),
      featured_image: chosenMovie.poster ? `https://image.tmdb.org/t/p/w780${chosenMovie.poster}` : undefined,
      published: true,
      category: chosenMovie.isTV ? 'TV Series Review' : 'Movie Review',
      tags: (generated.tags || '').slice(0, 500),
      author: 'FMoviesz Editorial',
      ai_generated: true,
    });

    return NextResponse.json({ ok: true, post: { id: post.id, title: post.title, slug: post.slug } });
  } catch (err) {
    console.error('[cron/generate-blog]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
