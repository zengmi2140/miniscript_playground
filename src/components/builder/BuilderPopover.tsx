'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { X, Plus, Trash2, Key, Clock } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import {
  findNode,
  updateSignatureRole,
  updateTimelockValue,
  updateThreshold,
  removeNode,
  addSignatureChild,
  addTimelockChild,
} from '@/lib/builder/node-ops';
import { TIMELOCK_PRESETS, blocksToHumanTime, type TimelockPresetKey } from '@/lib/builder/types';
import type { StrategyNode } from '@/lib/builder/types';

export function BuilderPopover() {
  const { t } = useI18n();
  const strategyTree = usePlaygroundStore((s) => s.strategyTree);
  const selectedBuilderNodeId = usePlaygroundStore((s) => s.selectedBuilderNodeId);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const updateStrategyTree = usePlaygroundStore((s) => s.updateStrategyTree);
  const addKeyVariable = usePlaygroundStore((s) => s.addKeyVariable);

  const [newRoleName, setNewRoleName] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);

  const selectedNode = useMemo(() => {
    if (!strategyTree || !selectedBuilderNodeId) return null;
    return findNode(strategyTree, selectedBuilderNodeId);
  }, [strategyTree, selectedBuilderNodeId]);

  const handleClose = useCallback(() => {
    setSelectedBuilderNodeId(null);
    setShowAddRole(false);
    setNewRoleName('');
  }, [setSelectedBuilderNodeId]);

  const handleRoleSelect = useCallback(
    (roleId: string) => {
      if (!strategyTree || !selectedBuilderNodeId) return;
      const newTree = updateSignatureRole(strategyTree, selectedBuilderNodeId, roleId);
      updateStrategyTree(newTree);
    },
    [strategyTree, selectedBuilderNodeId, updateStrategyTree]
  );

  const handleAddNewRole = useCallback(() => {
    if (!newRoleName.trim()) return;
    const name = newRoleName.trim();

    // Generate a random test public key
    const prefix = Math.random() > 0.5 ? '02' : '03';
    const bytes = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join('');
    const publicKey = prefix + bytes;

    // Add to key variables
    addKeyVariable({ name, policyName: name, publicKey });

    // If we're editing a signature node, also update it
    if (selectedNode?.kind === 'signature' && strategyTree && selectedBuilderNodeId) {
      const newTree = updateSignatureRole(strategyTree, selectedBuilderNodeId, name);
      updateStrategyTree(newTree);
    }

    setNewRoleName('');
    setShowAddRole(false);
  }, [newRoleName, addKeyVariable, selectedNode, strategyTree, selectedBuilderNodeId, updateStrategyTree]);

  const handleTimelockChange = useCallback(
    (value: number) => {
      if (!strategyTree || !selectedBuilderNodeId) return;
      const newTree = updateTimelockValue(strategyTree, selectedBuilderNodeId, value);
      updateStrategyTree(newTree);
    },
    [strategyTree, selectedBuilderNodeId, updateStrategyTree]
  );

  const handleThresholdChange = useCallback(
    (k: number) => {
      if (!strategyTree || !selectedBuilderNodeId) return;
      const newTree = updateThreshold(strategyTree, selectedBuilderNodeId, k);
      updateStrategyTree(newTree);
    },
    [strategyTree, selectedBuilderNodeId, updateStrategyTree]
  );

  const handleDelete = useCallback(() => {
    if (!strategyTree || !selectedBuilderNodeId) return;
    const newTree = removeNode(strategyTree, selectedBuilderNodeId);
    if (newTree) {
      updateStrategyTree(newTree);
    }
    handleClose();
  }, [strategyTree, selectedBuilderNodeId, updateStrategyTree, handleClose]);

  const handleAddSignature = useCallback(
    (roleId: string) => {
      if (!strategyTree || !selectedBuilderNodeId) return;
      const newTree = addSignatureChild(strategyTree, selectedBuilderNodeId, roleId);
      updateStrategyTree(newTree);
    },
    [strategyTree, selectedBuilderNodeId, updateStrategyTree]
  );

  const handleAddTimelock = useCallback(() => {
    if (!strategyTree || !selectedBuilderNodeId) return;
    const newTree = addTimelockChild(strategyTree, selectedBuilderNodeId, 4320);
    updateStrategyTree(newTree);
  }, [strategyTree, selectedBuilderNodeId, updateStrategyTree]);

  if (!selectedNode) return null;

  return (
    <Popover.Root open={!!selectedBuilderNodeId} onOpenChange={(open) => !open && handleClose()}>
      <Popover.Anchor className="fixed left-1/2 top-1/2" />
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-lg border border-border-subtle bg-surface-card p-4 shadow-xl"
          sideOffset={5}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {selectedNode.kind === 'signature' && t('builder.node.signature')}
              {selectedNode.kind === 'timelock' && t('builder.node.timelock')}
              {selectedNode.kind === 'group' && (
                selectedNode.op === 'threshold'
                  ? t('builder.node.threshold')
                  : selectedNode.op === 'all'
                  ? t('builder.node.all')
                  : t('builder.node.any')
              )}
            </h3>
            <Popover.Close asChild>
              <button
                className="rounded p-1 text-text-muted hover:bg-surface-elevated hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Popover.Close>
          </div>

          {/* Signature Node Editor */}
          {selectedNode.kind === 'signature' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                  {t('builder.popover.selectRole')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {keyVariables.map((kv) => (
                    <button
                      key={kv.name}
                      onClick={() => handleRoleSelect(kv.name)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        selectedNode.roleId === kv.name
                          ? 'bg-btc-500 text-white'
                          : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                      )}
                    >
                      {kv.name}
                    </button>
                  ))}
                </div>
              </div>

              {showAddRole ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Name"
                    className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1 text-sm text-text-primary placeholder:text-text-muted focus:border-btc-500 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewRole()}
                  />
                  <button
                    onClick={handleAddNewRole}
                    className="rounded bg-btc-500 px-2 py-1 text-xs font-medium text-white hover:bg-btc-600"
                  >
                    {t('playground.keys.add')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddRole(true)}
                  className="flex items-center gap-1.5 text-xs text-btc-500 hover:text-btc-400"
                >
                  <Plus className="h-3 w-3" />
                  {t('builder.popover.addRole')}
                </button>
              )}
            </div>
          )}

          {/* Timelock Node Editor */}
          {selectedNode.kind === 'timelock' && selectedNode.mode === 'relative' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                  {t('builder.popover.blocks')}
                </label>
                <input
                  type="number"
                  value={selectedNode.value}
                  onChange={(e) => handleTimelockChange(parseInt(e.target.value) || 0)}
                  className="w-full rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-sm text-text-primary focus:border-btc-500 focus:outline-none"
                  min={1}
                />
                <p className="mt-1 text-xs text-text-muted">
                  {blocksToHumanTime(selectedNode.value)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                  {t('builder.popover.timePreset')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(TIMELOCK_PRESETS) as TimelockPresetKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleTimelockChange(TIMELOCK_PRESETS[key])}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs transition-colors',
                        selectedNode.value === TIMELOCK_PRESETS[key]
                          ? 'bg-btc-500 text-white'
                          : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Threshold Group Editor */}
          {selectedNode.kind === 'group' && selectedNode.op === 'threshold' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                  {t('builder.popover.threshold')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={selectedNode.threshold ?? 1}
                    onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 1)}
                    className="w-16 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-sm text-text-primary focus:border-btc-500 focus:outline-none"
                    min={1}
                    max={selectedNode.children.length}
                  />
                  <span className="text-sm text-text-muted">
                    / {selectedNode.children.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {t('builder.popover.thresholdHint')
                    .replace('{k}', String(selectedNode.threshold ?? 1))
                    .replace('{n}', String(selectedNode.children.length))}
                </p>
              </div>
            </div>
          )}

          {/* Group Add Child Actions */}
          {selectedNode.kind === 'group' && (
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                {t('builder.node.addChild')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddSignature(keyVariables[0]?.name || 'New')}
                  className="flex items-center gap-1.5 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-border-hover"
                >
                  <Key className="h-3 w-3" />
                  {t('builder.node.signature')}
                </button>
                <button
                  onClick={handleAddTimelock}
                  className="flex items-center gap-1.5 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-border-hover"
                >
                  <Clock className="h-3 w-3" />
                  {t('builder.node.timelock')}
                </button>
              </div>
            </div>
          )}

          {/* Delete Action */}
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              {t('builder.node.delete')}
            </button>
          </div>

          <Popover.Arrow className="fill-surface-card" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
