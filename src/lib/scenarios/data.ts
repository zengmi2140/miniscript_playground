import type { Scenario, KeyVariable } from '@/lib/engine/types';

export const DEFAULT_TEST_KEYS: Record<string, string> = {
  Alice: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Bob: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Charlie: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
  User: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Service: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Owner: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Heir: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Hot: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Cold: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Recovery: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
};

function kv(name: string, policyName?: string): KeyVariable {
  return {
    name,
    policyName: policyName || name,
    publicKey: DEFAULT_TEST_KEYS[name],
  };
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'single-key',
    icon: 'Key',
    title: { zh: '个人单签', en: 'Single Key' },
    description: {
      zh: '只有你一个人可以花这笔钱。最简单的情况。',
      en: 'Only you can spend. The simplest case.',
    },
    explanation: {
      zh: '这是最基础的比特币花费条件：一把私钥对应一个公钥，用这把私钥签名就能花费。优点是简单，缺点是私钥丢了就永远无法恢复。',
      en: 'The most basic Bitcoin spending condition: one private key corresponds to one public key. Sign with the private key to spend. Simple but no recovery if the key is lost.',
    },
    policy: 'pk(Alice)',
    keyVariables: [kv('Alice')],
    context: 'wsh',
  },
  {
    id: 'multisig-2of3',
    icon: 'Users',
    title: { zh: '2-of-3 多签', en: '2-of-3 Multisig' },
    description: {
      zh: '三把钥匙，任意两把就能花。适合团队或家庭共管。',
      en: 'Three keys, any two can spend. Great for teams or families.',
    },
    explanation: {
      zh: '经典的多签方案。三个参与者各持一把私钥，任意两人合作即可花费资金。常用于公司金库、家庭共管账户等场景。即使丢了一把钥匙，另外两把仍然可以恢复资金。',
      en: 'Classic multisig. Three participants each hold a private key, any two can cooperate to spend. Even if one key is lost, the other two can still recover funds.',
    },
    policy: 'thresh(2,pk(Alice),pk(Bob),pk(Charlie))',
    keyVariables: [kv('Alice'), kv('Bob'), kv('Charlie')],
    context: 'wsh',
  },
  {
    id: '2fa-recovery',
    icon: 'ShieldCheck',
    title: { zh: '2FA + 超时恢复', en: '2FA with Timeout Recovery' },
    description: {
      zh: '平时双重验证花费；服务商失联 30 天后你可以自己恢复。',
      en: 'Two-factor to spend normally; self-recovery after 30 days if service goes offline.',
    },
    explanation: {
      zh: '日常花费需要你和 2FA 服务商同时签名（双保险）。但如果服务商倒闭或失联，等待 30 天（约 4,320 个区块）后，你可以独自签名恢复资金。Policy 中的 99@ 是编译器优化提示，不影响实际花费逻辑。',
      en: 'Daily spending requires both your signature and the 2FA service (double safety). If the service goes offline, after 30 days (~4,320 blocks), you can recover funds alone.',
    },
    policy: 'and(pk(User),or(99@pk(Service),older(4320)))',
    keyVariables: [kv('User'), kv('Service')],
    context: 'wsh',
  },
  {
    id: 'inheritance',
    icon: 'Heart',
    title: { zh: '遗产继承', en: 'Inheritance Plan' },
    description: {
      zh: '平时你自己花；一年不活跃后，继承人也能花。',
      en: 'You spend normally; after 1 year of inactivity, your heir can access funds.',
    },
    explanation: {
      zh: '这是一个简单的继承方案：你随时可以用自己的私钥花费资金。但如果你有 1 年（约 52,560 个区块）没有移动这笔 UTXO，继承人就获得花费权。注意：你需要每年至少"刷新"一次（把钱转给自己的新地址），以重置计时器。',
      en: 'Simple inheritance: you can spend anytime with your key. After 1 year (~52,560 blocks) of inactivity, the heir gains spending rights. You need to "refresh" at least annually.',
    },
    policy: 'or(99@pk(Owner),and(pk(Heir),older(52560)))',
    keyVariables: [kv('Owner'), kv('Heir')],
    context: 'wsh',
  },
  {
    id: 'degrading-multisig',
    icon: 'Vault',
    title: { zh: '退化多签金库', en: 'Degrading Multisig Vault' },
    description: {
      zh: '平时 3-of-3 全员签名；90 天后降级为 2-of-3。',
      en: '3-of-3 normally; degrades to 2-of-3 after 90 days.',
    },
    explanation: {
      zh: '这是一个巧妙的策略：正常情况下需要三个管理员全部签名（最安全）。但如果其中一人失联超过 90 天（约 12,960 个区块），剩余两人即可花费。thresh(3,...) 配合 older() 实现了"时间锁当作第四把钥匙"的效果。',
      en: 'Clever strategy: normally all three admins must sign (safest). If one is unavailable for 90 days (~12,960 blocks), the remaining two can spend.',
    },
    policy: 'thresh(3,pk(Alice),pk(Bob),pk(Charlie),older(12960))',
    keyVariables: [kv('Alice'), kv('Bob'), kv('Charlie')],
    context: 'wsh',
  },
  {
    id: 'vault-hot-cold',
    icon: 'Lock',
    title: { zh: '保险柜', en: 'Hot + Cold Vault' },
    description: {
      zh: '日常热钱包 + 冷钱包双签；紧急情况下恢复密钥 120 天后介入。',
      en: 'Hot + Cold dual-sign daily; recovery key kicks in after 120 days.',
    },
    explanation: {
      zh: '双层安全设计：日常使用需要热钱包和冷钱包同时签名。如果冷钱包丢失或损坏，恢复密钥在 120 天（约 17,280 个区块）后可以独立花费。99@ 表示正常双签路径更常用。',
      en: 'Dual-layer security: daily use requires both hot and cold wallet signatures. If the cold wallet is lost, the recovery key can spend independently after 120 days (~17,280 blocks).',
    },
    policy: 'or(99@and(pk(Hot),pk(Cold)),and(pk(Recovery),older(17280)))',
    keyVariables: [kv('Hot'), kv('Cold'), kv('Recovery')],
    context: 'wsh',
  },
];
