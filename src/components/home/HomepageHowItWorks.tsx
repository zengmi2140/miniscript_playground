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
    border: 'border-btc-500/25',
    bg: 'bg-btc-500/10',
    codeBg: 'bg-btc-500/5',
    codeBorder: 'border-btc-500/20',
  },
  {
    step: '02',
    iconKey: 'code',
    titleKey: 'home.how.step2.title',
    descKey: 'home.how.step2.desc',
    exampleKey: 'home.how.step2.example',
    accent: 'text-yellow-400',
    border: 'border-yellow-400/25',
    bg: 'bg-yellow-400/10',
    codeBg: 'bg-yellow-400/5',
    codeBorder: 'border-yellow-400/20',
  },
  {
    step: '03',
    iconKey: 'git',
    titleKey: 'home.how.step3.title',
    descKey: 'home.how.step3.desc',
    exampleKey: 'home.how.step3.example',
    accent: 'text-emerald-400',
    border: 'border-emerald-400/25',
    bg: 'bg-emerald-400/10',
    codeBg: 'bg-emerald-400/5',
    codeBorder: 'border-emerald-400/20',
  },
  {
    step: '04',
    iconKey: 'pointer',
    titleKey: 'home.how.step4.title',
    descKey: 'home.how.step4.desc',
    exampleKey: 'home.how.step4.example',
    accent: 'text-violet-400',
    border: 'border-violet-400/25',
    bg: 'bg-violet-400/10',
    codeBg: 'bg-violet-400/5',
    codeBorder: 'border-violet-400/20',
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
      <div className="mx-auto max-w-4xl px-4">
        {/* Section header */}
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

        {/* Step list — vertical stack */}
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => {
            const Icon = ICON_MAP[step.iconKey];
            const isLast = index === steps.length - 1;
            return (
              <div key={step.step} className="relative flex flex-col gap-3">
                {/* Card */}
                <div
                  className={`grid grid-cols-1 items-center gap-5 rounded-xl border ${step.border} bg-surface-base px-6 py-5 transition-colors hover:bg-surface-card md:grid-cols-[1fr_auto]`}
                >
                  {/* Left: meta + title + desc */}
                  <div className="flex items-start gap-4">
                    {/* Step number + icon column */}
                    <div className="flex flex-col items-center gap-2 pt-0.5">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${step.bg}`}
                      >
                        <Icon className={`h-4 w-4 ${step.accent}`} />
                      </div>
                      <span className={`font-mono text-[10px] font-bold ${step.accent} opacity-40`}>
                        {step.step}
                      </span>
                    </div>

                    {/* Title + desc */}
                    <div>
                      <h3 className="mb-1.5 text-sm font-semibold leading-snug text-text-primary">
                        {t(step.titleKey)}
                      </h3>
                      <p className="text-xs leading-relaxed text-text-secondary">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>

                  {/* Right: code example — fixed width, wraps cleanly */}
                  <div
                    className={`w-full overflow-hidden rounded-lg border ${step.codeBorder} ${step.codeBg} px-4 py-3 md:w-64`}
                  >
                    <code
                      className={`block break-words font-mono text-[11px] leading-relaxed ${step.accent}`}
                    >
                      {t(step.exampleKey)}
                    </code>
                  </div>
                </div>

                {/* Connector line between steps */}
                {!isLast && (
                  <div className="mx-auto h-3 w-px bg-border-subtle" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
