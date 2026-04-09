'use client';

import { useState } from 'react';
import Link from 'next/link';
import { INTRO_APPLICATION_EXAMPLES } from '@/components/intro/data';
import { useI18n } from '@/lib/i18n/context';

export function IntroApplicationsSection() {
  const { t } = useI18n();
  const [activeExample, setActiveExample] = useState(0);
  const ex = INTRO_APPLICATION_EXAMPLES[activeExample];
  const playgroundHref =
    ex.playgroundScenarioId != null
      ? `/playground?scenario=${encodeURIComponent(ex.playgroundScenarioId)}`
      : '/playground';

  return (
    <section
      id="applications"
      className="border-t border-border-subtle bg-surface-base py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Applications
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          从 Policy 到最终脚本：实时查看真实应用场景的完整编译演化过程。
        </p>

        <div className="mb-12 flex flex-wrap gap-3">
          {INTRO_APPLICATION_EXAMPLES.map((example, idx) => (
            <button
              key={example.title}
              type="button"
              onClick={() => setActiveExample(idx)}
              className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-colors ${
                activeExample === idx
                  ? 'border-btc-500 bg-btc-500/15 text-btc-500'
                  : 'border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
              }`}
            >
              {example.title}
            </button>
          ))}
        </div>

        <div className="mb-16 grid gap-12 md:grid-cols-2">
          <div>
            <div className="h-full rounded-xl border border-border-default bg-surface-card p-8">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 text-2xl font-semibold text-text-primary">
                  {ex.title}
                </h3>
                <Link
                  href={playgroundHref}
                  className="inline-flex shrink-0 items-center rounded-button border border-border-default bg-surface-elevated px-3 py-1.5 text-sm font-medium text-btc-500 transition-colors hover:border-btc-500/40 hover:bg-surface-overlay"
                >
                  {t('intro.applications.tryIt')}
                </Link>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  使用场景
                </p>
                <p className="leading-relaxed text-text-secondary">{ex.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                    应用类型
                  </p>
                  <p className="text-sm text-text-muted">{ex.applicationType}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                    真实案例
                  </p>
                  <p className="text-sm text-text-muted">{ex.realCase}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                    优势
                  </p>
                  <p className="text-sm text-text-muted">{ex.advantage}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card">
              <div className="border-b border-border-subtle bg-surface-elevated px-6 py-3">
                <p className="text-sm font-medium uppercase tracking-widest text-text-muted">
                  Layer 1: Policy
                </p>
              </div>
              <div className="p-6">
                <code className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
                  {ex.policy}
                </code>
              </div>
            </div>

            <div className="flex justify-center py-2">
              <span className="text-sm text-text-muted">编译 ↓</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card">
              <div className="border-b border-border-subtle bg-surface-elevated px-6 py-3">
                <p className="text-sm font-medium uppercase tracking-widest text-text-muted">
                  Layer 2: Miniscript
                </p>
              </div>
              <div className="p-6">
                <code className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
                  {ex.miniscript}
                </code>
              </div>
            </div>

            <div className="flex justify-center py-2">
              <span className="text-sm text-text-muted">编译 ↓</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card">
              <div className="border-b border-border-subtle bg-surface-elevated px-6 py-3">
                <p className="text-sm font-medium uppercase tracking-widest text-text-muted">
                  Layer 3: Bitcoin Script
                </p>
              </div>
              <div className="p-6">
                <code className="max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-secondary">
                  {ex.bitcoinScript}
                </code>
              </div>
            </div>

            <div className="rounded-xl border border-btc-500/20 bg-btc-500/5 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                脚本大小优化
              </p>
              <p className="font-mono text-sm text-text-secondary">{ex.scriptSize}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 rounded-xl border border-border-default bg-surface-card p-8 md:grid-cols-3">
          <div>
            <p className="mb-2 text-3xl font-semibold text-btc-500">20-40%</p>
            <p className="text-sm text-text-muted">平均脚本大小减少</p>
          </div>
          <div>
            <p className="mb-2 text-3xl font-semibold text-btc-500">7+</p>
            <p className="text-sm text-text-muted">真实应用场景示例</p>
          </div>
          <div>
            <p className="mb-2 text-3xl font-semibold text-btc-500">完整</p>
            <p className="text-sm text-text-muted">从 Policy 到 Script</p>
          </div>
        </div>
      </div>
    </section>
  );
}
