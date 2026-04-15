import type { Scenario, KeyVariable } from '@/lib/engine/types';
import { HTLC_TEACHING_HASH160_DIGEST } from '@/lib/playground/htlc-display-mask';

export const DEFAULT_TEST_KEYS: Record<string, string> = {
  Alice: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Bob: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Charlie: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
  /** 简化 DLC 教学：预言机侧公钥占位 */
  Oracle_A: '024f355bdcb7cc0af728ef3cceb9615d90684bb5b2cba8862724862592b0a7f6',
  Oracle_B: '021b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f',
  User: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Service: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Owner: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Heir: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Main: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Hot: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Cold: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Recovery: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
  Holder: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
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
    id: 'multisig-or-timelock',
    icon: 'Users',
    title: { zh: '多签 + 时间锁定', en: 'Multisig + Timelock' },
    description: {
      zh: '需要 Alice 与 Bob 同时签名，或由 Charlie 在输出确认后再经过 1000 个区块单独花费。',
      en: 'Requires Alice and Bob together, or Charlie alone after 1000 blocks since the output confirms.',
    },
    explanation: {
      zh: '由 `or` 连接两条路径：协作多签路径，或 Charlie 与 `older(1000)` 相对时间锁（输出确认后再过 1000 块）。与首页 Applications 教程一致。',
      en: 'Two spending paths: cooperative multisig, or Charlie with `older(1000)` (1000 blocks after confirmation). Matches the Applications walkthrough.',
    },
    policy: 'or(and(pk(Alice),pk(Bob)),and(pk(Charlie),older(1000)))',
    keyVariables: [kv('Alice'), kv('Bob'), kv('Charlie')],
    context: 'wsh',
  },
  {
    id: 'recoverykey',
    icon: 'Heart',
    title: { zh: '恢复密钥', en: 'Recovery Key' },
    description: {
      zh: '正常情况用主密钥签名；紧急时在输出确认后再经过 10000 个区块，可用恢复密钥单独花费。',
      en: 'Spend with the main key normally; after confirmation, wait 10000 blocks to spend with the recovery key alone.',
    },
    explanation: {
      zh: '主路径是 `pk(Main)`：日常花费只需主密钥。另一条路径是恢复密钥加上 `older(10000)`——在输出确认后再经过 10000 个区块，可用 Recovery 单独花费。与首页 Applications「恢复密钥」示例一致。',
      en: 'Primary path is `pk(Main)` for day-to-day spending. The alternate path combines the recovery key with `older(10000)` (10000 blocks after confirmation) so Recovery can spend alone. Matches the Applications “Recovery Key” example.',
    },
    policy: 'or(pk(Main),and(pk(Recovery),older(10000)))',
    keyVariables: [kv('Main'), kv('Recovery')],
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
  {
    id: 'htlc-atomic',
    icon: 'Lock',
    title: { zh: '原子交换（HTLC）', en: 'Atomic Swap (HTLC)' },
    description: {
      zh: '哈希锁路径或超时退款路径；摘要为固定教学值。',
      en: 'Hashlock path or timeout refund; digest is a fixed teaching value.',
    },
    explanation: {
      zh: '演示 HTLC：`hash160(<20 字节摘要 hex>)` 与 `older(2016)`（约 2 周）二选一。摘要为固定测试值，不输入原像。中栏 Policy 与路径图等对摘要以 `HEX` 占位展示，右栏 Tab 为完整 hex。与首页 Applications「原子交换」一致。',
      en: 'HTLC demo: `hash160(<20-byte digest hex>)` vs `older(2016)` (~2 weeks). Fixed digest for teaching; no preimage entry. The policy editor and path map show the digest as `HEX`; the right panel tabs show the full hex. Matches the Applications “Atomic Swap” card.',
    },
    policy: `or(and(pk(Alice),hash160(${HTLC_TEACHING_HASH160_DIGEST})),and(pk(Bob),older(2016)))`,
    keyVariables: [kv('Alice'), kv('Bob')],
    context: 'wsh',
  },
  {
    id: 'dlc-simple',
    icon: 'ShieldCheck',
    title: { zh: 'DLC（简化）', en: 'DLC (simplified)' },
    description: {
      zh: '两条互斥路径，各需一方与预言机侧公钥；非完整 DLC 协议。',
      en: 'Two paths, each with a party and an oracle key — not a full DLC.',
    },
    explanation: {
      zh: '教学用纯 `pk` 组合：Alice+Oracle_A 或 Bob+Oracle_B。真实 DLC 含适配器签名与 attestations，此处不模拟。',
      en: 'Teaching-only `pk` paths: Alice+Oracle_A or Bob+Oracle_B. Real DLCs use adaptor sigs and attestations — not modeled here.',
    },
    policy: 'or(and(pk(Alice),pk(Oracle_A)),and(pk(Bob),pk(Oracle_B)))',
    keyVariables: [kv('Alice'), kv('Bob'), kv('Oracle_A'), kv('Oracle_B')],
    context: 'wsh',
  },
  {
    id: 'batch-payment',
    icon: 'Users',
    title: { zh: '批量支付', en: 'Batch-style conditions' },
    description: {
      zh: '两组条件同时满足：Alice/Bob 二选一，且 Charlie 签名或在输出确认后再经过 500 个区块。',
      en: 'Both branches must pass: Alice or Bob, and Charlie or 500 blocks after the output confirms.',
    },
    explanation: {
      zh: '与首页 Applications「批量支付」一致：`and(or(...), or(...))`；第二组为 Charlie 或 `older(500)`（输出确认后再过 500 块）。角色名为 Alice、Bob、Charlie，对应默认测试公钥表。',
      en: 'Matches Applications “Batch payment”: `and(or(...), or(...))` with Charlie or `older(500)` (500 blocks after confirmation). Alice, Bob, Charlie use the default test keys.',
    },
    policy: 'and(or(pk(Alice),pk(Bob)),or(pk(Charlie),older(500)))',
    keyVariables: [kv('Alice'), kv('Bob'), kv('Charlie')],
    context: 'wsh',
  },
  {
    id: 'holder-timelock',
    icon: 'Clock',
    title: { zh: '穿越牛熊', en: 'Diamond Hands (HODL)' },
    description: {
      zh: '三年后解锁，必须同时满足三年时间锁和签名两个条件。',
      en: 'Unlocks after 3 years, requiring both the timelock and a signature.',
    },
    explanation: {
      zh: '最简单的时间锁场景：`and(pk(Holder), older(157680))`。在 UTXO 确认后必须等待约 3 年（157,680 个区块）并提供 Holder 的签名才能花费。适合强制长期持有。',
      en: 'Simplest timelock scenario: `and(pk(Holder), older(157680))`. Must wait ~3 years (157,680 blocks after confirmation) and provide the Holder signature to spend. Ideal for enforced long-term holding.',
    },
    policy: 'and(pk(Holder),older(157680))',
    keyVariables: [kv('Holder')],
    context: 'wsh',
  },
];
