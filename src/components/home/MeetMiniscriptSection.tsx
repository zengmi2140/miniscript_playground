'use client';

import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const BUILDING_BLOCKS = [
  {
    code: 'pk(Alice)',
    colorClass: 'text-yellow-400',
    borderClass: 'border-yellow-400/30',
    bgClass: 'bg-yellow-400/5',
  },
  {
    code: 'older(1000)',
    colorClass: 'text-btc-500',
    borderClass: 'border-btc-500/30',
    bgClass: 'bg-btc-500/5',
  },
  {
    code: 'pk(Bob)',
    colorClass: 'text-yellow-400',
    borderClass: 'border-yellow-400/30',
    bgClass: 'bg-yellow-400/5',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Pipeline StackColumn + Arrow                                       */
/* ------------------------------------------------------------------ */

function PipelineCard({
  layer,
  role,
  desc,
  code,
  note,
  accent,
}: {
  layer: string;
  role: string;
  desc: string;
  code: string;
  note: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border-default bg-surface-card p-5">
      <p
        className="mb-2 text-[11px] font-medium uppercase tracking-widest"
        style={{ color: accent }}
      >
        {layer}
      </p>
      <p className="mb-1 text-sm font-semibold text-text-primary">{role}</p>
      <p className="mb-3 text-xs leading-relaxed text-text-secondary">{desc}</p>
      <code className="mb-2 mt-auto block rounded-md bg-surface-elevated p-3 font-mono text-xs text-text-secondary">
        {code}
      </code>
      <p className="text-xs text-text-muted">{note}</p>
    </div>
  );
}

function PipelineArrow({ label }: { label: string }) {
  return (
    <>
      <div className="hidden items-center justify-center md:flex">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] uppercase tracking-widest text-text-muted">{label}</span>
          <ArrowRight className="h-5 w-5 text-btc-500/70" />
        </div>
      </div>
      <div className="flex justify-center py-1 md:hidden">
        <span className="text-sm text-btc-500/70">↓</span>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Part ①  Definition + 3-layer pipeline                              */
/* ------------------------------------------------------------------ */

function DefinitionBlock() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-6 text-2xl font-semibold text-text-primary md:text-3xl">
        {t('home.meetMiniscript.definition.title')}
      </h3>

      <div className="mb-8 flex items-start gap-3 rounded-xl border border-btc-500/30 bg-btc-500/5 px-5 py-4">
        <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-btc-500" />
        <div>
          <p className="text-base font-semibold text-text-primary md:text-lg">
            {t('home.meetMiniscript.definition.calloutStrong')}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {t('home.meetMiniscript.definition.calloutBody')}
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <PipelineCard
          layer={t('home.meetMiniscript.definition.pipeline.policy.layer')}
          role={t('home.meetMiniscript.definition.pipeline.policy.role')}
          desc={t('home.meetMiniscript.definition.pipeline.policy.desc')}
          code={t('home.meetMiniscript.definition.pipeline.policy.code')}
          note={t('home.meetMiniscript.definition.pipeline.policy.note')}
          accent="var(--semantic-key, #EAB308)"
        />
        <PipelineArrow label={t('home.meetMiniscript.definition.arrowLabel')} />
        <PipelineCard
          layer={t('home.meetMiniscript.definition.pipeline.miniscript.layer')}
          role={t('home.meetMiniscript.definition.pipeline.miniscript.role')}
          desc={t('home.meetMiniscript.definition.pipeline.miniscript.desc')}
          code={t('home.meetMiniscript.definition.pipeline.miniscript.code')}
          note={t('home.meetMiniscript.definition.pipeline.miniscript.note')}
          accent="#F7931A"
        />
        <PipelineArrow label={t('home.meetMiniscript.definition.arrowLabel')} />
        <PipelineCard
          layer={t('home.meetMiniscript.definition.pipeline.script.layer')}
          role={t('home.meetMiniscript.definition.pipeline.script.role')}
          desc={t('home.meetMiniscript.definition.pipeline.script.desc')}
          code={t('home.meetMiniscript.definition.pipeline.script.code')}
          note={t('home.meetMiniscript.definition.pipeline.script.note')}
          accent="var(--text-muted, #A8A29E)"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Features — three cards (Readability / Composability / Portability)  */
/* ------------------------------------------------------------------ */

function FeatureHeader({
  label,
  title,
  accent,
}: {
  label: string;
  title: string;
  accent: 'btc' | 'violet' | 'emerald';
}) {
  const accentMap = {
    btc: 'border-btc-500/25 bg-btc-500/10 text-btc-500',
    violet: 'border-violet-400/25 bg-violet-400/10 text-violet-400',
    emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
  } as const;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <span
        className={`inline-block shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${accentMap[accent]}`}
      >
        {label}
      </span>
      <h4 className="text-xl font-semibold text-text-primary md:text-2xl">{title}</h4>
    </div>
  );
}

function ReadabilityCard() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 md:p-8">
      <FeatureHeader
        label={t('home.meetMiniscript.features.readability.label')}
        title={t('home.meetMiniscript.features.readability.title')}
        accent="btc"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-red-500/20 bg-surface-elevated p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-red-400">
            {t('home.meetMiniscript.features.readability.scriptCaption')}
          </p>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-red-400/80">
            <code>{t('home.meetMiniscript.features.readability.scriptExample')}</code>
          </pre>
        </div>
        <div className="rounded-xl border border-btc-500/20 bg-surface-elevated p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-btc-500">
            {t('home.meetMiniscript.features.readability.policyCaption')}
          </p>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
            <code>{t('home.meetMiniscript.features.readability.policyExample')}</code>
          </pre>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        {t('home.meetMiniscript.features.readability.compareNote')}
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-btc-500/20 bg-btc-500/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-btc-500" />
        <p className="text-sm text-text-secondary">
          {t('home.meetMiniscript.features.readability.takeaway')}
        </p>
      </div>
    </div>
  );
}

