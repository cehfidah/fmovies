'use client';
import { useEffect, useState } from 'react';

/**
 * StickyBanner — A persistent bottom ad bar.
 * Drop your Monetag / direct advertiser banner code inside the inner div.
 * Replace the placeholder <ins> tag with your actual ad tag.
 */
export default function StickyBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Delay showing banner by 4s so it doesn't annoy on arrival
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(11,12,14,0.97)', borderTop: '1px solid #30363d', minHeight: '70px', padding: '0 1rem' }}
    >
      {/* ── Replace this div with your actual ad tag (Monetag, direct banner, etc.) ── */}
      <div
        className="flex items-center gap-3 text-gray-400 text-xs"
        style={{ maxWidth: '728px', width: '100%', minHeight: '60px', justifyContent: 'center' }}
      >
        {/* Example: Monetag banner slot — paste your <script> or <ins> tag here */}
        <span className="opacity-40 select-none">Advertisement</span>
      </div>

      {/* Close button */}
      <button
        onClick={() => { setVisible(false); setDismissed(true); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[#30363d] hover:bg-[#444c56] text-gray-400 hover:text-white text-xs transition"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
