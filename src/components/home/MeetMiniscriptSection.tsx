'use client';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  Puzzle,
  Search,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

/* ------------------------------------------------------------------ */
/*  Code samples reused from the old benefits section                  */
/* ------------------------------------------------------------------ */

const SCRIPT_EXAMPLE = `OP_2 <pk1> <pk2> <pk3>
OP_3 OP_CHECKMULTISIG`;

const POLICY_EXAMPLE = `thresh(2,
  pk(Alice),
  pk(Bob),
  pk(Charlie)
)`;

const DESCRIPTOR_SAMPLE = 'wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(Recovery),older(10000))))';

const COMPOSABILITY_RESULT = `or(
  and(pk(Alice), pk(Bob)),
  and(pk(Bob), older(1000))
)`;

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
/*  Part ①  Problem statement                                          */
/* ------------------------------------------------------------------ */

function PainCard({
  Icon,
  label,
  desc,
}: {
  Icon: typeof Layers;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border-default bg-surface-card p-5">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/25 bg-red-400/10">
          <Icon className="h-5 w-5 text-red-400" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-sm font-semibold text-text-primary">{label}</p>
        <p className="text-xs leading-relaxed text-text-secondary md:text-sm">{desc}</p>
      </div>
    </div>
  );
}

function ProblemBlock() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-8 text-2xl font-semibold text-text-primary md:text-3xl">
        {t('home.meetMiniscript.problem.title')}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <PainCard
          Icon={Layers}
          label={t('home.meetMiniscript.problem.items.lowLevel.label')}
          desc={t('home.meetMiniscript.problem.items.lowLevel.desc')}
        />
        <PainCard
          Icon={AlertTriangle}
          label={t('home.meetMiniscript.problem.items.errorProne.label')}
          desc={t('home.meetMiniscript.problem.items.errorProne.desc')}
        />
        <PainCard
          Icon={Puzzle}
          label={t('home.meetMiniscript.problem.items.nonComposable.label')}
          desc={t('home.meetMiniscript.problem.items.nonComposable.desc')}
        />
        <PainCard
          Icon={Search}
          label={t('home.meetMiniscript.problem.items.hardToAnalyze.label')}
          desc={t('home.meetMiniscript.problem.items.hardToAnalyze.desc')}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Part ②  Definition + 3-layer horizontal pipeline                   */
/* ------------------------------------------------------------------ */

function StackColumn({
  layer,
  role,
  subtitle,
  example,
  accent,
}: {
  layer: string;
  role: string;
  subtitle: string;
  example: string;
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
      <p className="mb-3 text-xs text-text-muted">{subtitle}</p>
      <code className="mt-auto block rounded-md bg-surface-elevated px-3 py-2 font-mono text-[11px] leading-relaxed text-text-secondary">
        {example}
      </code>
    </div>
  );
}

function PipelineArrow() {
  const { t } = useI18n();
  return (
    <>
      <div className="hidden items-center justify-center md:flex">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] uppercase tracking-widest text-text-muted">
            {t('home.meetMiniscript.definition.arrowLabel')}
          </span>
          <ArrowRight className="h-5 w-5 text-btc-500/70" />
        </div>
      </div>
      <div className="flex justify-center py-1 md:hidden">
        <span className="text-sm text-btc-500/70">↓</span>
      </div>
    </>
  );
}

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
        <StackColumn
          layer={t('home.meetMiniscript.definition.stack.policy.layer')}
          role={t('home.meetMiniscript.definition.stack.policy.role')}
          subtitle={t('home.meetMiniscript.definition.stack.policy.subtitle')}
          example={t('home.meetMiniscript.definition.stack.policy.example')}
          accent="var(--semantic-key, #EAB308)"
        />
        <PipelineArrow />
        <StackColumn
          layer={t('home.meetMiniscript.definition.stack.miniscript.layer')}
          role={t('home.meetMiniscript.definition.stack.miniscript.role')}
          subtitle={t('home.meetMiniscript.definition.stack.miniscript.subtitle')}
          example={t('home.meetMiniscript.definition.stack.miniscript.example')}
          accent="#F7931A"
        />
        <PipelineArrow />
        <StackColumn
          layer={t('home.meetMiniscript.definition.stack.script.layer')}
          role={t('home.meetMiniscript.definition.stack.script.role')}
          subtitle={t('home.meetMiniscript.definition.stack.script.subtitle')}
          example={t('home.meetMiniscript.definition.stack.script.example')}
          accent="var(--text-muted, #A8A29E)"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Part ③  Features — three cards                                     */
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
            <code>{SCRIPT_EXAMPLE}</code>
          </pre>
        </div>
        <div className="rounded-xl border border-btc-500/20 bg-surface-elevated p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-btc-500">
            {t('home.meetMiniscript.features.readability.policyCaption')}
          </p>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-btc-500">
            <code>{POLICY_EXAMPLE}</code>
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
              {COMPOSABILITY_RESULT}
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
              {t('home.meetMiniscript.features.portability.export')}
            </span>
            <ArrowRight className="h-5 w-5 text-btc-500/60" />
          </div>
        </div>
        <div className="flex justify-center py-1 md:hidden">
          <span className="text-sm text-btc-500/60">↓</span>
        </div>

        <div className="flex flex-col items-center rounded-xl border border-btc-500/30 bg-btc-500/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
            Output Descriptor
          </p>
          <code className="mb-2 block max-w-full break-all text-center font-mono text-[11px] leading-relaxed text-btc-500">
            {DESCRIPTOR_SAMPLE}
          </code>
          <p className="text-center text-xs text-text-muted">
            {t('home.meetMiniscript.features.portability.descriptorNote')}
          </p>
        </div>

        <div className="hidden items-center md:flex">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-muted">
              {t('home.meetMiniscript.features.portability.import')}
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
          <ProblemBlock />
          <DefinitionBlock />
          <FeaturesBlock />
        </div>
      </div>
    </section>
  );
}
