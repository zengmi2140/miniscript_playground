'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export function BuilderSyncBanner() {
  const { t } = useI18n();
  const builderSyncState = usePlaygroundStore((s) => s.builderSyncState);

  if (builderSyncState === 'synced') {
    return null;
  }

  const isTextLed = builderSyncState === 'text-led';
  const isCompileError = builderSyncState === 'compile-error';

  return (
    <div
      className={cn(
        'absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border px-4 py-2 shadow-lg',
        isTextLed && 'border-blue-500/30 bg-blue-500/10',
        isCompileError && 'border-red-500/30 bg-red-500/10'
      )}
    >
      {isTextLed && (
        <>
          <Info className="h-4 w-4 flex-shrink-0 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-400">
              {t('builder.sync.readOnly')}
            </span>
            <span className="text-xs text-blue-300/80">
              {t('builder.sync.textLed')}
            </span>
          </div>
        </>
      )}
      {isCompileError && (
        <>
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-red-400">
              {t('builder.sync.readOnly')}
            </span>
            <span className="text-xs text-red-300/80">
              {t('builder.sync.compileError')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
