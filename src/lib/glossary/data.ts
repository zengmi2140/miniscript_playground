export interface GlossaryEntry {
  zh: string;
  en: string;
  explain_zh: string;
  explain_en: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  pk: {
    zh: '公钥签名',
    en: 'Public Key',
    explain_zh: '要求指定公钥对应的私钥进行签名。这是最基本的花费条件。',
    explain_en: 'Requires a signature from the specified public key.',
  },
  older: {
    zh: '相对时间锁',
    en: 'Relative Timelock',
    explain_zh:
      '从 UTXO 被创建开始算，必须等待指定数量的区块后才能花费。常用于恢复路径、惩罚窗口等。不是固定日期——每次你重新花费到新地址，计时器就会重置。',
    explain_en:
      'Must wait a specified number of blocks after the UTXO is created before spending.',
  },
  after: {
    zh: '绝对时间锁',
    en: 'Absolute Timelock',
    explain_zh:
      '必须等到指定的区块高度或日期之后才能花费。与 older 不同，这是一个固定的截止点，不会因为转账而重置。',
    explain_en:
      'Cannot spend until a specific block height or date is reached.',
  },
  and: {
    zh: '且（AND）',
    en: 'AND',
    explain_zh: '所有子条件都必须同时满足才能花费。',
    explain_en: 'All sub-conditions must be satisfied simultaneously.',
  },
  or: {
    zh: '或（OR）',
    en: 'OR',
    explain_zh:
      '满足任意一个子条件即可花费。可以用 N@ 标注分支权重提示（仅用于编译优化，不影响花费逻辑）。',
    explain_en: 'Any one sub-condition is sufficient to spend.',
  },
  thresh: {
    zh: '阈值条件',
    en: 'Threshold',
    explain_zh:
      'N 个条件中需要满足 K 个。多签是最常见的例子，但条件不限于签名——时间锁也可以作为其中一个条件。',
    explain_en: 'K out of N conditions must be met.',
  },
  sha256: {
    zh: 'SHA256 哈希锁',
    en: 'SHA256 Hash Lock',
    explain_zh:
      '需要揭示一个 32 字节的原像（preimage），其 SHA256 哈希值等于指定值。常用于原子交换和闪电网络 HTLC。',
    explain_en:
      'Requires revealing a 32-byte preimage whose SHA256 hash matches.',
  },
  descriptor: {
    zh: '输出描述符',
    en: 'Output Descriptor',
    explain_zh:
      '描述一类比特币输出的模板。包含脚本类型（如 wsh、tr）和具体的 Miniscript。可以从描述符直接推导出地址。',
    explain_en: 'A template describing a class of Bitcoin outputs.',
  },
  satisfaction: {
    zh: '满足条件',
    en: 'Satisfaction',
    explain_zh:
      '能够解锁脚本、花费资金的一组见证数据（签名、原像、时间锁等）。一个脚本可能有多种满足方式，对应不同的花费路径。',
    explain_en: 'A set of witness data that unlocks the script.',
  },
  witness: {
    zh: '见证数据',
    en: 'Witness',
    explain_zh:
      '花费交易中附带的数据，用于证明你有权花费这笔钱。包括签名、公钥、哈希原像等。见证数据的大小直接影响交易手续费。',
    explain_en:
      'Data attached to a spending transaction proving authorization.',
  },
  'non-malleable': {
    zh: '不可延展',
    en: 'Non-malleable',
    explain_zh:
      '见证数据无法被第三方修改为另一种有效形式。使用不可延展的满足方式可以防止攻击者篡改你的交易大小和费率。',
    explain_en:
      'The witness cannot be modified into another valid form by a third party.',
  },
  miniscript: {
    zh: 'Miniscript',
    en: 'Miniscript',
    explain_zh:
      '一种结构化的比特币脚本子集表示法。它让复杂的花费条件变得可分析、可组合、可预测。Policy 编译后得到 Miniscript，Miniscript 再编码为真正的 Bitcoin Script。',
    explain_en:
      'A structured representation of a subset of Bitcoin Script.',
  },
  policy: {
    zh: '策略语言',
    en: 'Policy Language',
    explain_zh:
      '一种高层级、人类可读的语言，用于描述花费条件。比 Miniscript 更简洁易懂，编译器会自动将其优化为最经济的 Miniscript。',
    explain_en:
      'A high-level, human-readable language for describing spending conditions.',
  },
};
