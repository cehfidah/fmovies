'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search/${encodeURIComponent(query.trim())}`);
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="search-form">
        <a href="/filter" className="filter-btn" style={{ textDecoration: 'none' }}>
          <i className="uil uil-filter" /> Filter
        </a>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies and series"
          aria-label="Search movies and series"
          autoComplete="off"
        />
        <button type="submit" aria-label="Search">
          <i className="uil uil-search" />
        </button>
      </form>
    </div>
  );
}
