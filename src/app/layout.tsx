import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/Header';
import {
  SCRIPTWISE_LOCALE_COOKIE,
  SCRIPTWISE_THEME_COOKIE,
  localeToHtmlLang,
  resolveLocalePreference,
  resolveThemePreference,
  type ThemePreference,
} from '@/lib/preferences';
import { APP_URL } from '@/lib/app-url';
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

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'ScriptWise — Bitcoin 花费条件教学实验室',
    template: '%s | ScriptWise',
  },
  description: '一个场景优先、以花费路径为中心的 Bitcoin Miniscript 教学实验室。读懂 Bitcoin 的花费条件，从 Miniscript 开始。',
  keywords: ['Bitcoin', 'Miniscript', 'Policy', 'Script', 'P2WSH', '比特币', '多签', '时间锁'],
  authors: [{ name: 'ScriptWise' }],
  creator: 'ScriptWise',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    url: APP_URL,
    siteName: 'ScriptWise',
    title: 'ScriptWise — Bitcoin 花费条件教学实验室',
    description: '把 Bitcoin 的花费条件讲清楚。场景优先、以花费路径为中心的 Miniscript 教学工具。',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'ScriptWise — Bitcoin Miniscript educational playground',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptWise — Bitcoin 花费条件教学实验室',
    description: '把 Bitcoin 的花费条件讲清楚。场景优先、花费路径可视化的 Miniscript 教学工具。',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function buildNoFlashThemeScript(initialTheme: ThemePreference) {
  return `
    (() => {
      try {
        const match = document.cookie.match(/(?:^|; )${SCRIPTWISE_THEME_COOKIE}=([^;]+)/);
        let theme = match ? decodeURIComponent(match[1]) : '${initialTheme}';
        if (theme !== 'dark' && theme !== 'light') theme = '${initialTheme}';
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        root.style.colorScheme = theme;
      } catch {}
    })();
  `;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const initialLocale = resolveLocalePreference(cookieStore.get(SCRIPTWISE_LOCALE_COOKIE)?.value);
  const initialTheme = resolveThemePreference(cookieStore.get(SCRIPTWISE_THEME_COOKIE)?.value);

  return (
    <html
      lang={localeToHtmlLang(initialLocale)}
      className={initialTheme === 'dark' ? 'dark' : ''}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <head>
        <script
          id="scriptwise-theme-init"
          dangerouslySetInnerHTML={{ __html: buildNoFlashThemeScript(initialTheme) }}
        />
        {/* Prefetch the Playground page document so navigation feels instant */}
        <link rel="prefetch" href="/playground" as="document" />
      </head>
      <body className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} font-sans`}>
        <Providers initialLocale={initialLocale} initialTheme={initialTheme}>
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