function ComposabilityCard() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 md:p-8">
      <FeatureHeader
        label={t('home.meetMiniscript.features.composability.label')}
        title={t('home.meetMiniscript.features.composability.title')}
        accent="violet"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
            {t('home.meetMiniscript.features.composability.blocksLabel')}
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
              {t('home.meetMiniscript.features.composability.combineArrow')}
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="rounded-xl border border-btc-500/20 bg-btc-500/5 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
              {t('home.meetMiniscript.features.composability.resultLabel')}
            </p>
            <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
              {t('home.meetMiniscript.features.composability.resultCode')}
            </code>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('home.meetMiniscript.features.composability.benefit1.title')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.meetMiniscript.features.composability.benefit1.desc')}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('home.meetMiniscript.features.composability.benefit2.title')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.meetMiniscript.features.composability.benefit2.desc')}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('home.meetMiniscript.features.composability.benefit3.title')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.meetMiniscript.features.composability.benefit3.desc')}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PortabilityCard() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border-default bg-surface-card p-6 md:p-8">
      <FeatureHeader
        label={t('home.meetMiniscript.features.portability.label')}
        title={t('home.meetMiniscript.features.portability.title')}
        accent="emerald"
      />

      <p className="mb-6 text-sm leading-relaxed text-text-secondary">
        {t('home.meetMiniscript.features.portability.intro')}
      </p>

      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="flex flex-col items-center rounded-xl border border-border-default bg-surface-elevated p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-btc-500/10">
            <span className="text-lg">🅰</span>
          </div>
          <p className="mb-1 text-sm font-medium text-text-primary">
            {t('home.meetMiniscript.features.portability.walletA')}
          </p>
          <p className="text-center text-xs text-text-muted">
            {t('home.meetMiniscript.features.portability.walletADesc')}
          </p>
        </div>

        <div className="hidden items-center md:flex">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-muted">
              {t('home.meetMiniscript.features.portability.exportLabel')}
            </span>
            <ArrowRight className="h-5 w-5 text-btc-500/60" />
          </div>
        </div>
        <div className="flex justify-center py-1 md:hidden">
          <span className="text-sm text-btc-500/60">↓</span>
        </div>

        <div className="flex flex-col items-center rounded-xl border border-btc-500/30 bg-btc-500/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
            {t('home.meetMiniscript.features.portability.descriptorLabel')}
          </p>
          <code className="mb-2 block max-w-full break-all text-center font-mono text-[11px] leading-relaxed text-btc-500">
            {t('home.meetMiniscript.features.portability.descriptorSample')}
          </code>
          <p className="text-center text-xs text-text-muted">
            {t('home.meetMiniscript.features.portability.descriptorNote')}
          </p>
        </div>

        <div className="hidden items-center md:flex">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-muted">
              {t('home.meetMiniscript.features.portability.importLabel')}
            </span>
            <ArrowRight className="h-5 w-5 text-btc-500/60" />
          </div>
        </div>
        <div className="flex justify-center py-1 md:hidden">
          <span className="text-sm text-btc-500/60">↓</span>
        </div>

        <div className="flex flex-col items-center rounded-xl border border-border-default bg-surface-elevated p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
            <span className="text-lg">🅱</span>
          </div>
          <p className="mb-1 text-sm font-medium text-text-primary">
            {t('home.meetMiniscript.features.portability.walletB')}
          </p>
          <p className="text-center text-xs text-text-muted">
            {t('home.meetMiniscript.features.portability.walletBDesc')}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
        <p className="text-sm text-text-secondary">
          {t('home.meetMiniscript.features.portability.takeaway')}
        </p>
      </div>
    </div>
  );
}

function FeaturesBlock() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-8 text-2xl font-semibold text-text-primary md:text-3xl">
        {t('home.meetMiniscript.features.title')}
      </h3>

      <div className="space-y-8">
        <ReadabilityCard />
        <ComposabilityCard />
        <PortabilityCard />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                       */
/* ------------------------------------------------------------------ */

export function MeetMiniscriptSection() {
  const { t } = useI18n();

  return (
    <section className="bg-surface-base py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.meetMiniscript.title')}
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-text-secondary">
          {t('home.meetMiniscript.subtitle')}
        </p>

        <div className="space-y-16">
          <DefinitionBlock />
          <FeaturesBlock />
        </div>
      </div>
    </section>
  );
}
