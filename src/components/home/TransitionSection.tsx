'use client';

import { useI18n } from '@/lib/i18n/context';

const SINGLE_SIG_ADDRESS = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
const MULTISIG_ADDRESS = 'tb1qrp33g0q5b5698ahp5jnf0y5eme3p4lkjxq4gv4';

export function TransitionSection() {
  const { t } = useI18n();

  return (
    <section className="border-t border-border-subtle bg-surface-card py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.transition.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.transition.subtitle')}
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {/* 单签 */}
          <div className="rounded-xl border border-border-default bg-surface-elevated p-6 md:p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-muted">
              {t('home.transition.singleSig.label')}
            </p>
            <pre className="mb-4 font-mono text-sm leading-relaxed text-text-secondary">
              <code>{t('home.transition.singleSig.code')}</code>
            </pre>
            <div className="mb-4 text-center text-sm text-text-muted">↓</div>
            <p className="mb-2 truncate rounded-lg bg-surface-base px-3 py-2 font-mono text-xs text-text-muted">
              {SINGLE_SIG_ADDRESS}
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              {t('home.transition.singleSig.desc')}
            </p>
          </div>

          {/* 多签 */}
          <div className="rounded-xl border border-btc-500/20 bg-surface-elevated p-6 md:p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-btc-500">
              {t('home.transition.multiSig.label')}
            </p>
            <pre className="mb-4 font-mono text-sm leading-relaxed text-btc-500">
              <code>{t('home.transition.multiSig.code')}</code>
            </pre>
            <div className="mb-4 text-center text-sm text-text-muted">↓</div>
            <p className="mb-2 truncate rounded-lg bg-surface-base px-3 py-2 font-mono text-xs text-text-muted">
              {MULTISIG_ADDRESS}
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              {t('home.transition.multiSig.desc')}
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-text-secondary">
          {t('home.transition.footer')}
        </p>
      </div>
    </section>
  );
}
