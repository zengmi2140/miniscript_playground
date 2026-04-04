import { describe, it, expect, beforeEach } from 'vitest';
import { serializeStrategyTree } from '../serialize';
import {
  singleSigTemplate,
  sharedControlTemplate,
  nestedRecoveryLikeTree,
  resetNodeIdCounter,
} from '../templates';

describe('Builder test fixtures', () => {
  beforeEach(() => {
    resetNodeIdCounter();
  });

  describe('singleSigTemplate', () => {
    it('returns a single signature node', () => {
      const template = singleSigTemplate();
      expect(template.tree.kind).toBe('signature');
      if (template.tree.kind === 'signature') {
        expect(template.tree.roleId).toBe('Alice');
      }
    });

    it('returns policy pk(Alice)', () => {
      const template = singleSigTemplate();
      expect(template.policy).toBe('pk(Alice)');
    });

    it('returns one key variable for Alice', () => {
      const template = singleSigTemplate();
      expect(template.keyVariables).toHaveLength(1);
      expect(template.keyVariables[0].name).toBe('Alice');
      expect(template.keyVariables[0].publicKey).toHaveLength(66);
    });
  });

  describe('sharedControlTemplate', () => {
    it('returns a threshold group with 3 signature children', () => {
      const template = sharedControlTemplate();
      expect(template.tree.kind).toBe('group');
      if (template.tree.kind === 'group') {
        expect(template.tree.op).toBe('threshold');
        expect(template.tree.threshold).toBe(2);
        expect(template.tree.children).toHaveLength(3);
        expect(template.tree.children.every((c) => c.kind === 'signature')).toBe(true);
      }
    });

    it('returns policy thresh(2,pk(Alice),pk(Bob),pk(Charlie))', () => {
      const template = sharedControlTemplate();
      expect(template.policy).toBe('thresh(2,pk(Alice),pk(Bob),pk(Charlie))');
    });

    it('returns three key variables', () => {
      const template = sharedControlTemplate();
      expect(template.keyVariables).toHaveLength(3);
      expect(template.keyVariables.map((k) => k.name)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
    });
  });

  describe('nestedRecoveryLikeTree', () => {
    it('returns an and-group with signature and or-group', () => {
      const tree = nestedRecoveryLikeTree();
      expect(tree.kind).toBe('group');
      if (tree.kind === 'group') {
        expect(tree.op).toBe('all');
        expect(tree.children).toHaveLength(2);

        const [firstChild, secondChild] = tree.children;
        expect(firstChild.kind).toBe('signature');
        expect(secondChild.kind).toBe('group');

        if (secondChild.kind === 'group') {
          expect(secondChild.op).toBe('any');
          expect(secondChild.children).toHaveLength(2);

          const timelock = secondChild.children.find((c) => c.kind === 'timelock');
          expect(timelock).toBeDefined();
          if (timelock && timelock.kind === 'timelock') {
            expect(timelock.mode).toBe('relative');
            expect(timelock.value).toBe(4320);
          }
        }
      }
    });

    it('serializes to and(pk(User),or(pk(Service),older(4320)))', () => {
      const tree = nestedRecoveryLikeTree();
      expect(serializeStrategyTree(tree)).toBe('and(pk(User),or(pk(Service),older(4320)))');
    });
  });
});
