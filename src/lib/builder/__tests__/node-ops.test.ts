import { describe, it, expect, beforeEach } from 'vitest';
import {
  findNode,
  updateNode,
  removeNode,
  addChildNode,
  wrapNodeInGroup,
  changeGroupOp,
  computeTreeDepth,
  updateThreshold,
  updateTimelockValue,
  updateSignatureRole,
  resetNodeOpsIdCounter,
} from '../node-ops';
import type { StrategyNode } from '../types';

beforeEach(() => {
  resetNodeOpsIdCounter();
});

// ──────────────────────────────────────────────
// findNode
// ──────────────────────────────────────────────
describe('findNode', () => {
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

  it('finds root node', () => {
    expect(findNode(tree, 'root')?.id).toBe('root');
  });

  it('finds deeply nested node', () => {
    expect(findNode(tree, 'sig-2')?.kind).toBe('signature');
  });

  it('returns null for non-existent id', () => {
    expect(findNode(tree, 'missing')).toBeNull();
  });
});

// ──────────────────────────────────────────────
// updateNode
// ──────────────────────────────────────────────
describe('updateNode', () => {
  it('updates a nested signature node immutably', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [{ id: 'sig-1', kind: 'signature', roleId: 'Alice' }],
    };

    const updated = updateNode(tree, 'sig-1', (n) => ({ ...n, roleId: 'Bob' } as StrategyNode));
    // Original unchanged
    expect((tree.children[0] as any).roleId).toBe('Alice');
    // New tree updated
    expect((updated as any).children[0].roleId).toBe('Bob');
  });
});

// ──────────────────────────────────────────────
// removeNode
// ──────────────────────────────────────────────
describe('removeNode', () => {
  it('removes a child from group', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      ],
    };

    const result = removeNode(tree, 'sig-1');
    expect(result).not.toBeNull();
    expect((result as any).children.length).toBe(1);
    expect((result as any).children[0].id).toBe('sig-2');
  });

  it('returns null when removing root', () => {
    const tree: StrategyNode = { id: 'root', kind: 'signature', roleId: 'Alice' };
    expect(removeNode(tree, 'root')).toBeNull();
  });
});

// ──────────────────────────────────────────────
// addChildNode
// ──────────────────────────────────────────────
describe('addChildNode', () => {
  it('adds a child to a group', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [{ id: 'sig-1', kind: 'signature', roleId: 'Alice' }],
    };
    const newChild: StrategyNode = { id: 'sig-2', kind: 'signature', roleId: 'Bob' };
    const result = addChildNode(tree, 'root', newChild);
    expect((result as any).children.length).toBe(2);
    expect((result as any).children[1].id).toBe('sig-2');
  });
});

// ──────────────────────────────────────────────
// wrapNodeInGroup
// ──────────────────────────────────────────────
describe('wrapNodeInGroup', () => {
  it('wraps a leaf node in a new group and adds a placeholder', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      ],
    };

    const result = wrapNodeInGroup(tree, 'sig-1', 'any');
    const children = (result as any).children;
    // First child is now a group
    expect(children[0].kind).toBe('group');
    expect(children[0].op).toBe('any');
    // The original sig-1 is the first child of the new group
    expect(children[0].children[0].id).toBe('sig-1');
    // A placeholder is added as second child
    expect(children[0].children[1].kind).toBe('placeholder');
  });

  it('wrapping the root node returns a new root group', () => {
    const tree: StrategyNode = { id: 'sig-root', kind: 'signature', roleId: 'Alice' };
    const result = wrapNodeInGroup(tree, 'sig-root', 'all');
    expect(result.kind).toBe('group');
    expect((result as any).children[0].id).toBe('sig-root');
  });

  it('wraps a group node in a new group (nested wrapping)', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        {
          id: 'inner',
          kind: 'group',
          op: 'any',
          children: [{ id: 'sig-1', kind: 'signature', roleId: 'Alice' }],
        },
      ],
    };

    const result = wrapNodeInGroup(tree, 'inner', 'all');
    const outerChildren = (result as any).children;
    expect(outerChildren[0].kind).toBe('group');
    expect(outerChildren[0].op).toBe('all');
    expect(outerChildren[0].children[0].id).toBe('inner');
  });

  it('supports threshold op when wrapping', () => {
    const tree: StrategyNode = { id: 'sig-1', kind: 'signature', roleId: 'Alice' };
    const result = wrapNodeInGroup(tree, 'sig-1', 'threshold', 2);
    expect((result as any).op).toBe('threshold');
    expect((result as any).threshold).toBe(2);
  });
});

