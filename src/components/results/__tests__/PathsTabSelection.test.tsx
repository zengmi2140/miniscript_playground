import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PathsTab } from '../PathsTab';
import { I18nProvider } from '@/lib/i18n/context';
import type { SpendingPath } from '@/lib/engine/types';

// Mock store state
let mockSelectedPathIndex: number | null = null;
const mockSetSelectedPathIndex = vi.fn();

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: any) => any) => {
    const state = {
      spendingPaths: [
        {
          conditions: [{ type: 'signature', keyName: 'Alice' }],
          isSatisfied: true,
          satisfiedConditions: [{ type: 'signature', keyName: 'Alice' }],
          requiredConditions: [],
        },
        {
          conditions: [
            { type: 'signature', keyName: 'Alice' },
            { type: 'signature', keyName: 'Bob' },
          ],
          isSatisfied: false,
          satisfiedConditions: [{ type: 'signature', keyName: 'Alice' }],
          requiredConditions: [{ type: 'signature', keyName: 'Bob' }],
        },
      ],
      selectedPathIndex: mockSelectedPathIndex,
      setSelectedPathIndex: mockSetSelectedPathIndex,
      availableKeys: new Set(['Alice']),
      currentTimeBlocks: 0,
    };
    return selector(state);
  },
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale="en">
      {children}
    </I18nProvider>
  );
}

describe('PathsTab selection for builder highlighting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedPathIndex = null;
  });

  it('should render spending paths', () => {
    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    // Should show path cards
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('should call setSelectedPathIndex when a path is clicked', () => {
    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    const pathButtons = screen.getAllByRole('button');
    fireEvent.click(pathButtons[0]);

    expect(mockSetSelectedPathIndex).toHaveBeenCalled();
  });

  it('should toggle selection when clicking same path again', () => {
    mockSelectedPathIndex = 0;

    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    const pathButtons = screen.getAllByRole('button');
    fireEvent.click(pathButtons[0]);

    // Should deselect (set to null)
    expect(mockSetSelectedPathIndex).toHaveBeenCalledWith(null);
  });

  it('should visually indicate selected path', () => {
    mockSelectedPathIndex = 0;

    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    // The first path should have a selected state
    const pathButtons = screen.getAllByRole('button');
    expect(pathButtons[0]).toHaveClass(/border-btc|ring|selected/i);
  });
});
