import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';

afterEach(() => cleanup());
import { BuilderConditionNode, BuilderPlaceholderNode, BuilderAddChildNode } from '../BuilderNodes';
import { I18nProvider } from '@/lib/i18n/context';
import type { BuilderFlowNodeData } from '@/lib/builder/tree-to-flow';

const mockSetSelectedBuilderNodeId = vi.fn();

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: Object.assign(
    (selector: (state: unknown) => unknown) =>
      selector({
        setSelectedBuilderNodeId: mockSetSelectedBuilderNodeId,
        setOperatorSwitchNodeId: vi.fn(),
        operatorSwitchNodeId: null,
      }),
    {
      getState: () => ({
        operatorSwitchNodeId: null,
      }),
    },
  ),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale="en">
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </I18nProvider>
  );
}

const baseLeafData: BuilderFlowNodeData = {
  nodeType: 'builderCondition',
  strategyNodeId: 'sig-1',
  label: 'Alice',
  kind: 'signature',
  status: 'pending',
  isReadOnly: false,
  isHighlighted: false,
};

const basePlaceholderRoot: BuilderFlowNodeData = {
  nodeType: 'builderPlaceholder',
  strategyNodeId: 'placeholder-root',
  label: 'Add root',
  kind: 'placeholder',
  placeholderType: 'root',
  status: 'missing',
  isReadOnly: false,
  isHighlighted: false,
};

const baseAddChild: BuilderFlowNodeData = {
  nodeType: 'builderAddChild',
  strategyNodeId: 'group-1',
  label: '+',
  kind: 'group',
  status: 'pending',
  isReadOnly: false,
  isHighlighted: false,
  addChildSlotKind: 'virtual',
  parentRoleId: 'AllRequired',
};

describe('BuilderNodes keyboard activation (P1-07)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers leaf condition node selection on Enter key', () => {
    render(
      <Wrapper>
        <BuilderConditionNode data={baseLeafData} />
      </Wrapper>,
    );
    const node = screen.getByRole('button', { name: /Edit node Alice/i });
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledWith('sig-1');
  });

  it('triggers leaf condition node selection on Space key', () => {
    render(
      <Wrapper>
        <BuilderConditionNode data={baseLeafData} />
      </Wrapper>,
    );
    const node = screen.getByRole('button', { name: /Edit node Alice/i });
    fireEvent.keyDown(node, { key: ' ' });
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledWith('sig-1');
  });

  it('does not invoke handler when read-only', () => {
    render(
      <Wrapper>
        <BuilderConditionNode data={{ ...baseLeafData, isReadOnly: true }} />
      </Wrapper>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(mockSetSelectedBuilderNodeId).not.toHaveBeenCalled();
  });

  it('placeholder root activates on Enter and Space', () => {
    render(
      <Wrapper>
        <BuilderPlaceholderNode data={basePlaceholderRoot} />
      </Wrapper>,
    );
    const node = screen.getByRole('button', { name: /Add root node/i });
    fireEvent.keyDown(node, { key: 'Enter' });
    fireEvent.keyDown(node, { key: ' ' });
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledTimes(2);
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledWith('placeholder-root');
  });

  it('add-child node activates on Enter', () => {
    render(
      <Wrapper>
        <BuilderAddChildNode data={baseAddChild} />
      </Wrapper>,
    );
    const node = screen.getByRole('button', { name: /Add child condition to AllRequired/i });
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedBuilderNodeId).toHaveBeenCalledWith('add_child:group-1');
  });
});
