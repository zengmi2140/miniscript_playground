'use client';

import { useMemo } from 'react';
import { Key, Hash, Check, X } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import {
  HTLC_TEACHING_HASH160_DIGEST,
  shouldMaskHtlcTeachingHash160,
} from '@/lib/playground/htlc-display-mask';

export function ConditionToggles() {
  const { t } = useI18n();
  const activeScenarioId = usePlaygroundStore((s) => s.activeScenarioId);
  const maskHtlcHash = shouldMaskHtlcTeachingHash160(activeScenarioId);
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const availableHashes = usePlaygroundStore((s) => s.availableHashes);
  const toggleKey = usePlaygroundStore((s) => s.toggleKey);
  const toggleHash = usePlaygroundStore((s) => s.toggleHash);

  const { keyNames, hashes } = useMemo(() => {
    if (!semanticTree) return { keyNames: [] as string[], hashes: [] as string[] };
    const keys = new Set<string>();
    const hs = new Set<string>();
    collectConditions(semanticTree, keys, hs);
    return { keyNames: Array.from(keys), hashes: Array.from(hs) };
  }, [semanticTree]);

  if (keyNames.length === 0 && hashes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-medium text-text-muted">
        {t('playground.conditions.title')}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {keyNames.map((name) => {
          const isOn = availableKeys.has(name);
          return (
            <button
              key={`key-${name}`}
              onClick={() => toggleKey(name)}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-chip border pl-1 pr-2.5 text-chip transition-all',
                isOn
                  ? 'border-semantic-key/40 bg-semantic-key/10 text-semantic-key'
                  : 'border-border-default bg-surface-elevated text-text-muted',
              )}
            >
              <div className={cn(
                'flex h-4 w-4 items-center justify-center rounded-sm',
                isOn ? 'bg-semantic-key/20' : 'bg-surface-overlay',
              )}>
                {isOn ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
              </div>
              <Key className="h-3 w-3" />
              {name}
            </button>
          );
        })}
        {hashes.map((hash) => {
          const isOn = availableHashes.has(hash);
          const shortHash =
            maskHtlcHash && hash === HTLC_TEACHING_HASH160_DIGEST
              ? 'HEX'
              : hash.slice(0, 8) + '...';
          return (
            <button
              key={`hash-${hash}`}
              onClick={() => toggleHash(hash)}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-chip border pl-1 pr-2.5 text-chip transition-all',
                isOn
                  ? 'border-semantic-hashlock/40 bg-semantic-hashlock/10 text-semantic-hashlock'
                  : 'border-border-default bg-surface-elevated text-text-muted',
              )}
            >
              <div className={cn(
                'flex h-4 w-4 items-center justify-center rounded-sm',
                isOn ? 'bg-semantic-hashlock/20' : 'bg-surface-overlay',
              )}>
                {isOn ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
              </div>
              <Hash className="h-3 w-3" />
              {shortHash}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function collectConditions(
  node: import('@/lib/engine/types').MiniscriptNode,
  keys: Set<string>,
  hashes: Set<string>,
) {
  switch (node.type) {
    case 'key':
      keys.add(node.name);
      break;
    case 'hash':
      hashes.add(node.hash);
      break;
    case 'multi':
      for (const k of node.keys) keys.add(k);
      break;
    case 'and':
    case 'or':
      for (const child of node.children) collectConditions(child, keys, hashes);
      break;
    case 'threshold':
      for (const child of node.children) collectConditions(child, keys, hashes);
      break;
  }
}
