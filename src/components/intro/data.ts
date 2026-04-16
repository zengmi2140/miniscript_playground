export type IntroApplicationExampleEn = {
  title: string;
  description: string;
  applicationType: string;
  realCase: string;
  advantage: string;
  scriptSize: string;
};

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
  /** Optional English overrides for translatable text fields. */
  en?: IntroApplicationExampleEn;
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
    en: {
      title: 'Multisig (2-of-3)',
      description: 'Any two of three participants can sign to spend',
      applicationType: 'Multisig wallet',
      realCase: 'Bitcoin funds, exchange cold wallets, DAO treasuries',
      advantage: 'Flexible threshold configuration (2-of-3, 3-of-5, etc.)',
      scriptSize: 'Policy ~45 bytes → Miniscript ~75 bytes → Bitcoin Script 71 bytes',
    },
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
    en: {
      title: 'Multisig + Timelock',
      description:
        'Alice and Bob must co-sign to spend, or after 1000 blocks from confirmation Charlie can spend alone',
      applicationType: 'Multisig wallet + Timelock',
      realCase: 'Corporate multi-approval, co-founder asset management',
      advantage: 'No single point of failure; timelock provides an emergency fallback',
      scriptSize: 'Policy ~80 bytes → Miniscript ~65 bytes → Bitcoin Script 54 bytes',
    },
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
    en: {
      title: 'Recovery Key',
      description:
        'Day-to-day spending with the main key; after 10000 blocks from confirmation, the recovery key can spend alone',
      applicationType: 'Emergency access control',
      realCase: 'Personal cold wallet backup, inheritance planning',
      advantage: 'Balances everyday convenience with emergency protection',
      scriptSize: 'Policy ~60 bytes → Miniscript ~50 bytes → Bitcoin Script 45 bytes',
    },
  },
  {
    title: '原子交换（HTLC）',
    description: '哈希时间锁合约： preimage 路径或约 2 周相对时间锁退款',
    policy:
      'or(\n  and(pk(Alice), hash160(HEX)),\n  and(pk(Bob), older(2016))\n)',
    miniscript:
      'andor(\n  pk(Alice), hash160(HEX),\n  and_v(v:pk(Bob), older(2016))\n)',
    bitcoinScript:
      'OP_IF\n  OP_HASH160 [HEX] OP_EQUALVERIFY\n  [Alice] OP_CHECKSIG\nOP_ELSE\n  [2016] OP_CHECKSEQUENCEVERIFY OP_DROP\n  [Bob] OP_CHECKSIG\nOP_ENDIF',
    scriptSize: 'Policy ~90 字节 → Miniscript ~68 字节 → Bitcoin Script 56 字节',
    applicationType: '哈希时间锁合约（HTLC）',
    realCase: '闪电网络跨链原子交换、去中心化交易',
    advantage: '无信任交换，超时自动退款',
    playgroundScenarioId: 'htlc-atomic',
    en: {
      title: 'Atomic Swap (HTLC)',
      description: 'Hash-timelock contract: spend via preimage or claim a refund after ~2 weeks',
      applicationType: 'Hash Time-Locked Contract (HTLC)',
      realCase: 'Lightning Network, cross-chain atomic swaps, decentralized exchanges',
      advantage: 'Trustless exchange with automatic refund on timeout',
      scriptSize: 'Policy ~90 bytes → Miniscript ~68 bytes → Bitcoin Script 56 bytes',
    },
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
    en: {
      title: 'DLC Contract',
      description: 'Oracle-signed discrete log contract: two different payment paths',
      applicationType: 'Discrete Log Contract (DLC)',
      realCase: 'Bitcoin futures, decentralized oracles, derivatives',
      advantage: 'Trustless oracle, native Bitcoin settlement',
      scriptSize: 'Policy ~110 bytes → Miniscript ~85 bytes → Bitcoin Script 72 bytes',
    },
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
    en: {
      title: 'Batch Payment',
      description:
        'Satisfy two groups simultaneously: Alice or Bob (one of); and Charlie or after 500 blocks',
      applicationType: 'Conditional payment combination',
      realCase: 'Payroll systems, investment allocation, multi-condition escrow',
      advantage: 'Elegant expression of complex conditional logic',
      scriptSize: 'Policy ~85 bytes → Miniscript ~62 bytes → Bitcoin Script 52 bytes',
    },
  },
  {
    title: '穿越牛熊',
    description:
      '在输出确认后再经过约三年（157,680 个区块），须同时满足相对时间锁与 Holder 签名才能花费',
    policy: 'and(pk(Holder), older(157680))',
    miniscript: 'and_v(v:pk(Holder), older(157680))',
    bitcoinScript:
      '[157680] OP_CHECKSEQUENCEVERIFY OP_DROP [Holder] OP_CHECKSIG',
    scriptSize: 'Policy ~42 字节 → Miniscript ~48 字节 → Bitcoin Script ~38 字节',
    applicationType: '长期持有 / 强制锁仓',
    realCase: '长期囤币、储蓄型冷钱包、遗产或信托式锁仓',
    advantage: '时间与签名双条件，结构简单、意图清晰',
    playgroundScenarioId: 'holder-timelock',
    en: {
      title: 'Diamond Hands (HODL)',
      description:
        'After ~3 years from confirmation (157,680 blocks), spending requires both the relative timelock and a Holder signature',
      applicationType: 'Long-term hold / enforced lock',
      realCase: 'Long-term stacking, savings-oriented cold storage, inheritance-style locking',
      advantage: 'Timelock plus signature — simple and explicit',
      scriptSize: 'Policy ~42 bytes → Miniscript ~48 bytes → Bitcoin Script ~38 bytes',
    },
  },
];

/** Preset ids in the same order as `INTRO_APPLICATION_EXAMPLES` — 与首页 Applications 标签顺序一致，供 Playground 左栏对齐。 */
export const APPLICATION_PLAYGROUND_SCENARIO_IDS: string[] =
  INTRO_APPLICATION_EXAMPLES.map((ex) => ex.playgroundScenarioId).filter(
    (id): id is string => id != null,
  );
