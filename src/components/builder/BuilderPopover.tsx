'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { X, Plus, Trash2, Key, Clock, Users, AlertTriangle, Layers } from 'lucide-react';
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
  addChildNode,
  canAddChildToBinaryGroup,
  convertRootPlaceholder,
  convertChildPlaceholder,
  createDefaultKeyVariables,
  createSignatureNode,
  createTimelockNode,
  collectRoleIds,
} from '@/lib/builder/node-ops';
import { TIMELOCK_PRESETS, blocksToHumanTime, type TimelockPresetKey } from '@/lib/builder/types';
import type { StrategyNode } from '@/lib/builder/types';
import { createNextKeyVariable } from '@/lib/playground/add-next-key-variable';
import { AddChildOptions } from './AddChildOptions';

type PopoverMode = 'root-type-select' | 'add-child' | 'edit-signature' | 'edit-timelock' | 'edit-threshold' | 'edit-group' | 'confirm-delete';

export function BuilderPopover() {
  const { t } = useI18n();
  const strategyTree = usePlaygroundStore((s) => s.strategyTree);
  const selectedBuilderNodeId = usePlaygroundStore((s) => s.selectedBuilderNodeId);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const updateStrategyTree = usePlaygroundStore((s) => s.updateStrategyTree);
  const addKeyVariable = usePlaygroundStore((s) => s.addKeyVariable);
  const setKeyVariables = usePlaygroundStore((s) => s.setKeyVariables);
  const wrapNode = usePlaygroundStore((s) => s.wrapNode);

  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<string | null>(null);

  // Parse the selected node ID - could be a regular ID or "add_child:{parentId}"
  const { isAddChildMode, targetNodeId, parentIdForAdd } = useMemo(() => {
    if (!selectedBuilderNodeId) {
      return { isAddChildMode: false, targetNodeId: null, parentIdForAdd: null };
    }
    if (selectedBuilderNodeId.startsWith('add_child:')) {
      const parentId = selectedBuilderNodeId.replace('add_child:', '');
      return { isAddChildMode: true, targetNodeId: null, parentIdForAdd: parentId };
    }
    return { isAddChildMode: false, targetNodeId: selectedBuilderNodeId, parentIdForAdd: null };
  }, [selectedBuilderNodeId]);

  const selectedNode = useMemo(() => {
    if (!strategyTree || !targetNodeId) return null;
    return findNode(strategyTree, targetNodeId);
  }, [strategyTree, targetNodeId]);

  // Determine popover mode
  const mode: PopoverMode | null = useMemo(() => {
    if (confirmDeleteTarget) return 'confirm-delete';
    if (isAddChildMode) return 'add-child';
    if (!selectedNode) return null;
    
    if (selectedNode.kind === 'placeholder' && selectedNode.placeholderType === 'root') {
      return 'root-type-select';
    }
    if (selectedNode.kind === 'placeholder' && selectedNode.placeholderType === 'child') {
      return 'add-child';
    }
    if (selectedNode.kind === 'signature') return 'edit-signature';
    if (selectedNode.kind === 'timelock') return 'edit-timelock';
    if (selectedNode.kind === 'group') {
      if (selectedNode.op === 'threshold') return 'edit-threshold';
      return 'edit-group';
    }
    return null;
  }, [selectedNode, isAddChildMode, confirmDeleteTarget]);

  const handleClose = useCallback(() => {
    setSelectedBuilderNodeId(null);
    setConfirmDeleteTarget(null);
  }, [setSelectedBuilderNodeId]);

  // ============ Root Type Selection ============
  const handleSelectRootType = useCallback(
    (type: 'signature' | 'all' | 'any' | 'threshold') => {
      if (!strategyTree) return;

      if (type === 'signature') {
        // Create default key variables
        const defaultKeys = createDefaultKeyVariables(1);
        setKeyVariables(defaultKeys);
        const newTree = convertRootPlaceholder(strategyTree, 'signature', { roleId: defaultKeys[0].policyName });
        updateStrategyTree(newTree);
      } else {
        // Group type
        const op = type;
        const initialChildCount = op === 'threshold' ? 3 : 0;
        
        // Create default key variables for threshold
        if (op === 'threshold') {
          const defaultKeys = createDefaultKeyVariables(3);
          setKeyVariables(defaultKeys);
          
          // Create threshold group with signature children
          const newTree: StrategyNode = {
            id: 'root_group',
            kind: 'group',
            op: 'threshold',
            threshold: 2,
            children: defaultKeys.map((kv, i) => ({
              id: `sig_${i}`,
              kind: 'signature' as const,
              roleId: kv.policyName,
            })),
          };
          updateStrategyTree(newTree);
        } else {
          // For all/any, start with empty group
          const newTree = convertRootPlaceholder(strategyTree, 'group', { groupOp: op, initialChildCount: 0 });
          updateStrategyTree(newTree);
        }
      }
      handleClose();
    },
    [strategyTree, updateStrategyTree, setKeyVariables, handleClose]
  );

  // ============ Add Child ============
  const handleAddChildType = useCallback(
    (type: 'signature' | 'timelock' | 'group', groupOp?: 'all' | 'any' | 'threshold') => {
      if (!strategyTree) return;

      const replacePlaceholder =
        !isAddChildMode &&
        targetNodeId &&
        selectedNode?.kind === 'placeholder' &&
        selectedNode.placeholderType === 'child';

      if (replacePlaceholder) {
        let newTree: StrategyNode;
        if (type === 'signature') {
          const usedRoles = collectRoleIds(strategyTree);
          const unusedKv = keyVariables.find(kv => !usedRoles.has(kv.policyName));
          let roleId: string;
          if (unusedKv) {
            roleId = unusedKv.policyName;
          } else {
            const newKey = createNextKeyVariable(keyVariables);
            addKeyVariable(newKey);
            roleId = newKey.policyName;
          }
          newTree = convertChildPlaceholder(strategyTree, targetNodeId, 'signature', { roleId });
        } else if (type === 'timelock') {
          newTree = convertChildPlaceholder(strategyTree, targetNodeId, 'timelock', { timelockBlocks: 4320 });
        } else {
          newTree = convertChildPlaceholder(strategyTree, targetNodeId, 'group', {
            groupOp: groupOp || 'all',
          });
        }
        updateStrategyTree(newTree);
        handleClose();
        return;
      }

      if (!parentIdForAdd) return;

      const parentForAdd = findNode(strategyTree, parentIdForAdd);
      if (
        parentForAdd?.kind === 'group' &&
        !canAddChildToBinaryGroup(parentForAdd)
      ) {
        handleClose();
        return;
      }

      let newTree: StrategyNode;
      if (type === 'signature') {
        const usedRoles = collectRoleIds(strategyTree);
        const unusedKv = keyVariables.find(kv => !usedRoles.has(kv.policyName));
        let roleId: string;
        if (unusedKv) {
          roleId = unusedKv.policyName;
        } else {
          const newKey = createNextKeyVariable(keyVariables);
          addKeyVariable(newKey);
          roleId = newKey.policyName;
        }
        newTree = addSignatureChild(strategyTree, parentIdForAdd, roleId);
      } else if (type === 'timelock') {
        newTree = addTimelockChild(strategyTree, parentIdForAdd, 4320);
      } else {
        const childGroup: StrategyNode = {
          id: `nested_${Date.now()}`,
          kind: 'group',
          op: groupOp || 'all',
          threshold: groupOp === 'threshold' ? 2 : undefined,
          children: [],
        };
        newTree = addChildNode(strategyTree, parentIdForAdd, childGroup);
      }

      updateStrategyTree(newTree);
      handleClose();
    },
    [
      strategyTree,
      parentIdForAdd,
      isAddChildMode,
      targetNodeId,
      selectedNode,
      keyVariables,
      addKeyVariable,
      updateStrategyTree,
      handleClose,
    ]
  );

  // ============ Edit Signature ============
  const handleRoleSelect = useCallback(
    (roleId: string) => {
      if (!strategyTree || !targetNodeId) return;
      const newTree = updateSignatureRole(strategyTree, targetNodeId, roleId);
      updateStrategyTree(newTree);
    },
    [strategyTree, targetNodeId, updateStrategyTree]
  );

  const handleQuickAddRole = useCallback(() => {
    const kv = createNextKeyVariable(keyVariables);
    addKeyVariable(kv);
    if (selectedNode?.kind === 'signature' && strategyTree && targetNodeId) {
      const newTree = updateSignatureRole(strategyTree, targetNodeId, kv.policyName);
      updateStrategyTree(newTree);
    }
  }, [
    keyVariables,
    addKeyVariable,
    selectedNode,
    strategyTree,
    targetNodeId,
    updateStrategyTree,
  ]);

  // ============ Edit Timelock ============
  const handleTimelockChange = useCallback(
    (value: number) => {
      if (!strategyTree || !targetNodeId) return;
      const newTree = updateTimelockValue(strategyTree, targetNodeId, value);
      updateStrategyTree(newTree);
    },
    [strategyTree, targetNodeId, updateStrategyTree]
  );

  // ============ Edit Threshold ============
  const handleThresholdChange = useCallback(
    (k: number) => {
      if (!strategyTree || !targetNodeId) return;
      const newTree = updateThreshold(strategyTree, targetNodeId, k);
      updateStrategyTree(newTree);
    },
    [strategyTree, targetNodeId, updateStrategyTree]
  );

  // ============ Wrap ============
  const handleWrap = useCallback(
    (wrapperOp: 'all' | 'any' | 'threshold') => {
      if (!targetNodeId) return;
      wrapNode(targetNodeId, wrapperOp);
      handleClose();
    },
    [targetNodeId, wrapNode, handleClose]
  );

  // ============ Delete ============
  const handleDeleteRequest = useCallback((nodeId: string) => {
    // Check if this is the root node
    if (strategyTree?.id === nodeId) {
      setConfirmDeleteTarget(nodeId);
    } else {
      // Direct delete for non-root nodes
      if (!strategyTree) return;
      const newTree = removeNode(strategyTree, nodeId);
      if (newTree) {
        updateStrategyTree(newTree);
      }
      handleClose();
    }
  }, [strategyTree, updateStrategyTree, handleClose]);

  const handleConfirmDelete = useCallback(() => {
    // Reset to initial placeholder state
    const initialTree: StrategyNode = {
      id: 'root_placeholder',
      kind: 'placeholder',
      placeholderType: 'root',
    };
    updateStrategyTree(initialTree);
    setKeyVariables([]);
    handleClose();
  }, [updateStrategyTree, setKeyVariables, handleClose]);

  // Close on outside click
  useEffect(() => {
    if (!selectedBuilderNodeId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-builder-popover]')) return;
      if (target.closest('.react-flow__node')) return;
      handleClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedBuilderNodeId, handleClose]);

  if (!mode) return null;

  // Reusable wrap section rendered at bottom of leaf and group popovers
  function WrapSection() {
    return (
      <div className="mt-3 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-xs font-medium text-text-muted">
            {t('builder.wrap.title') || '组合成组'}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleWrap('all')}
            className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-btc-500 hover:text-btc-500 transition-colors"
          >
            {t('builder.op.all.label')}
          </button>
          <button
            onClick={() => handleWrap('any')}
            className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-btc-500 hover:text-btc-500 transition-colors"
          >
            {t('builder.op.any.label')}
          </button>
          <button
            onClick={() => handleWrap('threshold')}
            className="flex-1 rounded border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs text-text-secondary hover:border-btc-500 hover:text-btc-500 transition-colors"
          >
            {t('builder.op.threshold.label')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-builder-popover
      className="absolute right-4 top-4 z-50 w-72 rounded-lg border border-border-subtle bg-surface-card p-4 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {mode === 'root-type-select' && (t('builder.starter.title') || '选择策略类型')}
          {mode === 'add-child' && (t('builder.node.addChild') || '添加条件')}
          {mode === 'edit-signature' && t('builder.node.signature')}
          {mode === 'edit-timelock' && t('builder.node.timelock')}
          {mode === 'edit-threshold' && t('builder.node.threshold')}
          {mode === 'edit-group' && (selectedNode?.kind === 'group' && selectedNode.op === 'all' ? t('builder.node.all') : t('builder.node.any'))}
          {mode === 'confirm-delete' && (t('builder.confirm.title') || '确认删除')}
        </h3>
        <button
          onClick={handleClose}
          className="rounded p-1 text-text-muted hover:bg-surface-elevated hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Root Type Selection */}
      {mode === 'root-type-select' && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted mb-3">{t('builder.starter.subtitle') || '从一个常见模式开始'}</p>
          <button
            onClick={() => handleSelectRootType('signature')}
            className="w-full flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 text-left hover:border-btc-500 hover:bg-btc-500/10 transition-all"
          >
            <Key className="h-5 w-5 text-btc-500" />
            <div>
              <p className="text-sm font-medium text-text-primary">{t('builder.starter.singleControl') || '单签名'}</p>
              <p className="text-xs text-text-muted">{t('builder.starter.singleControlDesc') || '单个密钥签名'}</p>
            </div>
          </button>
          <button
            onClick={() => handleSelectRootType('threshold')}
            className="w-full flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 text-left hover:border-btc-500 hover:bg-btc-500/10 transition-all"
          >
            <Users className="h-5 w-5 text-btc-500" />
            <div>
              <p className="text-sm font-medium text-text-primary">{t('builder.starter.sharedControl') || '阈值条件'}</p>
              <p className="text-xs text-text-muted">{t('builder.starter.sharedControlDesc') || 'k-of-n 门限条件'}</p>
            </div>
          </button>
          <button
            onClick={() => handleSelectRootType('all')}
            className="w-full flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 text-left hover:border-btc-500 hover:bg-btc-500/10 transition-all"
          >
            <div className="flex h-5 w-5 items-center justify-center text-btc-500 font-bold text-xs">&amp;</div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t('builder.node.all') || '都需要'}</p>
              <p className="text-xs text-text-muted">{t('builder.op.all.desc')}</p>
            </div>
          </button>
          <button
            onClick={() => handleSelectRootType('any')}
            className="w-full flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 text-left hover:border-btc-500 hover:bg-btc-500/10 transition-all"
          >
            <div className="flex h-5 w-5 items-center justify-center text-btc-500 font-bold text-xs">|</div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t('builder.node.any') || '二选一'}</p>
              <p className="text-xs text-text-muted">{t('builder.op.any.desc')}</p>
            </div>
          </button>
        </div>
      )}

      {/* Add Child */}
      {mode === 'add-child' && <AddChildOptions onPick={handleAddChildType} />}

      {/* Edit Signature */}
      {mode === 'edit-signature' && selectedNode?.kind === 'signature' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              {t('builder.popover.selectRole')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {keyVariables.map((kv) => (
                <button
                  key={kv.policyName}
                  onClick={() => handleRoleSelect(kv.policyName)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    selectedNode.roleId === kv.policyName
                      ? 'bg-btc-500 text-white'
                      : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                  )}
                >
                  {kv.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAddRole}
            className="flex items-center gap-1.5 text-xs text-btc-500 hover:text-btc-400"
          >
            <Plus className="h-3 w-3" />
            {t('builder.popover.addRole')}
          </button>

          <WrapSection />

          <div className="mt-3 pt-3 border-t border-border-subtle">
            <button
              onClick={() => handleDeleteRequest(targetNodeId!)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              {t('builder.node.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Timelock */}
      {mode === 'edit-timelock' && selectedNode?.kind === 'timelock' && (
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

          <WrapSection />

          <div className="mt-3 pt-3 border-t border-border-subtle">
            <button
              onClick={() => handleDeleteRequest(targetNodeId!)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              {t('builder.node.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Threshold */}
      {mode === 'edit-threshold' && selectedNode?.kind === 'group' && selectedNode.op === 'threshold' && (
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
                max={selectedNode.children.filter(c => c.kind !== 'placeholder').length || 1}
              />
              <span className="text-sm text-text-muted">
                / {selectedNode.children.filter(c => c.kind !== 'placeholder').length}
              </span>
            </div>
          </div>

          <WrapSection />

          <div className="mt-3 pt-3 border-t border-border-subtle">
            <button
              onClick={() => handleDeleteRequest(targetNodeId!)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              {t('builder.node.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Group (all/any) */}
      {mode === 'edit-group' && selectedNode?.kind === 'group' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">
            {selectedNode.op === 'all' ? t('builder.popover.editGroupAll') : t('builder.popover.editGroupAny')}
          </p>

          <WrapSection />

          <div className="mt-3 pt-3 border-t border-border-subtle">
            <button
              onClick={() => handleDeleteRequest(targetNodeId!)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              {t('builder.node.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {mode === 'confirm-delete' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              {t('builder.confirm.deleteRoot')}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setConfirmDeleteTarget(null)}
              className="flex-1 rounded border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-elevated/80"
            >
              {t('builder.confirm.cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              {t('builder.confirm.confirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
