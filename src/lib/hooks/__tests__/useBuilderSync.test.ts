import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderSync } from '../useBuilderSync';
import { usePlaygroundStore } from '@/lib/stores/playground-store';

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
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetStrategyTree).not.toHaveBeenCalled();
    expect(mockSetBuilderSyncState).not.toHaveBeenCalled();
  });

  it('keeps synced state when policy is empty in build mode', () => {
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
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    // Should not change state when already synced
    expect(mockSetBuilderSyncState).not.toHaveBeenCalled();
  });

  it('sets compile-error state when there is a compilation error', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        playgroundMode: 'build',
        policy: 'pk(Alice',
        semanticTree: null,
        compilationError: { message: 'Syntax error' },
        lastBuilderPolicySnapshot: 'pk(Bob)',
        builderSyncState: 'synced',
        setStrategyTree: mockSetStrategyTree,
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    expect(mockSetBuilderSyncState).toHaveBeenCalledWith('compile-error');
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
        setBuilderSyncState: mockSetBuilderSyncState,
        setLastBuilderPolicySnapshot: mockSetLastBuilderPolicySnapshot,
      };
      return selector(state);
    });

    renderHook(() => useBuilderSync());

    // Should not attempt import when policy matches snapshot
    expect(mockSetStrategyTree).not.toHaveBeenCalled();
  });
});
