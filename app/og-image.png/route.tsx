import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          backgroundColor: '#ffffff',
          fontFamily: 'serif',
        }}
      >
        {/* Top decorative line */}
        <div
          style={{
            display: 'flex',
            width: '100px',
            height: '3px',
            backgroundColor: '#000000',
            marginBottom: '40px',
          }}
        />

        {/* Business name */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 700,
            color: '#000000',
            marginBottom: '16px',
            letterSpacing: '-1px',
          }}
        >
          The Porch Coffee Bar
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: '#666666',
            marginBottom: '40px',
          }}
        >
          Premium Mobile Coffee Cart for Events
        </div>

        {/* Services */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '20px',
            color: '#999999',
          }}
        >
          <span>Weddings</span>
          <span style={{ color: '#cccccc' }}>|</span>
          <span>Parties</span>
          <span style={{ color: '#cccccc' }}>|</span>
          <span>Corporate Events</span>
          <span style={{ color: '#cccccc' }}>|</span>
          <span>Pop-Ups</span>
        </div>

        {/* Bottom decorative line */}
        <div
          style={{
            display: 'flex',
            width: '100px',
            height: '3px',
            backgroundColor: '#000000',
            marginTop: '40px',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
