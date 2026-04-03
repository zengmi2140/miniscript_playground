import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuilderPopover } from '../BuilderPopover';
import { I18nProvider } from '@/lib/i18n/context';
import type { StrategyNode } from '@/lib/builder/types';

const mockUpdateStrategyTree = vi.fn();
const mockAddKeyVariable = vi.fn();
const mockSetSelectedBuilderNodeId = vi.fn();
const mockSetKeyVariables = vi.fn();
const mockStore = vi.hoisted(() => ({
  strategyTree: {
    id: 'root',
    kind: 'group' as const,
    op: 'all' as const,
    children: [{ id: 'sig-1', kind: 'signature' as const, roleId: 'Alice' }],
  } as StrategyNode,
  keyVariables: [
    { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
    { name: 'Bob', policyName: 'Bob', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
  ],
  selectedBuilderNodeId: 'sig-1' as string | null,
}));

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: unknown) => unknown) =>
    selector({
      strategyTree: mockStore.strategyTree,
      keyVariables: mockStore.keyVariables,
      selectedBuilderNodeId: mockStore.selectedBuilderNodeId,
      updateStrategyTree: mockUpdateStrategyTree,
      addKeyVariable: mockAddKeyVariable,
      setSelectedBuilderNodeId: mockSetSelectedBuilderNodeId,
      setKeyVariables: mockSetKeyVariables,
    }),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

describe('BuilderPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.strategyTree = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [{ id: 'sig-1', kind: 'signature', roleId: 'Alice' }],
    };
    mockStore.keyVariables = [
      { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
      { name: 'Bob', policyName: 'Bob', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
    ];
    mockStore.selectedBuilderNodeId = 'sig-1';
  });

  describe('signature node', () => {
    it('renders role selector and Add New Role', () => {
      render(
        <TestWrapper>
          <BuilderPopover />
        </TestWrapper>
      );

      expect(screen.getByText('选择角色')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('新建角色')).toBeInTheDocument();
    });

    it('adds next key variable and updates signature role on Add New Role click', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <BuilderPopover />
        </TestWrapper>
      );

      const addRoleButtons = screen.getAllByRole('button', { name: '新建角色' });
      await user.click(addRoleButtons[0]!);

      expect(mockAddKeyVariable).toHaveBeenCalledTimes(1);
      expect(mockAddKeyVariable.mock.calls[0][0].name).toBe('Charlie');

      expect(mockUpdateStrategyTree).toHaveBeenCalledTimes(1);
      const updated = mockUpdateStrategyTree.mock.calls[0][0] as StrategyNode;
      expect(updated.kind).toBe('group');
      if (updated.kind === 'group') {
        const sig = updated.children.find((c) => c.id === 'sig-1');
        expect(sig?.kind).toBe('signature');
        if (sig?.kind === 'signature') expect(sig.roleId).toBe('Charlie');
      }
    });
  });

  it('renders nothing when no selection', () => {
    mockStore.selectedBuilderNodeId = null;
    const { container } = render(
      <TestWrapper>
        <BuilderPopover />
      </TestWrapper>
    );
    expect(container.firstChild).toBeNull();
  });
});
