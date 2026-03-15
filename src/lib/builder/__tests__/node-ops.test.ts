import { describe, it, expect } from 'vitest';
import {
  findNodeById,
  updateNode,
  deleteNode,
  addChildToGroup,
  wrapNodeWithGroup,
  updateThreshold,
  updateTimelock,
  updateSignatureRole,
} from '../node-ops';
import type { StrategyNode } from '../types';

describe('findNodeById', () => {
  const tree: StrategyNode = {
    id: 'root',
    kind: 'group',
    op: 'all',
    children: [
      { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
      {
        id: 'nested',
        kind: 'group',
        op: 'any',
        children: [
          { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
          { id: 'time-1', kind: 'timelock', mode: 'relative', value: 1000, unit: 'blocks' },
        ],
      },
    ],
  };

  it('should find root node', () => {
    const node = findNodeById(tree, 'root');
    expect(node).toBeDefined();
    expect(node?.id).toBe('root');
  });

  it('should find nested node', () => {
    const node = findNodeById(tree, 'sig-2');
    expect(node).toBeDefined();
    expect(node?.kind).toBe('signature');
  });

  it('should return undefined for non-existent id', () => {
    const node = findNodeById(tree, 'not-exist');
    expect(node).toBeUndefined();
  });
});

describe('updateNode', () => {
  it('should update a nested node immutably', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
      ],
    };

    const updated = updateNode(tree, 'sig-1', { roleId: 'Bob' });
    
    // Original unchanged
    expect((tree.children as StrategyNode[])[0]).toHaveProperty('roleId', 'Alice');
    // New tree updated
    expect((updated.children as StrategyNode[])[0]).toHaveProperty('roleId', 'Bob');
  });
});

describe('deleteNode', () => {
  it('should delete a child from group', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      ],
    };

    const result = deleteNode(tree, 'sig-1');
    expect(result).not.toBeNull();
    expect((result!.children as StrategyNode[]).length).toBe(1);
    expect((result!.children as StrategyNode[])[0].id).toBe('sig-2');
  });

  it('should return null when deleting root', () => {
    const tree: StrategyNode = { id: 'root', kind: 'signature', roleId: 'Alice' };
    const result = deleteNode(tree, 'root');
    expect(result).toBeNull();
  });

  it('should collapse single-child group after delete', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        {
          id: 'nested',
          kind: 'group',
          op: 'any',
          children: [
            { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
            { id: 'sig-3', kind: 'signature', roleId: 'Charlie' },
          ],
        },
      ],
    };

    const result = deleteNode(tree, 'sig-3');
    expect(result).not.toBeNull();
    // nested group should remain since it still has one child
    const nested = findNodeById(result!, 'nested');
    expect(nested).toBeDefined();
    expect((nested as any).children.length).toBe(1);
  });
});

describe('addChildToGroup', () => {
  it('should add a child to a group', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
      ],
    };

    const newChild: StrategyNode = { id: 'sig-2', kind: 'signature', roleId: 'Bob' };
    const result = addChildToGroup(tree, 'root', newChild);
    
    expect((result.children as StrategyNode[]).length).toBe(2);
    expect((result.children as StrategyNode[])[1].id).toBe('sig-2');
  });

  it('should not modify non-group nodes', () => {
    const tree: StrategyNode = { id: 'root', kind: 'signature', roleId: 'Alice' };
    const newChild: StrategyNode = { id: 'sig-2', kind: 'signature', roleId: 'Bob' };
    const result = addChildToGroup(tree, 'root', newChild);
    
    // Should return unchanged
    expect(result).toEqual(tree);
  });
});

describe('wrapNodeWithGroup', () => {
  it('should wrap a node with a group', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      ],
    };

    const result = wrapNodeWithGroup(tree, 'sig-1', 'any', 'wrap-1');
    const children = result.children as StrategyNode[];
    
    // First child should now be a group
    expect(children[0].kind).toBe('group');
    expect(children[0].id).toBe('wrap-1');
    expect((children[0] as any).op).toBe('any');
    // The original sig-1 should be inside
    expect((children[0] as any).children[0].id).toBe('sig-1');
  });
});

describe('updateThreshold', () => {
  it('should update threshold value', () => {
    const tree: StrategyNode = {
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

    const result = updateThreshold(tree, 'root', 3);
    expect((result as any).threshold).toBe(3);
  });

  it('should clamp threshold to valid range', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'threshold',
      threshold: 2,
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      ],
    };

    // Try to set threshold > n
    const result = updateThreshold(tree, 'root', 5);
    expect((result as any).threshold).toBe(2); // Clamped to n
  });
});

describe('updateTimelock', () => {
  it('should update timelock value', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'timelock',
      mode: 'relative',
      value: 1000,
      unit: 'blocks',
    };

    const result = updateTimelock(tree, 'root', 4320);
    expect((result as any).value).toBe(4320);
  });
});

describe('updateSignatureRole', () => {
  it('should update signature role', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
      ],
    };

    const result = updateSignatureRole(tree, 'sig-1', 'Bob');
    expect(((result.children as StrategyNode[])[0] as any).roleId).toBe('Bob');
  });
});
