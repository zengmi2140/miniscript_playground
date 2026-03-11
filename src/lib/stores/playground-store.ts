import { create } from 'zustand';
import type {
  CompilationResult,
  FriendlyError,
  KeyVariable,
  MiniscriptNode,
  Network,
  PlaygroundState,
  ResultTab,
  ScriptContext,
  SpendingPath,
} from '@/lib/engine/types';
import type { Scenario } from '@/lib/engine/types';
import { SCENARIOS } from '@/lib/scenarios/data';

interface PlaygroundActions {
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
  reset: () => void;
}

export type PlaygroundStore = PlaygroundState & PlaygroundActions;

const initialState: PlaygroundState = {
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
};

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
  ...initialState,

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
    });
  },

  reset: () => set(initialState),
}));
