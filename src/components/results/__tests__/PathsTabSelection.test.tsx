import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PathsTab } from '../PathsTab';
import { I18nProvider } from '@/lib/i18n/context';
import type { SpendingPath } from '@/lib/engine/types';

const mockPaths: SpendingPath[] = [
  {
    index: 1,
    labelVariant: { kind: 'signatures', names: ['Alice'] },
    conditions: [{ type: 'signature', keyName: 'Alice' }],
    witnessAsm: '',
    witnessSize: 42,
    isMalleable: false,
    satisfiable: true,
    missingConditions: [],
  },
  {
    index: 2,
    labelVariant: { kind: 'signatures', names: ['Alice', 'Bob'] },
    conditions: [
      { type: 'signature', keyName: 'Alice' },
      { type: 'signature', keyName: 'Bob' },
    ],
    witnessAsm: '',
    witnessSize: 100,
    isMalleable: false,
    satisfiable: false,
    missingConditions: [{ type: 'signature', keyName: 'Bob' }],
  },
];

const mockUsePlaygroundStore = vi.hoisted(() => vi.fn());
const mockSetSelectedPathIndex = vi.hoisted(() => vi.fn());
let mockSelectedPathIndex: number | null = null;

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (
    selector: (state: {
      spendingPaths: SpendingPath[];
      selectedPathIndex: number | null;
      setSelectedPathIndex: (index: number | null) => void;
    }) => unknown
  ) =>
    mockUsePlaygroundStore(selector),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale="en">
      {children}
    </I18nProvider>
  );
}

describe('PathsTab', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedPathIndex = null;
    mockUsePlaygroundStore.mockImplementation((selector) =>
      selector({
        spendingPaths: mockPaths,
        selectedPathIndex: mockSelectedPathIndex,
        setSelectedPathIndex: mockSetSelectedPathIndex,
      }),
    );
  });

  it('renders path labels when spending paths exist', () => {
    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    expect(screen.getByText('Path 1: Alice signatures')).toBeInTheDocument();
    expect(screen.getByText('Path 2: Alice + Bob signatures')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Spending Paths' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('selects a path on click', () => {
    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>,
    );

    const secondPath = screen.getByRole('option', { name: /Path 2: Alice \+ Bob signatures/i });
    fireEvent.click(secondPath);

    expect(mockSetSelectedPathIndex).toHaveBeenCalledWith(1);
  });

  it('supports keyboard selection with arrow keys', () => {
    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>,
    );

    const [firstPath] = screen.getAllByRole('option');
    firstPath.focus();
    fireEvent.keyDown(firstPath, { key: 'ArrowDown' });

    expect(mockSetSelectedPathIndex).toHaveBeenCalledWith(1);
  });

  it('renders empty state when there are no paths', () => {
    mockUsePlaygroundStore.mockImplementation((selector) =>
      selector({
        spendingPaths: [],
        selectedPathIndex: null,
        setSelectedPathIndex: mockSetSelectedPathIndex,
      }),
    );

    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    expect(
      screen.getByText(/No spending paths available/i)
    ).toBeInTheDocument();
  });
});
