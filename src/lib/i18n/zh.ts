'use client';

export const zh: Record<string, string> = {
  'home.hero.title': '比特币花费条件，讲清楚',
  'home.hero.subtitle': '通过真实的花费场景理解 Miniscript —— 从多签、时间锁到可工作的脚本。',
  'home.hero.desc': '每个 Bitcoin UTXO 背后都有一组规则，决定谁可以花费它以及何时可以花费。Miniscript Lab 帮你理解这些规则。',
  'home.hero.cta.primary': '查看应用场景',
  'home.hero.cta.secondary': '打开 Playground',
  'home.hero.card.label': '花费路径分析',
  'home.hero.card.path1': 'Alice + Bob 签名',
  'home.hero.card.path2': 'Alice + 等待 30 天',
  'home.hero.card.path3': 'Bob + 等待 30 天',

  'home.explainer.label': '基础概念',
  'home.explainer.title': '什么是 Miniscript？',
  'home.explainer.subtitle': '每个 Bitcoin UTXO 都由脚本约束，定义谁可以花费以及何时可以花费。Miniscript 是一种结构化语言，让这些规则可读、可组合，并可形式化验证。',

  'home.explainer.what.title': 'Miniscript 是什么',
  'home.explainer.what.desc': 'Bitcoin Script 是低层堆栈语言，既难写对，也难审计。Miniscript 是 Bitcoin Script 的结构化子集，用可组合的 Policy 树表达花费条件，再由工具自动编译成链上脚本，避免手写错误。',

  'home.explainer.why.title': '为什么重要',
  'home.explainer.why.benefit1': '语义可读：and()、or()、thresh() 直接映射为业务逻辑',
  'home.explainer.why.benefit2': '可组合、可审计：条件可以自由嵌套，工具自动分析所有花费路径和最小 Witness',
  'home.explainer.why.benefit3': '链上安全：编译结果会自动通过所有 Bitcoin Script 安全约束检查',

  'home.explainer.mission.label': '我们的目标',
  'home.explainer.mission.title': '为什么要做这个',
  'home.explainer.mission.desc': 'Miniscript 工具分散、文档密集，而且钱包开发者和高级用户之间有很高的学习门槛。Miniscript Lab 把编译、路径分析和可视化构建放到一个交互式平台里，让任何人都能真正理解比特币花费条件。',

  'home.explainer.comparison.old.title': '原始 Bitcoin Script（难以阅读）',
  'home.explainer.comparison.old.example': `OP_2\n<Alice> <Bob> <Carol>\nOP_3 OP_CHECKMULTISIG`,
  'home.explainer.comparison.old.problem1': '操作码栈不直观 —— 即使专家也要逐字节追踪才能理解意图',
  'home.explainer.comparison.old.problem2': '稍复杂一点的条件就几乎不可能手写正确 —— 一个字节写错就可能永久锁币',

  'home.explainer.comparison.new.title': 'Miniscript Policy（一眼可读）',
  'home.explainer.comparison.new.example': `or(\n  thresh(2, pk(Alice), pk(Bob), pk(Carol)),\n  and(pk(Alice), older(52560))\n)`,
  'home.explainer.comparison.new.advantage1': '结构就是语义：or / and / thresh 直接映射意图',
  'home.explainer.comparison.new.advantage2': '自动编译成最优脚本 —— 工具验证安全性，不需要手写低级代码',

  'home.how.label': '工作方式',
  'home.how.title': '它是怎么工作的？',
};