import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Fmovies — Watch Free HD Movies and TV Shows Online';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b0c0e 0%, #0d1117 60%, #00363d 100%)',
          fontFamily: 'sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: 'linear-gradient(135deg,#00acc1,#0097a7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: '28px solid transparent',
                borderBottom: '28px solid transparent',
                borderLeft: '44px solid white',
                marginLeft: 10,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              background: 'linear-gradient(135deg,#00acc1,#00cee7)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: -2,
            }}
          >
            FMovies
          </div>
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Watch Free HD Movies and TV Shows Online
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#8b949e',
            textAlign: 'center',
          }}
        >
          fmoviesz.cyou · No sign-up · No downloads
        </div>
      </div>
    ),
    { ...size }
  );
}
