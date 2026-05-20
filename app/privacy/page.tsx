import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — FMoviesz',
  description: 'Privacy policy for FMoviesz — how we collect and use your data.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-extrabold text-white mb-6">Privacy Policy</h1>
          <div className="text-gray-300 space-y-5 text-sm leading-relaxed">

            <p>
              Welcome to FMoviesz (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). This Privacy Policy explains how we collect, use, and protect information when you visit <strong>fmoviesz.cyou</strong>.
            </p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Log data:</strong> Your IP address, browser type, pages visited, and timestamps — collected automatically by our server and third-party analytics.</li>
              <li><strong>Cookies:</strong> We use cookies to remember your preferences and for advertising purposes. You can disable cookies in your browser settings.</li>
              <li><strong>Account data:</strong> If you register, we store your email address and a hashed (encrypted) password. We never store plain-text passwords.</li>
              <li><strong>Comments:</strong> If you post a comment, your username and comment text are stored in our database.</li>
            </ul>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>To provide and improve our service</li>
              <li>To personalise your experience</li>
              <li>To display relevant advertising (via third-party ad networks)</li>
              <li>To respond to your inquiries and comments</li>
            </ul>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Third-Party Advertising</h2>
            <p>
              We work with third-party advertising partners who may use cookies, web beacons, and similar tracking technologies to serve ads. These third parties have their own privacy policies. We do not control the data they collect.
            </p>
            <p>
              You can opt out of personalised ads via the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-[#00acc1] hover:underline">Digital Advertising Alliance</a> or <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-[#00acc1] hover:underline">Your Online Choices</a> (EU).
            </p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Data Retention</h2>
            <p>We retain your personal data only as long as necessary to provide our service. You may request deletion of your account at any time by contacting us.</p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Children&rsquo;s Privacy</h2>
            <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>

            <h2 className="text-white text-xl font-bold mt-8 mb-3">Contact Us</h2>
            <p>
              For privacy-related questions, email us at: <a href="mailto:privacy@fmoviesz.cyou" className="text-[#00acc1] hover:underline">privacy@fmoviesz.cyou</a>
            </p>

            <p className="text-gray-500 text-xs mt-10">Last updated: May 2026</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
