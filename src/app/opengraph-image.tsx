import { ImageResponse } from 'next/og';
import { APP_URL_DISPLAY } from '@/lib/app-url';

export const runtime = 'edge';
export const alt = 'ScriptWise — Bitcoin 花费条件教学实验室';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0C0A09',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'rgba(247, 147, 26, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(247, 147, 26, 0.05)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 20,
              background: '#F7931A',
              marginBottom: 32,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"
                fill="white"
              />
            </svg>
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#FAFAF9',
              letterSpacing: '-1px',
              marginBottom: 16,
            }}
          >
            ScriptWise
          </div>

          <div
            style={{
              fontSize: 24,
              color: '#A8A29E',
              marginBottom: 48,
              textAlign: 'center',
            }}
          >
            把 Bitcoin 的花费条件讲清楚
          </div>

          <div
            style={{
              display: 'flex',
              gap: 16,
            }}
          >
            {['多签名', '时间锁', '哈希锁', '花费路径'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  background: 'rgba(247, 147, 26, 0.12)',
                  border: '1px solid rgba(247, 147, 26, 0.3)',
                  color: '#F7931A',
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#57534E',
            fontSize: 15,
          }}
        >
          <span>{APP_URL_DISPLAY}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
