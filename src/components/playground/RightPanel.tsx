'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { ExplainPopover } from '@/components/shared/ExplainPopover';
import { PathsTab } from '@/components/results/PathsTab';
import { PolicyTab } from '@/components/results/PolicyTab';
import { MiniscriptTab } from '@/components/results/MiniscriptTab';
import { ScriptTab } from '@/components/results/ScriptTab';
import { DescriptorTab } from '@/components/results/DescriptorTab';
import { AddressTab } from '@/components/results/AddressTab';
import { WarningsTab } from '@/components/results/WarningsTab';
import type { ResultTab } from '@/lib/engine/types';

interface TabDef {
  key: ResultTab;
  i18nKey: string;
  glossaryKey?: string;
}

const TABS: TabDef[] = [
  { key: 'paths', i18nKey: 'playground.results.paths', glossaryKey: 'satisfaction' },
  { key: 'policy', i18nKey: 'playground.results.policy', glossaryKey: 'policy' },
  { key: 'miniscript', i18nKey: 'playground.results.miniscript', glossaryKey: 'miniscript' },
  { key: 'script', i18nKey: 'playground.results.script' },
  { key: 'descriptor', i18nKey: 'playground.results.descriptor', glossaryKey: 'descriptor' },
  { key: 'address', i18nKey: 'playground.results.address' },
  { key: 'warnings', i18nKey: 'playground.results.warnings' },
];

const TAB_COMPONENTS: Record<ResultTab, React.FC> = {
  paths: PathsTab,
  policy: PolicyTab,
  miniscript: MiniscriptTab,
  script: ScriptTab,
  descriptor: DescriptorTab,
  address: AddressTab,
  warnings: WarningsTab,
};

export function RightPanel() {
  const { t } = useI18n();
  const activeTab = usePlaygroundStore((s) => s.activeResultTab);
  const setActiveTab = usePlaygroundStore((s) => s.setActiveResultTab);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const compilationError = usePlaygroundStore((s) => s.compilationError);

  const isStale = compilationError !== null && compilationResult !== null;

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-end gap-0.5 border-b border-border-subtle px-3 pt-3">
        {TABS.map((tab) => (
          <div key={tab.key} className="flex items-center gap-0.5">
            <button
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-t-button px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-b-2 border-btc-500 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {t(tab.i18nKey)}
              {isStale && activeTab === tab.key && tab.key !== 'warnings' && (
                <span className="ml-1 text-[10px] text-text-muted">
                  ({t('playground.results.stale')})
                </span>
              )}
            </button>
            {tab.glossaryKey && (
              <ExplainPopover glossaryKey={tab.glossaryKey} className="mb-1" />
            )}
          </div>
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
          <ActiveComponent />
        )}
      </div>
    </div>
  );
}