// ──────────────────────────────────────────────
// changeGroupOp
// ──────────────────────────────────────────────
describe('changeGroupOp', () => {
  const tree: StrategyNode = {
    id: 'root',
    kind: 'group',
    op: 'all',
    children: [
      { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
      { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      { id: 'sig-3', kind: 'signature', roleId: 'Charlie' },
    ],
  };

  it('switches AND to OR, children unchanged', () => {
    const result = changeGroupOp(tree, 'root', 'any');
    expect((result as any).op).toBe('any');
    expect((result as any).children.length).toBe(3);
    // No threshold field on OR
    expect((result as any).threshold).toBeUndefined();
  });

  it('switches AND to threshold, k = min(2, realChildCount)', () => {
    const result = changeGroupOp(tree, 'root', 'threshold');
    expect((result as any).op).toBe('threshold');
    expect((result as any).threshold).toBe(2);
  });

  it('uses provided k value when switching to threshold', () => {
    const result = changeGroupOp(tree, 'root', 'threshold', 3);
    expect((result as any).threshold).toBe(3);
  });

  it('switches threshold back to AND, drops threshold field', () => {
    const thresholdTree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'threshold',
      threshold: 2,
      children: [
        { id: 'sig-1', kind: 'signature', roleId: 'Alice' },
        { id: 'sig-2', kind: 'signature', roleId: 'Bob' },
      ],
    };
    const result = changeGroupOp(thresholdTree, 'root', 'all');
    expect((result as any).op).toBe('all');
    expect((result as any).threshold).toBeUndefined();
  });

  it('returns tree unchanged if nodeId targets a non-group', () => {
    const result = changeGroupOp(tree, 'sig-1', 'any');
    // sig-1 is a signature node, should be untouched
    const sig = findNode(result, 'sig-1');
    expect(sig?.kind).toBe('signature');
  });
});

// ──────────────────────────────────────────────
// computeTreeDepth
// ──────────────────────────────────────────────
describe('computeTreeDepth', () => {
  it('returns 1 for a leaf node', () => {
    const leaf: StrategyNode = { id: 'sig', kind: 'signature', roleId: 'Alice' };
    expect(computeTreeDepth(leaf)).toBe(1);
  });

  it('returns correct depth for 3-level tree', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        {
          id: 'mid',
          kind: 'group',
          op: 'any',
          children: [{ id: 'leaf', kind: 'signature', roleId: 'Alice' }],
        },
      ],
    };
    expect(computeTreeDepth(tree)).toBe(3);
  });
});

// ──────────────────────────────────────────────
// updateThreshold
// ──────────────────────────────────────────────
describe('updateThreshold', () => {
  it('updates threshold k value', () => {
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
});

// ──────────────────────────────────────────────
// updateTimelockValue
// ──────────────────────────────────────────────
describe('updateTimelockValue', () => {
  it('updates timelock block value', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'timelock',
      mode: 'relative',
      value: 1000,
      unit: 'blocks',
    };
    const result = updateTimelockValue(tree, 'root', 4320);
    expect((result as any).value).toBe(4320);
  });
});

// ──────────────────────────────────────────────
// updateSignatureRole
// ──────────────────────────────────────────────
describe('updateSignatureRole', () => {
  it('updates signature role ID', () => {
    const tree: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [{ id: 'sig-1', kind: 'signature', roleId: 'Alice' }],
    };
    const result = updateSignatureRole(tree, 'sig-1', 'Bob');
    expect(((result as any).children[0]).roleId).toBe('Bob');
  });
});
