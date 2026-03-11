import type { SpendingPath, PathCondition, KeyVariable } from './types';
import { blocksToHuman, afterToHuman, isOlderSatisfied } from './time-utils';

interface Satisfaction {
  asm: string;
  nSequence?: number;
  nLockTime?: number;
}

export function analyzeSpendingPaths(
  nonMalleableSats: Satisfaction[],
  malleableSats: Satisfaction[],
  keyVariables: KeyVariable[],
  availableKeys: Set<string>,
  availableHashes: Set<string>,
  currentTimeBlocks: number,
): SpendingPath[] {
  const pubkeyToName: Record<string, string> = {};
  for (const kv of keyVariables) {
    pubkeyToName[kv.publicKey] = kv.name;
  }

  const paths: SpendingPath[] = [];
  let index = 0;

  for (const sat of nonMalleableSats) {
    index++;
    paths.push(
      buildPath(sat, index, false, pubkeyToName, availableKeys, availableHashes, currentTimeBlocks),
    );
  }

  for (const sat of malleableSats) {
    index++;
    paths.push(
      buildPath(sat, index, true, pubkeyToName, availableKeys, availableHashes, currentTimeBlocks),
    );
  }

  paths.sort((a, b) => a.witnessSize - b.witnessSize);

  return paths;
}

function buildPath(
  sat: Satisfaction,
  index: number,
  isMalleable: boolean,
  pubkeyToName: Record<string, string>,
  availableKeys: Set<string>,
  availableHashes: Set<string>,
  currentTimeBlocks: number,
): SpendingPath {
  const conditions = extractConditions(sat, pubkeyToName);

  const timelockConditions = extractTimelockFromSequence(sat.nSequence);
  if (timelockConditions) {
    conditions.push(timelockConditions);
  }
  const absoluteLock = extractTimelockFromLocktime(sat.nLockTime);
  if (absoluteLock) {
    conditions.push(absoluteLock);
  }

  const missingConditions: PathCondition[] = [];
  let satisfiable = true;

  for (const cond of conditions) {
    if (cond.type === 'signature') {
      if (!availableKeys.has(cond.keyName)) {
        satisfiable = false;
        missingConditions.push(cond);
      }
    } else if (cond.type === 'hashlock') {
      if (!availableHashes.has(cond.hash)) {
        satisfiable = false;
        missingConditions.push(cond);
      }
    } else if (cond.type === 'timelock_relative') {
      if (!isOlderSatisfied(cond.blocks, currentTimeBlocks)) {
        satisfiable = false;
        missingConditions.push(cond);
      }
    } else if (cond.type === 'timelock_absolute') {
      satisfiable = false;
      missingConditions.push(cond);
    }
  }

  const witnessSize = estimateWitnessSize(sat.asm);
  const label = generateLabel(index, conditions);

  return {
    index,
    label,
    conditions,
    witnessAsm: sat.asm,
    witnessSize,
    nSequence: sat.nSequence,
    nLockTime: sat.nLockTime,
    isMalleable,
    satisfiable,
    missingConditions,
  };
}

function extractConditions(
  sat: Satisfaction,
  pubkeyToName: Record<string, string>,
): PathCondition[] {
  const conditions: PathCondition[] = [];
  const asm = sat.asm;

  const sigRegex = /<sig\(([^)]+)\)>/g;
  let match: RegExpExecArray | null;
  while ((match = sigRegex.exec(asm)) !== null) {
    const pubkey = match[1];
    const keyName = pubkeyToName[pubkey] || pubkey;
    if (!conditions.some(c => c.type === 'signature' && c.keyName === keyName)) {
      conditions.push({ type: 'signature', keyName });
    }
  }

  const preimageRegex = /<(sha256|hash256|ripemd160|hash160)_preimage\(([^)]+)\)>/g;
  while ((match = preimageRegex.exec(asm)) !== null) {
    const hashType = match[1] as 'sha256' | 'hash256' | 'ripemd160' | 'hash160';
    const hash = match[2];
    conditions.push({ type: 'hashlock', hashType, hash });
  }

  return conditions;
}

function extractTimelockFromSequence(nSequence?: number): PathCondition | null {
  if (nSequence === undefined || nSequence === 0xffffffff) return null;

  const isTimeFlag = (nSequence & 0x00400000) !== 0;
  const value = nSequence & 0x0000ffff;

  if (value === 0) return null;

  if (isTimeFlag) {
    const seconds = value * 512;
    const blocks = Math.round(seconds / 600);
    return {
      type: 'timelock_relative',
      blocks,
      humanReadable: blocksToHuman(blocks),
    };
  }

  return {
    type: 'timelock_relative',
    blocks: value,
    humanReadable: blocksToHuman(value),
  };
}

function extractTimelockFromLocktime(nLockTime?: number): PathCondition | null {
  if (nLockTime === undefined || nLockTime === 0) return null;

  return {
    type: 'timelock_absolute',
    value: nLockTime,
    humanReadable: afterToHuman(nLockTime),
  };
}

function estimateWitnessSize(asm: string): number {
  let size = 0;
  const tokens = asm.split(/\s+/);
  for (const token of tokens) {
    if (token.startsWith('<sig(')) {
      size += 73;
    } else if (token.startsWith('<key(') || token.startsWith('<pk(')) {
      size += 34;
    } else if (token.includes('preimage')) {
      size += 33;
    } else if (token === '0' || token === 'OP_0' || token === '') {
      size += 1;
    } else if (token === '1' || token === 'OP_1') {
      size += 1;
    } else {
      size += 1;
    }
  }
  return size;
}

function generateLabel(index: number, conditions: PathCondition[]): string {
  const sigCount = conditions.filter(c => c.type === 'signature').length;
  const hasTimelock = conditions.some(
    c => c.type === 'timelock_relative' || c.type === 'timelock_absolute',
  );
  const hasHash = conditions.some(c => c.type === 'hashlock');

  let description = '';
  if (sigCount > 0 && !hasTimelock && !hasHash) {
    const names = conditions
      .filter((c): c is PathCondition & { type: 'signature' } => c.type === 'signature')
      .map(c => c.keyName);
    description = names.join(' + ') + ' 签名';
  } else if (hasTimelock && sigCount > 0) {
    description = '超时恢复';
  } else if (hasTimelock) {
    description = '时间锁路径';
  } else if (hasHash) {
    description = '哈希锁路径';
  } else {
    description = '花费路径';
  }

  return `路径 ${index}: ${description}`;
}
