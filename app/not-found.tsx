import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '404 — Page Not Found | FMoviesz',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e] flex items-center justify-center">
        <div className="text-center px-4 py-20">
          <div className="text-[#00acc1] text-8xl font-black mb-4">404</div>
          <h1 className="text-white text-2xl font-bold mb-3">Page Not Found</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved. Try searching for the movie you want to watch.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/home" className="bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold px-6 py-3 rounded-xl text-sm transition">
              ← Back to Home
            </a>
            <a href="/fmovies-movie" className="bg-[#161b22] border border-[#30363d] hover:border-[#00acc1] text-white font-bold px-6 py-3 rounded-xl text-sm transition">
              Browse Movies
            </a>
            <a href="/top-imdb" className="bg-[#161b22] border border-[#30363d] hover:border-[#00acc1] text-white font-bold px-6 py-3 rounded-xl text-sm transition">
              Top IMDb
            </a>
          </div>
          <div className="mt-10 text-gray-600 text-xs">
            Looking for a specific movie? Use the search bar in the header above.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
