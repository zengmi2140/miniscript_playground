'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { useI18n } from '@/lib/i18n/context';

export function DescriptorTab() {
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const { t } = useI18n();

  if (!compilationResult) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">{t('playground.right.waiting')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <CodeBlock code={compilationResult.descriptor} />
      <div className="rounded-card border border-border-subtle bg-surface-base p-3">
        <p className="mb-1 text-[12px] font-medium text-text-muted">
          {t('playground.right.scriptHex')}
        </p>
        <p className="break-all font-mono text-[11px] leading-relaxed text-text-secondary">
          {compilationResult.scriptHex}
        </p>
      </div>
    </div>
  );
}
