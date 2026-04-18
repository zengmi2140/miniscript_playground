'use client';

import Link from 'next/link';
import { Bitcoin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

// A minimal animated code snippet to show what Miniscript looks like
const CODE_LINES = [
  { text: 'thresh(2,', color: 'text-btc-500' },
  { text: '  pk(Alice),', color: 'text-yellow-400' },
  { text: '  pk(Bob),', color: 'text-yellow-400' },
  { text: '  older(4320)', color: 'text-emerald-400' },
  { text: ')', color: 'text-btc-500' },
];

export function HomepageHero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface-base">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Left: Text */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-btc-500/20 bg-btc-500/10 px-3 py-1.5">
              <Bitcoin className="h-3.5 w-3.5 text-btc-500" />
              <span className="text-xs font-medium text-btc-500">Bitcoin Miniscript</span>
            </div>

            <h1 className="mb-4 text-[28px] font-bold leading-tight tracking-tight text-text-primary md:text-[36px] lg:text-[42px]">
              {t('home.hero.title')}
            </h1>

            <p className="mb-8 text-sm leading-relaxed text-text-secondary md:text-base">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#applications"
                className="group inline-flex items-center justify-center gap-2 rounded-button bg-btc-500 px-5 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:bg-btc-400"
              >
                {t('home.hero.cta.primary')}
              </Link>
              <Link
                href="/playground"
                className="group inline-flex items-center justify-center gap-2 rounded-button border border-border-default bg-surface-elevated px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-border-hover hover:bg-surface-overlay"
              >
                {t('home.hero.cta.secondary')}
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-muted md:hidden">
              {t('home.playground.desktopHint')}
            </p>
          </div>

          {/* Right: Code preview card */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-xl shadow-black/30">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-text-muted font-mono">policy.miniscript</span>
              </div>

              {/* Code body */}
              <div className="p-5">
                <pre className="font-mono text-sm leading-7">
                  {CODE_LINES.map((line, i) => (
                    <div key={i} className={line.color}>
                      {line.text}
                    </div>
                  ))}
                </pre>

                <div className="mt-5 border-t border-border-subtle pt-4">
                  <p className="mb-2 text-xs text-text-muted">{t('home.hero.card.label')}</p>
                  <div className="flex flex-col gap-1.5">
                    <PathRow icon="key" label={t('home.hero.card.path1')} status="satisfied" />
                    <PathRow icon="key" label={t('home.hero.card.path2')} status="satisfied" />
                    <PathRow icon="clock" label={t('home.hero.card.path3')} status="pending" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative label */}
            <div className="absolute -bottom-3 -right-3 rounded-lg border border-btc-500/30 bg-surface-card px-3 py-1.5 shadow-lg">
              <span className="text-xs font-medium text-btc-500">P2WSH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathRow({ label, status }: { icon: string; label: string; status: 'satisfied' | 'pending' }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-surface-elevated px-3 py-2">
      <div
        className={`h-2 w-2 flex-shrink-0 rounded-full ${
          status === 'satisfied' ? 'bg-emerald-400' : 'bg-btc-500'
        }`}
      />
      <span className="text-xs text-text-secondary font-mono truncate">{label}</span>
    </div>
  );
}
