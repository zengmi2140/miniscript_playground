import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TimeSlider } from '../TimeSlider';
import { I18nProvider } from '@/lib/i18n/context';
import type { MiniscriptNode } from '@/lib/engine/types';

const mockSetCurrentTimeBlocks = vi.hoisted(() => vi.fn());

const mockSemanticTree: MiniscriptNode = {
  type: 'older',
  blocks: 144,
  humanReadable: '1 day',
};

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (
    selector: (state: {
      semanticTree: MiniscriptNode | null;
      currentTimeBlocks: number;
      setCurrentTimeBlocks: (blocks: number) => void;
      blockTipHeight: number;
      blockTipHeightReady: boolean;
    }) => unknown
  ) =>
    selector({
      semanticTree: mockSemanticTree,
      currentTimeBlocks: 0,
      setCurrentTimeBlocks: mockSetCurrentTimeBlocks,
      blockTipHeight: 945000,
      blockTipHeightReady: true,
    }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe('TimeSlider a11y + token colors (P2-10)', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides an accessible label for the range input', () => {
    render(
      <Wrapper>
        <TimeSlider />
      </Wrapper>,
    );

    expect(
      screen.getByRole('slider', { name: 'Simulated elapsed time in blocks' }),
    ).toBeInTheDocument();
  });

  it('uses design tokens in slider progress background', () => {
    render(
      <Wrapper>
        <TimeSlider />
      </Wrapper>,
    );

    const slider = screen.getByRole('slider', { name: 'Simulated elapsed time in blocks' });
    const style = slider.getAttribute('style') ?? '';
    expect(style).toContain('var(--semantic-timelock)');
    expect(style).toContain('var(--bg-elevated)');
  });
});
