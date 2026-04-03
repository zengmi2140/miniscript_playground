import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/Header';
import './globals.css';
import '@xyflow/react/dist/style.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://miniscript-lab.replit.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Miniscript Lab — Bitcoin 花费条件教学实验室',
    template: '%s | Miniscript Lab',
  },
  description: '一个场景优先、以花费路径为中心的 Bitcoin Miniscript 教学实验室。把 Bitcoin 的花费条件讲清楚。',
  keywords: ['Bitcoin', 'Miniscript', 'Policy', 'Script', 'P2WSH', '比特币', '多签', '时间锁'],
  authors: [{ name: 'Miniscript Lab' }],
  creator: 'Miniscript Lab',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    url: APP_URL,
    siteName: 'Miniscript Lab',
    title: 'Miniscript Lab — Bitcoin 花费条件教学实验室',
    description: '把 Bitcoin 的花费条件讲清楚。场景优先、以花费路径为中心的 Miniscript 教学工具。',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Miniscript Lab — Bitcoin Miniscript educational playground',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miniscript Lab — Bitcoin 花费条件教学实验室',
    description: '把 Bitcoin 的花费条件讲清楚。场景优先、花费路径可视化的 Miniscript 教学工具。',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        {/* Prefetch the Playground page document so navigation feels instant */}
        <link rel="prefetch" href="/playground" as="document" />
      </head>
      <body className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} font-sans`}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-surface-base">
            <Header />
            <main className="flex flex-1 flex-col">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
