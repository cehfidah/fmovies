'use client';
import { useState } from 'react';

interface DownloadButtonProps {
  title: string;
}

export default function DownloadButton({ title }: DownloadButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  function handleClick() {
    if (status !== 'idle') return;
    setStatus('loading');

    // Fire the ad
    const adUrl = process.env.NEXT_PUBLIC_POPUNDER_URL;
    if (adUrl) {
      try { window.open(adUrl, '_blank', 'noopener,noreferrer'); } catch { /* blocked */ }
    }

    // Simulate "preparing download" then show unavailable message
    setTimeout(() => setStatus('done'), 3500);
  }

  if (status === 'loading') {
    return (
      <button
        disabled
        className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] text-gray-400 text-sm font-semibold px-4 py-2 rounded-lg cursor-not-allowed"
      >
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" />
        </svg>
        Preparing download…
      </button>
    );
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2 bg-[#161b22] border border-yellow-600/40 text-yellow-400 text-xs font-medium px-4 py-2 rounded-lg">
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Download unavailable — stream it free above
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-[#00acc1] text-gray-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 group"
    >
      <svg className="w-4 h-4 text-[#00acc1] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download {title}
    </button>
  );
}
