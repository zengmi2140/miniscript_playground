import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PathsTab } from '../PathsTab';
import { I18nProvider } from '@/lib/i18n/context';
import type { SpendingPath } from '@/lib/engine/types';

const mockPaths: SpendingPath[] = [
  {
    index: 0,
    label: 'Path A',
    conditions: [{ type: 'signature', keyName: 'Alice' }],
    witnessAsm: '',
    witnessSize: 42,
    isMalleable: false,
    satisfiable: true,
    missingConditions: [],
  },
  {
    index: 1,
    label: 'Path B',
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

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: { spendingPaths: SpendingPath[] }) => unknown) =>
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlaygroundStore.mockImplementation((selector) =>
      selector({ spendingPaths: mockPaths }),
    );
  });

  it('renders path labels when spending paths exist', () => {
    render(
      <TestWrapper>
        <PathsTab />
      </TestWrapper>
    );

    expect(screen.getByText('Path A')).toBeInTheDocument();
    expect(screen.getByText('Path B')).toBeInTheDocument();
  });

  it('renders empty state when there are no paths', () => {
    mockUsePlaygroundStore.mockImplementation((selector) =>
      selector({ spendingPaths: [] }),
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
