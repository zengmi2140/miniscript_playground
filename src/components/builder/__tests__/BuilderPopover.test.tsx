import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuilderPopover } from '../BuilderPopover';
import { I18nProvider } from '@/lib/i18n/context';
import type { StrategyNode } from '@/lib/builder/types';

// Mock the store
const mockUpdateStrategyTree = vi.fn();
const mockAddKeyVariable = vi.fn();
const mockSetSelectedBuilderNodeId = vi.fn();

vi.mock('@/lib/stores/playground-store', () => ({
  usePlaygroundStore: (selector: (state: any) => any) => {
    const state = {
      strategyTree: {
        id: 'root',
        kind: 'group',
        op: 'all',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'time-1', kind: 'timelock', mode: 'relative', value: 1000, unit: 'blocks' },
          { id: 'thresh-1', kind: 'group', op: 'threshold', threshold: 2, children: [] },
        ],
      },
      keyVariables: [
        { name: 'Alice', pubkey: 'alice123' },
        { name: 'Bob', pubkey: 'bob456' },
      ],
      selectedBuilderNodeId: null,
      builderSyncState: 'synced',
      updateStrategyTree: mockUpdateStrategyTree,
      addKeyVariable: mockAddKeyVariable,
      setSelectedBuilderNodeId: mockSetSelectedBuilderNodeId,
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

describe('BuilderPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signature node', () => {
    it('should render role selector for signature node', () => {
      render(
        <TestWrapper>
          <BuilderPopover
            nodeId="sig-1"
            nodeKind="signature"
            anchorPosition={{ x: 100, y: 100 }}
            onClose={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Select Role')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should show quick add role option', () => {
      render(
        <TestWrapper>
          <BuilderPopover
            nodeId="sig-1"
            nodeKind="signature"
            anchorPosition={{ x: 100, y: 100 }}
            onClose={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Add New Role')).toBeInTheDocument();
    });
  });

  describe('timelock node', () => {
    it('should render dual input for timelock node', () => {
      render(
        <TestWrapper>
          <BuilderPopover
            nodeId="time-1"
            nodeKind="timelock"
            anchorPosition={{ x: 100, y: 100 }}
            onClose={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Blocks')).toBeInTheDocument();
      expect(screen.getByText('Time Preset')).toBeInTheDocument();
    });

    it('should have time preset dropdown options', () => {
      render(
        <TestWrapper>
          <BuilderPopover
            nodeId="time-1"
            nodeKind="timelock"
            anchorPosition={{ x: 100, y: 100 }}
            onClose={() => {}}
          />
        </TestWrapper>
      );

      // Check for preset options
      expect(screen.getByText('7 days')).toBeInTheDocument();
      expect(screen.getByText('30 days')).toBeInTheDocument();
      expect(screen.getByText('90 days')).toBeInTheDocument();
    });
  });

  describe('threshold node', () => {
    it('should render threshold editor for threshold group', () => {
      render(
        <TestWrapper>
          <BuilderPopover
            nodeId="thresh-1"
            nodeKind="group"
            anchorPosition={{ x: 100, y: 100 }}
            onClose={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Threshold')).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('should show delete and add child buttons for groups', () => {
      render(
        <TestWrapper>
          <BuilderPopover
            nodeId="thresh-1"
            nodeKind="group"
            anchorPosition={{ x: 100, y: 100 }}
            onClose={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Add Condition')).toBeInTheDocument();
    });
  });
});
