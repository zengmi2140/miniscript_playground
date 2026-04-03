import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeftPanel } from '../LeftPanel';
import { I18nProvider } from '@/lib/i18n/context';

// Track mock function calls
const mockEnterBuildMode = vi.fn();
const mockLoadScenario = vi.fn();
let mockPlaygroundMode = 'scenario';

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: any) => any) => {
    const state = {
      playgroundMode: mockPlaygroundMode,
      activeScenarioId: null,
      isLeftPanelOpen: true,
      policy: '',
      keyVariables: [] as { name: string; policyName: string; publicKey: string }[],
      context: 'wsh' as const,
      network: 'testnet' as const,
      enterBuildMode: mockEnterBuildMode,
      loadScenario: mockLoadScenario,
      setLeftPanelOpen: vi.fn(),
      setKeyVariables: vi.fn(),
      addKeyVariable: vi.fn(),
      removeKeyVariable: vi.fn(),
      updateKeyVariable: vi.fn(),
      setContext: vi.fn(),
      setNetwork: vi.fn(),
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

describe('LeftPanel BuildMode Entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaygroundMode = 'scenario';
  });

  it('should render build mode card', () => {
    render(
      <TestWrapper>
        <LeftPanel />
      </TestWrapper>
    );

    expect(screen.getAllByTestId('playground-build-mode-card').length).toBeGreaterThanOrEqual(1);
  });

  it('should call enterBuildMode when clicked', () => {
    render(
      <TestWrapper>
        <LeftPanel />
      </TestWrapper>
    );

    const buildCards = screen.getAllByTestId('playground-build-mode-card');
    fireEvent.click(buildCards[buildCards.length - 1]!);

    expect(mockEnterBuildMode).toHaveBeenCalledTimes(1);
  });

  it('should show active state when in build mode', () => {
    mockPlaygroundMode = 'build';

    render(
      <TestWrapper>
        <LeftPanel />
      </TestWrapper>
    );

    // Should show "Building" badge
    expect(screen.getByText('Building')).toBeInTheDocument();
  });

  it('should not call enterBuildMode again when already in build mode', () => {
    mockPlaygroundMode = 'build';

    render(
      <TestWrapper>
        <LeftPanel />
      </TestWrapper>
    );

    const buildCards = screen.getAllByTestId('playground-build-mode-card');
    fireEvent.click(buildCards[buildCards.length - 1]!);

    // Should not call enterBuildMode since already active
    expect(mockEnterBuildMode).not.toHaveBeenCalled();
  });
});
