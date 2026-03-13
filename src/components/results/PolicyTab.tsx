'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { useI18n } from '@/lib/i18n/context';

export function PolicyTab() {
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const { t } = useI18n();

  if (!compilationResult) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">{t('playground.right.waiting')}</p>
      </div>
    );
  }

  return <CodeBlock code={compilationResult.policyWithKeys} />;
}
