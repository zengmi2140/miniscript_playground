'use client';

import { BookOpen, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const RESOURCE_LINKS = [
  {
    href: 'https://bitcoin.sipa.be/miniscript/',
    badgeKey: 'resources.links.official.badge',
    titleKey: 'resources.links.official.title',
    descKey: 'resources.links.official.desc',
  },
  {
    href: 'https://github.com/rust-bitcoin/rust-miniscript',
    badgeKey: 'resources.links.rust.badge',
    titleKey: 'resources.links.rust.title',
    descKey: 'resources.links.rust.desc',
  },
  {
    href: 'https://adys.dev/miniscript',
    badgeKey: 'resources.links.studio.badge',
    titleKey: 'resources.links.studio.title',
    descKey: 'resources.links.studio.desc',
  },
  {
    href: 'https://min.sc/',
    badgeKey: 'resources.links.minsc.badge',
    titleKey: 'resources.links.minsc.title',
    descKey: 'resources.links.minsc.desc',
  },
  {
    href: 'https://bitcoindevkit.org/',
    badgeKey: 'resources.links.bdk.badge',
    titleKey: 'resources.links.bdk.title',
    descKey: 'resources.links.bdk.desc',
    highlight: true as const,
  },
] as const;

/** 在 zh.ts / en.ts 增加词条后在此追加；每条需 `titleKey`，可选 `descKey` */
const RECOMMENDED_READING_ARTICLES: {
  href: string;
  titleKey: string;
  descKey?: string;
}[] = [];

export default function ResourcesPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-balance text-2xl font-bold text-text-primary md:text-3xl">
          {t('resources.title')}
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-text-secondary md:text-base">
          {t('resources.subtitle')}
        </p>
      </div>

      {/* 工具与文档 */}
      <section className="mb-14">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">{t('resources.toolsDoc.title')}</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-text-secondary">
            {t('resources.toolsDoc.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {RESOURCE_LINKS.filter((item) => !('highlight' in item && item.highlight)).map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-base p-6 transition-colors hover:border-btc-500/40 hover:bg-surface-elevated"
              >
                <span className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-muted group-hover:text-btc-500">
                  {t(item.badgeKey)}
                </span>
                <span className="mb-2 flex items-start justify-between gap-2 text-lg font-semibold text-text-primary">
                  {t(item.titleKey)}
                  <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted opacity-70 transition-opacity group-hover:opacity-100" />
                </span>
                <p className="text-sm leading-relaxed text-text-secondary">{t(item.descKey)}</p>
              </a>
            ))}
          </div>

          {RESOURCE_LINKS.filter((item) => 'highlight' in item && item.highlight).map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-btc-500/25 bg-btc-500/5 p-6 transition-colors hover:border-btc-500/40"
            >
              <span className="mb-2 text-[11px] font-medium uppercase tracking-wider text-btc-500/90">
                {t(item.badgeKey)}
              </span>
              <span className="mb-2 flex items-start justify-between gap-2 text-lg font-semibold text-text-primary">
                {t(item.titleKey)}
                <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-btc-500/80 transition-opacity group-hover:opacity-100" />
              </span>
              <p className="text-sm leading-relaxed text-text-secondary">{t(item.descKey)}</p>
            </a>
          ))}
        </div>
      </section>

      {/* 推荐阅读 */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">{t('resources.reading.title')}</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-text-secondary">
            {t('resources.reading.subtitle')}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base">
          {RECOMMENDED_READING_ARTICLES.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
                <BookOpen className="h-6 w-6 text-text-muted" />
              </div>
              <p className="max-w-sm text-sm text-text-muted">{t('resources.reading.placeholder')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {RECOMMENDED_READING_ARTICLES.map((article) => (
                <li key={article.href}>
                  <a
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 px-6 py-5 transition-colors hover:bg-surface-elevated"
                  >
                    <span className="flex items-start justify-between gap-3 text-[15px] font-medium text-text-primary">
                      {t(article.titleKey)}
                      <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted opacity-60 transition-opacity group-hover:opacity-100" />
                    </span>
                    {article.descKey ? (
                      <p className="text-sm leading-relaxed text-text-secondary">{t(article.descKey)}</p>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer className="mt-16 border-t border-border-subtle pt-8 text-center">
        <p className="text-xs text-text-muted">{t('footer.description')}</p>
        <p className="mt-1 text-xs text-text-muted">{t('footer.rights')}</p>
      </footer>
    </div>
  );
}
