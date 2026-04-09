'use client';

import { BookOpen, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { RECOMMENDED_READING_ARTICLES } from '@/lib/resources/recommended-reading';

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
    href: 'https://bitcoindevkit.org/bdk-cli/playground/playground.html',
    badgeKey: 'resources.links.bdkPlayground.badge',
    titleKey: 'resources.links.bdkPlayground.title',
    descKey: 'resources.links.bdkPlayground.desc',
  },
  {
    href: 'https://miniscript.fun/',
    badgeKey: 'resources.links.miniscriptBuilder.badge',
    titleKey: 'resources.links.miniscriptBuilder.title',
    descKey: 'resources.links.miniscriptBuilder.desc',
  },
  {
    href: 'https://bitcoindevkit.org/',
    badgeKey: 'resources.links.bdk.badge',
    titleKey: 'resources.links.bdk.title',
    descKey: 'resources.links.bdk.desc',
    highlight: true as const,
  },
] as const;

export default function ResourcesPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
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

        {RECOMMENDED_READING_ARTICLES.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base">
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
                <BookOpen className="h-6 w-6 text-text-muted" />
              </div>
              <p className="max-w-sm text-sm text-text-muted">{t('resources.reading.placeholder')}</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {RECOMMENDED_READING_ARTICLES.map((article, index) => (
              <li key={article.titleKey}>
                <a
                  href={locale === 'zh' ? article.hrefZh : article.hrefEn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 rounded-xl border border-border-subtle bg-surface-base p-4 transition-all hover:border-btc-500/30 hover:bg-surface-elevated hover:shadow-sm md:gap-4 md:p-5"
                >
                  <span
                    className="hidden w-7 shrink-0 pt-0.5 text-right font-mono text-[11px] text-text-muted/70 sm:block"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-pretty text-[15px] font-semibold leading-snug text-text-primary md:text-base">
                        {t(article.titleKey)}
                      </h3>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-text-muted opacity-50 transition-opacity group-hover:text-btc-500 group-hover:opacity-100" />
                    </div>
                    <p className="mt-2 text-xs text-text-muted">{t(article.sourceKey)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-16 border-t border-border-subtle pt-8 text-center">
        <p className="text-xs text-text-muted">{t('footer.description')}</p>
        <p className="mt-1 text-xs text-text-muted">{t('footer.rights')}</p>
      </footer>
    </div>
  );
}
