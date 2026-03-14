import { describe, it, expect, beforeEach } from 'vitest';
import {
  singleSigTemplate,
  sharedControlTemplate,
  recoveryTemplate,
  getTemplate,
  resetNodeIdCounter,
} from '../templates';

describe('Builder Templates', () => {
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

    it('returns policy multi(2,Alice,Bob,Charlie)', () => {
      const template = sharedControlTemplate();
      expect(template.policy).toBe('multi(2,Alice,Bob,Charlie)');
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

  describe('recoveryTemplate', () => {
    it('returns an and-group with signature and or-group', () => {
      const template = recoveryTemplate();
      expect(template.tree.kind).toBe('group');
      if (template.tree.kind === 'group') {
        expect(template.tree.op).toBe('all');
        expect(template.tree.children).toHaveLength(2);

        const [firstChild, secondChild] = template.tree.children;
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

    it('returns policy and(pk(User),or(pk(Service),older(4320)))', () => {
      const template = recoveryTemplate();
      expect(template.policy).toBe('and(pk(User),or(pk(Service),older(4320)))');
    });

    it('returns two key variables', () => {
      const template = recoveryTemplate();
      expect(template.keyVariables).toHaveLength(2);
      expect(template.keyVariables.map((k) => k.name)).toEqual(['User', 'Service']);
    });
  });

  describe('getTemplate', () => {
    it('returns single-control template', () => {
      const template = getTemplate('single-control');
      expect(template.policy).toBe('pk(Alice)');
    });

    it('returns shared-control template', () => {
      const template = getTemplate('shared-control');
      expect(template.policy).toBe('multi(2,Alice,Bob,Charlie)');
    });

    it('returns recovery template', () => {
      const template = getTemplate('recovery');
      expect(template.policy).toBe('and(pk(User),or(pk(Service),older(4320)))');
    });

    it('throws for unknown starter id', () => {
      // @ts-expect-error - testing invalid input
      expect(() => getTemplate('invalid')).toThrow('Unknown starter ID');
    });
  });
});
