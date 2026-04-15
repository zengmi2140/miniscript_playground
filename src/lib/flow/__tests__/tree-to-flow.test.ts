import { describe, expect, it } from 'vitest';
import type { MiniscriptNode } from '@/lib/engine/types';
import { treeToFlow } from '@/lib/flow/tree-to-flow';

describe('treeToFlow', () => {
  it('根级 multi：单层 k-of-n root，阈值满足时根节点 status 为 satisfied', () => {
    const tree: MiniscriptNode = {
      type: 'multi',
      k: 2,
      keys: ['Alice', 'Bob', 'Charlie'],
    };
    const availableKeys = new Set(['Alice', 'Bob']);
    const availableHashes = new Set<string>();

    const { nodes, edges } = treeToFlow(tree, availableKeys, availableHashes, 0, 'zh', {});

    const roots = nodes.filter((n) => n.type === 'root');
    expect(roots).toHaveLength(1);
    const root = roots[0];
    expect(root?.data.label).toMatch(/2-of-3/);
    expect(root?.data.status).toBe('satisfied');

    expect(nodes.some((n) => n.type === 'operator')).toBe(false);

    const fromRoot = edges.filter((e) => e.source === root?.id);
    expect(fromRoot).toHaveLength(3);
    expect(fromRoot.every((e) => e.data?.relation === 'threshold')).toBe(true);
    const greenEdges = fromRoot.filter((e) => e.data?.satisfied);
    expect(greenEdges).toHaveLength(2);
    expect(greenEdges.every((e) => e.zIndex === 2)).toBe(true);
  });

  it('根级 multi：未满阈值时根节点不为 satisfied，且已满足子边 zIndex 高于未满足', () => {
    const tree: MiniscriptNode = {
      type: 'multi',
      k: 2,
      keys: ['Alice', 'Bob', 'Charlie'],
    };
    const availableKeys = new Set(['Alice']);
    const availableHashes = new Set<string>();

    const { nodes, edges } = treeToFlow(tree, availableKeys, availableHashes, 0, 'zh', {});

    const root = nodes.find((n) => n.type === 'root');
    expect(root?.data.status).not.toBe('satisfied');

    const fromRoot = edges.filter((e) => e.source === root?.id);
    const satisfiedEdge = fromRoot.find((e) => e.data?.satisfied);
    const missingEdge = fromRoot.find((e) => !e.data?.satisfied);
    expect(satisfiedEdge?.zIndex).toBe(2);
    expect((missingEdge?.zIndex ?? 0) < (satisfiedEdge?.zIndex ?? 0)).toBe(true);
  });
});
