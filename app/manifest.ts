import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fmovies — Watch Free HD Movies and TV Shows Online',
    short_name: 'Fmovies',
    description:
      'Fmovies is the top site for watching free movies online without the need for downloading.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0c0e',
    theme_color: '#00acc1',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
