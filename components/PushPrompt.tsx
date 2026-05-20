'use client';
import { useEffect, useState } from 'react';

/**
 * PushPrompt — Asks user for browser push notification permission.
 * Push subscribers earn $0.01–$0.05 each via Monetag / PropellerAds.
 * Shows a custom modal 12s after page load (feels natural, not intrusive).
 * On "Allow", calls the native Notification.requestPermission() — required by browsers.
 * You can then register a service worker with your ad network's push SDK.
 */
export default function PushPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already decided, or if browser doesn't support it
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (sessionStorage.getItem('push_dismissed')) return;

    const t = setTimeout(() => setShow(true), 12000);
    return () => clearTimeout(t);
  }, []);

  function handleAllow() {
    setShow(false);
    Notification.requestPermission().catch(() => {/* permission denied */});
    // TODO: After permission granted, register your push network service worker here
    // e.g. navigator.serviceWorker.register('/push-sw.js') for Monetag/PropellerAds
  }

  function handleDismiss() {
    setShow(false);
    sessionStorage.setItem('push_dismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] max-w-sm w-full" style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.7))' }}>
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#00acc1]/20 to-transparent px-5 py-4 flex items-start gap-3">
          {/* Bell icon */}
          <div className="w-10 h-10 rounded-full bg-[#00acc1]/15 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-[#00acc1]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Never miss new releases!</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
              Get notified when new movies &amp; episodes are available. Free, no spam.
            </p>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4 pt-1">
          <button
            onClick={handleAllow}
            className="flex-1 bg-[#00acc1] hover:bg-[#0097a7] text-white text-sm font-bold py-2 rounded-lg transition"
          >
            🔔 Allow
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-[#1c2128] hover:bg-[#2d333b] text-gray-400 hover:text-white text-sm font-medium py-2 rounded-lg transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
