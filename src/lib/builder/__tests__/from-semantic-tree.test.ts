import { describe, it, expect, beforeEach } from 'vitest';
import { importFromSemanticTree, resetImportNodeIdCounter } from '../from-semantic-tree';
import type { MiniscriptNode } from '@/lib/engine/types';
import type { StrategyNode } from '../types';

function assertBinaryAndOrGroups(node: StrategyNode): void {
  if (node.kind === 'group' && (node.op === 'all' || node.op === 'any')) {
    expect(node.children.length).toBeLessThanOrEqual(2);
  }
  if (node.kind === 'group') {
    node.children.forEach(assertBinaryAndOrGroups);
  }
}

describe('importFromSemanticTree', () => {
  beforeEach(() => {
    resetImportNodeIdCounter();
  });

  describe('supported structures', () => {
    it('imports pk(Alice) -> signature', () => {
      const semantic: MiniscriptNode = { type: 'key', name: 'Alice' };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('signature');
        if (result.tree.kind === 'signature') {
          expect(result.tree.roleId).toBe('Alice');
        }
      }
    });

    it('imports older(4320) -> timelock(relative)', () => {
      const semantic: MiniscriptNode = {
        type: 'older',
        blocks: 4320,
        humanReadable: '~30 days',
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('timelock');
        if (result.tree.kind === 'timelock') {
          expect(result.tree.mode).toBe('relative');
          expect(result.tree.value).toBe(4320);
        }
      }
    });

    it('imports and(pk(A),older(4320)) -> group(all)', () => {
      const semantic: MiniscriptNode = {
        type: 'and',
        children: [
          { type: 'key', name: 'A' },
          { type: 'older', blocks: 4320, humanReadable: '~30 days' },
        ],
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('all');
          expect(result.tree.children).toHaveLength(2);
        }
      }
    });

    it('imports or(pk(A),pk(B)) -> group(any)', () => {
      const semantic: MiniscriptNode = {
        type: 'or',
        children: [
          { type: 'key', name: 'A' },
          { type: 'key', name: 'B' },
        ],
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('any');
          expect(result.tree.children).toHaveLength(2);
        }
      }
    });

    it('imports thresh(2,pk(A),pk(B),pk(C)) -> group(threshold)', () => {
      const semantic: MiniscriptNode = {
        type: 'threshold',
        k: 2,
        n: 3,
        children: [
          { type: 'key', name: 'A' },
          { type: 'key', name: 'B' },
          { type: 'key', name: 'C' },
        ],
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('threshold');
          expect(result.tree.threshold).toBe(2);
          expect(result.tree.children).toHaveLength(3);
        }
      }
    });

    it('imports multi(2,A,B,C) -> group(threshold) with signatures', () => {
      const semantic: MiniscriptNode = {
        type: 'multi',
        k: 2,
        keys: ['A', 'B', 'C'],
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('threshold');
          expect(result.tree.threshold).toBe(2);
          expect(result.tree.children).toHaveLength(3);
          expect(result.tree.children.every((c) => c.kind === 'signature')).toBe(true);
        }
      }
    });

    it('folds 3-way and into nested binary all groups', () => {
      const semantic: MiniscriptNode = {
        type: 'and',
        children: [
          { type: 'key', name: 'A' },
          { type: 'key', name: 'B' },
          { type: 'key', name: 'C' },
        ],
      };
      const result = importFromSemanticTree(semantic);
      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        assertBinaryAndOrGroups(result.tree);
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('all');
          expect(result.tree.children).toHaveLength(2);
          expect(result.tree.children[0].kind).toBe('signature');
          const right = result.tree.children[1];
          expect(right.kind).toBe('group');
          if (right.kind === 'group') {
            expect(right.op).toBe('all');
            expect(right.children).toHaveLength(2);
          }
        }
      }
    });

    it('folds 3-way or into nested binary any groups', () => {
      const semantic: MiniscriptNode = {
        type: 'or',
        children: [
          { type: 'key', name: 'A' },
          { type: 'key', name: 'B' },
          { type: 'key', name: 'C' },
        ],
      };
      const result = importFromSemanticTree(semantic);
      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        assertBinaryAndOrGroups(result.tree);
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('any');
          expect(result.tree.children).toHaveLength(2);
        }
      }
    });

    it('imports complex nested structure', () => {
      // and(pk(User),or(pk(Service),older(4320)))
      const semantic: MiniscriptNode = {
        type: 'and',
        children: [
          { type: 'key', name: 'User' },
          {
            type: 'or',
            children: [
              { type: 'key', name: 'Service' },
              { type: 'older', blocks: 4320, humanReadable: '~30 days' },
            ],
          },
        ],
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('supported');
      if (result.status === 'supported') {
        expect(result.tree.kind).toBe('group');
        if (result.tree.kind === 'group') {
          expect(result.tree.op).toBe('all');
          expect(result.tree.children).toHaveLength(2);

          const orGroup = result.tree.children[1];
          expect(orGroup.kind).toBe('group');
          if (orGroup.kind === 'group') {
            expect(orGroup.op).toBe('any');
          }
        }
      }
    });
  });

  describe('unsupported structures', () => {
    it('rejects after(800000) with absolute-timelock reason', () => {
      const semantic: MiniscriptNode = {
        type: 'after',
        value: 800000,
        humanReadable: 'Block 800000',
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.reason).toBe('absolute-timelock');
        expect(result.message).toContain('after');
      }
    });

    it('rejects sha256(...) with hashlock reason', () => {
      const semantic: MiniscriptNode = {
        type: 'hash',
        hashType: 'sha256',
        hash: 'abcd1234567890',
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.reason).toBe('hashlock');
        expect(result.message).toContain('sha256');
      }
    });

    it('rejects hash160(...) with hashlock reason', () => {
      const semantic: MiniscriptNode = {
        type: 'hash',
        hashType: 'hash160',
        hash: 'abcd1234567890',
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.reason).toBe('hashlock');
      }
    });

    it('rejects just_0 with constant-branch reason', () => {
      const semantic: MiniscriptNode = { type: 'just_0' };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.reason).toBe('constant-branch');
      }
    });

    it('rejects just_1 with constant-branch reason', () => {
      const semantic: MiniscriptNode = { type: 'just_1' };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.reason).toBe('constant-branch');
      }
    });

    it('rejects nested unsupported structures', () => {
      // and(pk(A),after(800000))
      const semantic: MiniscriptNode = {
        type: 'and',
        children: [
          { type: 'key', name: 'A' },
          { type: 'after', value: 800000, humanReadable: 'Block 800000' },
        ],
      };
      const result = importFromSemanticTree(semantic);

      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.reason).toBe('absolute-timelock');
      }
    });
  });
});
