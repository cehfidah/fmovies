'use client';
import { useEffect } from 'react';

/**
 * Fires a pop-under ad on the very first user click on the page.
 * Replace NEXT_PUBLIC_POPUNDER_URL in .env.local with your ad network smartlink.
 */
export default function PopunderOnce() {
  useEffect(() => {
    const adUrl = process.env.NEXT_PUBLIC_POPUNDER_URL;
    if (!adUrl) return;

    function handleFirstClick() {
      window.open(adUrl, '_blank', 'noopener');
    }

    document.addEventListener('click', handleFirstClick, { once: true });
    return () => document.removeEventListener('click', handleFirstClick);
  }, []);

  return null;
}
