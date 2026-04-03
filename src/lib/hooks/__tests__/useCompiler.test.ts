import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCompiler } from '../useCompiler';
import { usePlaygroundStore } from '@/lib/stores/playground-store';

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: vi.fn(),
}));

vi.mock('@/lib/engine/compiler', () => ({
  compile: vi.fn(),
}));

describe('useCompiler', () => {
  const mockSetCompilationResult = vi.fn();
  const mockSetCompilationError = vi.fn();
  const mockSetSemanticTree = vi.fn();
  const mockSetSpendingPaths = vi.fn();

  const baseState = {
    keyVariables: [],
    context: 'wsh' as const,
    network: 'testnet' as const,
    availableKeys: new Set<string>(),
    availableHashes: new Set<string>(),
    currentTimeBlocks: 0,
    setCompilationResult: mockSetCompilationResult,
    setCompilationError: mockSetCompilationError,
    setSemanticTree: mockSetSemanticTree,
    setSpendingPaths: mockSetSpendingPaths,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears compilation outputs when policy is empty', () => {
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      return selector({ ...baseState, policy: '   ' });
    });

    renderHook(() => useCompiler());

    expect(mockSetCompilationError).toHaveBeenCalledWith(null);
    expect(mockSetCompilationResult).toHaveBeenCalledWith(null);
    expect(mockSetSemanticTree).toHaveBeenCalledWith(null);
    expect(mockSetSpendingPaths).toHaveBeenCalledWith([]);
  });
});
