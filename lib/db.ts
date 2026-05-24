import { neon } from '@neondatabase/serverless';

let _db: ReturnType<typeof neon> | null = null;

function getDB(): ReturnType<typeof neon> {
  if (!_db) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is not set');
    _db = neon(process.env.DATABASE_URL);
  }
  return _db;
}

const sql = (strings: TemplateStringsArray, ...values: unknown[]) =>
  getDB()(strings, ...values);

export { sql };

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      slug VARCHAR(500) UNIQUE NOT NULL,
      content TEXT,
      meta_description VARCHAR(1000),
      meta_keywords VARCHAR(1000),
      featured_image VARCHAR(1000),
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Migrate: add new columns if they don't exist yet
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(100)`;
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT`;
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS author VARCHAR(200)`;
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, created_at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS slug_mappings (
      slug VARCHAR(200) PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,
      imdb_id VARCHAR(20),
      media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
      title VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS movie_comments (
      id SERIAL PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,
      user_id INTEGER REFERENCES site_users(id) ON DELETE SET NULL,
      guest_name VARCHAR(80),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_movie_comments_tmdb ON movie_comments(tmdb_id)
  `;
}

/** Upsert a slug mapping (used by seed route) */
export async function upsertSlugMapping(
  slug: string,
  tmdb_id: number,
  imdb_id: string,
  media_type: 'movie' | 'tv',
  title: string
) {
  await sql`
    INSERT INTO slug_mappings (slug, tmdb_id, imdb_id, media_type, title)
    VALUES (${slug}, ${tmdb_id}, ${imdb_id}, ${media_type}, ${title})
    ON CONFLICT (slug) DO UPDATE SET
      tmdb_id    = EXCLUDED.tmdb_id,
      imdb_id    = EXCLUDED.imdb_id,
      media_type = EXCLUDED.media_type,
      title      = EXCLUDED.title
  `;
}

export async function getPosts(publishedOnly = true): Promise<any[]> {
  if (publishedOnly) {
    const rows = await sql`SELECT * FROM posts WHERE published = true ORDER BY created_at DESC` as any[];
    return Array.isArray(rows) ? rows : [];
  }
  const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC` as any[];
  return Array.isArray(rows) ? rows : [];
}

export async function getPostsByCategory(category: string): Promise<any[]> {
  const rows = await sql`SELECT * FROM posts WHERE published = true AND category = ${category} ORDER BY created_at DESC` as any[];
  return Array.isArray(rows) ? rows : [];
}

export async function getPostBySlug(slug: string) {
  const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1` as any[];
  return rows[0] || null;
}

export async function getPostById(id: number) {
  const rows = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1` as any[];
  return rows[0] || null;
}

export async function createPost(data: {
  title: string;
  slug: string;
  content?: string;
  meta_description?: string;
  meta_keywords?: string;
  featured_image?: string;
  published?: boolean;
  category?: string;
  tags?: string;
  author?: string;
  ai_generated?: boolean;
}) {
  const rows = await sql`
    INSERT INTO posts (title, slug, content, meta_description, meta_keywords, featured_image, published, category, tags, author, ai_generated)
    VALUES (
      ${data.title}, ${data.slug}, ${data.content ?? null}, ${data.meta_description ?? null},
      ${data.meta_keywords ?? null}, ${data.featured_image ?? null}, ${data.published ?? false},
      ${data.category ?? null}, ${data.tags ?? null}, ${data.author ?? null}, ${data.ai_generated ?? false}
    )
    RETURNING *
  ` as any[];
  return rows[0];
}

export async function updatePost(
  id: number,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    meta_description?: string;
    meta_keywords?: string;
    featured_image?: string;
    published?: boolean;
    category?: string;
    tags?: string;
    author?: string;
  }
) {
  const rows = await sql`
    UPDATE posts SET
      title            = COALESCE(${data.title ?? null}, title),
      slug             = COALESCE(${data.slug ?? null}, slug),
      content          = COALESCE(${data.content ?? null}, content),
      meta_description = COALESCE(${data.meta_description ?? null}, meta_description),
      meta_keywords    = COALESCE(${data.meta_keywords ?? null}, meta_keywords),
      featured_image   = COALESCE(${data.featured_image ?? null}, featured_image),
      published        = COALESCE(${data.published ?? null}, published),
      category         = COALESCE(${data.category ?? null}, category),
      tags             = COALESCE(${data.tags ?? null}, tags),
      author           = COALESCE(${data.author ?? null}, author),
      updated_at       = NOW()
    WHERE id = ${id}
    RETURNING *
  ` as any[];
  return rows[0];
}

export async function deletePost(id: number) {
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

export async function getAdminByUsername(username: string) {
  const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} LIMIT 1` as any[];
  return rows[0] || null;
}

export async function createAdminUser(username: string, passwordHash: string) {
  const rows = await sql`
    INSERT INTO admin_users (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO NOTHING
    RETURNING *
  ` as any[];
  return rows[0];
}
