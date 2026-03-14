import { describe, it, expect, beforeEach } from 'vitest';
import { serializeStrategyTree } from '../serialize';
import {
  singleSigTemplate,
  sharedControlTemplate,
  recoveryTemplate,
  resetNodeIdCounter,
} from '../templates';
import type { StrategyNode } from '../types';

describe('serializeStrategyTree', () => {
  beforeEach(() => {
    resetNodeIdCounter();
  });

  it('serializes single signature template', () => {
    const template = singleSigTemplate();
    expect(serializeStrategyTree(template.tree)).toBe('pk(Alice)');
  });

  it('serializes shared control template as multi()', () => {
    const template = sharedControlTemplate();
    expect(serializeStrategyTree(template.tree)).toBe('multi(2,Alice,Bob,Charlie)');
  });

  it('serializes recovery template', () => {
    const template = recoveryTemplate();
    expect(serializeStrategyTree(template.tree)).toBe(
      'and(pk(User),or(pk(Service),older(4320)))'
    );
  });

  it('serializes relative timelock', () => {
    const node: StrategyNode = {
      id: 'test',
      kind: 'timelock',
      mode: 'relative',
      value: 1008,
      unit: 'blocks',
    };
    expect(serializeStrategyTree(node)).toBe('older(1008)');
  });

  it('serializes absolute timelock', () => {
    const node: StrategyNode = {
      id: 'test',
      kind: 'timelock',
      mode: 'absolute',
      value: 800000,
      unit: 'blocks',
    };
    expect(serializeStrategyTree(node)).toBe('after(800000)');
  });

  it('serializes and-group with multiple children', () => {
    const node: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [
        { id: '1', kind: 'signature', roleId: 'A' },
        { id: '2', kind: 'signature', roleId: 'B' },
        { id: '3', kind: 'signature', roleId: 'C' },
      ],
    };
    expect(serializeStrategyTree(node)).toBe('and(pk(A),pk(B),pk(C))');
  });

  it('serializes or-group with multiple children', () => {
    const node: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'any',
      children: [
        { id: '1', kind: 'signature', roleId: 'A' },
        { id: '2', kind: 'signature', roleId: 'B' },
      ],
    };
    expect(serializeStrategyTree(node)).toBe('or(pk(A),pk(B))');
  });

  it('serializes mixed threshold as thresh()', () => {
    const node: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'threshold',
      threshold: 2,
      children: [
        { id: '1', kind: 'signature', roleId: 'A' },
        { id: '2', kind: 'signature', roleId: 'B' },
        { id: '3', kind: 'timelock', mode: 'relative', value: 1000, unit: 'blocks' },
      ],
    };
    expect(serializeStrategyTree(node)).toBe('thresh(2,pk(A),pk(B),older(1000))');
  });

  it('serializes pure multisig threshold as multi()', () => {
    const node: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'threshold',
      threshold: 3,
      children: [
        { id: '1', kind: 'signature', roleId: 'A' },
        { id: '2', kind: 'signature', roleId: 'B' },
        { id: '3', kind: 'signature', roleId: 'C' },
        { id: '4', kind: 'signature', roleId: 'D' },
      ],
    };
    expect(serializeStrategyTree(node)).toBe('multi(3,A,B,C,D)');
  });

  it('serializes hashlock', () => {
    const node: StrategyNode = {
      id: 'test',
      kind: 'hashlock',
      hashType: 'sha256',
      digest: 'abcd1234',
    };
    expect(serializeStrategyTree(node)).toBe('sha256(abcd1234)');
  });

  it('unwraps single-child groups', () => {
    const node: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [{ id: '1', kind: 'signature', roleId: 'Solo' }],
    };
    expect(serializeStrategyTree(node)).toBe('pk(Solo)');
  });

  it('handles empty groups', () => {
    const node: StrategyNode = {
      id: 'root',
      kind: 'group',
      op: 'all',
      children: [],
    };
    expect(serializeStrategyTree(node)).toBe('');
  });
});
