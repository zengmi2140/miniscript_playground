import type { MiniscriptNode } from './types';
import { blocksToHuman, afterToHuman } from './time-utils';

export function parseMiniscript(expr: string): MiniscriptNode {
  expr = expr.trim();

  const wrapperRegex = /^([asdcvjntlu]):(.+)$/;
  const match = wrapperRegex.exec(expr);
  if (match) {
    return parseMiniscript(match[2]);
  }

  if (expr === '0') return { type: 'just_0' };
  if (expr === '1') return { type: 'just_1' };

  const fragmentMatch = /^(\w+)\((.+)\)$/.exec(expr);
  if (!fragmentMatch) {
    throw new Error(`无法解析: ${expr}`);
  }

  const name = fragmentMatch[1];
  const argsStr = fragmentMatch[2];
  const args = splitArgs(argsStr);

  switch (name) {
    case 'pk':
    case 'pk_k':
    case 'pk_h':
      return { type: 'key', name: args[0] };

    case 'older':
      return {
        type: 'older',
        blocks: parseInt(args[0]),
        humanReadable: blocksToHuman(parseInt(args[0])),
      };

    case 'after':
      return {
        type: 'after',
        value: parseInt(args[0]),
        humanReadable: afterToHuman(parseInt(args[0])),
      };

    case 'sha256':
    case 'hash256':
    case 'ripemd160':
    case 'hash160':
      return { type: 'hash', hashType: name, hash: args[0] };

    case 'and_v':
    case 'and_b':
    case 'and_n':
      return { type: 'and', children: args.map(parseMiniscript) };

    case 'or_b':
    case 'or_c':
    case 'or_d':
    case 'or_i':
      return { type: 'or', children: args.map(parseMiniscript) };

    case 'andor':
      return {
        type: 'or',
        children: [
          { type: 'and', children: [parseMiniscript(args[0]), parseMiniscript(args[1])] },
          parseMiniscript(args[2]),
        ],
      };

    case 'thresh': {
      const k = parseInt(args[0]);
      return {
        type: 'threshold',
        k,
        n: args.length - 1,
        children: args.slice(1).map(parseMiniscript),
      };
    }

    case 'multi':
    case 'multi_a': {
      const mk = parseInt(args[0]);
      return { type: 'multi', k: mk, keys: args.slice(1) };
    }

    default:
      throw new Error(`未知 fragment: ${name}`);
  }
}

function splitArgs(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of argsStr) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}
