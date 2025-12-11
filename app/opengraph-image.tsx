import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Odd One Out - Multiplayer Party Game'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #9333EA 0%, #2563EB 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
        }}
      >
        {/* Three circles representing players */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            marginRight: 30,
          }}
        />
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#FCD34D',
            border: '4px solid white',
            marginRight: 30,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
          }}
        />
      </div>
      <h1
        style={{
          fontSize: 80,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        Odd One Out
      </h1>
      <p
        style={{
          fontSize: 32,
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          maxWidth: 800,
        }}
      >
        A multiplayer guessing game for remote teams
      </p>
    </div>,
    {
      ...size,
    }
  )
}
