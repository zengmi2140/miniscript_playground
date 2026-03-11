import { describe, it, expect } from 'vitest';
import { parseMiniscript } from '../miniscript-parser';

describe('parseMiniscript', () => {
  it('parses pk()', () => {
    const result = parseMiniscript('pk(Alice)');
    expect(result).toEqual({ type: 'key', name: 'Alice' });
  });

  it('parses pk_k()', () => {
    const result = parseMiniscript('pk_k(Bob)');
    expect(result).toEqual({ type: 'key', name: 'Bob' });
  });

  it('parses older()', () => {
    const result = parseMiniscript('older(4320)');
    expect(result.type).toBe('older');
    if (result.type === 'older') {
      expect(result.blocks).toBe(4320);
      expect(result.humanReadable).toBe('≈30 天');
    }
  });

  it('parses after()', () => {
    const result = parseMiniscript('after(800000)');
    expect(result.type).toBe('after');
    if (result.type === 'after') {
      expect(result.value).toBe(800000);
    }
  });

  it('parses sha256()', () => {
    const result = parseMiniscript('sha256(abcd1234)');
    expect(result).toEqual({ type: 'hash', hashType: 'sha256', hash: 'abcd1234' });
  });

  it('parses and_v(v:pk(A),or_d(pk(B),older(4320)))', () => {
    const result = parseMiniscript('and_v(v:pk(A),or_d(pk(B),older(4320)))');
    expect(result.type).toBe('and');
    if (result.type === 'and') {
      expect(result.children.length).toBe(2);
      expect(result.children[0]).toEqual({ type: 'key', name: 'A' });
      expect(result.children[1].type).toBe('or');
      if (result.children[1].type === 'or') {
        expect(result.children[1].children.length).toBe(2);
        expect(result.children[1].children[0]).toEqual({ type: 'key', name: 'B' });
        expect(result.children[1].children[1].type).toBe('older');
      }
    }
  });

  it('parses andor(X,Y,Z)', () => {
    const result = parseMiniscript('andor(pk(A),pk(B),pk(C))');
    expect(result.type).toBe('or');
    if (result.type === 'or') {
      expect(result.children.length).toBe(2);
      expect(result.children[0].type).toBe('and');
      expect(result.children[1]).toEqual({ type: 'key', name: 'C' });
    }
  });

  it('parses thresh()', () => {
    const result = parseMiniscript('thresh(2,pk(A),pk(B),pk(C))');
    expect(result.type).toBe('threshold');
    if (result.type === 'threshold') {
      expect(result.k).toBe(2);
      expect(result.n).toBe(3);
      expect(result.children.length).toBe(3);
    }
  });

  it('parses multi()', () => {
    const result = parseMiniscript('multi(2,A,B,C)');
    expect(result.type).toBe('multi');
    if (result.type === 'multi') {
      expect(result.k).toBe(2);
      expect(result.keys).toEqual(['A', 'B', 'C']);
    }
  });

  it('strips wrappers', () => {
    const result = parseMiniscript('c:pk_k(Alice)');
    expect(result).toEqual({ type: 'key', name: 'Alice' });
  });

  it('strips nested wrappers', () => {
    const result = parseMiniscript('v:c:pk_k(Alice)');
    expect(result).toEqual({ type: 'key', name: 'Alice' });
  });

  it('parses just_0 and just_1', () => {
    expect(parseMiniscript('0')).toEqual({ type: 'just_0' });
    expect(parseMiniscript('1')).toEqual({ type: 'just_1' });
  });

  it('throws on unknown fragment', () => {
    expect(() => parseMiniscript('foobar(x)')).toThrow('未知 fragment: foobar');
  });
});
