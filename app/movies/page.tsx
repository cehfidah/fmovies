import { redirect } from 'next/navigation';

// Alias: /movies/ → /fmovies-movie (matches fmoviess.org URL pattern)
export default function MoviesRedirect() {
  redirect('/fmovies-movie');
}
