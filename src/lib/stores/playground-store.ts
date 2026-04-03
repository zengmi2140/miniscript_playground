import { create } from 'zustand';
import type {
  CompilationResult,
  FriendlyError,
  KeyVariable,
  MiniscriptNode,
  Network,
  PlaygroundMode,
  PlaygroundState,
  ResultTab,
  ScriptContext,
  SpendingPath,
} from '@/lib/engine/types';
import type { Scenario } from '@/lib/engine/types';
import { SCENARIOS } from '@/lib/scenarios/data';
import type { BuilderSyncState, BuildStarterId, StrategyNode, StrategyPlaceholderNode } from '@/lib/builder/types';
import { getTemplate } from '@/lib/builder/templates';
import { serializeStrategyTree } from '@/lib/builder/serialize';
import { changeGroupOp, wrapNodeInGroup, computeTreeDepth, findNode } from '@/lib/builder/node-ops';

interface PlaygroundActions {
  setPlaygroundMode: (mode: PlaygroundMode) => void;
  setPolicy: (policy: string) => void;
  setContext: (context: ScriptContext) => void;
  setNetwork: (network: Network) => void;
  setKeyVariables: (keyVariables: KeyVariable[]) => void;
  addKeyVariable: (kv: KeyVariable) => void;
  removeKeyVariable: (name: string) => void;
  updateKeyVariable: (name: string, updates: Partial<KeyVariable>) => void;

  setCompilationResult: (result: CompilationResult | null) => void;
  setCompilationError: (error: FriendlyError | null) => void;
  setSemanticTree: (tree: MiniscriptNode | null) => void;
  setSpendingPaths: (paths: SpendingPath[]) => void;

  toggleKey: (keyName: string) => void;
  toggleHash: (hash: string) => void;
  setCurrentTimeBlocks: (blocks: number) => void;
  setAvailableKeys: (keys: Set<string>) => void;
  setAvailableHashes: (hashes: Set<string>) => void;

  setSelectedPathIndex: (index: number | null) => void;
  setActiveResultTab: (tab: ResultTab) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;

  loadScenario: (scenarioId: string) => void;
  restoreSession: (payload: { policy: string; keyVariables: KeyVariable[]; context: ScriptContext; network: Network; playgroundMode?: PlaygroundMode }) => void;
  reset: () => void;

  // Builder actions
  setStrategyTree: (tree: StrategyNode | null) => void;
  setBuilderSyncState: (state: BuilderSyncState) => void;
  setSelectedBuilderNodeId: (id: string | null) => void;
  setOperatorSwitchNodeId: (id: string | null) => void;
  setLastBuilderPolicySnapshot: (policy: string | null) => void;
  enterBuildMode: () => void;
  applyBuildStarter: (starterId: BuildStarterId) => void;
  updateStrategyTree: (tree: StrategyNode) => void;
  switchNodeOperator: (nodeId: string, newOp: 'all' | 'any' | 'threshold', newThreshold?: number) => void;
  wrapNode: (nodeId: string, wrapperOp: 'all' | 'any' | 'threshold', wrapperThreshold?: number) => void;
  clearDepthWarning: () => void;
  clearBinaryTrimNotice: () => void;
}

interface BuilderState {
  strategyTree: StrategyNode | null;
  builderSyncState: BuilderSyncState;
  selectedBuilderNodeId: string | null;
  /** Group node id whose operator switch panel is open (top-right of canvas). */
  operatorSwitchNodeId: string | null;
  lastBuilderPolicySnapshot: string | null;
  builderDepthWarning: boolean;
  /** Shown when switching to AND/OR dropped children beyond the binary limit. */
  builderBinaryTrimNotice: boolean;
}

export type PlaygroundStore = PlaygroundState & BuilderState & PlaygroundActions;

const initialBuilderState: BuilderState = {
  strategyTree: null,
  builderSyncState: 'synced',
  selectedBuilderNodeId: null,
  operatorSwitchNodeId: null,
  lastBuilderPolicySnapshot: null,
  builderDepthWarning: false,
  builderBinaryTrimNotice: false,
};

