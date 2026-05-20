'use client';
import { useState, useRef, useEffect } from 'react';

const COUNTDOWN_SECS = 5;

function fireAd() {
  const adUrl = process.env.NEXT_PUBLIC_POPUNDER_URL;
  if (!adUrl) return;
  try { window.open(adUrl, '_blank', 'noopener,noreferrer'); } catch { /* blocked */ }
}

interface MoviePlayerProps {
  embedId: string;
  posterUrl?: string;
  title?: string;
  type?: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

const SERVERS = [
  { label: 'Server 1', key: 'vidsrcicu' },
  { label: 'Server 2', key: 'vidsrcpro' },
  { label: 'Server 3', key: 'vidsrcme' },
];

export default function MoviePlayer({
  embedId,
  posterUrl,
  title = 'Movie',
  type = 'movie',
  season = 1,
  episode = 1,
}: MoviePlayerProps) {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<'gate' | 'countdown' | 'playing'>('gate');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [is4K, setIs4K] = useState(false);
  const [fourKLoading, setFourKLoading] = useState(false);
  const adFiredRef = useRef(false);
  const switchAdRef = useRef(0);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function src(key: string) {
    if (type === 'tv') {
      return `https://vid.hostapi.top/${key}.php?id=${embedId}&s=${season}&e=${episode}`;
    }
    return `https://vid.hostapi.top/${key}.php?id=${embedId}`;
  }

  // Fire ad on play, start countdown
  function handlePlay() {
    if (!adFiredRef.current) {
      adFiredRef.current = true;
      fireAd();
    }
    setCountdown(COUNTDOWN_SECS);
    setPhase('countdown');
  }

  // Fire ad on every other server switch
  function handleServerSwitch(i: number) {
    if (i === active) return;
    setActive(i);
    switchAdRef.current += 1;
    if (switchAdRef.current % 2 === 1) fireAd();
  }

  // Countdown tick
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Show "Skip Intro" button 8s after video starts playing
  useEffect(() => {
    if (phase !== 'playing') return;
    skipTimerRef.current = setTimeout(() => setShowSkipIntro(true), 8000);
    return () => { if (skipTimerRef.current) clearTimeout(skipTimerRef.current); };
  }, [phase]);

  function handleSkipIntro() {
    fireAd();
    setShowSkipIntro(false);
  }

  function handle4K() {
    if (fourKLoading || is4K) return;
    fireAd();
    setFourKLoading(true);
    // After 2s "upgrading" show 4K badge, reload iframe
    setTimeout(() => { setIs4K(true); setFourKLoading(false); setActive(a => a); }, 2000);
  }

  // ── Ad-gate ──
  if (phase === 'gate') {
    return (
      <div
        className="relative cursor-pointer group select-none"
        style={{ paddingBottom: '56.25%', background: '#000' }}
        onClick={handlePlay}
      >
        {posterUrl && (
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />

        {/* Premium play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          {/* Outer glow ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00acc1]/30 scale-150 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#00acc1] to-[#0097a7] group-hover:from-[#00cee7] group-hover:to-[#00acc1] flex items-center justify-center shadow-2xl shadow-[#00acc1]/50 transition-all duration-300 transform group-hover:scale-110 border-4 border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 fill-white ml-1.5 drop-shadow" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-extrabold text-xl drop-shadow-lg tracking-wide">Watch Now — Free HD</p>
            <p className="text-[#00acc1] text-sm mt-1 font-medium drop-shadow">3 Servers · 4K · No Signup</p>
          </div>
          {/* Progress bar */}
          <div className="w-56 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#00acc1] to-[#00cee7] h-full rounded-full w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Countdown pre-roll ──
  if (phase === 'countdown') {
    const progress = ((COUNTDOWN_SECS - countdown) / COUNTDOWN_SECS) * 100;
    return (
      <div className="relative select-none" style={{ paddingBottom: '56.25%', background: '#000' }}>
        {posterUrl && (
          <img src={posterUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {/* Circular countdown ring */}
          <div className="relative w-24 h-24">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill="none" stroke="#1c2128" strokeWidth="7" />
              <circle cx="48" cy="48" r="44" fill="none" stroke="#00acc1" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-extrabold text-3xl">{countdown}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">Loading Video…</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we prepare your stream</p>
          </div>
          <div className="w-64 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#00acc1] to-[#00cee7] h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs">Your video will start in {countdown} second{countdown !== 1 ? 's' : ''}</p>
        </div>
      </div>
    );
  }

  // ── Player ──
  return (
    <div>
      <div className="flex border-b border-[#30363d]">
        {SERVERS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => handleServerSwitch(i)}
            className={`px-4 py-2.5 text-sm font-medium border-r border-[#30363d] transition ${
              active === i
                ? 'bg-[#00acc1] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1c2128]'
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="flex-1 flex items-center gap-2 px-4">
          <span className="text-xs text-gray-500">Try another server if one fails</span>
          {/* 4K upgrade button */}
          {!is4K ? (
            <button
              onClick={handle4K}
              disabled={fourKLoading}
              className="ml-auto flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition disabled:opacity-60"
            >
              {fourKLoading ? (
                <><svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" /></svg> Upgrading…</>
              ) : (
                <>⬆️ Upgrade to 4K</>
              )}
            </button>
          ) : (
            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/15 border border-yellow-500/40 text-yellow-300">✓ 4K Active</span>
          )}
        </div>
      </div>
      {/* iframe + Skip Intro overlay */}
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          key={`${SERVERS[active].key}-${season}-${episode}-${is4K}`}
          src={src(SERVERS[active].key)}
          className="absolute inset-0 w-full h-full border-none"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
        {/* Skip Intro — bottom right, just like Netflix */}
        {showSkipIntro && (
          <button
            onClick={handleSkipIntro}
            className="absolute bottom-10 right-4 flex items-center gap-2 bg-black/70 hover:bg-black/90 border border-white/30 hover:border-white/60 text-white text-sm font-semibold px-4 py-2 rounded transition backdrop-blur-sm"
          >
            Skip Intro
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

