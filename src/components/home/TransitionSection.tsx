'use client';

import { useI18n } from '@/lib/i18n/context';

const SINGLE_SIG_ADDRESS = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
const MULTISIG_ADDRESS = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

export function TransitionSection() {
  const { t } = useI18n();
  const footer = t('home.transition.footer');

  return (
    <section className="border-t border-border-subtle bg-surface-card py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.transition.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.transition.subtitle')}
        </p>

        <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
          {/* 单签 */}
          <div className="flex flex-col rounded-xl border border-border-default bg-surface-elevated p-6 md:p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-muted">
              {t('home.transition.singleSig.label')}
            </p>
            <pre className="mb-4 whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-text-secondary">
              <code>{t('home.transition.singleSig.code')}</code>
            </pre>
            <p className="mb-6 text-sm text-text-secondary">
              {t('home.transition.singleSig.desc')}
            </p>
            <div className="mt-auto">
              <div className="mb-2 text-center text-sm text-text-muted">↓</div>
              <p className="truncate rounded-lg bg-surface-base px-3 py-2 font-mono text-xs text-text-muted">
                {SINGLE_SIG_ADDRESS}
              </p>
            </div>
          </div>

          {/* 多签 */}
          <div className="flex flex-col rounded-xl border border-btc-500/20 bg-surface-elevated p-6 md:p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-btc-500">
              {t('home.transition.multiSig.label')}
            </p>
            <pre className="mb-4 whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-btc-500">
              <code>{t('home.transition.multiSig.code')}</code>
            </pre>
            <p className="mb-6 text-sm text-text-secondary">
              {t('home.transition.multiSig.desc')}
            </p>
            <div className="mt-auto">
              <div className="mb-2 text-center text-sm text-text-muted">↓</div>
              <p className="truncate rounded-lg bg-surface-base px-3 py-2 font-mono text-xs text-text-muted">
                {MULTISIG_ADDRESS}
              </p>
            </div>
          </div>
        </div>

        {footer ? (
          <p className="mt-10 text-center text-sm text-text-secondary">{footer}</p>
        ) : null}
      </div>
    </section>
  );
}
