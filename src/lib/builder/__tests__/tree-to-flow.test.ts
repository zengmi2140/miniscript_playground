import { describe, it, expect, beforeEach } from 'vitest';
import { builderTreeToFlow, resetFlowNodeIdCounter } from '../tree-to-flow';
import { singleSigTemplate, sharedControlTemplate, recoveryTemplate, resetNodeIdCounter } from '../templates';

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

      // Root + 3 children
      expect(nodes).toHaveLength(4);
      expect(edges).toHaveLength(3);

      const root = nodes.find((n) => n.type === 'builderRoot');
      expect(root).toBeDefined();
      expect(root?.data.op).toBe('threshold');
      expect(root?.data.threshold).toBe(2);

      const conditions = nodes.filter((n) => n.type === 'builderCondition');
      expect(conditions).toHaveLength(3);
    });

    it('converts recovery template to nested structure', () => {
      const template = recoveryTemplate();
      const { nodes, edges } = builderTreeToFlow(template.tree, defaultOptions);

      // Root (and) + User sig + or group + Service sig + timelock
      expect(nodes).toHaveLength(5);
      expect(edges).toHaveLength(4);

      const root = nodes.find((n) => n.type === 'builderRoot');
      expect(root?.data.op).toBe('all');

      const operators = nodes.filter((n) => n.type === 'builderOperator');
      expect(operators).toHaveLength(1); // the or group
      expect(operators[0].data.op).toBe('any');

      const conditions = nodes.filter((n) => n.type === 'builderCondition');
      expect(conditions).toHaveLength(3); // User, Service, timelock
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
      const template = recoveryTemplate();
      const { nodes } = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        currentTimeBlocks: 1000, // less than 4320
      });

      const timelockNode = nodes.find((n) => n.data.kind === 'timelock');
      expect(timelockNode?.data.status).toBe('pending');
    });

    it('marks relative timelock as satisfied when time reached', () => {
      const template = recoveryTemplate();
      const { nodes } = builderTreeToFlow(template.tree, {
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
      const template = recoveryTemplate();

      // Need User + (Service OR timelock)
      // Nothing available -> missing
      let result = builderTreeToFlow(template.tree, defaultOptions);
      expect(result.nodes[0].data.status).toBe('missing');

      // User available, timelock pending -> pending
      result = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        availableKeys: new Set(['User']),
        currentTimeBlocks: 1000,
      });
      expect(result.nodes[0].data.status).toBe('pending');

      // User + Service available -> satisfied
      result = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        availableKeys: new Set(['User', 'Service']),
      });
      expect(result.nodes[0].data.status).toBe('satisfied');
    });
  });

  describe('read-only mode', () => {
    it('marks all nodes as read-only when isReadOnly is true', () => {
      const template = recoveryTemplate();
      const { nodes } = builderTreeToFlow(template.tree, {
        ...defaultOptions,
        isReadOnly: true,
      });

      expect(nodes.every((n) => n.data.isReadOnly)).toBe(true);
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
