'use client';

import { Zap, Eye, PenTool, Share2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const features = [
  {
    iconKey: 'zap',
    titleKey: 'home.features.f1.title',
    descKey: 'home.features.f1.desc',
    accent: 'text-btc-500',
    bg: 'bg-btc-500/10',
  },
  {
    iconKey: 'eye',
    titleKey: 'home.features.f2.title',
    descKey: 'home.features.f2.desc',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    iconKey: 'pen',
    titleKey: 'home.features.f3.title',
    descKey: 'home.features.f3.desc',
    accent: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    iconKey: 'share',
    titleKey: 'home.features.f4.title',
    descKey: 'home.features.f4.desc',
    accent: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
] as const;

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap,
  eye: Eye,
  pen: PenTool,
  share: Share2,
};

export function HomepageFeatures() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-base py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-3 inline-block rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
            {t('home.features.label')}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-text-primary md:text-3xl">
            {t('home.features.title')}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary md:text-base">
            {t('home.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = ICON_MAP[f.iconKey];
            return (
              <div
                key={f.iconKey}
                className="group rounded-xl border border-border-default bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg hover:shadow-black/20"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.bg}`}>
                  <Icon className={`h-5 w-5 ${f.accent}`} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-text-primary">
                  {t(f.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {t(f.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
