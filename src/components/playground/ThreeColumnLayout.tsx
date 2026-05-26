'use client';

import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';
import { usePlaygroundStore } from '@/lib/stores/playground-store';

interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

const LEFT_PANEL_ID = 'playground-left-panel';
const RIGHT_PANEL_ID = 'playground-right-panel';

export function ThreeColumnLayout({ left, center, right }: ThreeColumnLayoutProps) {
  const { t } = useI18n();
  const isLeftOpen = usePlaygroundStore((s) => s.isLeftPanelOpen);
  const isRightOpen = usePlaygroundStore((s) => s.isRightPanelOpen);
  const setLeftOpen = usePlaygroundStore((s) => s.setLeftPanelOpen);
  const setRightOpen = usePlaygroundStore((s) => s.setRightPanelOpen);

  return (
    <div className="relative flex h-full min-h-0 flex-1">
      <div
        id={LEFT_PANEL_ID}
        className={cn(
          'relative flex-shrink-0 border-r border-border-subtle bg-surface-card transition-[width] duration-300 ease-in-out',
          isLeftOpen ? 'w-[var(--playground-left-panel-width)]' : 'w-0',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200',
            isLeftOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          {left}
        </div>
      </div>

      <button
        onClick={() => setLeftOpen(!isLeftOpen)}
        className={cn(
          'absolute top-3 z-20 flex h-7 w-7 items-center justify-center rounded-button border border-border-default bg-surface-card text-text-secondary shadow-sm transition-all hover:bg-surface-elevated hover:text-text-primary',
          isLeftOpen
            ? 'left-[calc(var(--playground-left-panel-width)-var(--playground-panel-toggle-edge-offset))]'
            : 'left-2',
        )}
        aria-label={isLeftOpen ? t('playground.panels.collapseLeft') : t('playground.panels.expandLeft')}
        aria-expanded={isLeftOpen}
        aria-controls={LEFT_PANEL_ID}
      >
        {isLeftOpen ? (
          <PanelLeftClose className="h-3.5 w-3.5" />
        ) : (
          <PanelLeftOpen className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {center}
      </div>

      <button
        onClick={() => setRightOpen(!isRightOpen)}
        className={cn(
          'absolute top-3 z-20 flex h-7 w-7 items-center justify-center rounded-button border border-border-default bg-surface-card text-text-secondary shadow-sm transition-all hover:bg-surface-elevated hover:text-text-primary',
          isRightOpen
            ? 'right-[calc(var(--playground-right-panel-width)-var(--playground-panel-toggle-edge-offset))]'
            : 'right-2',
        )}
        aria-label={isRightOpen ? t('playground.panels.collapseRight') : t('playground.panels.expandRight')}
        aria-expanded={isRightOpen}
        aria-controls={RIGHT_PANEL_ID}
      >
        {isRightOpen ? (
          <PanelRightClose className="h-3.5 w-3.5" />
        ) : (
          <PanelRightOpen className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        id={RIGHT_PANEL_ID}
        className={cn(
          'relative flex-shrink-0 border-l border-border-subtle bg-surface-card transition-[width] duration-300 ease-in-out',
          isRightOpen ? 'w-[var(--playground-right-panel-width)]' : 'w-0',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200',
            isRightOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
