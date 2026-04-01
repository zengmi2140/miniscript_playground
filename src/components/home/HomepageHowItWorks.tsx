'use client';

import { Code2, GitBranch, Layers, MousePointer } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const steps = [
  {
    step: '01',
    iconKey: 'layers',
    titleKey: 'home.how.step1.title',
    descKey: 'home.how.step1.desc',
    exampleKey: 'home.how.step1.example',
    accent: 'text-btc-500',
    border: 'border-btc-500/20',
    bg: 'bg-btc-500/10',
  },
  {
    step: '02',
    iconKey: 'code',
    titleKey: 'home.how.step2.title',
    descKey: 'home.how.step2.desc',
    exampleKey: 'home.how.step2.example',
    accent: 'text-yellow-400',
    border: 'border-yellow-400/20',
    bg: 'bg-yellow-400/10',
  },
  {
    step: '03',
    iconKey: 'git',
    titleKey: 'home.how.step3.title',
    descKey: 'home.how.step3.desc',
    exampleKey: 'home.how.step3.example',
    accent: 'text-emerald-400',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/10',
  },
  {
    step: '04',
    iconKey: 'pointer',
    titleKey: 'home.how.step4.title',
    descKey: 'home.how.step4.desc',
    exampleKey: 'home.how.step4.example',
    accent: 'text-violet-400',
    border: 'border-violet-400/20',
    bg: 'bg-violet-400/10',
  },
] as const;

const ICON_MAP: Record<string, React.ElementType> = {
  layers: Layers,
  code: Code2,
  git: GitBranch,
  pointer: MousePointer,
};

export function HomepageHowItWorks() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-card py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-3 inline-block rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
            {t('home.how.label')}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-text-primary md:text-3xl">
            {t('home.how.title')}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary md:text-base">
            {t('home.how.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = ICON_MAP[step.iconKey];
            return (
              <div
                key={step.step}
                className={`relative rounded-xl border ${step.border} bg-surface-base p-5 transition-all hover:border-opacity-60`}
              >
                {/* Step number */}
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${step.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${step.accent}`} />
                  </div>
                  <span className={`text-xs font-mono font-bold ${step.accent} opacity-40`}>
                    {step.step}
                  </span>
                </div>

                <h3 className="mb-2 text-sm font-semibold text-text-primary">
                  {t(step.titleKey)}
                </h3>
                <p className="mb-3 text-xs leading-relaxed text-text-secondary">
                  {t(step.descKey)}
                </p>
                <div className={`rounded-md border ${step.border} ${step.bg} px-2.5 py-1.5`}>
                  <span className={`font-mono text-[11px] ${step.accent}`}>
                    {t(step.exampleKey)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
