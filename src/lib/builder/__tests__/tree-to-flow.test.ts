import { describe, it, expect, beforeEach } from 'vitest';
import { builderTreeToFlow, resetFlowNodeIdCounter } from '../tree-to-flow';
import { singleSigTemplate, sharedControlTemplate, nestedRecoveryLikeTree, resetNodeIdCounter } from '../templates';

describe('builderTreeToFlow', () => {
  beforeEach(() => {
    resetFlowNodeIdCounter();
    resetNodeIdCounter();
  });

  const defaultOptions = {
    availableKeys: new Set<string>(),
    currentTimeBlocks: 0,
    locale: 'zh' as const,
  };

  describe('basic structure conversion', () => {
    it('converts single signature to one node', () => {
      const template = singleSigTemplate();
      const { nodes, edges } = builderTreeToFlow(template.tree, defaultOptions);

      expect(nodes).toHaveLength(1);
      expect(edges).toHaveLength(0);
      expect(nodes[0].type).toBe('builderRoot');
      expect(nodes[0].data.kind).toBe('signature');
      expect(nodes[0].data.roleId).toBe('Alice');
    });

    it('converts threshold group with signature children', () => {
      const template = sharedControlTemplate();
      const { nodes, edges } = builderTreeToFlow(template.tree, defaultOptions);

      // Root + 3 signatures + add-child placeholder
      expect(nodes).toHaveLength(5);
      expect(edges).toHaveLength(4);

      const root = nodes.find((n) => n.type === 'builderRoot');
      expect(root).toBeDefined();
      expect(root?.data.op).toBe('threshold');
      expect(root?.data.threshold).toBe(2);

      const conditions = nodes.filter((n) => n.type === 'builderCondition');
      expect(conditions).toHaveLength(3);
    });

    it('converts nested and/or/timelock tree to flow', () => {
      const tree = nestedRecoveryLikeTree();
      const { nodes, edges } = builderTreeToFlow(tree, defaultOptions);

      // Root + User + OR; OR + Service + timelock (binary AND/OR full: no virtual add-child)
      expect(nodes).toHaveLength(5);
      expect(edges).toHaveLength(4);

      const root = nodes.find((n) => n.type === 'builderRoot');
      expect(root?.data.op).toBe('all');

      const operators = nodes.filter((n) => n.type === 'builderOperator');
      expect(operators).toHaveLength(1); // the or group
      expect(operators[0].data.op).toBe('any');

      const conditions = nodes.filter((n) => n.type === 'builderCondition');
      expect(conditions).toHaveLength(3); // User, Service, timelock

      const virtualAdds = nodes.filter((n) => n.data.addChildSlotKind === 'virtual');
      expect(virtualAdds).toHaveLength(0);
    });

    it('shows virtual add-child for binary all/any with fewer than two children', () => {
      const tree = {
        id: 'root',
        kind: 'group' as const,
        op: 'all' as const,
        children: [{ id: 'sig-1', kind: 'signature' as const, roleId: 'Alice' }],
      };
      resetFlowNodeIdCounter();
      const { nodes } = builderTreeToFlow(tree, defaultOptions);
      const virtualAdds = nodes.filter((n) => n.data.addChildSlotKind === 'virtual');
      expect(virtualAdds.length).toBeGreaterThanOrEqual(1);
    });

    it('does not add virtual add-child when threshold group has a tree placeholder', () => {
      const tree = {
        id: 'root',
        kind: 'group' as const,
        op: 'threshold' as const,
        threshold: 1,
        children: [
          { id: 'sig-1', kind: 'signature' as const, roleId: 'Alice' },
          { id: 'ph-1', kind: 'placeholder' as const, placeholderType: 'child' as const },
        ],
      };
      resetFlowNodeIdCounter();
      const { nodes } = builderTreeToFlow(tree, defaultOptions);
      const virtualAdds = nodes.filter((n) => n.data.addChildSlotKind === 'virtual');
      expect(virtualAdds.length).toBe(0);
      const treePh = nodes.find((n) => n.data.addChildSlotKind === 'treePlaceholder');
      expect(treePh).toBeDefined();
    });

  });

  describe('status computation', () => {
    it('marks signature as satisfied when key is available', () => {
      const template = singleSigTemplate();
      const { nodes } = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        availableKeys: new Set(['Alice']),
      });

      expect(nodes[0].data.status).toBe('satisfied');
    });

    it('marks signature as missing when key is not available', () => {
      const template = singleSigTemplate();
      const { nodes } = builderTreeToFlow(template.tree, defaultOptions);

      expect(nodes[0].data.status).toBe('missing');
    });

    it('marks relative timelock as pending when time not reached', () => {
      const tree = nestedRecoveryLikeTree();
      const { nodes } = builderTreeToFlow(tree, {
        ...defaultOptions,
        currentTimeBlocks: 1000, // less than 4320
      });

      const timelockNode = nodes.find((n) => n.data.kind === 'timelock');
      expect(timelockNode?.data.status).toBe('pending');
    });

    it('marks relative timelock as satisfied when time reached', () => {
      const tree = nestedRecoveryLikeTree();
      const { nodes } = builderTreeToFlow(tree, {
        ...defaultOptions,
        currentTimeBlocks: 5000, // greater than 4320
      });

      const timelockNode = nodes.find((n) => n.data.kind === 'timelock');
      expect(timelockNode?.data.status).toBe('satisfied');
    });

    it('computes threshold group status correctly', () => {
      const template = sharedControlTemplate();

      // 0 of 3 satisfied -> missing
      let result = builderTreeToFlow(template.tree, defaultOptions);
      expect(result.nodes[0].data.status).toBe('missing');

      // 1 of 3 satisfied -> still missing (need 2)
      result = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        availableKeys: new Set(['Alice']),
      });
      expect(result.nodes[0].data.status).toBe('missing');

      // 2 of 3 satisfied -> satisfied
      result = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        availableKeys: new Set(['Alice', 'Bob']),
      });
      expect(result.nodes[0].data.status).toBe('satisfied');
    });

    it('computes and-group status correctly', () => {
      const tree = nestedRecoveryLikeTree();

      // Need User + (Service OR timelock)
      // Nothing available: User missing, OR has timelock pending -> root pending
      let result = builderTreeToFlow(tree, defaultOptions);
      expect(result.nodes[0].data.status).toBe('pending');

      // User available, timelock pending -> pending
      result = builderTreeToFlow(tree, {
        ...defaultOptions,
        availableKeys: new Set(['User']),
        currentTimeBlocks: 1000,
      });
      expect(result.nodes[0].data.status).toBe('pending');

      // User + Service available -> satisfied
      result = builderTreeToFlow(tree, {
        ...defaultOptions,
        availableKeys: new Set(['User', 'Service']),
      });
      expect(result.nodes[0].data.status).toBe('satisfied');
    });
  });

  describe('read-only mode', () => {
    it('marks all nodes as read-only when isReadOnly is true', () => {
      const tree = nestedRecoveryLikeTree();
      const { nodes } = builderTreeToFlow(tree, {
        ...defaultOptions,
        isReadOnly: true,
      });

      expect(nodes.every((n) => n.data.isReadOnly)).toBe(true);
    });
  });

  describe('layout: parent centered over direct children', () => {
    function expectParentCenteredOverChildren(
      nodes: ReturnType<typeof builderTreeToFlow>['nodes'],
      edges: ReturnType<typeof builderTreeToFlow>['edges'],
      parentId: string
    ): void {
      const parent = nodes.find((n) => n.id === parentId);
      expect(parent).toBeDefined();
      const childEdges = edges.filter((e) => e.source === parentId);
      expect(childEdges.length).toBeGreaterThan(0);
      let left = Infinity;
      let right = -Infinity;
      for (const e of childEdges) {
        const c = nodes.find((n) => n.id === e.target);
        expect(c).toBeDefined();
        const w = c!.width ?? 0;
        left = Math.min(left, c!.position.x);
        right = Math.max(right, c!.position.x + w);
      }
      const bboxCenter = (left + right) / 2;
      const pw = parent!.width ?? 0;
      const parentCenter = parent!.position.x + pw / 2;
      expect(Math.abs(parentCenter - bboxCenter)).toBeLessThan(1);
    }

    it('centers root over threshold group children row', () => {
      const template = sharedControlTemplate();
      const { nodes, edges } = builderTreeToFlow(template.tree, defaultOptions);
      const root = nodes.find((n) => n.type === 'builderRoot');
      expect(root).toBeDefined();
      expectParentCenteredOverChildren(nodes, edges, root!.id);
    });

    it('centers nested OR group over its children row', () => {
      const tree = nestedRecoveryLikeTree();
      const { nodes, edges } = builderTreeToFlow(tree, defaultOptions);
      const orOp = nodes.find((n) => n.type === 'builderOperator' && n.data.op === 'any');
      expect(orOp).toBeDefined();
      expectParentCenteredOverChildren(nodes, edges, orOp!.id);
    });
  });

  describe('undefined roles', () => {
    it('marks signature nodes with undefined roles', () => {
      const template = singleSigTemplate();
      const { nodes } = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        definedRoles: new Set(), // Alice not defined
      });

      expect(nodes[0].data.isUndefinedRole).toBe(true);
    });

    it('does not mark signature nodes with defined roles', () => {
      const template = singleSigTemplate();
      const { nodes } = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        definedRoles: new Set(['Alice']),
      });

      expect(nodes[0].data.isUndefinedRole).toBe(false);
    });
  });
});
