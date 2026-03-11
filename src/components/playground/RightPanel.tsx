'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import type { ResultTab } from '@/lib/engine/types';

const TABS: { key: ResultTab; i18nKey: string }[] = [
  { key: 'paths', i18nKey: 'playground.results.paths' },
  { key: 'policy', i18nKey: 'playground.results.policy' },
  { key: 'miniscript', i18nKey: 'playground.results.miniscript' },
  { key: 'script', i18nKey: 'playground.results.script' },
  { key: 'descriptor', i18nKey: 'playground.results.descriptor' },
  { key: 'address', i18nKey: 'playground.results.address' },
  { key: 'warnings', i18nKey: 'playground.results.warnings' },
];

export function RightPanel() {
  const { t } = useI18n();
  const activeTab = usePlaygroundStore((s) => s.activeResultTab);
  const setActiveTab = usePlaygroundStore((s) => s.setActiveResultTab);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-0.5 border-b border-border-subtle px-3 pt-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-t-button px-2.5 py-1.5 text-[12px] font-medium transition-colors',
              activeTab === tab.key
                ? 'border-b-2 border-btc-500 text-text-primary'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {t(tab.i18nKey)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!compilationResult ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[13px] text-text-muted">
              {t('playground.right.waiting')}
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-[13px] text-text-muted">
              {t('playground.right.tabPlaceholder')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
