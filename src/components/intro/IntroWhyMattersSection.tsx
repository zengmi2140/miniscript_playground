'use client';

import { useI18n } from '@/lib/i18n/context';

export function IntroWhyMattersSection() {
  const { t } = useI18n();
  return (
    <section className="bg-surface-base py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Why Miniscript Matters
        </h2>

        <div className="space-y-12">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">
              {t('home.why.innovation.title')}
            </h3>
            <p className="leading-relaxed text-text-secondary">
              {t('home.why.innovation.desc')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">
              {t('home.why.enterprise.title')}
            </h3>
            <p className="leading-relaxed text-text-secondary">
              {t('home.why.enterprise.desc')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">
              {t('home.why.ecosystem.title')}
            </h3>
            <p className="leading-relaxed text-text-secondary">
              {t('home.why.ecosystem.desc')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">
              {t('home.why.efficiency.title')}
            </h3>
            <p className="leading-relaxed text-text-secondary">
              {t('home.why.efficiency.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
