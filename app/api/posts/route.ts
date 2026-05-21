import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { getPosts, createPost } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  const posts = await getPosts(!user).catch(() => []);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, slug, content, meta_description, meta_keywords, featured_image, published, category, tags, author } = body;

    if (!title || typeof title !== 'string' || !slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 });
    }

    const post = await createPost({
      title: title.trim().slice(0, 500),
      slug: slug.trim().slice(0, 500),
      content: typeof content === 'string' ? content : undefined,
      meta_description: typeof meta_description === 'string' ? meta_description.slice(0, 1000) : undefined,
      meta_keywords: typeof meta_keywords === 'string' ? meta_keywords.slice(0, 1000) : undefined,
      featured_image: typeof featured_image === 'string' ? featured_image.slice(0, 1000) : undefined,
      published: !!published,
      category: typeof category === 'string' ? category.slice(0, 100) : undefined,
      tags: typeof tags === 'string' ? tags.slice(0, 500) : undefined,
      author: typeof author === 'string' ? author.slice(0, 200) : undefined,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes('unique')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    console.error('[POST /api/posts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
