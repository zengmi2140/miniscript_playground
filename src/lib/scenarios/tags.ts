import type { Scenario } from '@/lib/engine/types';

export type ConditionTag = 'signature' | 'multisig' | 'timelock' | 'hashlock';

export interface TagInfo {
  type: ConditionTag;
  label: { zh: string; en: string };
  color: string;
  bgColor: string;
}

const TAG_MAP: Record<ConditionTag, TagInfo> = {
  signature: {
    type: 'signature',
    label: { zh: '签名', en: 'Signature' },
    color: 'text-semantic-key',
    bgColor: 'bg-semantic-key/10',
  },
  multisig: {
    type: 'multisig',
    label: { zh: '多签', en: 'Multisig' },
    color: 'text-semantic-key',
    bgColor: 'bg-semantic-key/10',
  },
  timelock: {
    type: 'timelock',
    label: { zh: '时间锁', en: 'Timelock' },
    color: 'text-semantic-timelock',
    bgColor: 'bg-semantic-timelock/10',
  },
  hashlock: {
    type: 'hashlock',
    label: { zh: '哈希锁', en: 'Hashlock' },
    color: 'text-semantic-hashlock',
    bgColor: 'bg-semantic-hashlock/10',
  },
};

export function getScenarioTags(scenario: Scenario): TagInfo[] {
  const tags: TagInfo[] = [];
  const policy = scenario.policy;

  const pkCount = (policy.match(/pk\(/g) || []).length;
  const hasThresh = /thresh\(/.test(policy);

  if (hasThresh || pkCount > 1) {
    tags.push(TAG_MAP.multisig);
  } else if (pkCount === 1) {
    tags.push(TAG_MAP.signature);
  }

  if (/older\(|after\(/.test(policy)) {
    tags.push(TAG_MAP.timelock);
  }

  if (/sha256\(|hash256\(|ripemd160\(|hash160\(/.test(policy)) {
    tags.push(TAG_MAP.hashlock);
  }

  return tags;
}

export function getTopBarColor(scenario: Scenario): string {
  const policy = scenario.policy;

  if (/older\(|after\(/.test(policy)) {
    return 'bg-semantic-timelock';
  }

  if (/sha256\(|hash256\(|ripemd160\(|hash160\(/.test(policy)) {
    return 'bg-semantic-hashlock';
  }

  return 'bg-semantic-key';
}
