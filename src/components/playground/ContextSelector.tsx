'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import type { ScriptContext, Network } from '@/lib/engine/types';

const CONTEXTS: { value: ScriptContext; i18nKey: string; disabled: boolean }[] = [
  { value: 'wsh', i18nKey: 'playground.context.wsh', disabled: false },
  { value: 'tr', i18nKey: 'playground.context.tr', disabled: true },
];

const NETWORKS: { value: Network; label: string }[] = [
  { value: 'testnet', label: 'Testnet' },
  { value: 'regtest', label: 'Regtest' },
  { value: 'signet', label: 'Signet' },
];

export function ContextSelector() {
  const { t } = useI18n();
  const context = usePlaygroundStore((s) => s.context);
  const setContext = usePlaygroundStore((s) => s.setContext);
  const network = usePlaygroundStore((s) => s.network);
  const setNetwork = usePlaygroundStore((s) => s.setNetwork);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {CONTEXTS.map((ctx) => (
          <label
            key={ctx.value}
            className={cn(
              'flex items-center gap-2 rounded-button px-3 py-2 text-[13px] transition-colors',
              ctx.disabled
                ? 'cursor-not-allowed text-text-muted'
                : 'cursor-pointer text-text-primary hover:bg-surface-elevated',
              context === ctx.value && !ctx.disabled && 'bg-btc-500/5',
            )}
          >
            <input
              type="radio"
              name="context"
              value={ctx.value}
              checked={context === ctx.value}
              disabled={ctx.disabled}
              onChange={() => setContext(ctx.value)}
              className="accent-btc-500"
            />
            {t(ctx.i18nKey)}
            {ctx.disabled && (
              <span className="ml-auto text-[10px] italic text-text-muted">
                {t('playground.context.comingSoon')}
              </span>
            )}
          </label>
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-text-muted">
          {t('playground.context.network')}
        </p>
        <div className="flex gap-1">
          {NETWORKS.map((net) => (
            <button
              key={net.value}
              onClick={() => setNetwork(net.value)}
              className={cn(
                'rounded-chip px-2.5 py-1 text-[11px] font-medium transition-colors',
                network === net.value
                  ? 'bg-btc-500/10 text-btc-500'
                  : 'text-text-muted hover:bg-surface-elevated hover:text-text-secondary',
              )}
            >
              {net.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
