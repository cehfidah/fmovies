import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserAuth from '@/components/UserAuth';

export const metadata: Metadata = {
  title: 'Sign Up — FMoviesz',
  description: 'Create a free FMoviesz account to post comments, save favourites, and more.',
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <a href="/home" className="inline-block text-2xl font-black bg-gradient-to-r from-[#00acc1] to-[#00cee7] bg-clip-text text-transparent">FMovies</a>
            <h1 className="text-white text-xl font-bold mt-3">Create your free account</h1>
            <p className="text-gray-400 text-sm mt-1">Post comments, report broken links, and more.</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <UserAuth />
          </div>
          <p className="text-center text-gray-500 text-xs mt-5">
            Already have an account?{' '}
            <a href="/login" className="text-[#00acc1] hover:underline">Sign in</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
