import type { Metadata } from 'next';
import './globals.css';
import StickyBanner from '@/components/StickyBanner';
import PushPrompt from '@/components/PushPrompt';
import ExitIntent from '@/components/ExitIntent';
import TabRefocusAd from '@/components/TabRefocusAd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';
const SITE_NAME = 'Fmovies';
const DEFAULT_TITLE = 'Fmovies: Watch Free HD Movies and TV Shows Online';
const DEFAULT_DESC =
  'Fmovies is the top site to watch free HD movies and TV shows online — no sign-up, no downloads. Stream the latest releases in high quality.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  category: 'entertainment',
  other: {
    monetag: 'f1b77867617202815f85391c13eb3593',
  },
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Fmovies',
  },
  description: DEFAULT_DESC,
  keywords: [
    'Fmovies', 'FMoviesz', 'fmovies.to', 'fmoviess.org', 'fmovies free',
    'watch movies online free', 'free movies HD', 'free tv shows',
    'stream movies online', '123movies', 'gomovies', 'putlocker', 'soap2day',
    'hdtoday', 'movieyoda', 'freemovie', 'watch free movies 2025', 'watch free movies 2026',
    'full movies online free', 'movies without ads', 'no sign up movies',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fmovies',
    creator: '@fmovies',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    // google: 'xxx', // add Google Search Console verification token
    // other: { 'msvalidate.01': 'xxx' }, // Bing Webmaster
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <meta name="theme-color" content="#00acc1" />
        <meta name="revisit-after" content="1 days" />
        {/* Explicit favicon links — belt-and-suspenders for crawlers that miss Next.js auto-generated tags */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
        {/* Unicons icon font */}
        <link
          rel="stylesheet"
          href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: SITE_URL,
              name: DEFAULT_TITLE,
              description: DEFAULT_DESC,
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search/{search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/icon.svg`,
              sameAs: [],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <StickyBanner />
        <PushPrompt />
        <ExitIntent />
        <TabRefocusAd />
      </body>
    </html>
  );
}
