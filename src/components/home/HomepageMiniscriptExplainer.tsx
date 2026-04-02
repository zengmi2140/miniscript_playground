'use client';

import { CheckCircle2, XCircle, Lock, FileCode2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function HomepageMiniscriptExplainer() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-base py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section header */}
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-3 inline-block rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
            {t('home.explainer.label')}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-text-primary md:text-3xl">
            {t('home.explainer.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
            {t('home.explainer.subtitle')}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: What & Why */}
          <div className="space-y-5">
            {/* What is Miniscript */}
            <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-btc-500/10">
                  <FileCode2 className="h-4 w-4 text-btc-500" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {t('home.explainer.what.title')}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                {t('home.explainer.what.desc')}
              </p>
            </div>

            {/* Why Miniscript */}
            <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {t('home.explainer.why.title')}
                </h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span>{t('home.explainer.why.benefit1')}</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span>{t('home.explainer.why.benefit2')}</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span>{t('home.explainer.why.benefit3')}</span>
                </li>
              </ul>
            </div>

            {/* Our mission */}
            <div className="rounded-lg border border-btc-500/30 bg-btc-500/5 p-5">
              <h3 className="mb-2 text-sm font-semibold text-btc-500">
                {t('home.explainer.mission.title')}
              </h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                {t('home.explainer.mission.desc')}
              </p>
            </div>
          </div>

          {/* Right: Comparison (Traditional Script vs Miniscript) */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <h4 className="text-xs font-semibold text-text-primary">
                  {t('home.explainer.comparison.old.title')}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="rounded border border-red-500/20 bg-red-500/5 p-3">
                  <pre className="overflow-x-auto text-[10px] leading-relaxed text-red-400">
                    <code>{t('home.explainer.comparison.old.example')}</code>
                  </pre>
                </div>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-1.5 text-[11px] text-text-muted">
                    <span className="text-red-400">•</span>
                    <span>{t('home.explainer.comparison.old.problem1')}</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[11px] text-text-muted">
                    <span className="text-red-400">•</span>
                    <span>{t('home.explainer.comparison.old.problem2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-text-primary">
                  {t('home.explainer.comparison.new.title')}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <pre className="overflow-x-auto text-[10px] leading-relaxed text-emerald-400">
                    <code>{t('home.explainer.comparison.new.example')}</code>
                  </pre>
                </div>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-1.5 text-[11px] text-text-muted">
                    <span className="text-emerald-400">•</span>
                    <span>{t('home.explainer.comparison.new.advantage1')}</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[11px] text-text-muted">
                    <span className="text-emerald-400">•</span>
                    <span>{t('home.explainer.comparison.new.advantage2')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
