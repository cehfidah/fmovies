import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DMCA — FMoviesz',
  description: 'DMCA copyright takedown policy for FMoviesz.',
  robots: { index: true, follow: true },
};

export default function DmcaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-extrabold text-white mb-6">DMCA Policy</h1>
          <div className="prose prose-invert max-w-none text-gray-300 space-y-5 text-sm leading-relaxed">
            <p>
              FMoviesz (<strong>fmoviesz.cyou</strong>) respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (&ldquo;DMCA&rdquo;), we will respond expeditiously to claims of copyright infringement.
            </p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">No Files Hosted</h2>
            <p>
              FMoviesz is a search engine and index site. We do <strong>not</strong> host, upload, or store any video files on our servers. All content is linked from third-party external hosting services. We have no control over those third-party websites.
            </p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">How to Submit a Takedown Notice</h2>
            <p>If you are a copyright owner and believe that content linked from our site infringes your copyright, please send a written notice containing:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your full legal name and contact information (email, address, phone)</li>
              <li>Identification of the copyrighted work you claim has been infringed</li>
              <li>The URL(s) on our site that you claim to be infringing</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law</li>
              <li>A statement, under penalty of perjury, that the information in the notice is accurate and you are the copyright owner or are authorized to act on behalf of the copyright owner</li>
              <li>Your physical or electronic signature</li>
            </ul>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Send Notices To</h2>
            <p>
              Email: <a href="mailto:dmca@fmoviesz.cyou" className="text-[#00acc1] hover:underline">dmca@fmoviesz.cyou</a>
            </p>
            <p>
              We will process valid DMCA notices within <strong>3–5 business days</strong> and remove the relevant links from our index.
            </p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Counter-Notification</h2>
            <p>
              If you believe that your content was removed or disabled by mistake or misidentification, you may file a counter-notification with us by providing the information required under 17 U.S.C. § 512(g)(3).
            </p>

            <p className="text-gray-500 text-xs mt-10">Last updated: May 2026</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
