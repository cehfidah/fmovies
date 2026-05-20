'use client';
import { useEffect, useState, useRef } from 'react';

function fireAd() {
  const adUrl = process.env.NEXT_PUBLIC_POPUNDER_URL;
  if (!adUrl) return;
  try { window.open(adUrl, '_blank', 'noopener,noreferrer'); } catch { /* blocked */ }
}

/**
 * ExitIntent — fires ad + shows modal when cursor leaves viewport from the top
 * (user is about to close tab or click the back button).
 * Only triggers once per session, after the user has been on the page 10+ seconds.
 */
export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const firedRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    // Only arm after 10s (don't fire on accidental mouse-out on arrival)
    const arm = setTimeout(() => { readyRef.current = true; }, 10000);

    function onMouseLeave(e: MouseEvent) {
      if (!readyRef.current) return;
      if (firedRef.current) return;
      if (e.clientY > 10) return; // only top-edge exits
      firedRef.current = true;
      fireAd();
      setShow(true);
    }

    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      clearTimeout(arm);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
        {/* Red warning strip */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 flex items-center gap-2">
          <span className="text-white text-lg">⚠️</span>
          <span className="text-white font-bold text-sm">Wait! Your movie will stop playing</span>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            If you leave now your progress will be lost. Stay and finish watching <strong className="text-white">for free</strong> — no account needed.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShow(false)}
              className="w-full bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold py-2.5 rounded-xl transition text-sm"
            >
              ▶ Continue Watching
            </button>
            <button
              onClick={() => setShow(false)}
              className="w-full text-gray-500 hover:text-gray-300 text-xs py-2 transition"
            >
              Leave anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
