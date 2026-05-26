import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ThreeColumnLayout } from '../ThreeColumnLayout';
import { I18nProvider } from '@/lib/i18n/context';

const mockSetLeftOpen = vi.hoisted(() => vi.fn());
const mockSetRightOpen = vi.hoisted(() => vi.fn());
let mockIsLeftOpen = true;
let mockIsRightOpen = true;

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (
    selector: (state: {
      isLeftPanelOpen: boolean;
      isRightPanelOpen: boolean;
      setLeftPanelOpen: (open: boolean) => void;
      setRightPanelOpen: (open: boolean) => void;
    }) => unknown
  ) =>
    selector({
      isLeftPanelOpen: mockIsLeftOpen,
      isRightPanelOpen: mockIsRightOpen,
      setLeftPanelOpen: mockSetLeftOpen,
      setRightPanelOpen: mockSetRightOpen,
    }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe('ThreeColumnLayout panel toggle semantics (P2-12)', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLeftOpen = true;
    mockIsRightOpen = true;
  });

  it('exposes aria-expanded and aria-controls when both panels are open', () => {
    render(
      <Wrapper>
        <ThreeColumnLayout left={<div>left</div>} center={<div>center</div>} right={<div>right</div>} />
      </Wrapper>,
    );

    const leftButton = screen.getByRole('button', { name: 'Collapse left panel' });
    const rightButton = screen.getByRole('button', { name: 'Collapse right panel' });

    expect(leftButton).toHaveAttribute('aria-expanded', 'true');
    expect(leftButton).toHaveAttribute('aria-controls', 'playground-left-panel');
    expect(rightButton).toHaveAttribute('aria-expanded', 'true');
    expect(rightButton).toHaveAttribute('aria-controls', 'playground-right-panel');
  });

  it('uses i18n labels for collapsed panel actions', () => {
    mockIsLeftOpen = false;
    mockIsRightOpen = false;

    render(
      <Wrapper>
        <ThreeColumnLayout left={<div>left</div>} center={<div>center</div>} right={<div>right</div>} />
      </Wrapper>,
    );

    const leftButton = screen.getByRole('button', { name: 'Expand left panel' });
    const rightButton = screen.getByRole('button', { name: 'Expand right panel' });

    expect(leftButton).toHaveAttribute('aria-expanded', 'false');
    expect(rightButton).toHaveAttribute('aria-expanded', 'false');
  });
});
