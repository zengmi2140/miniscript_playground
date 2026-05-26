import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { KeyVariableManager } from '../KeyVariableManager';
import { I18nProvider } from '@/lib/i18n/context';

afterEach(() => cleanup());

const mockState = {
  keyVariables: [
    {
      name: 'Alice',
      policyName: 'Alice',
      publicKey: '02'.padEnd(66, 'a'),
    },
  ],
  activeScenarioId: null,
  setKeyVariables: vi.fn(),
  addKeyVariable: vi.fn(),
  removeKeyVariable: vi.fn(),
  updateKeyVariable: vi.fn(),
  renameKeyVariable: vi.fn(),
};

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: unknown) => unknown) => selector(mockState),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe('KeyVariableManager hover-only buttons a11y (P1-09)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes labelled edit and delete buttons for each key', () => {
    render(
      <Wrapper>
        <KeyVariableManager />
      </Wrapper>,
    );
    expect(screen.getByRole('button', { name: 'Edit Alice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Alice' })).toBeInTheDocument();
  });

  it('hidden edit button still becomes visible on focus-visible / focus-within', () => {
    render(
      <Wrapper>
        <KeyVariableManager />
      </Wrapper>,
    );
    const editBtn = screen.getByRole('button', { name: 'Edit Alice' });
    const container = editBtn.parentElement!;
    expect(container.className).toMatch(/group-focus-within:opacity-100/);
    expect(editBtn.className).toMatch(/focus-visible:opacity-100/);
  });

  it('keeps the edit button reachable via keyboard focus', () => {
    render(
      <Wrapper>
        <KeyVariableManager />
      </Wrapper>,
    );
    const editBtn = screen.getByRole('button', { name: 'Edit Alice' });
    editBtn.focus();
    expect(document.activeElement).toBe(editBtn);
  });
});
