import { redirect } from 'next/navigation';

// Alias: /tv-series/ → /fmovies-series (matches fmoviess.org URL pattern)
export default function TVSeriesRedirect() {
  redirect('/fmovies-series');
}
