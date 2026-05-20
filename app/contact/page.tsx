import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact Us — FMoviesz',
  description: 'Contact the FMoviesz team for DMCA notices, broken links, suggestions, or general inquiries.',
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-[#00acc1]">Home</a>
            <span>/</span>
            <span className="text-gray-300">Contact</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-white mb-2">Contact Us</h1>
          <p className="text-gray-400 text-sm mb-10">
            Have a question, found a broken link, or want to submit a DMCA notice? Use the form below or email us directly.
          </p>

          {/* Quick contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <a href="mailto:dmca@fmoviesz.cyou" className="bg-[#161b22] border border-[#30363d] hover:border-[#00acc1] rounded-xl p-5 transition group">
              <div className="text-2xl mb-2">⚖️</div>
              <h3 className="text-white font-bold text-sm mb-1">DMCA / Copyright</h3>
              <p className="text-gray-400 text-xs">dmca@fmoviesz.cyou</p>
            </a>
            <a href="mailto:support@fmoviesz.cyou" className="bg-[#161b22] border border-[#30363d] hover:border-[#00acc1] rounded-xl p-5 transition group">
              <div className="text-2xl mb-2">🛠️</div>
              <h3 className="text-white font-bold text-sm mb-1">Support / Bugs</h3>
              <p className="text-gray-400 text-xs">support@fmoviesz.cyou</p>
            </a>
          </div>

          {/* Contact form (client-side mailto fallback) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-white font-bold mb-5 text-lg">Send a Message</h2>
            <ContactForm />
          </div>

          <p className="text-gray-500 text-xs text-center mt-8">
            We aim to respond within 2–3 business days.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Client component for the form
function ContactForm() {
  return (
    <form
      action="mailto:support@fmoviesz.cyou"
      method="get"
      encType="text/plain"
      className="space-y-4"
    >
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Your Name</label>
        <input
          name="name"
          type="text"
          placeholder="John Doe"
          className="w-full bg-[#0b0c0e] border border-[#30363d] focus:border-[#00acc1] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition placeholder-gray-600"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full bg-[#0b0c0e] border border-[#30363d] focus:border-[#00acc1] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition placeholder-gray-600"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Subject</label>
        <select
          name="subject"
          className="w-full bg-[#0b0c0e] border border-[#30363d] focus:border-[#00acc1] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
        >
          <option value="">Select a subject…</option>
          <option>DMCA / Copyright Removal</option>
          <option>Broken Video Link</option>
          <option>Wrong Movie / Info Error</option>
          <option>Feature Request</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Message</label>
        <textarea
          name="body"
          rows={5}
          placeholder="Describe your issue or request…"
          className="w-full bg-[#0b0c0e] border border-[#30363d] focus:border-[#00acc1] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition placeholder-gray-600 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-[#00acc1]/20"
      >
        Send Message
      </button>
    </form>
  );
}
