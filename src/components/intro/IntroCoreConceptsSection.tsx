'use client';

import { useI18n } from '@/lib/i18n/context';

export function IntroCoreConceptsSection({ hideStack = false }: { hideStack?: boolean } = {}) {
  const { t } = useI18n();

  const stackSteps = hideStack ? [] : [
    {
      num: '1',
      title: 'Policy',
      desc: t('home.concepts.stack.step1.desc'),
      detail: t('home.concepts.stack.step1.detail'),
    },
    {
      num: '2',
      title: 'Miniscript',
      desc: t('home.concepts.stack.step2.desc'),
      detail: t('home.concepts.stack.step2.detail'),
    },
    {
      num: '3',
      title: 'Bitcoin Script',
      desc: t('home.concepts.stack.step3.desc'),
      detail: t('home.concepts.stack.step3.detail'),
    },
  ];

  return (
    <section
      id="concepts"
      className="bg-surface-base py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.concepts.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.concepts.subtitle')}
        </p>

        <div className="space-y-12">
          <div className="pb-12">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">Policy</h3>
            <p className="mb-6 max-w-3xl leading-relaxed text-text-secondary">
              {t('home.concepts.policy.desc')}
            </p>
            <div className="mb-4 rounded-xl border border-border-default bg-surface-card p-6">
              <code className="font-mono text-sm text-btc-500">
                or(pk(Alice), and(pk(Bob), after(block_height)))
              </code>
            </div>
            <p className="text-sm text-text-muted">
              {t('home.concepts.policy.example')}
            </p>
          </div>

          <div className="pb-12">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">Miniscript</h3>
            <p className="mb-6 max-w-3xl leading-relaxed text-text-secondary">
              {t('home.concepts.miniscript.desc')}
            </p>
            <div className="mb-4 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.concepts.miniscript.featuresLabel')}
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>{t('home.concepts.miniscript.feature1')}</li>
                  <li>{t('home.concepts.miniscript.feature2')}</li>
                  <li>{t('home.concepts.miniscript.feature3')}</li>
                  <li>{t('home.concepts.miniscript.feature4')}</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.concepts.miniscript.compileLabel')}
                </p>
                <p className="mb-3 text-sm text-text-secondary">
                  {t('home.concepts.miniscript.compileDesc')}
                </p>
                <p className="rounded-lg bg-surface-base p-2 font-mono text-xs text-text-muted">
                  {t('home.concepts.miniscript.compileNote')}
                </p>
              </div>
            </div>
          </div>

          <div className="pb-12">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              Output Descriptor
            </h3>
            <p className="mb-6 max-w-3xl leading-relaxed text-text-secondary">
              {t('home.concepts.descriptor.desc')}
            </p>
            <div className="space-y-4">
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.concepts.descriptor.multisigLabel')}
                </p>
                <code className="break-all font-mono text-sm text-btc-500">
                  wsh(multi(2,[abcd1234/44h/0h/0h]xpub...,[dcba4321/44h/0h/0h]xpub...))
                </code>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  {t('home.concepts.descriptor.timelockLabel')}
                </p>
                <code className="break-all font-mono text-sm text-btc-500">
                  {`wsh(or_d(pk([fingerprint1]xpub.../0/*), and_v(v:pk([fingerprint2]xpub.../1/*), older(144))))`}
                </code>
              </div>
            </div>
            <p className="mt-4 text-sm text-text-muted">
              {t('home.concepts.descriptor.note')}
            </p>
          </div>
        </div>

        {!hideStack && <div className="mt-16">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            The Technical Stack
          </h2>

          <div className="mb-12 hidden items-center justify-between gap-4 md:flex">
            <div className="flex-1 text-center">
              <div className="rounded-xl border border-border-default bg-surface-card p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 text-lg font-semibold text-btc-500">
                  1
                </div>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">Policy</h4>
                <p className="mb-2 text-sm text-text-secondary">
                  {t('home.concepts.stack.step1.desc')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.concepts.stack.step1.detail')}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 text-2xl font-light text-btc-500/40">→</div>
            <div className="flex-1 text-center">
              <div className="rounded-xl border border-border-default bg-surface-card p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 text-lg font-semibold text-btc-500">
                  2
                </div>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">Miniscript</h4>
                <p className="mb-2 text-sm text-text-secondary">
                  {t('home.concepts.stack.step2.desc')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.concepts.stack.step2.detail')}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 text-2xl font-light text-btc-500/40">→</div>
            <div className="flex-1 text-center">
              <div className="rounded-xl border border-border-default bg-surface-card p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 text-lg font-semibold text-btc-500">
                  3
                </div>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">Bitcoin Script</h4>
                <p className="mb-2 text-sm text-text-secondary">
                  {t('home.concepts.stack.step3.desc')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('home.concepts.stack.step3.detail')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {stackSteps.map((item, idx) => (
              <div key={item.num}>
                <div className="flex items-center gap-4 rounded-xl border border-border-default bg-surface-card p-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-btc-500/10 text-sm font-semibold text-btc-500">
                    {item.num}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                    <p className="mt-1 text-xs text-text-muted">{item.detail}</p>
                  </div>
                </div>
                {idx < 2 && (
                  <div className="py-2 text-center text-sm text-btc-500/30">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>}
      </div>
    </section>
  );
}
