'use client';

import { CheckCircle2, XCircle, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function HomepageMiniscriptExplainer() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-base py-14 md:py-20">
      <div className="mx-auto max-w-4xl px-4">

        {/* Section header — "是什么"合并在这里 */}
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-3 inline-block rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
            {t('home.explainer.label')}
          </span>
          <h2 className="mb-4 text-2xl font-bold text-text-primary md:text-3xl">
            {t('home.explainer.title')}
          </h2>
          {/* 把"是什么"的描述放在副标题里，用两段区分定义和背景 */}
          <p className="mx-auto mb-3 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
            {t('home.explainer.what.desc')}
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-text-muted">
            {t('home.explainer.subtitle')}
          </p>
        </div>

        {/* Three cards: 缺点 / 优势 / 为什么需要 */}
        <div className="flex flex-col gap-4">

          {/* Card 1: 传统 Bitcoin Script 的缺点 */}
          <div className="rounded-xl border border-red-500/20 bg-surface-card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {t('home.explainer.comparison.old.title')}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                  <span className="mt-0.5 text-red-400">•</span>
                  <span>{t('home.explainer.comparison.old.problem1')}</span>
                </li>
                <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                  <span className="mt-0.5 text-red-400">•</span>
                  <span>{t('home.explainer.comparison.old.problem2')}</span>
                </li>
              </ul>
              <div className="w-full rounded-lg border border-red-500/15 bg-red-500/5 px-4 py-3 md:w-64">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-red-400">
                  <code>{t('home.explainer.comparison.old.example')}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Card 2: Miniscript 的优势 */}
          <div className="rounded-xl border border-emerald-500/20 bg-surface-card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {t('home.explainer.comparison.new.title')}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                  <span className="mt-0.5 text-emerald-400">•</span>
                  <span>{t('home.explainer.comparison.new.advantage1')}</span>
                </li>
                <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                  <span className="mt-0.5 text-emerald-400">•</span>
                  <span>{t('home.explainer.comparison.new.advantage2')}</span>
                </li>
              </ul>
              <div className="w-full rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-4 py-3 md:w-64">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-emerald-400">
                  <code>{t('home.explainer.comparison.new.example')}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Card 3: 为什么需要它 */}
          <div className="rounded-xl border border-btc-500/20 bg-surface-card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-btc-500/10">
                <Zap className="h-4 w-4 text-btc-500" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {t('home.explainer.why.title')}
              </h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-btc-500" />
                <span>{t('home.explainer.why.benefit1')}</span>
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-btc-500" />
                <span>{t('home.explainer.why.benefit2')}</span>
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-btc-500" />
                <span>{t('home.explainer.why.benefit3')}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
