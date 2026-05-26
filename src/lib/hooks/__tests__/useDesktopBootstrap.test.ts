import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDesktopBootstrap } from '../useDesktopBootstrap';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { clearSession } from '@/lib/utils/storage';
import { fetchBlockTipHeight } from '@/lib/engine/block-height';

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: vi.fn(),
}));

vi.mock('@/lib/utils/storage', () => ({
  clearSession: vi.fn(),
}));

vi.mock('@/lib/engine/block-height', () => ({
  fetchBlockTipHeight: vi.fn(),
}));

describe('useDesktopBootstrap', () => {
  const setBlockTipHeight = vi.fn();
  const setBlockTipHeightReady = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUsePlaygroundStore = usePlaygroundStore as unknown as ReturnType<typeof vi.fn>;
    mockUsePlaygroundStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        setBlockTipHeight,
        setBlockTipHeightReady,
      });
    });
  });

  it('does not trigger block-tip bootstrap while viewport mode is loading', () => {
    renderHook(() => useDesktopBootstrap('loading'));

    expect(clearSession).not.toHaveBeenCalled();
    expect(fetchBlockTipHeight).not.toHaveBeenCalled();
    expect(setBlockTipHeight).not.toHaveBeenCalled();
    expect(setBlockTipHeightReady).not.toHaveBeenCalled();
  });
});
