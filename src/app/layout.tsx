import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/Header';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Miniscript Lab - Bitcoin Miniscript 教学实验室',
  description: '一个场景优先、以花费路径为中心的 Miniscript 教学实验室',
  openGraph: {
    title: 'Miniscript Lab',
    description: '把 Bitcoin 的花费条件讲清楚',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
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
