'use client';

import { useCallback, useState } from 'react';
import { Plus, Dice5, RotateCcw, Trash2, Pencil, Check, X } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { DEFAULT_TEST_KEYS } from '@/lib/scenarios/data';
import { cn } from '@/lib/utils/cn';
import type { KeyVariable } from '@/lib/engine/types';

function generateRandomPubkey(): string {
  const bytes = new Uint8Array(33);
  crypto.getRandomValues(bytes);
  bytes[0] = bytes[0] % 2 === 0 ? 0x02 : 0x03;
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function KeyRow({ kv, onRemove }: { kv: KeyVariable; onRemove: () => void }) {
  const updateKeyVariable = usePlaygroundStore((s) => s.updateKeyVariable);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(kv.name);
  const [editKey, setEditKey] = useState(kv.publicKey);

  const handleSave = () => {
    updateKeyVariable(kv.name, {
      name: editName,
      policyName: editName,
      publicKey: editKey,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(kv.name);
    setEditKey(kv.publicKey);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 rounded-button border border-border-active bg-surface-base p-2">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="rounded border border-border-default bg-surface-elevated px-2 py-1 text-[12px] text-text-primary outline-none focus:border-border-active"
          placeholder="Name"
        />
        <input
          value={editKey}
          onChange={(e) => setEditKey(e.target.value)}
          className="rounded border border-border-default bg-surface-elevated px-2 py-1 font-mono text-[11px] text-text-secondary outline-none focus:border-border-active"
          placeholder="Public key (hex)"
        />
        <div className="flex gap-1">
          <button onClick={handleSave} className="flex h-5 w-5 items-center justify-center rounded text-semantic-satisfied hover:bg-semantic-satisfied/10">
            <Check className="h-3 w-3" />
          </button>
          <button onClick={handleCancel} className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-surface-elevated">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 rounded-button px-2 py-1.5 transition-colors hover:bg-surface-elevated">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-semantic-key/10 text-[10px] font-semibold text-semantic-key">
        {kv.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-text-primary">{kv.name}</p>
        <p className="truncate font-mono text-[10px] text-text-muted">{kv.publicKey}</p>
      </div>
      <div className="flex flex-shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => setEditing(true)} className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-surface-overlay hover:text-text-secondary">
          <Pencil className="h-2.5 w-2.5" />
        </button>
        <button onClick={onRemove} className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-semantic-warning/10 hover:text-semantic-warning">
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

export function KeyVariableManager() {
  const { t } = useI18n();
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const setKeyVariables = usePlaygroundStore((s) => s.setKeyVariables);
  const addKeyVariable = usePlaygroundStore((s) => s.addKeyVariable);
  const removeKeyVariable = usePlaygroundStore((s) => s.removeKeyVariable);
  const activeScenarioId = usePlaygroundStore((s) => s.activeScenarioId);

  const handleAdd = useCallback(() => {
    const existing = new Set(keyVariables.map((k) => k.name));
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'];
    const newName = names.find((n) => !existing.has(n)) || `Key${keyVariables.length + 1}`;
    const pubkey = DEFAULT_TEST_KEYS[newName] || generateRandomPubkey();
    addKeyVariable({ name: newName, policyName: newName, publicKey: pubkey });
  }, [keyVariables, addKeyVariable]);

  const handleRandom = useCallback(() => {
    const updated: KeyVariable[] = keyVariables.map((kv) => ({
      ...kv,
      publicKey: generateRandomPubkey(),
    }));
    setKeyVariables(updated);
  }, [keyVariables, setKeyVariables]);

  const handleRestore = useCallback(() => {
    const restored: KeyVariable[] = keyVariables.map((kv) => ({
      ...kv,
      publicKey: DEFAULT_TEST_KEYS[kv.name] || kv.publicKey,
    }));
    setKeyVariables(restored);
  }, [keyVariables, setKeyVariables]);

  return (
    <div className="flex flex-col gap-2">
      {keyVariables.length === 0 ? (
        <p className="py-3 text-center text-[12px] text-text-muted">
          {activeScenarioId
            ? t('playground.keys.empty')
            : t('playground.left.keysPlaceholder')}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {keyVariables.map((kv) => (
            <KeyRow
              key={kv.name}
              kv={kv}
              onRemove={() => removeKeyVariable(kv.name)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        <ActionButton icon={Plus} label={t('playground.keys.add')} onClick={handleAdd} />
        <ActionButton icon={Dice5} label={t('playground.keys.random')} onClick={handleRandom} disabled={keyVariables.length === 0} />
        <ActionButton icon={RotateCcw} label={t('playground.keys.restore')} onClick={handleRestore} disabled={keyVariables.length === 0} />
      </div>

      <p className="text-[10px] leading-relaxed text-text-muted">
        {t('playground.keys.hint')}
      </p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-6 items-center gap-1 rounded-chip border border-border-default px-2 text-[11px] text-text-secondary transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:border-border-hover hover:bg-surface-elevated',
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
