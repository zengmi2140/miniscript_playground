import { describe, it, expect } from 'vitest';
import { collectHighlightedNodeIds } from '../path-highlighting';
import type { StrategyNode } from '../types';
import type { SpendingPath } from '@/lib/engine/types';

function pathStub(overrides: Partial<SpendingPath> & Pick<SpendingPath, 'conditions'>): SpendingPath {
  return {
    index: 1,
    labelVariant: { kind: 'generic' },
    witnessAsm: '',
    witnessSize: 0,
    isMalleable: false,
    satisfiable: true,
    missingConditions: [],
    ...overrides,
  };
}

describe('collectHighlightedNodeIds', () => {
  describe('simple signature', () => {
    it('should highlight a matching signature node', () => {
      const tree: StrategyNode = {
        id: 'sig-1',
        kind: 'signature',
        roleId: 'Alice',
      };

      const path = pathStub({
        conditions: [{ type: 'signature', keyName: 'Alice' }],
      });

      const highlighted = collectHighlightedNodeIds(tree, path);
      expect(highlighted.has('sig-1')).toBe(true);
    });

    it('should not highlight a non-matching signature node', () => {
      const tree: StrategyNode = {
        id: 'sig-1',
        kind: 'signature',
        roleId: 'Alice',
      };

      const path = pathStub({
        conditions: [{ type: 'signature', keyName: 'Bob' }],
      });

      const highlighted = collectHighlightedNodeIds(tree, path);
      expect(highlighted.has('sig-1')).toBe(false);
    });
  });

  describe('2FA + older(4320) recovery path', () => {
    const recoveryTree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-user', kind: 'signature', roleId: 'User' },
        {
          id: 'recovery',
          kind: 'group',
          op: 'any',
          children: [
            { id: 'sig-service', kind: 'signature', roleId: 'Service' },
            { id: 'time-recovery', kind: 'timelock', mode: 'relative', value: 4320, unit: 'blocks' },
          ],
        },
      ],
    };

    it('should highlight User + Service path', () => {
      const path = pathStub({
        conditions: [
          { type: 'signature', keyName: 'User' },
          { type: 'signature', keyName: 'Service' },
        ],
      });

      const highlighted = collectHighlightedNodeIds(recoveryTree, path);
      expect(highlighted.has('sig-user')).toBe(true);
      expect(highlighted.has('sig-service')).toBe(true);
      expect(highlighted.has('recovery')).toBe(true);
      expect(highlighted.has('root')).toBe(true);
      // Time branch should NOT be highlighted
      expect(highlighted.has('time-recovery')).toBe(false);
    });

    it('should highlight User + timelock recovery path', () => {
      const path = pathStub({
        conditions: [
          { type: 'signature', keyName: 'User' },
          { type: 'timelock_relative', blocks: 4320, humanReadable: '~30 day(s)' },
        ],
      });

      const highlighted = collectHighlightedNodeIds(recoveryTree, path);
      expect(highlighted.has('sig-user')).toBe(true);
      expect(highlighted.has('time-recovery')).toBe(true);
      expect(highlighted.has('recovery')).toBe(true);
      expect(highlighted.has('root')).toBe(true);
      // Service branch should NOT be highlighted
      expect(highlighted.has('sig-service')).toBe(false);
    });
  });

  describe('threshold group', () => {
    const thresholdTree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'threshold',
      threshold: 2,
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
        { id: 'sig-3', kind: 'signature', roleId: 'Charlie' },
      ],
    };

    it('should highlight matched participants and parent for 2-of-3', () => {
      const path = pathStub({
        conditions: [
          { type: 'signature', keyName: 'Alice' },
          { type: 'signature', keyName: 'Bob' },
        ],
      });

      const highlighted = collectHighlightedNodeIds(thresholdTree, path);
      expect(highlighted.has('sig-1')).toBe(true);
      expect(highlighted.has('sig-2')).toBe(true);
      expect(highlighted.has('sig-3')).toBe(false);
      expect(highlighted.has('root')).toBe(true);
    });

    it('should not highlight parent if threshold not met', () => {
      const path = pathStub({
        conditions: [{ type: 'signature', keyName: 'Alice' }],
      });

      const highlighted = collectHighlightedNodeIds(thresholdTree, path);
      expect(highlighted.has('sig-1')).toBe(true);
      expect(highlighted.has('root')).toBe(false);
    });
  });

  describe('nested structure', () => {
    it('should propagate highlight to ancestors along the selected branch', () => {
      const tree: StrategyNode = {
        id: 'root',
        kind: 'group',
        op: 'any',
        children: [
          {
            id: 'branch-1',
            kind: 'group',
            op: 'all',
            children: [
              { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
              { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
            ],
          },
          {
            id: 'branch-2',
            kind: 'group',
            op: 'all',
            children: [
              { id: 'sig-3', kind: 'signature', roleId: 'Charlie' },
              { id: 'time-1', kind: 'timelock', mode: 'relative', value: 1000, unit: 'blocks' },
            ],
          },
        ],
      };

      const path = pathStub({
        conditions: [
          { type: 'signature', keyName: 'Charlie' },
          { type: 'timelock_relative', blocks: 1000, humanReadable: '~7 day(s)' },
        ],
      });

      const highlighted = collectHighlightedNodeIds(tree, path);
      // Branch 2 should be highlighted
      expect(highlighted.has('sig-3')).toBe(true);
      expect(highlighted.has('time-1')).toBe(true);
      expect(highlighted.has('branch-2')).toBe(true);
      expect(highlighted.has('root')).toBe(true);
      // Branch 1 should NOT be highlighted
      expect(highlighted.has('sig-1')).toBe(false);
      expect(highlighted.has('sig-2')).toBe(false);
      expect(highlighted.has('branch-1')).toBe(false);
    });
  });
});
