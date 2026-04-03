'use client';

import { ChevronDown, ChevronRight, Hammer, Check } from 'lucide-react';
import { useState } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { SCENARIOS } from '@/lib/scenarios/data';
import { cn } from '@/lib/utils/cn';
import { KeyVariableManager } from './KeyVariableManager';
import { ContextSelector } from './ContextSelector';
import type { Scenario } from '@/lib/engine/types';

function ScenarioMiniCard({ scenario, isActive, onSelect }: {
  scenario: Scenario;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { locale } = useI18n();

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full rounded-button border px-3 py-2.5 text-left transition-all',
        isActive
          ? 'border-border-active bg-btc-500/10 text-text-primary'
          : 'border-border-subtle bg-transparent text-text-secondary hover:border-border-hover hover:bg-surface-elevated',
      )}
    >
      <p className="text-[13px] font-medium leading-tight">
        {scenario.title[locale]}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-text-muted">
        {scenario.description[locale]}
      </p>
    </button>
  );
}

function BuildModeCard() {
  const { t } = useI18n();
  const playgroundMode = usePlaygroundStore((s) => s.playgroundMode);
  const enterBuildMode = usePlaygroundStore((s) => s.enterBuildMode);
  const isActive = playgroundMode === 'build';

  const handleClick = () => {
    // If already in build mode, do nothing to avoid accidental reset
    if (isActive) return;
    enterBuildMode();
  };

  return (
    <button
      type="button"
      data-testid="playground-build-mode-card"
      onClick={handleClick}
      className={cn(
        'w-full rounded-button border px-3 py-2.5 text-left transition-all',
        isActive
          ? 'border-border-active bg-btc-500/10 text-text-primary'
          : 'border-dashed border-border-default bg-transparent text-text-secondary hover:border-border-hover hover:bg-surface-elevated',
      )}
    >
      <div className="flex items-center gap-1.5">
        <Hammer className={cn(
          'h-3.5 w-3.5 flex-shrink-0',
          isActive ? 'text-btc-500' : 'text-text-muted'
        )} />
        <p className={cn(
          'text-[13px] font-medium leading-tight',
          isActive ? 'text-text-primary' : 'text-text-muted'
        )}>
          {t('playground.left.diy')}
        </p>
        {isActive && (
          <span className="ml-auto flex items-center gap-1 rounded-chip bg-btc-500/20 px-1.5 py-0.5 text-[9px] font-medium text-btc-500">
            <Check className="h-2.5 w-2.5" />
            {t('playground.left.diyActive')}
          </span>
        )}
      </div>
      <p className={cn(
        'mt-0.5 text-[11px] leading-snug',
        isActive ? 'text-text-secondary' : 'text-text-muted'
      )}>
        {t('playground.left.diyDesc')}
      </p>
    </button>
  );
}

function CollapsibleSection({ title, defaultOpen, children, pulse }: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-3 text-[13px] font-semibold text-text-secondary transition-colors hover:text-text-primary',
          pulse && 'animate-pulse text-btc-500',
        )}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        {title}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function LeftPanel() {
  const { t } = useI18n();
  const activeScenarioId = usePlaygroundStore((s) => s.activeScenarioId);
  const loadScenario = usePlaygroundStore((s) => s.loadScenario);
  const policy = usePlaygroundStore((s) => s.policy);

  const isEmpty = !policy && !activeScenarioId;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <CollapsibleSection
        title={t('playground.left.scenarios')}
        defaultOpen={true}
        pulse={isEmpty}
      >
        <div className={cn(
          'flex flex-col gap-1.5',
          isEmpty && 'rounded-button ring-2 ring-btc-500/40 ring-offset-2 ring-offset-surface-card',
        )}>
          <BuildModeCard />
          {SCENARIOS.map((scenario) => (
            <ScenarioMiniCard
              key={scenario.id}
              scenario={scenario}
              isActive={activeScenarioId === scenario.id}
              onSelect={() => loadScenario(scenario.id)}
            />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('playground.keys.title')}
        defaultOpen={true}
      >
        <KeyVariableManager />
      </CollapsibleSection>

      <CollapsibleSection
        title={t('playground.context.title')}
        defaultOpen={false}
      >
        <ContextSelector />
      </CollapsibleSection>
    </div>
  );
}
