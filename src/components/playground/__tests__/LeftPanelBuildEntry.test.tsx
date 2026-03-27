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
      enterBuildMode: mockEnterBuildMode,
      loadScenario: mockLoadScenario,
      setLeftPanelOpen: vi.fn(),
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

    expect(screen.getByText('Build Your Own')).toBeInTheDocument();
  });

  it('should call enterBuildMode when clicked', () => {
    render(
      <TestWrapper>
        <LeftPanel />
      </TestWrapper>
    );

    const buildCard = screen.getByText('Build Your Own').closest('button');
    expect(buildCard).toBeInTheDocument();
    fireEvent.click(buildCard!);

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

    const buildCard = screen.getByText('Build Your Own').closest('button');
    fireEvent.click(buildCard!);

    // Should not call enterBuildMode since already active
    expect(mockEnterBuildMode).not.toHaveBeenCalled();
  });
});
