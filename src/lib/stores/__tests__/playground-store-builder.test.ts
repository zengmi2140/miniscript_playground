import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaygroundStore } from '../playground-store';
import { singleSigTemplate, sharedControlTemplate, resetNodeIdCounter } from '@/lib/builder/templates';
import { serializeStrategyTree } from '@/lib/builder/serialize';
import type { BuilderTemplate } from '@/lib/builder/types';

function seedBuilderFromFixture(template: BuilderTemplate) {
  const policy = serializeStrategyTree(template.tree);
  usePlaygroundStore.setState({
    strategyTree: template.tree,
    policy,
    keyVariables: template.keyVariables,
    builderSyncState: 'synced',
    lastBuilderPolicySnapshot: policy,
    selectedBuilderNodeId: null,
    operatorSwitchNodeId: null,
    builderBinaryTrimNotice: false,
  });
}

describe('Playground Store - Builder', () => {
  beforeEach(() => {
    // Reset store and node counter before each test
    usePlaygroundStore.getState().reset();
    resetNodeIdCounter();
  });

  describe('loadScenario', () => {
    it('sets playgroundMode to scenario', () => {
      const store = usePlaygroundStore.getState();
      store.loadScenario('multisig-2of3');

      expect(usePlaygroundStore.getState().playgroundMode).toBe('scenario');
    });

    it('resets builder state when loading scenario', () => {
      const store = usePlaygroundStore.getState();

      // First enter build mode
      store.enterBuildMode();
      seedBuilderFromFixture(singleSigTemplate());
      expect(usePlaygroundStore.getState().strategyTree).not.toBeNull();

      // Then load a scenario
      store.loadScenario('multisig-2of3');

      expect(usePlaygroundStore.getState().strategyTree).toBeNull();
      expect(usePlaygroundStore.getState().builderSyncState).toBe('synced');
    });
  });

  describe('enterBuildMode', () => {
    it('sets playgroundMode to build', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();

      expect(usePlaygroundStore.getState().playgroundMode).toBe('build');
    });

    it('clears policy and keyVariables; sets fresh root placeholder tree', () => {
      const store = usePlaygroundStore.getState();

      // Setup some existing state
      store.loadScenario('multisig-2of3');
      expect(usePlaygroundStore.getState().policy).not.toBe('');

      // Enter build mode
      store.enterBuildMode();

      const state = usePlaygroundStore.getState();
      expect(state.policy).toBe('');
      expect(state.strategyTree).toEqual({
        id: 'root_placeholder',
        kind: 'placeholder',
        placeholderType: 'root',
      });
      expect(state.keyVariables).toHaveLength(0);
    });

    it('clears path results', () => {
      const store = usePlaygroundStore.getState();
      store.setSpendingPaths([{ index: 0, label: 'test', conditions: [], witnessAsm: '', witnessSize: 0, isMalleable: false, satisfiable: true, missingConditions: [] }]);

      store.enterBuildMode();

      expect(usePlaygroundStore.getState().spendingPaths).toHaveLength(0);
    });

    it('clears activeScenarioId', () => {
      const store = usePlaygroundStore.getState();
      store.loadScenario('multisig-2of3');
      expect(usePlaygroundStore.getState().activeScenarioId).toBe('multisig-2of3');

      store.enterBuildMode();

      expect(usePlaygroundStore.getState().activeScenarioId).toBeNull();
    });

    it('resets simulation conditions', () => {
      const store = usePlaygroundStore.getState();
      store.setAvailableKeys(new Set(['Alice', 'Bob']));
      store.setCurrentTimeBlocks(1000);

      store.enterBuildMode();

      const state = usePlaygroundStore.getState();
      expect(state.availableKeys.size).toBe(0);
      expect(state.currentTimeBlocks).toBe(0);
    });
  });

  describe('updateStrategyTree', () => {
    it('updates tree and policy together', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(singleSigTemplate());

      // Update the tree to a different signature
      store.updateStrategyTree({
        id: 'new',
        kind: 'signature',
        roleId: 'Bob',
      });

      const state = usePlaygroundStore.getState();
      expect(state.policy).toBe('pk(Bob)');
      expect(state.strategyTree?.kind).toBe('signature');
      if (state.strategyTree?.kind === 'signature') {
        expect(state.strategyTree.roleId).toBe('Bob');
      }
    });

    it('updates lastBuilderPolicySnapshot', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(singleSigTemplate());

      store.updateStrategyTree({
        id: 'new',
        kind: 'signature',
        roleId: 'Charlie',
      });

      expect(usePlaygroundStore.getState().lastBuilderPolicySnapshot).toBe('pk(Charlie)');
    });

    it('sets builderSyncState to synced when seeding fixture after text-led', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.setBuilderSyncState('text-led');
      seedBuilderFromFixture(singleSigTemplate());

      expect(usePlaygroundStore.getState().builderSyncState).toBe('synced');
    });

    it('sets lastBuilderPolicySnapshot when seeding single-sig fixture', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(singleSigTemplate());

      expect(usePlaygroundStore.getState().lastBuilderPolicySnapshot).toBe('pk(Alice)');
    });
  });

  describe('operatorSwitchNodeId', () => {
    it('clears selectedBuilderNodeId when set to a group node id', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(sharedControlTemplate());
      const tree = usePlaygroundStore.getState().strategyTree;
      expect(tree?.kind).toBe('group');
      if (tree?.kind !== 'group') return;

      store.setSelectedBuilderNodeId('some-node');
      store.setOperatorSwitchNodeId(tree.id);

      const state = usePlaygroundStore.getState();
      expect(state.selectedBuilderNodeId).toBeNull();
      expect(state.operatorSwitchNodeId).toBe(tree.id);
    });

    it('clears operatorSwitchNodeId when selecting another builder node', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(sharedControlTemplate());
      const tree = usePlaygroundStore.getState().strategyTree;
      expect(tree?.kind).toBe('group');
      if (tree?.kind !== 'group') return;

      store.setOperatorSwitchNodeId(tree.id);
      store.setSelectedBuilderNodeId('sig-1');

      const state = usePlaygroundStore.getState();
      expect(state.operatorSwitchNodeId).toBeNull();
      expect(state.selectedBuilderNodeId).toBe('sig-1');
    });

    it('clears operatorSwitchNodeId after switchNodeOperator', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(sharedControlTemplate());
      const tree = usePlaygroundStore.getState().strategyTree;
      expect(tree?.kind).toBe('group');
      if (tree?.kind !== 'group') return;

      store.setOperatorSwitchNodeId(tree.id);
      store.switchNodeOperator(tree.id, 'all');

      expect(usePlaygroundStore.getState().operatorSwitchNodeId).toBeNull();
    });

    it('clears operatorSwitchNodeId when entering build mode', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      seedBuilderFromFixture(sharedControlTemplate());
      const tree = usePlaygroundStore.getState().strategyTree;
      expect(tree?.kind).toBe('group');
      if (tree?.kind !== 'group') return;

      store.setOperatorSwitchNodeId(tree.id);
      store.enterBuildMode();

      expect(usePlaygroundStore.getState().operatorSwitchNodeId).toBeNull();
    });
  });
});
