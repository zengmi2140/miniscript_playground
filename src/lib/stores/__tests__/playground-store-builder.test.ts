import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaygroundStore } from '../playground-store';
import { resetNodeIdCounter } from '@/lib/builder/templates';

describe('Playground Store - Builder', () => {
  beforeEach(() => {
    // Reset store and node counter before each test
    usePlaygroundStore.getState().reset();
    resetNodeIdCounter();
  });

  describe('loadScenario', () => {
    it('sets playgroundMode to scenario', () => {
      const store = usePlaygroundStore.getState();
      store.loadScenario('escrow-2of3');

      expect(usePlaygroundStore.getState().playgroundMode).toBe('scenario');
    });

    it('resets builder state when loading scenario', () => {
      const store = usePlaygroundStore.getState();

      // First enter build mode
      store.enterBuildMode();
      store.applyBuildStarter('single-control');
      expect(usePlaygroundStore.getState().strategyTree).not.toBeNull();

      // Then load a scenario
      store.loadScenario('escrow-2of3');

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

    it('clears policy, strategyTree, and keyVariables', () => {
      const store = usePlaygroundStore.getState();

      // Setup some existing state
      store.loadScenario('escrow-2of3');
      expect(usePlaygroundStore.getState().policy).not.toBe('');

      // Enter build mode
      store.enterBuildMode();

      const state = usePlaygroundStore.getState();
      expect(state.policy).toBe('');
      expect(state.strategyTree).toBeNull();
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
      store.loadScenario('escrow-2of3');
      expect(usePlaygroundStore.getState().activeScenarioId).toBe('escrow-2of3');

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

  describe('applyBuildStarter', () => {
    it('seeds policy for single-control', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('single-control');

      expect(usePlaygroundStore.getState().policy).toBe('pk(Alice)');
    });

    it('seeds keyVariables for single-control', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('single-control');

      const state = usePlaygroundStore.getState();
      expect(state.keyVariables).toHaveLength(1);
      expect(state.keyVariables[0].name).toBe('Alice');
    });

    it('seeds strategyTree for single-control', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('single-control');

      const state = usePlaygroundStore.getState();
      expect(state.strategyTree).not.toBeNull();
      expect(state.strategyTree?.kind).toBe('signature');
    });

    it('seeds policy for shared-control as multi()', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('shared-control');

      expect(usePlaygroundStore.getState().policy).toBe('multi(2,Alice,Bob,Charlie)');
    });

    it('seeds keyVariables for shared-control', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('shared-control');

      const state = usePlaygroundStore.getState();
      expect(state.keyVariables).toHaveLength(3);
      expect(state.keyVariables.map((k) => k.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('seeds policy for recovery', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('recovery');

      expect(usePlaygroundStore.getState().policy).toBe('and(pk(User),or(pk(Service),older(4320)))');
    });

    it('sets builderSyncState to synced', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.setBuilderSyncState('text-led');
      store.applyBuildStarter('single-control');

      expect(usePlaygroundStore.getState().builderSyncState).toBe('synced');
    });

    it('sets lastBuilderPolicySnapshot', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('single-control');

      expect(usePlaygroundStore.getState().lastBuilderPolicySnapshot).toBe('pk(Alice)');
    });
  });

  describe('updateStrategyTree', () => {
    it('updates tree and policy together', () => {
      const store = usePlaygroundStore.getState();
      store.enterBuildMode();
      store.applyBuildStarter('single-control');

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
      store.applyBuildStarter('single-control');

      store.updateStrategyTree({
        id: 'new',
        kind: 'signature',
        roleId: 'Charlie',
      });

      expect(usePlaygroundStore.getState().lastBuilderPolicySnapshot).toBe('pk(Charlie)');
    });
  });
});
