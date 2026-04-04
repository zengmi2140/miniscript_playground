'use client';

import { Key, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export type AddChildPickType = 'signature' | 'timelock' | 'group';

export interface AddChildOptionsProps {
  onPick: (type: AddChildPickType, groupOp?: 'all' | 'any' | 'threshold') => void;
}

/**
 * Shared "add condition" actions for virtual add-child and tree child placeholder (replace).
 * Parent owns append vs replace logic via a single onPick handler.
 */
export function AddChildOptions({ onPick }: AddChildOptionsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onPick('signature')}
        className="w-full flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 text-left hover:border-btc-500 hover:bg-btc-500/10 transition-all"
      >
        <Key className="h-4 w-4 text-btc-500" />
        <div>
          <p className="text-sm font-medium text-text-primary">{t('builder.action.addSignature')}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onPick('timelock')}
        className="w-full flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 text-left hover:border-btc-500 hover:bg-btc-500/10 transition-all"
      >
        <Clock className="h-4 w-4 text-btc-500" />
        <div>
          <p className="text-sm font-medium text-text-primary">{t('builder.action.addTimelock')}</p>
        </div>
      </button>
      <div className="pt-2 border-t border-border-subtle">
        <p className="text-xs text-text-muted mb-2">{t('builder.action.addGroup')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPick('group', 'all')}
            className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-btc-500"
          >
            {t('builder.node.all')}
          </button>
          <button
            type="button"
            onClick={() => onPick('group', 'any')}
            className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-btc-500"
          >
            {t('builder.node.any')}
          </button>
          <button
            type="button"
            onClick={() => onPick('group', 'threshold')}
            className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-btc-500"
          >
            {t('builder.node.threshold')}
          </button>
        </div>
      </div>
    </div>
  );
}
