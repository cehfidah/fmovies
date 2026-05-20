import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — FMoviesz',
  description: 'Find answers to common questions about FMoviesz — how to watch movies, HD quality, safe to use, and more.',
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    q: 'Is FMoviesz free to use?',
    a: 'Yes. FMoviesz is completely free. You do not need to register, subscribe, or pay anything to watch movies and TV shows.',
  },
  {
    q: 'Do I need to create an account to watch?',
    a: 'No account is required to stream content. However, creating a free account lets you post comments and save your watch history.',
  },
  {
    q: 'Is FMoviesz safe?',
    a: 'We do not host any video files on our servers. All content is embedded from third-party sources. We recommend using an ad blocker (such as uBlock Origin) for the safest experience.',
  },
  {
    q: 'What video quality is available?',
    a: 'Most movies and TV shows are available in HD (720p / 1080p). Some newer releases may be available in 4K depending on the source server.',
  },
  {
    q: 'Why is the video not playing?',
    a: 'Try switching to a different server using the server tabs above the player. If the problem persists, try disabling your VPN or browser extensions, or try a different browser.',
  },
  {
    q: 'Can I download movies from FMoviesz?',
    a: 'FMoviesz is a streaming site and does not provide official downloads. The "Download" button links to a resource page where you may find download options.',
  },
  {
    q: 'How often is new content added?',
    a: 'New movies and TV episodes are added as soon as they become available online, usually within hours of release.',
  },
  {
    q: 'Why do I see pop-up ads?',
    a: 'Pop-up ads help us keep the site free for everyone. We recommend using an ad blocker if the ads are disruptive. Clicking the play button on a movie may open an ad in a new tab — this is expected behaviour.',
  },
  {
    q: 'The movie I want is not here. What do I do?',
    a: 'Use the search bar at the top of the page. If you still cannot find it, the movie may not be available on our source servers yet. Check back later or browse similar titles.',
  },
  {
    q: 'How do I report a broken link or wrong video?',
    a: 'You can report issues via the Contact page. Please include the movie/show title and the nature of the problem.',
  },
  {
    q: 'What devices can I use to watch?',
    a: 'FMoviesz works on any device with a modern web browser — desktop, laptop, tablet, and smartphone. No app download is required.',
  },
  {
    q: 'Do you have subtitles?',
    a: 'Subtitles depend on the embedded video server. Some servers include built-in subtitle options. Look for a CC or subtitle icon in the player controls.',
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-[#00acc1]">Home</a>
            <span>/</span>
            <span className="text-gray-300">FAQ</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-sm mb-10">Everything you need to know about FMoviesz.</p>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none text-white font-semibold text-sm hover:bg-[#1c2128] transition">
                  <span>{faq.q}</span>
                  <span className="text-[#00acc1] text-xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 pt-1 text-gray-300 text-sm leading-relaxed border-t border-[#30363d]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center">
            <p className="text-gray-300 text-sm mb-3">Still have questions? We&rsquo;re happy to help.</p>
            <a href="/contact" className="inline-block bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
