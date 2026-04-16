'use client';

import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

/* ------------------------------------------------------------------ */
/*  Readability — Bitcoin Script vs Miniscript                         */
/* ------------------------------------------------------------------ */

const SCRIPT_EXAMPLE = `OP_2 <pk1> <pk2> <pk3>
OP_3 OP_CHECKMULTISIG`;

const POLICY_EXAMPLE = `thresh(2,
  pk(Alice),
  pk(Bob),
  pk(Charlie)
)`;

function ReadabilityCard() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 md:p-8">
      <div className="mb-6">
        <span className="mb-2 inline-block rounded-full border border-btc-500/25 bg-btc-500/10 px-3 py-1 text-xs font-medium text-btc-500">
          {t('home.benefits.readability.label')}
        </span>
        <h3 className="mb-2 text-xl font-semibold text-text-primary md:text-2xl">
          {t('home.benefits.readability.title')}
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          {t('home.benefits.readability.desc')}
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bitcoin Script — the problem */}
        <div className="rounded-xl border border-red-500/20 bg-surface-elevated p-5">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <p className="text-xs font-medium uppercase tracking-widest text-red-400">
              Bitcoin Script
            </p>
          </div>
          <pre className="mb-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-red-400/80">
            <code>{SCRIPT_EXAMPLE}</code>
          </pre>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
              <span className="mt-0.5 text-red-400">✕</span>
              <span>{t('home.benefits.readability.script.problem1')}</span>
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
              <span className="mt-0.5 text-red-400">✕</span>
              <span>{t('home.benefits.readability.script.problem2')}</span>
            </li>
          </ul>
        </div>

        {/* Miniscript Policy — the solution */}
        <div className="rounded-xl border border-btc-500/20 bg-surface-elevated p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-btc-500" />
            <p className="text-xs font-medium uppercase tracking-widest text-btc-500">
              Miniscript Policy
            </p>
          </div>
          <pre className="mb-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
            <code>{POLICY_EXAMPLE}</code>
          </pre>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
              <span className="mt-0.5 text-btc-500">✓</span>
              <span>{t('home.benefits.readability.policy.advantage1')}</span>
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
              <span className="mt-0.5 text-btc-500">✓</span>
              <span>{t('home.benefits.readability.policy.advantage2')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Key takeaway */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-btc-500/20 bg-btc-500/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-btc-500" />
        <p className="text-sm text-text-secondary">
          {t('home.benefits.readability.takeaway')}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Portability — wallet migration flow                                */
/* ------------------------------------------------------------------ */

function PortabilityCard() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 md:p-8">
      <div className="mb-6">
        <span className="mb-2 inline-block rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
          {t('home.benefits.portability.label')}
        </span>
        <h3 className="mb-2 text-xl font-semibold text-text-primary md:text-2xl">
          {t('home.benefits.portability.title')}
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          {t('home.benefits.portability.desc')}
        </p>
      </div>

      {/* Migration flow visual */}
      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* Wallet A */}
        <div className="flex flex-col items-center rounded-xl border border-border-default bg-surface-elevated p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-btc-500/10">
            <span className="text-lg">🅰</span>
          </div>
          <p className="mb-1 text-sm font-medium text-text-primary">
            {t('home.benefits.portability.walletA')}
          </p>
          <p className="text-center text-xs text-text-muted">
            {t('home.benefits.portability.walletADesc')}
          </p>
        </div>

        {/* Arrow 1 */}
        <div className="hidden items-center md:flex">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-muted">{t('home.benefits.portability.export')}</span>
            <ArrowRight className="h-5 w-5 text-btc-500/60" />
          </div>
        </div>
        <div className="flex justify-center py-1 md:hidden">
          <span className="text-sm text-btc-500/60">↓</span>
        </div>

        {/* Descriptor — the portable artifact */}
        <div className="flex flex-col items-center rounded-xl border border-btc-500/30 bg-btc-500/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
            Output Descriptor
          </p>
          <code className="mb-2 block max-w-full break-all text-center font-mono text-[11px] leading-relaxed text-btc-500">
            wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(Recovery),older(10000))))
          </code>
          <p className="text-center text-xs text-text-muted">
            {t('home.benefits.portability.descriptorNote')}
          </p>
        </div>

        {/* Arrow 2 */}
        <div className="hidden items-center md:flex">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-muted">{t('home.benefits.portability.import')}</span>
            <ArrowRight className="h-5 w-5 text-btc-500/60" />
          </div>
        </div>
        <div className="flex justify-center py-1 md:hidden">
          <span className="text-sm text-btc-500/60">↓</span>
        </div>

        {/* Wallet B */}
        <div className="flex flex-col items-center rounded-xl border border-border-default bg-surface-elevated p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
            <span className="text-lg">🅱</span>
          </div>
          <p className="mb-1 text-sm font-medium text-text-primary">
            {t('home.benefits.portability.walletB')}
          </p>
          <p className="text-center text-xs text-text-muted">
            {t('home.benefits.portability.walletBDesc')}
          </p>
        </div>
      </div>

      {/* Key takeaway */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
        <p className="text-sm text-text-secondary">
          {t('home.benefits.portability.takeaway')}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composability — building blocks                                    */
/* ------------------------------------------------------------------ */

const BUILDING_BLOCKS = [
  { code: 'pk(Alice)', colorClass: 'text-yellow-400', borderClass: 'border-yellow-400/30', bgClass: 'bg-yellow-400/5' },
  { code: 'older(1000)', colorClass: 'text-btc-500', borderClass: 'border-btc-500/30', bgClass: 'bg-btc-500/5' },
  { code: 'pk(Bob)', colorClass: 'text-yellow-400', borderClass: 'border-yellow-400/30', bgClass: 'bg-yellow-400/5' },
] as const;

function ComposabilityCard() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 md:p-8">
      <div className="mb-6">
        <span className="mb-2 inline-block rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-400">
          {t('home.benefits.composability.label')}
        </span>
        <h3 className="mb-2 text-xl font-semibold text-text-primary md:text-2xl">
          {t('home.benefits.composability.title')}
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          {t('home.benefits.composability.desc')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: building blocks */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
            {t('home.benefits.composability.blocksLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {BUILDING_BLOCKS.map((block) => (
              <span
                key={block.code}
                className={`rounded-lg border ${block.borderClass} ${block.bgClass} px-3 py-2 font-mono text-xs ${block.colorClass}`}
              >
                {block.code}
              </span>
            ))}
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-xs font-medium text-text-muted">
              {t('home.benefits.composability.combineArrow')}
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="rounded-xl border border-btc-500/20 bg-btc-500/5 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
              {t('home.benefits.composability.resultLabel')}
            </p>
            <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
              {`or(\n  and(pk(Alice), pk(Bob)),\n  and(pk(Bob), older(1000))\n)`}
            </code>
          </div>
        </div>

        {/* Right: benefits list */}
        <div className="flex flex-col justify-center">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('home.benefits.composability.benefit1.title')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.benefits.composability.benefit1.desc')}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('home.benefits.composability.benefit2.title')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.benefits.composability.benefit2.desc')}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('home.benefits.composability.benefit3.title')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.benefits.composability.benefit3.desc')}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                       */
/* ------------------------------------------------------------------ */

export function MiniscriptBenefitsSection() {
  const { t } = useI18n();

  return (
    <section className="bg-surface-base py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.benefits.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.benefits.subtitle')}
        </p>

        <div className="space-y-8">
          <ReadabilityCard />
          <PortabilityCard />
          <ComposabilityCard />
        </div>
      </div>
    </section>
  );
}