const initialState: PlaygroundState & BuilderState = {
  playgroundMode: 'scenario',
  policy: '',
  context: 'wsh',
  network: 'testnet',
  keyVariables: [],
  activeScenarioId: null,

  compilationResult: null,
  compilationError: null,
  semanticTree: null,

  spendingPaths: [],

  availableKeys: new Set<string>(),
  availableHashes: new Set<string>(),
  currentTimeBlocks: 0,

  selectedPathIndex: null,
  activeResultTab: 'paths',
  isLeftPanelOpen: true,
  isRightPanelOpen: true,

  ...initialBuilderState,
};

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
  ...initialState,

  setPlaygroundMode: (playgroundMode) => set({ playgroundMode }),
  setPolicy: (policy) => set({ policy }),
  setContext: (context) => set({ context }),
  setNetwork: (network) => set({ network }),
  setKeyVariables: (keyVariables) => set({ keyVariables }),

  addKeyVariable: (kv) =>
    set((state) => ({
      keyVariables: [...state.keyVariables, kv],
    })),

  removeKeyVariable: (name) =>
    set((state) => ({
      keyVariables: state.keyVariables.filter((k) => k.name !== name),
    })),

  updateKeyVariable: (name, updates) =>
    set((state) => ({
      keyVariables: state.keyVariables.map((k) =>
        k.name === name ? { ...k, ...updates } : k,
      ),
    })),

  setCompilationResult: (compilationResult) => set({ compilationResult }),
  setCompilationError: (compilationError) => set({ compilationError }),
  setSemanticTree: (semanticTree) => set({ semanticTree }),
  setSpendingPaths: (spendingPaths) => set({ spendingPaths }),

  toggleKey: (keyName) =>
    set((state) => {
      const next = new Set(state.availableKeys);
      if (next.has(keyName)) {
        next.delete(keyName);
      } else {
        next.add(keyName);
      }
      return { availableKeys: next };
    }),

  toggleHash: (hash) =>
    set((state) => {
      const next = new Set(state.availableHashes);
      if (next.has(hash)) {
        next.delete(hash);
      } else {
        next.add(hash);
      }
      return { availableHashes: next };
    }),

  setCurrentTimeBlocks: (currentTimeBlocks) => set({ currentTimeBlocks }),
  setAvailableKeys: (availableKeys) => set({ availableKeys }),
  setAvailableHashes: (availableHashes) => set({ availableHashes }),

  setSelectedPathIndex: (selectedPathIndex) => set({ selectedPathIndex }),
  setActiveResultTab: (activeResultTab) => set({ activeResultTab }),
  setLeftPanelOpen: (isLeftPanelOpen) => set({ isLeftPanelOpen }),
  setRightPanelOpen: (isRightPanelOpen) => set({ isRightPanelOpen }),

  loadScenario: (scenarioId) => {
    const scenario = SCENARIOS.find((s: Scenario) => s.id === scenarioId);
    if (!scenario) return;

    set({
      playgroundMode: 'scenario',
      policy: scenario.policy,
      context: scenario.context,
      keyVariables: [...scenario.keyVariables],
      activeScenarioId: scenario.id,
      availableKeys: new Set<string>(),
      availableHashes: new Set<string>(),
      currentTimeBlocks: 0,
      compilationResult: null,
      compilationError: null,
      semanticTree: null,
      spendingPaths: [],
      selectedPathIndex: null,
      activeResultTab: 'paths',
      // Reset builder state when loading scenario
      strategyTree: null,
      builderSyncState: 'synced',
      selectedBuilderNodeId: null,
      operatorSwitchNodeId: null,
      lastBuilderPolicySnapshot: null,
    });
  },

  restoreSession: (payload) => {
    set({
      playgroundMode: payload.playgroundMode ?? 'scenario',
      policy: payload.policy,
      context: payload.context,
      network: payload.network,
      keyVariables: [...payload.keyVariables],
      activeScenarioId: null,
      compilationResult: null,
      compilationError: null,
      semanticTree: null,
      spendingPaths: [],
      availableKeys: new Set<string>(),
      availableHashes: new Set<string>(),
      currentTimeBlocks: 0,
      selectedPathIndex: null,
      activeResultTab: 'paths',
      // Reset builder state - will be rehydrated from policy via useBuilderSync
      strategyTree: null,
      builderSyncState: 'synced',
      selectedBuilderNodeId: null,
      operatorSwitchNodeId: null,
      lastBuilderPolicySnapshot: null,
    });
  },

  reset: () => set(initialState),

  // Builder actions
  setStrategyTree: (strategyTree) => set({ strategyTree }),
  setBuilderSyncState: (builderSyncState) => set({ builderSyncState }),
  setSelectedBuilderNodeId: (selectedBuilderNodeId) =>
    set({
      selectedBuilderNodeId,
      ...(selectedBuilderNodeId !== null ? { operatorSwitchNodeId: null } : {}),
    }),
  setOperatorSwitchNodeId: (operatorSwitchNodeId) =>
    set({
      operatorSwitchNodeId,
      ...(operatorSwitchNodeId !== null ? { selectedBuilderNodeId: null } : {}),
    }),
  setLastBuilderPolicySnapshot: (lastBuilderPolicySnapshot) => set({ lastBuilderPolicySnapshot }),

  enterBuildMode: () => {
    // Create initial placeholder root node
    const initialTree: StrategyNode = {
      id: 'root_placeholder',
      kind: 'placeholder',
      placeholderType: 'root',
    };

    set({
      playgroundMode: 'build',
      activeScenarioId: null,
      policy: '',
      strategyTree: initialTree,
      keyVariables: [],
      compilationResult: null,
      compilationError: null,
      semanticTree: null,
      spendingPaths: [],
      availableKeys: new Set<string>(),
      availableHashes: new Set<string>(),
      currentTimeBlocks: 0,
      selectedPathIndex: null,
      selectedBuilderNodeId: null,
      operatorSwitchNodeId: null,
      builderSyncState: 'synced',
      lastBuilderPolicySnapshot: null,
      builderBinaryTrimNotice: false,
    });
  },

  applyBuildStarter: (starterId) => {
    const template = getTemplate(starterId);
    const policy = serializeStrategyTree(template.tree);

    set({
      strategyTree: template.tree,
      policy,
      keyVariables: template.keyVariables,
      builderSyncState: 'synced',
      lastBuilderPolicySnapshot: policy,
      selectedBuilderNodeId: null,
      operatorSwitchNodeId: null,
      builderBinaryTrimNotice: false,
    });
  },

  updateStrategyTree: (tree) => {
    const policy = serializeStrategyTree(tree);
    set({
      strategyTree: tree,
      policy,
      lastBuilderPolicySnapshot: policy,
    });
  },

  switchNodeOperator: (nodeId, newOp, newThreshold) => {
    set((state) => {
      if (!state.strategyTree) return {};
      const before = findNode(state.strategyTree, nodeId);
      const newTree = changeGroupOp(state.strategyTree, nodeId, newOp, newThreshold);
      const policy = serializeStrategyTree(newTree);
      const trimmed =
        before?.kind === 'group' &&
        before.children.length > 2 &&
        (newOp === 'all' || newOp === 'any');
      return {
        strategyTree: newTree,
        policy,
        lastBuilderPolicySnapshot: policy,
        selectedBuilderNodeId: null,
        operatorSwitchNodeId: null,
        builderBinaryTrimNotice: trimmed,
      };
    });
  },

  wrapNode: (nodeId, wrapperOp, wrapperThreshold) => {
    set((state) => {
      if (!state.strategyTree) return {};
      const newTree = wrapNodeInGroup(state.strategyTree, nodeId, wrapperOp, wrapperThreshold);
      const depth = computeTreeDepth(newTree);
      const policy = serializeStrategyTree(newTree);
      return {
        strategyTree: newTree,
        policy,
        lastBuilderPolicySnapshot: policy,
        selectedBuilderNodeId: null,
        operatorSwitchNodeId: null,
        builderDepthWarning: depth > 5,
      };
    });
  },

  clearDepthWarning: () => set({ builderDepthWarning: false }),
  clearBinaryTrimNotice: () => set({ builderBinaryTrimNotice: false }),
}));
