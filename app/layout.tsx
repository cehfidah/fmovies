import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import StickyBanner from '@/components/StickyBanner';
import PushPrompt from '@/components/PushPrompt';
import ExitIntent from '@/components/ExitIntent';
import TabRefocusAd from '@/components/TabRefocusAd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  other: {
    monetag: 'f1b77867617202815f85391c13eb3593',
  },
  title: {
    default: 'Fmovies: Watch Free HD Movies and TV Shows Online',
    template: '%s | Fmovies',
  },
  description:
    'Fmovies is the top site for watching free movies online without the need for downloading. Stream free movies here.',
  keywords: [
    'Fmovies', 'FMoviesz', 'fmovies.to', 'fmoviess.org', 'fmovies free',
    'watch movies online free', 'free movies HD', 'free tv shows',
    'stream movies online', '123movies', 'gomovies', 'putlocker', 'soap2day',
    'hdtoday', 'movieyoda', 'freemovie', 'watch free movies 2025', 'watch free movies 2026',
    'full movies online free', 'movies without ads', 'no sign up movies',
  ],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  authors: [{ name: 'Fmovies' }],
  openGraph: {
    type: 'website',
    siteName: 'Fmovies',
    title: 'Fmovies: Watch Free HD Movies and TV Shows Online',
    description:
      'Fmovies is the top site for watching free movies online without the need for downloading. Stream free movies here.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fmovies: Watch Free HD Movies and TV Shows Online',
    description:
      'Fmovies is the top site for watching free movies online without the need for downloading. Stream free movies here.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: {
    // Add your Google/Bing verification codes here
    // google: 'xxx',
    // other: { 'msvalidate.01': 'xxx' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <meta name="theme-color" content="#00acc1" />
        <meta name="revisit-after" content="1 days" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
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
              name: 'Fmovies: Watch Free HD Movies and TV Shows Online',
              description:
                'Fmovies is the top site for watching free movies online without the need for downloading. Stream free movies here.',
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search/{search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
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
        {/* Monetag Push Notifications */}
        {/* Monetag Multitag (popunder + native + more) */}
        <Script src="https://quge5.com/88/tag.min.js" data-zone="241423" strategy="afterInteractive" data-cfasync="false" />
      </body>
    </html>
  );
}
