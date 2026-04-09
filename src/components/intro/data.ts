export type IntroApplicationExample = {
  title: string;
  description: string;
  policy: string;
  miniscript: string;
  bitcoinScript: string;
  scriptSize: string;
  applicationType: string;
  realCase: string;
  advantage: string;
  /** `SCENARIOS` preset id for `?scenario=`; `null` when no matching preset yet. */
  playgroundScenarioId: string | null;
};

export const INTRO_APPLICATION_EXAMPLES: IntroApplicationExample[] = [
  {
    title: '多重签名（2-of-3）',
    description: '三个参与者中任意两个签名即可花费',
    policy: 'thresh(2, pk(Alice), pk(Bob), pk(Charlie))',
    miniscript: 'multi(2, Alice, Bob, Charlie)',
    bitcoinScript:
      '[B] OP_NOTIF [C] OP_NOTIF OP_2 OP_ROT [A] [B] [C] OP_3 OP_CHECKMULTISIG OP_ELSE [A] OP_CHECKSIG OP_ENDIF OP_ELSE [B] OP_CHECKSIG OP_ENDIF',
    scriptSize: 'Policy ~45 字节 → Miniscript ~75 字节 → Bitcoin Script 71 字节',
    applicationType: '多重签名钱包',
    realCase: '比特币基金、交易所冷钱包、DAO 财库',
    advantage: '灵活的门槛配置（2-of-3、3-of-5 等）',
    playgroundScenarioId: 'multisig-2of3',
  },
  {
    title: '多签 + 时间锁定',
    description:
      '需要 Alice 与 Bob 共同签名协作花费，或在输出确认后再经过 1000 个区块，由 Charlie 单独花费',
    policy:
      'or(\n  and(pk(Alice), pk(Bob)),\n  and(pk(Charlie), older(1000))\n)',
    miniscript:
      'andor(\n  pk(Alice), pk(Bob),\n  and_v(v:pk(Charlie), older(1000))\n)',
    bitcoinScript:
      'OP_NOTIF\n  OP_DUP OP_HASH160 [hash_Bob]\n  OP_EQUALVERIFY OP_CHECKSIG\nOP_ELSE\n  [1000] OP_CHECKSEQUENCEVERIFY OP_DROP\n  [hash_Charlie] OP_EQUALVERIFY\n  OP_CHECKSIG\nOP_ENDIF',
    scriptSize: 'Policy ~80 字节 → Miniscript ~65 字节 → Bitcoin Script 54 字节',
    applicationType: '多签钱包 + 时间锁定',
    realCase: '企业财务多重审批、联合创始人资产管理',
    advantage: '防止单点失败，时间锁定提供应急方案',
    playgroundScenarioId: 'multisig-or-timelock',
  },
  {
    title: '恢复密钥',
    description:
      '日常用主密钥单独花费；紧急时在输出确认后再经过 10000 个区块，可用恢复密钥单独花费',
    policy: 'or(\n  pk(Main),\n  and(pk(Recovery), older(10000))\n)',
    miniscript:
      'andor(\n  pk(Recovery), older(10000),\n  pk(Main)\n)',
    bitcoinScript:
      'OP_NOTIF\n  [10000] OP_CHECKSEQUENCEVERIFY OP_DROP\n  [Recovery] OP_ELSE [Main] OP_ENDIF OP_CHECKSIG',
    scriptSize: 'Policy ~60 字节 → Miniscript ~50 字节 → Bitcoin Script 45 字节',
    applicationType: '紧急访问控制',
    realCase: '个人冷钱包备份、遗产继承安排',
    advantage: '日常便利性与紧急保障的平衡',
    playgroundScenarioId: 'recoverykey',
  },
  {
    title: '原子交换（HTLC）',
    description: '哈希时间锁合约： preimage 路径或约 2 周相对时间锁退款',
    policy:
      'or(\n  and(pk(Alice), hash160(HEX)),\n  and(pk(Bob), older(20160))\n)',
    miniscript:
      'andor(\n  pk(Alice), hash160(HEX),\n  and_v(v:pk(Bob), older(20160))\n)',
    bitcoinScript:
      'OP_IF\n  OP_HASH160 [HEX] OP_EQUALVERIFY\n  [Alice] OP_CHECKSIG\nOP_ELSE\n  [20160] OP_CHECKSEQUENCEVERIFY OP_DROP\n  [Bob] OP_CHECKSIG\nOP_ENDIF',
    scriptSize: 'Policy ~90 字节 → Miniscript ~68 字节 → Bitcoin Script 56 字节',
    applicationType: '哈希时间锁合约（HTLC）',
    realCase: '闪电网络跨链原子交换、去中心化交易',
    advantage: '无信任交换，超时自动退款',
    playgroundScenarioId: 'htlc-atomic',
  },
  {
    title: 'DLC 合约',
    description: '基于预言机签名的离散对数合约：两种不同的支付路径',
    policy:
      'or(\n  and(pk(Alice), pk(Oracle_A)),\n  and(pk(Bob), pk(Oracle_B))\n)',
    miniscript:
      'c:andor(\n  pk(Alice), pk_k(Oracle_A),\n  and_v(v:pk(Bob), pk_k(Oracle_B))\n)',
    bitcoinScript:
      'OP_IF\n  [Oracle_A] OP_CHECKSIG OP_NOTIF OP_RETURN OP_ENDIF\n  [Alice] OP_CHECKSIG\nOP_ELSE\n  [Oracle_B] OP_CHECKSIG OP_NOTIF OP_RETURN OP_ENDIF\n  [Bob] OP_CHECKSIG\nOP_ENDIF',
    scriptSize: 'Policy ~110 字节 → Miniscript ~85 字节 → Bitcoin Script 72 字节',
    applicationType: '离散对数合约（DLC）',
    realCase: '比特币期货、去中心化预言机、衍生品',
    advantage: '无需信任的预言机，原生比特币结算',
    playgroundScenarioId: 'dlc-simple',
  },
  {
    title: '支付通道',
    description: '链下支付：双方同意或单方面关闭后延迟',
    policy:
      'or(\n  thresh(2, pk(Alice), pk(Bob)),\n  and(pk(Alice), older(1000))\n)',
    miniscript:
      'or_b(\n  multi(2, pk(Alice), pk(Bob)),\n  and_v(v:pk(Alice), older(1000))\n)',
    bitcoinScript:
      'OP_NOTIF\n  [1000] OP_CHECKSEQUENCEVERIFY OP_DROP\n  [Alice] OP_CHECKSIG\nOP_ELSE\n  OP_2 [Alice] [Bob] OP_2 OP_CHECKMULTISIG\nOP_ENDIF',
    scriptSize: 'Policy ~75 字节 → Miniscript ~58 字节 → Bitcoin Script 48 字节',
    applicationType: '链下支付通道',
    realCase: '闪电网络、Stacking、支付处理器',
    advantage: '几乎无限的链下交易，定期链上结算',
    playgroundScenarioId: null,
  },
  {
    title: '批量支付',
    description:
      '同时满足两组条件：Alice 或 Bob 二选一；Charlie 签名，或在输出确认后再经过 500 个区块',
    policy: 'and(\n  or(pk(Alice), pk(Bob)),\n  or(pk(Charlie), older(500))\n)',
    miniscript:
      'and_v(\n  v:or_c(pk(Alice), v:pk(Bob)),\n  or_d(pk(Charlie), older(500))\n)',
    bitcoinScript:
      'OP_DUP OP_IF [Alice] OP_CHECKSIG OP_ELSE [Bob] OP_CHECKSIG OP_ENDIF OP_NOTIF [500] OP_CHECKSEQUENCEVERIFY OP_DROP [Charlie] OP_CHECKSIG OP_ENDIF',
    scriptSize: 'Policy ~85 字节 → Miniscript ~62 字节 → Bitcoin Script 52 字节',
    applicationType: '条件支付组合',
    realCase: '薪资发放系统、投资分配、多条件托管',
    advantage: '复杂条件逻辑的优雅表达',
    playgroundScenarioId: 'batch-payment',
  },
];

/** Preset ids in the same order as `INTRO_APPLICATION_EXAMPLES`（跳过无预设的卡片，如「支付通道」）— Playground 左栏场景列表与之对齐。 */
export const APPLICATION_PLAYGROUND_SCENARIO_IDS: string[] =
  INTRO_APPLICATION_EXAMPLES.map((ex) => ex.playgroundScenarioId).filter(
    (id): id is string => id != null,
  );
