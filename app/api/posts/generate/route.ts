import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'FMoviesz';

const BLOG_CATEGORIES = [
  'Movie Review',
  'TV Series Review',
  'Upcoming Movies',
  'Streaming News',
  'Top Lists',
  'Actor/Director Spotlight',
];

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured in .env.local' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const {
      movieTitle,
      category = 'Movie Review',
      year = new Date().getFullYear().toString(),
      extraContext = '',
    } = body;

    if (!movieTitle || typeof movieTitle !== 'string') {
      return NextResponse.json({ error: 'movieTitle is required' }, { status: 400 });
    }

    const cleanTitle = movieTitle.trim().slice(0, 200);
    const cleanCategory = BLOG_CATEGORIES.includes(category) ? category : 'Movie Review';
    const currentYear = new Date().getFullYear();

    // Fetch movie poster from TMDB
    let featuredImage = '';
    const tmdbKey = process.env.TMDB_API_KEY;
    if (tmdbKey) {
      try {
        const isTV = cleanCategory === 'TV Series Review';
        const searchType = isTV ? 'tv' : 'movie';
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/${searchType}?query=${encodeURIComponent(cleanTitle)}&language=en-US&page=1`,
          { headers: { Authorization: `Bearer ${tmdbKey}` } }
        );
        const tmdbData = await tmdbRes.json();
        const firstResult = tmdbData?.results?.[0];
        if (firstResult?.poster_path) {
          featuredImage = `https://image.tmdb.org/t/p/w780${firstResult.poster_path}`;
        } else if (firstResult?.backdrop_path) {
          featuredImage = `https://image.tmdb.org/t/p/w1280${firstResult.backdrop_path}`;
        }
      } catch {
        // TMDB lookup failed — continue without image
      }
    }

    const systemPrompt = `You are an expert SEO content writer for ${SITE_NAME} (${SITE}), a free movie streaming website.
Write engaging, SEO-optimised blog posts about movies and TV shows following strict formatting rules.
Always output a valid JSON object — no markdown fences, no extra text.`;

    const userPrompt = `Write a complete, publish-ready blog post for the ${cleanCategory} category.

Movie/Show: "${cleanTitle}"
Year: ${year}
Extra context: ${extraContext || 'None'}

=== OUTPUT FORMAT ===
Return ONLY valid JSON with exactly these keys:
{
  "title": "...",
  "slug": "...",
  "meta_description": "...",
  "tags": "...",
  "author": "FMoviesz Editorial",
  "featured_image_query": "...",
  "content": "..."
}

=== RULES ===

TITLE: 50-60 chars, include exact movie name and current year ${currentYear}, no em-dashes.

SLUG: lowercase, hyphens only, derived from title (e.g. "watch-${cleanTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)}-${currentYear}-online-free").

META_DESCRIPTION: 155-160 characters exactly. Include movie name. No em-dashes. Action-oriented.

TAGS: comma-separated string, exactly 5 tags. First = exact primary keyword. Mix: 1 broad, 1 site-specific ("watch free online"), 1 year-specific, 1 how-to variant. All lowercase.

FEATURED_IMAGE_QUERY: A short descriptive search query for finding a relevant movie poster/still image (e.g. "${cleanTitle} movie poster").

CONTENT: Full article body in HTML (NOT markdown). Follow ALL rules below:
- 1200-1500 words total
- Use <h2> every ~200-250 words
- Use <h3> for sub-points inside <h2> sections
- Include exact movie/show name in first 100 words
- At least one <h2> contains a keyword variant
- Include exactly ONE internal link: <a href="/fmovies-movie">watch free movies online on FMoviesz</a> (or /fmovies-series for TV)
- Include a <div class="cta-box"> with a call-to-action before the FAQ, mentioning ${SITE_NAME} by name
- End with a FAQ section using this exact HTML pattern:
  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-item">
      <h3>Question here?</h3>
      <p>Answer here (1-3 sentences).</p>
    </div>
  </div>
- Include 3-5 FAQ items with real "people also ask" style questions about the movie
- Tone: helpful, conversational, second person ("you", "your")
- Short sentences (15-20 words average)
- NEVER use em-dashes (—), use commas or periods instead
- No keyword stuffing, no fabricated statistics`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[generate] OpenAI error:', errText);
      return NextResponse.json({ error: 'OpenAI API error', detail: errText.slice(0, 300) }, { status: 502 });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '';

    // Extract JSON from response (strip any accidental markdown fences)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw: rawContent.slice(0, 500) }, { status: 502 });
    }

    let generated: Record<string, string>;
    try {
      generated = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI JSON', raw: rawContent.slice(0, 500) }, { status: 502 });
    }

    return NextResponse.json({
      title: generated.title || '',
      slug: (generated.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 200),
      meta_description: generated.meta_description || '',
      meta_keywords: generated.tags || '',
      tags: generated.tags || '',
      author: generated.author || 'FMoviesz Editorial',
      featured_image: featuredImage,
      content: generated.content || '',
      category: cleanCategory,
    });
  } catch (err) {
    console.error('[generate]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
