import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBuilderSync } from '../useBuilderSync';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { createRootPlaceholderTree } from '@/lib/builder/root-placeholder';

// Mock the store
vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: vi.fn(),
}));

// Mock from-semantic-tree
vi.mock('@/lib/builder/from-semantic-tree', () => ({
  importFromSemanticTree: vi.fn(),
}));

describe('useBuilderSync', () => {
  const mockSetStrategyTree = vi.fn();
  const mockUpdateStrategyTree = vi.fn();
  const mockSetBuilderSyncState = vi.fn();
  const mockSetLastBuilderPolicySnapshot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when not in build mode', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'scenario',
        policy: 'pk(Alice)',
        semanticTree: null,
        compilationError: null,
        lastBuilderPolicySnapshot: null,
        builderSyncState: 'synced',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetStrategyTree).not.toHaveBeenCalled();
    expect(mockSetBuilderSyncState).not.toHaveBeenCalled();
  });

  it('does not reset when policy and snapshot are both empty (empty and/or serializes to "")', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: '',
        semanticTree: null,
        compilationError: null,
        lastBuilderPolicySnapshot: '',
        builderSyncState: 'synced',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetStrategyTree).not.toHaveBeenCalled();
    expect(mockSetLastBuilderPolicySnapshot).not.toHaveBeenCalled();
  });

  it('resets to root placeholder tree and clears snapshot when policy is empty in build mode', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: '',
        semanticTree: null,
        compilationError: null,
        lastBuilderPolicySnapshot: null,
        builderSyncState: 'synced',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetStrategyTree).toHaveBeenCalledWith(createRootPlaceholderTree());
    expect(mockSetLastBuilderPolicySnapshot).toHaveBeenCalledWith(null);
    expect(mockSetBuilderSyncState).not.toHaveBeenCalled();
  });

  it('sets compile-error and seeds root placeholder when strategyTree is null', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn> & {
      getState: () => { strategyTree: ReturnType<typeof createRootPlaceholderTree> | null };
    };
    const state = {
      playgroundMode: 'build',
      policy: 'pk(Alice',
      semanticTree: null,
      compilationError: {
        raw: 'Syntax error',
        category: 'syntax' as const,
        friendly: { zh: '语法错误', en: 'Syntax error' },
      },
      lastBuilderPolicySnapshot: 'pk(Bob)',
      builderSyncState: 'synced',
      strategyTree: null as ReturnType<typeof createRootPlaceholderTree> | null,
      setStrategyTree: mockSetStrategyTree,
      updateStrategyTree: mockUpdateStrategyTree,
      setBuilderSyncState: mockSetBuilderSyncState,
      setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
    };
    mockUsePlaygroundStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector(state),
    );
    mockUsePlaygroundStore.getState = () => ({ strategyTree: state.strategyTree });

    renderHook(() => useBuilderSync());

    expect(mockSetBuilderSyncState).toHaveBeenCalledWith('compile-error');
    expect(mockSetStrategyTree).toHaveBeenCalledWith(createRootPlaceholderTree());
  });

  it('sets compile-error but does not replace strategyTree when one already exists', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn> & {
      getState: () => { strategyTree: ReturnType<typeof createRootPlaceholderTree> | null };
    };
    const existingTree = createRootPlaceholderTree();
    const state = {
      playgroundMode: 'build',
      policy: 'pk(Alice',
      semanticTree: null,
      compilationError: {
        raw: 'Syntax error',
        category: 'syntax' as const,
        friendly: { zh: '语法错误', en: 'Syntax error' },
      },
      lastBuilderPolicySnapshot: 'pk(Bob)',
      builderSyncState: 'synced',
      strategyTree: existingTree,
      setStrategyTree: mockSetStrategyTree,
      updateStrategyTree: mockUpdateStrategyTree,
      setBuilderSyncState: mockSetBuilderSyncState,
      setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
    };
    mockUsePlaygroundStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) =>
      selector(state),
    );
    mockUsePlaygroundStore.getState = () => ({ strategyTree: state.strategyTree });

    renderHook(() => useBuilderSync());

    expect(mockSetBuilderSyncState).toHaveBeenCalledWith('compile-error');
    expect(mockSetStrategyTree).not.toHaveBeenCalled();
  });

  it('does not reverse sync when policy matches snapshot', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: 'pk(Alice)',
        semanticTree: { type: 'pk', name: 'Alice' },
        compilationError: null,
        lastBuilderPolicySnapshot: 'pk(Alice)',
        builderSyncState: 'synced',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    // Should not attempt import when policy matches snapshot
    expect(mockSetStrategyTree).not.toHaveBeenCalled();
    expect(mockUpdateStrategyTree).not.toHaveBeenCalled();
  });

  it('recovers from compile-error to synced when policy === snapshot and no compile error (P1-04)', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: 'pk(Alice)',
        semanticTree: { type: 'pk', name: 'Alice' },
        compilationError: null,
        lastBuilderPolicySnapshot: 'pk(Alice)',
        builderSyncState: 'compile-error',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetBuilderSyncState).toHaveBeenCalledWith('synced');
    expect(mockSetStrategyTree).not.toHaveBeenCalled();
    expect(mockUpdateStrategyTree).not.toHaveBeenCalled();
  });

  it('recovers from text-led to synced when policy === snapshot (P1-04)', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: 'pk(Alice)',
        semanticTree: { type: 'pk', name: 'Alice' },
        compilationError: null,
        lastBuilderPolicySnapshot: 'pk(Alice)',
        builderSyncState: 'text-led',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetBuilderSyncState).toHaveBeenCalledWith('synced');
  });

  it('does not flip to synced when there is still a compilation error (P1-04 guard)', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: 'pk(Alice)',
        semanticTree: null,
        compilationError: {
          raw: 'Syntax error',
          category: 'syntax' as const,
          friendly: { zh: '语法错误', en: 'Syntax error' },
        },
        lastBuilderPolicySnapshot: 'pk(Alice)',
        builderSyncState: 'compile-error',
        setStrategyTree: mockSetStrategyTree,
        updateStrategyTree: mockUpdateStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetBuilderSyncState).not.toHaveBeenCalledWith('synced');
  });
});
