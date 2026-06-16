import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PolicyEditor } from '../PolicyEditor';
import { I18nProvider } from '@/lib/i18n/context';

const mockSetPolicy = vi.hoisted(() => vi.fn());

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: unknown) => unknown) =>
    selector({
      policy: 'thresh(2,pk(Alice),pk(Bob),pk(Charlie))',
      activeScenarioId: null,
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
      playgroundMode: 'scenario',
      setPolicy: mockSetPolicy,
    }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe('PolicyEditor toolbar', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the formatter entry point hidden while retaining the rest of the toolbar', () => {
    render(
      <Wrapper>
        <PolicyEditor compilationError={null} />
      </Wrapper>,
    );

    expect(screen.queryByRole('button', { name: 'Format' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });
});
