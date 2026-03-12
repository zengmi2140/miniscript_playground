'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

const NETWORK_LABELS: Record<string, { label: string; color: string }> = {
  testnet: { label: 'Testnet', color: 'bg-btc-500/15 text-btc-400' },
  signet: { label: 'Signet', color: 'bg-semantic-satisfied/15 text-semantic-satisfied' },
};

export function AddressTab() {
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const network = usePlaygroundStore((s) => s.network);
  const context = usePlaygroundStore((s) => s.context);
  const { t } = useI18n();

  if (!compilationResult) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">{t('playground.right.waiting')}</p>
      </div>
    );
  }

  const netInfo = NETWORK_LABELS[network] || NETWORK_LABELS.testnet;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-chip px-2 py-1 text-chip', netInfo.color)}>
          {netInfo.label}
        </span>
        <span className="rounded-chip bg-surface-elevated px-2 py-1 text-chip text-text-muted">
          {context === 'wsh' ? 'P2WSH' : 'P2TR'}
        </span>
      </div>
      <CodeBlock code={compilationResult.address} />
      <p className="text-[11px] leading-relaxed text-text-muted">
        {t('playground.address.warning')}
      </p>
    </div>
  );
}
