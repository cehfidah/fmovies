import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { getPostById, updatePost, deletePost } from '@/lib/db';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const post = await getPostById(id).catch(() => null);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const user = await getAuthUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const body = await req.json();
    const { title, slug, content, meta_description, meta_keywords, featured_image, published } = body;

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 });
    }

    const post = await updatePost(id, {
      title: typeof title === 'string' ? title.trim().slice(0, 500) : undefined,
      slug: typeof slug === 'string' ? slug.trim().slice(0, 500) : undefined,
      content: typeof content === 'string' ? content : undefined,
      meta_description: typeof meta_description === 'string' ? meta_description.slice(0, 1000) : undefined,
      meta_keywords: typeof meta_keywords === 'string' ? meta_keywords.slice(0, 1000) : undefined,
      featured_image: typeof featured_image === 'string' ? featured_image.slice(0, 1000) : undefined,
      published: typeof published === 'boolean' ? published : undefined,
    });

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (err: any) {
    if (err?.message?.includes('unique')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    console.error('[PUT /api/posts/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const user = await getAuthUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  await deletePost(id).catch(() => null);
  return NextResponse.json({ ok: true });
}
