import Header from '@/components/Header';

export default function MovieLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -800px 0; }
          100% { background-position: 800px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #1c2128 25%, #252d38 50%, #1c2128 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 6px;
        }
      `}</style>

      <Header />

      {/* Backdrop */}
      <div className="sk" style={{ height: '260px', borderRadius: 0 }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        {/* Breadcrumb */}
        <div className="sk" style={{ height: '14px', width: '240px', marginBottom: '1.5rem' }} />

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          {/* Poster */}
          <div className="sk" style={{ width: '180px', minWidth: '140px', aspectRatio: '2/3', borderRadius: '10px', flexShrink: 0 }} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div className="sk" style={{ height: '38px', width: '65%', marginBottom: '0.75rem' }} />
            <div className="sk" style={{ height: '18px', width: '40%', marginBottom: '1.25rem' }} />
            {/* Stars */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="sk" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
              ))}
              <div className="sk" style={{ height: '22px', width: '80px', borderRadius: '20px', marginLeft: '8px' }} />
            </div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[60, 80, 70].map((w, i) => (
                <div key={i} className="sk" style={{ height: '28px', width: `${w}px`, borderRadius: '20px' }} />
              ))}
            </div>
            {/* Meta rows */}
            {[55, 70, 45, 60].map((w, i) => (
              <div key={i} className="sk" style={{ height: '15px', width: `${w}%`, marginBottom: '0.65rem' }} />
            ))}
            {/* Overview */}
            <div className="sk" style={{ height: '14px', width: '95%', marginBottom: '0.4rem', marginTop: '1rem' }} />
            <div className="sk" style={{ height: '14px', width: '88%', marginBottom: '0.4rem' }} />
            <div className="sk" style={{ height: '14px', width: '72%', marginBottom: '1.5rem' }} />
            {/* Share buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[100, 100, 100].map((w, i) => (
                <div key={i} className="sk" style={{ height: '36px', width: `${w}px`, borderRadius: '8px' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="sk" style={{ width: '100%', aspectRatio: '16/9', maxHeight: '500px', borderRadius: '12px', marginBottom: '2rem' }} />

        {/* Tags row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {[80, 100, 70, 90, 60, 110].map((w, i) => (
            <div key={i} className="sk" style={{ height: '30px', width: `${w}px`, borderRadius: '20px' }} />
          ))}
        </div>

        {/* Similar heading */}
        <div className="sk" style={{ height: '24px', width: '180px', marginBottom: '1rem' }} />
        {/* Similar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sk" style={{ aspectRatio: '2/3', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    </>
  );
}
