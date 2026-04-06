import { describe, it, expect } from 'vitest';
import { computeBuilderStatus, type BuilderNodeStatus } from '../status';
import type { StrategyNode } from '../types';

describe('computeBuilderStatus', () => {
  describe('signature nodes', () => {
    it('should be satisfied when role is in availableKeys', () => {
      const tree: StrategyNode = {
        id: 'sig-1',
        kind: 'signature',
        roleId: 'Alice',
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice']), 0);
      expect(statusMap['sig-1']).toBe('satisfied');
    });

    it('should be missing when role is not in availableKeys', () => {
      const tree: StrategyNode = {
        id: 'sig-1',
        kind: 'signature',
        roleId: 'Alice',
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 0);
      expect(statusMap['sig-1']).toBe('missing');
    });
  });

  describe('timelock nodes', () => {
    it('relative timelock should be pending until time passes', () => {
      const tree: StrategyNode = {
        id: 'time-1',
        kind: 'timelock',
        mode: 'relative',
        value: 4320,
        unit: 'blocks',
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 0);
      expect(statusMap['time-1']).toBe('pending');
    });

    it('relative timelock should be satisfied when time passes', () => {
      const tree: StrategyNode = {
        id: 'time-1',
        kind: 'timelock',
        mode: 'relative',
        value: 4320,
        unit: 'blocks',
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 4320);
      expect(statusMap['time-1']).toBe('satisfied');
    });

    it('relative timelock should be satisfied when time exceeds required', () => {
      const tree: StrategyNode = {
        id: 'time-1',
        kind: 'timelock',
        mode: 'relative',
        value: 4320,
        unit: 'blocks',
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 5000);
      expect(statusMap['time-1']).toBe('satisfied');
    });

    it('absolute timelock (`after`) stays pending in MVP (not fully simulated)', () => {
      const tree: StrategyNode = {
        id: 'time-abs',
        kind: 'timelock',
        mode: 'absolute',
        value: 1_000_000,
        unit: 'blocks',
      };

      expect(computeBuilderStatus(tree, new Set(), 0)['time-abs']).toBe('pending');
      expect(computeBuilderStatus(tree, new Set(), 2_000_000)['time-abs']).toBe('pending');
    });
  });

  describe('group(all) nodes', () => {
    it('should be satisfied only when all children are satisfied', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'all',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice', 'Bob']), 0);
      expect(statusMap['group-1']).toBe('satisfied');
    });

    it('should be missing when any child is missing and none pending', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'all',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice']), 0);
      expect(statusMap['group-1']).toBe('missing');
    });

    it('should be pending when a child is pending', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'all',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'time-1', kind: 'timelock', mode: 'relative', value: 4320, unit: 'blocks' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice']), 0);
      expect(statusMap['group-1']).toBe('pending');
    });
  });

  describe('group(any) nodes', () => {
    it('should be satisfied when any child is satisfied', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'any',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice']), 0);
      expect(statusMap['group-1']).toBe('satisfied');
    });

    it('should be pending if one branch is time-locked and no branch is satisfied', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'any',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'time-1', kind: 'timelock', mode: 'relative', value: 4320, unit: 'blocks' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 0);
      expect(statusMap['group-1']).toBe('pending');
    });

    it('should be missing when all children are missing', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'any',
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 0);
      expect(statusMap['group-1']).toBe('missing');
    });
  });

  describe('group(threshold) nodes', () => {
    it('should be satisfied when k children are satisfied', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'threshold',
        threshold: 2,
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
          { id: 'sig-3', kind: 'signature', roleId: 'Charlie' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice', 'Bob']), 0);
      expect(statusMap['group-1']).toBe('satisfied');
    });

    it('should be pending when satisfied + pending >= k but satisfied < k', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'threshold',
        threshold: 2,
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'time-1', kind: 'timelock', mode: 'relative', value: 4320, unit: 'blocks' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(['Alice']), 0);
      expect(statusMap['group-1']).toBe('pending');
    });

    it('should be missing when satisfied + pending < k', () => {
      const tree: StrategyNode = {
        id: 'group-1',
        kind: 'group',
        op: 'threshold',
        threshold: 2,
        children: [
          { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
          { id: 'sig-3', kind: 'signature', roleId: 'Charlie' },
        ],
      };

      const statusMap = computeBuilderStatus(tree, new Set(), 0);
      expect(statusMap['group-1']).toBe('missing');
    });
  });

  describe('complex recovery scenario', () => {
    it('should correctly compute status for and(pk(User),or(pk(Service),older(4320)))', () => {
      const tree: StrategyNode = {
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

      // User only - root should be missing (service missing, time pending)
      let statusMap = computeBuilderStatus(tree, new Set(['User']), 0);
      expect(statusMap['sig-user']).toBe('satisfied');
      expect(statusMap['sig-service']).toBe('missing');
      expect(statusMap['time-recovery']).toBe('pending');
      expect(statusMap['recovery']).toBe('pending');
      expect(statusMap['root']).toBe('pending');

      // User + Service - root should be satisfied
      statusMap = computeBuilderStatus(tree, new Set(['User', 'Service']), 0);
      expect(statusMap['root']).toBe('satisfied');

      // User + time elapsed - root should be satisfied
      statusMap = computeBuilderStatus(tree, new Set(['User']), 4320);
      expect(statusMap['root']).toBe('satisfied');
    });
  });
});
