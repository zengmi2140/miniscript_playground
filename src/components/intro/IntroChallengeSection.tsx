'use client';

import { useI18n } from '@/lib/i18n/context';

export function IntroChallengeSection() {
  const { t } = useI18n();
  return (
    <section
      id="why"
      className="border-t border-border-subtle bg-surface-card py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          The Challenge
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.challenge.subtitle')}
        </p>

        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h3 className="mb-8 text-2xl font-semibold text-text-primary">
              Bitcoin Script
            </h3>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.challenge.scriptCol.lowLevel.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.scriptCol.lowLevel.desc')}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.challenge.scriptCol.errorProne.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.scriptCol.errorProne.desc')}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.challenge.scriptCol.nonComposable.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.scriptCol.nonComposable.desc')}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.challenge.scriptCol.hardToAnalyze.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.scriptCol.hardToAnalyze.desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-0 md:pt-8">
            <h3 className="mb-8 text-2xl font-semibold text-text-primary">
              Miniscript
            </h3>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  {t('home.challenge.miniscriptCol.highLevel.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.miniscriptCol.highLevel.desc')}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  {t('home.challenge.miniscriptCol.formalVerif.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.miniscriptCol.formalVerif.desc')}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  {t('home.challenge.miniscriptCol.composable.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.miniscriptCol.composable.desc')}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  {t('home.challenge.miniscriptCol.autoOpt.label')}
                </p>
                <p className="leading-relaxed text-text-secondary">
                  {t('home.challenge.miniscriptCol.autoOpt.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-border-default bg-surface-elevated p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-muted">
              Bitcoin Script
            </p>
            <code className="font-mono text-sm leading-relaxed text-text-secondary">
              {`OP_2 [pk1] [pk2] [pk3]\nOP_3 OP_CHECKMULTISIG`}
            </code>
            <p className="mt-3 text-xs text-text-muted">
              {t('home.challenge.codeCompare.scriptCaption')}
            </p>
          </div>
          <div className="rounded-xl border border-border-default bg-surface-elevated p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-btc-500">
              Miniscript
            </p>
            <code className="font-mono text-sm leading-relaxed text-btc-500">
              {`thresh(2,\n  pk(key1), pk(key2),\n  pk(key3)\n)`}
            </code>
            <p className="mt-3 text-xs text-btc-500/80">
              {t('home.challenge.codeCompare.miniscriptCaption')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
