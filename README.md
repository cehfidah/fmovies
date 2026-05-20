# FMoviesz — Next.js App

A full-featured movie streaming directory site built with **Next.js 14**, **Neon PostgreSQL**, and **TMDB API**, designed for deployment on **AWS Amplify**.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
- `DATABASE_URL` — from [console.neon.tech](https://console.neon.tech)
- `TMDB_API_KEY` — free key from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- `JWT_SECRET` — generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `ADMIN_USERNAME` + `ADMIN_PASSWORD` — your admin credentials
- `NEXT_PUBLIC_SITE_URL` — your domain (e.g. `https://fmoviesz.cyou`)

### 3. Initialize the database
After setting env vars, run this **once** to create tables and admin user:
```
GET https://your-domain.com/api/setup?secret=YOUR_JWT_SECRET
```
Or locally:
```
http://localhost:3000/api/setup?secret=YOUR_JWT_SECRET_VALUE
```

### 4. Run dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deployment on AWS Amplify

1. Push this repo to GitHub/GitLab/CodeCommit
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click **New App → Host Web App**
4. Connect your repository
5. Amplify will detect `amplify.yml` automatically
6. Add **Environment Variables** in the Amplify Console:
   - `DATABASE_URL`
   - `TMDB_API_KEY`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL`
7. Deploy!

> **Important:** In Amplify settings, set the **Framework** to `Next.js - SSR` for full server-side support.

---

## Project Structure

```
app/
├── page.tsx                  # / — SEO landing page (preserved from original)
├── home/page.tsx             # /home — Movie grid homepage
├── fmovies-movie/page.tsx    # /fmovies-movie — Movies listing
├── fmovies-series/page.tsx   # /fmovies-series — TV Series listing
├── top-imdb/page.tsx         # /top-imdb — Top rated
├── search/[query]/page.tsx   # /search/:query — Search results
├── filter/page.tsx           # /filter — Browse by genre/year
├── movie/[slug]/page.tsx     # /movie/:slug — Movie detail
├── tv/[slug]/page.tsx        # /tv/:slug — TV show detail
├── [slug]/page.tsx           # /:slug — Blog posts (guest posts)
├── admin/                    # Admin panel (protected)
│   ├── login/page.tsx
│   ├── page.tsx              # Dashboard
│   └── posts/                # Post management
└── api/
    ├── auth/login/           # Login endpoint
    ├── auth/logout/          # Logout endpoint
    ├── posts/                # Posts CRUD
    ├── search/               # Search API
    └── setup/                # First-run DB setup

components/
├── Header.tsx                # Nav with live search
├── Footer.tsx
├── MovieCard.tsx             # Movie/TV poster card
├── MovieGrid.tsx             # Responsive grid
├── PaginationBar.tsx
├── SearchSection.tsx         # Hero search bar
└── admin/
    ├── AdminShell.tsx        # Sidebar layout
    └── PostForm.tsx          # Rich post editor

lib/
├── db.ts                     # Neon DB helpers
├── auth.ts                   # JWT (jose)
└── tmdb.ts                   # TMDB API client
```

---

## Admin Panel

URL: `/admin` (redirects to `/admin/login` if not authenticated)

Features:
- **Dashboard** — post stats, quick actions
- **Posts list** — view all, edit, delete, toggle published
- **Post editor** — title, slug (auto-generated), SEO meta, HTML content with live preview, featured image
- **Published/Draft** toggle

---

## SEO Strategy

- `/` preserves the **exact article content** from the original `fmoviesz.cyou` index page
- All original URL patterns maintained: `/fmovies-movie`, `/fmovies-series`, `/top-imdb`, `/search/{q}`
- Auto-generated `sitemap.xml` includes all published posts
- `robots.txt` allows all pages except `/admin` and `/api`
- Full Open Graph + Twitter Card meta tags
- JSON-LD schema (WebSite + SearchAction)
- ISR (Incremental Static Regeneration) — pages revalidate every hour

---

## Guest Posting / Blog

Create posts at `/admin/posts/new`:
- Set a **custom slug** (the URL: `fmoviesz.cyou/your-slug`)
- Write content in **HTML** with live preview
- Add SEO meta description and keywords
- Toggle **Published** when ready

Published posts are automatically included in `sitemap.xml`.

---

## Neon DB Schema

```sql
-- Created automatically by /api/setup
CREATE TABLE posts (
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
);

CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
