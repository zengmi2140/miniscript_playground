import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ConditionToggles } from '../ConditionToggles';
import { I18nProvider } from '@/lib/i18n/context';
import type { MiniscriptNode } from '@/lib/engine/types';

const mockToggleKey = vi.hoisted(() => vi.fn());
const mockToggleHash = vi.hoisted(() => vi.fn());

const mockSemanticTree: MiniscriptNode = {
  type: 'and',
  children: [
    { type: 'key', name: 'Alice' },
    {
      type: 'hash',
      hashType: 'sha256',
      hash: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    },
  ],
};

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (
    selector: (state: {
      activeScenarioId: string | null;
      semanticTree: MiniscriptNode | null;
      availableKeys: Set<string>;
      availableHashes: Set<string>;
      toggleKey: (name: string) => void;
      toggleHash: (hash: string) => void;
    }) => unknown
  ) =>
    selector({
      activeScenarioId: null,
      semanticTree: mockSemanticTree,
      availableKeys: new Set(['Alice']),
      availableHashes: new Set<string>(),
      toggleKey: mockToggleKey,
      toggleHash: mockToggleHash,
    }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe('ConditionToggles a11y state semantics (P2-11)', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('announces current pressed state in accessible names', () => {
    render(
      <Wrapper>
        <ConditionToggles />
      </Wrapper>,
    );

    const keyToggle = screen.getByRole('button', {
      name: 'Toggle signature condition Alice, currently satisfied',
    });
    const hashToggle = screen.getByRole('button', {
      name: 'Toggle hash condition abcdef01..., currently not satisfied',
    });

    expect(keyToggle).toHaveAttribute('aria-pressed', 'true');
    expect(hashToggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks decorative icons as aria-hidden', () => {
    render(
      <Wrapper>
        <ConditionToggles />
      </Wrapper>,
    );

    const keyToggle = screen.getByRole('button', {
      name: 'Toggle signature condition Alice, currently satisfied',
    });
    const hashToggle = screen.getByRole('button', {
      name: 'Toggle hash condition abcdef01..., currently not satisfied',
    });

    expect(keyToggle.querySelectorAll('svg[aria-hidden=\"true\"]').length).toBeGreaterThan(0);
    expect(hashToggle.querySelectorAll('svg[aria-hidden=\"true\"]').length).toBeGreaterThan(0);
  });
});
