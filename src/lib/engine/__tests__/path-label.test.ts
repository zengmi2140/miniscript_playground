import { describe, it, expect } from 'vitest';
import { formatSpendingPathLabel } from '../path-label';
import type { SpendingPath } from '../types';
import type { I18nKey } from '@/lib/i18n/context';
import { zh } from '@/lib/i18n/zh';

function t(key: I18nKey, params?: Record<string, string | number>): string {
  const path = key.split('.');
  let cur: unknown = zh;
  for (const seg of path) {
    cur = cur != null && typeof cur === 'object' ? (cur as Record<string, unknown>)[seg] : undefined;
  }
  let s = typeof cur === 'string' ? cur : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

describe('formatSpendingPathLabel', () => {
  it('formats Chinese line for timelock recovery variant', () => {
    const path: SpendingPath = {
      index: 1,
      labelVariant: { kind: 'timelock_recovery' },
      conditions: [],
      witnessAsm: '',
      witnessSize: 0,
      isMalleable: false,
      satisfiable: false,
      missingConditions: [],
    };
    expect(formatSpendingPathLabel(path, t)).toBe('路径 1: 超时恢复');
  });

  it('formats signature names in description', () => {
    const path: SpendingPath = {
      index: 2,
      labelVariant: { kind: 'signatures', names: ['Bob', 'Alice'] },
      conditions: [],
      witnessAsm: '',
      witnessSize: 0,
      isMalleable: false,
      satisfiable: true,
      missingConditions: [],
    };
    expect(formatSpendingPathLabel(path, t)).toBe('路径 2: Bob + Alice 签名');
  });
});
