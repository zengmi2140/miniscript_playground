'use client';

import { AlertTriangle, Layers, Puzzle, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

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
    <div className="flex gap-4 rounded-xl border border-border-default bg-surface-elevated p-5">
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

export function ScriptComplexitySection() {
  const { t } = useI18n();

  return (
    <section className="border-t border-border-subtle bg-surface-card py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.scriptComplexity.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.scriptComplexity.subtitle')}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <PainCard
            Icon={Layers}
            label={t('home.scriptComplexity.items.lowLevel.label')}
            desc={t('home.scriptComplexity.items.lowLevel.desc')}
          />
          <PainCard
            Icon={AlertTriangle}
            label={t('home.scriptComplexity.items.errorProne.label')}
            desc={t('home.scriptComplexity.items.errorProne.desc')}
          />
          <PainCard
            Icon={Puzzle}
            label={t('home.scriptComplexity.items.nonComposable.label')}
            desc={t('home.scriptComplexity.items.nonComposable.desc')}
          />
          <PainCard
            Icon={Search}
            label={t('home.scriptComplexity.items.hardToAnalyze.label')}
            desc={t('home.scriptComplexity.items.hardToAnalyze.desc')}
          />
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-text-secondary">
          {t('home.scriptComplexity.outro')}
        </p>
      </div>
    </section>
  );
}
