'use client';

import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePlaygroundStore } from '@/lib/stores/playground-store';

interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export function ThreeColumnLayout({ left, center, right }: ThreeColumnLayoutProps) {
  const isLeftOpen = usePlaygroundStore((s) => s.isLeftPanelOpen);
  const isRightOpen = usePlaygroundStore((s) => s.isRightPanelOpen);
  const setLeftOpen = usePlaygroundStore((s) => s.setLeftPanelOpen);
  const setRightOpen = usePlaygroundStore((s) => s.setRightPanelOpen);

  return (
    <div className="relative flex h-full min-h-0 flex-1">
      <div
        className={cn(
          'relative flex-shrink-0 border-r border-border-subtle bg-surface-card transition-[width] duration-300 ease-in-out',
          isLeftOpen ? 'w-[240px]' : 'w-0',
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
          isLeftOpen ? 'left-[228px]' : 'left-2',
        )}
        aria-label={isLeftOpen ? 'Collapse left panel' : 'Expand left panel'}
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
          isRightOpen ? 'right-[308px]' : 'right-2',
        )}
        aria-label={isRightOpen ? 'Collapse right panel' : 'Expand right panel'}
      >
        {isRightOpen ? (
          <PanelRightClose className="h-3.5 w-3.5" />
        ) : (
          <PanelRightOpen className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn(
          'relative flex-shrink-0 border-l border-border-subtle bg-surface-card transition-[width] duration-300 ease-in-out',
          isRightOpen ? 'w-[320px]' : 'w-0',
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
