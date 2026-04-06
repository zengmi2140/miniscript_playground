export const zh: Record<string, string> = {
  // Homepage
  'home.hero.title': '把 Bitcoin 的花费条件讲清楚',
  'home.hero.subtitle': '用真实的花费场景理解 Miniscript，从多签到时间锁，从理论到可运行的脚本。',
  'home.hero.desc': '每一个 Bitcoin UTXO 背后，都有一套决定"谁能花、什么时候花"的规则。Miniscript Lab 帮你读懂这套规则。',
  'home.hero.cta.primary': '从场景开始',
  'home.hero.cta.secondary': '打开 Playground',
  'home.hero.card.label': '花费路径分析',
  'home.hero.card.path1': 'Alice + Bob 签名',
  'home.hero.card.path2': 'Alice + 等待 30 天',
  'home.hero.card.path3': 'Bob + 等待 30 天',

  // Miniscript Explainer section
  'home.explainer.label': '基础知识',
  'home.explainer.title': '什么是 Miniscript？',
  'home.explainer.subtitle': '每一个 Bitcoin UTXO 背后，都有一套规定"谁能花、何时能花"的脚本。Miniscript 是一种更结构化的语言，让这套规则变得可读、可组合、可验证。',

  'home.explainer.what.title': 'Miniscript 是什么',
  'home.explainer.what.desc': 'Bitcoin Script 是图灵不完备的低级脚本语言，直接编写容易出错且难以审计。Miniscript 是 Bitcoin Script 的一个结构化子集——它把花费条件表达为可组合的策略树，由工具自动编译为链上脚本，杜绝手写错误。',

  'home.explainer.why.title': '为什么需要它',
  'home.explainer.why.benefit1': '策略语义清晰：and()、or()、thresh() 直接描述业务逻辑，任何人都能读懂',
  'home.explainer.why.benefit2': '可组合可审计：子条件自由嵌套，工具自动分析所有花费路径和最小 Witness',
  'home.explainer.why.benefit3': '链上安全：编译结果经过形式化验证，满足 Bitcoin Script 的所有安全约束',

  'home.explainer.mission.label': '我们的目标',
  'home.explainer.mission.title': '我们为什么做这个',
  'home.explainer.mission.desc': 'Miniscript 的工具链分散、文档晦涩，钱包开发者和高级用户之间存在巨大的学习门槛。Miniscript Lab 把编译、路径分析、可视化搭建整合到一个交互式平台，让任何人都能真正读懂 Bitcoin 花费条件。',

  'home.explainer.comparison.old.title': '传统 Bitcoin Script（难以读懂）',
  'home.explainer.comparison.old.example': `OP_2\n<Alice> <Bob> <Carol>\nOP_3 OP_CHECKMULTISIG`,
  'home.explainer.comparison.old.problem1': '操作码堆叠，语义不直观，需要专家逐行解读',
  'home.explainer.comparison.old.problem2': '稍微复杂的条件组合极难手写正确，一个字节错误就会锁死资金',

  'home.explainer.comparison.new.title': 'Miniscript Policy（一眼读懂）',
  'home.explainer.comparison.new.example': `or(\n  thresh(2, pk(Alice), pk(Bob), pk(Carol)),\n  and(pk(Alice), older(52560))\n)`,
  'home.explainer.comparison.new.advantage1': '结构即语义：or / and / thresh 直接映射业务意图',
  'home.explainer.comparison.new.advantage2': '自动编译为最优脚本，工具验证安全性，无需手写底层代码',

  'home.how.label': '使用流程',
  'home.how.title': '三步理解任意花费策略',
  'home.how.subtitle': '从场景选择到完整链上脚本，每一步都有可视化反馈。',
  'home.how.step1.title': '选择或描述场景',
  'home.how.step1.desc': '从真实使用场景出发：个人单签、团队多签、遗产继承、双重验证……',
  'home.how.step1.example': '2-of-3 多签 · 遗产继承 · 2FA',
  'home.how.step2.title': '编写或搭建策略',
  'home.how.step2.desc': '用 Policy 语言描述规则，或在可视化画布上拖拽组合，实时看到 Miniscript 输出。',
  'home.how.step2.example': 'thresh(2,pk(A),pk(B),older(4320))',
  'home.how.step3.title': '看懂所有花费路径',
  'home.how.step3.desc': '每一条能花的路径都被列出，并可交互模拟：勾选签名、拨动时间，看哪条路径点亮。',
  'home.how.step3.example': 'Path 1: Alice + Bob · Path 2: 超时',
  'home.how.step4.title': '拿到链上可用脚本',
  'home.how.step4.desc': '完整输出 Script、Descriptor 和 P2WSH 地址，可直接用于测试网部署。',
  'home.how.step4.example': 'OP_2 <Alice> <Bob> ... OP_CHECKMULTISIG',

  'home.features.label': '核心能力',
  'home.features.title': '不只是编译器',
  'home.features.subtitle': '为真正理解而设计，而不仅仅是生成脚本。',
  'home.features.f1.title': '实时编译反馈',
  'home.features.f1.desc': '输入 Policy 即时看到 Miniscript、Script、Descriptor 和地址，语法错误精确定位。',
  'home.features.f2.title': '花费路径可视化',
  'home.features.f2.desc': '所有满足条件组合都以树状路径展示，可交互模拟签名和时间锁状态。',
  'home.features.f3.title': '可视化策略搭建',
  'home.features.f3.desc': '无需写代码，在画布上点选条件节点，拖拽组合，系统自动生成对应的 Policy 语法。',
  'home.features.f4.title': '一键分享',
  'home.features.f4.desc': '将当前策略、密钥变量和模拟状态打包成可分享链接，方便协作讨论。',

  'home.scenarios.label': '场景库',
  'home.scenarios.title': '从真实场景开始探索',
  'home.scenarios.subtitle': '每个场景都配有解释说明、完整 Policy 和交互式花费路径图。',

  'home.cta.title': '准备好自己设计了吗？',
  'home.cta.subtitle': '在 Playground 里自由输入任意 Policy，或者用可视化构建器从零搭建。',
  'home.cta.playground': '打开空白 Playground',
  'home.cta.build': '用画布搭建策略',
  'home.playground.desktopHint': 'Playground 建议在桌面端打开以获得完整体验。',

  // Builder
  'builder.starter.title': '选择策略类型',
  'builder.starter.subtitle': '选择根节点类型；之后可在画布上继续添加条件。',
  'builder.starter.singleControl': '单人控制',
  'builder.starter.singleControlDesc': '单个密钥完全控制',
  'builder.starter.sharedControl': '多人共管',
  'builder.starter.sharedControlDesc': '多签 (2-of-3)',
  'builder.canvas.waitingTree': '正在编译并同步画布…',
  'builder.canvas.initializing': '正在同步画布…',
  'builder.sync.textLed': '当前 Policy 包含构建器不支持的语法（如 after() 或哈希锁），画布显示上次同步的快照',
  'builder.sync.compileError':
    'Policy 无法编译或解析，画布为只读。若尚无成功编译记录，将显示初始占位；请修正 Policy 后重新同步。',
  'builder.sync.readOnly': '只读模式',
  'builder.node.signature': '签名',
  'builder.node.timelock': '时间锁',
  'builder.node.threshold': '门限',
  'builder.node.all': '都需要',
  'builder.node.any': '任选一',
  'builder.node.addChild': '添加条件',
  'builder.node.delete': '删除',

  // Operator switch
  'builder.op.switch.title': '切换操作符',
  'builder.op.all': '都需要',
  'builder.op.all.desc': '所有子条件都必须满足（AND）',
  'builder.op.any': '任选一',
  'builder.op.any.desc': '满足其中一个即可（OR）',
  'builder.op.threshold': '门限多签',
  'builder.op.threshold.desc': 'k-of-n，满足 k 个条件即可',
  'builder.op.threshold.k.label': '所需满足数量',
  'builder.op.threshold.confirm': '确认',
  'builder.op.binaryTrimNotice':
    '已切换为「都需要 / 任选一」，仅保留前两个子条件。',

  // Wrap
  'builder.wrap.title': '包裹进新组',
  'builder.wrap.depthWarning': '嵌套层数较多，建议不超过 5 层',
  'builder.node.wrap': '包装为',
  'builder.node.undefinedRole': '未定义的角色',
  'builder.popover.selectRole': '选择角色',
  'builder.popover.addRole': '新建角色',
  'builder.popover.blocks': '区块数',
  'builder.popover.timePreset': '常用时间',
  'builder.popover.threshold': '门限值',
  'builder.popover.thresholdHint': '{k} / {n} 个签名',
  'builder.popover.timeConversion': '约 {time}',
  'builder.popover.7days': '7 天',
  'builder.popover.30days': '30 天',
  'builder.popover.90days': '90 天',
  'builder.popover.180days': '180 天',
  'builder.popover.1year': '1 年',
  'builder.popover.custom': '自定义',
  'builder.action.wrapAll': '包装为「都需要」',
  'builder.action.wrapAny': '包装为「任选一」',
  'builder.action.wrapThreshold': '包装为「门限」',
  'builder.action.addSignature': '添加签名',
  'builder.action.addTimelock': '添加时间锁',
  'builder.action.addGroup': '添加嵌套组',
  'builder.confirm.title': '确认删除',
  'builder.confirm.deleteRoot': '确定要删除整个策略吗？这将重置画布到初始状态。',
  'builder.confirm.cancel': '取消',
  'builder.confirm.confirm': '确认删除',
  'playground.left.diyActive': '正在构建',
  'nav.scenarios': '场景',
  'nav.playground': 'Playground',
  'nav.compare': '资源',
  'nav.comingSoon': '������推出',
  'nav.toggleMenu': '菜单',
  'header.language.zh': '中文',
  'header.language.en': 'EN',
  'header.theme.light': '亮色',
  'header.theme.dark': '暗色',
  'scenarios.title': 'Miniscript Lab',
  'scenarios.subtitle': '把 Bitcoin 的花费条件讲清楚',
  'scenarios.orWrite': '或者自己写',
  'scenarios.openBlank': '打开空白 Playground',
  'playground.editor.title': 'Policy 编辑器',
  'playground.editor.placeholder': '在这里输入策略，例如：pk(Alice)',
  'playground.editor.compile': '编译',
  'playground.editor.format': '格式化',
  'playground.editor.clear': '清空',
  'playground.editor.copy': '复制',
  'playground.editor.share': '分享',
  'playground.editor.shareCopied': '已复制',
  'playground.error.hints': '建议',
  'playground.error.expandDetails': '显示技术详情',
  'playground.error.collapseDetails': '隐藏技术详情',
  'playground.error.copyRaw': '复制原始错误',
  'playground.error.rawCopied': '已复制',
  'playground.keys.title': '角色变量',
  'playground.keys.add': '添加',
  'playground.keys.random': '随机',
  'playground.keys.restore': '恢复默认',
  'playground.context.title': '地址类型',
  'playground.context.wsh': 'SegWit v0 (P2WSH)',
  'playground.context.tr': 'Taproot',
  'playground.context.comingSoon': 'Coming Soon',
  'playground.pathmap.title': '花费路径地图',
  'playground.conditions.title': '条件模拟',
  'playground.timeslider.label': '时间流逝',
  'playground.timeslider.blocks': '区块',
  'playground.timeslider.current': '当前: 第 {blocks} 区块 ≈ {human}',
  'playground.status.canSpend': '可花费: {path}',
  'playground.status.waiting': '还需等待 {time}，{path}才可用',
  'playground.status.cannotSpend': '当前条件下无法花费，还缺 {missing}',
  'playground.status.someConditions': '部分条件',
  'playground.results.policy': 'Policy',
  'playground.results.miniscript': 'Miniscript',
  'playground.results.script': 'Script',
  'playground.results.descriptor': 'Descriptor',
  'playground.results.address': 'Address',
  'playground.results.paths': '花费路径',
  'playground.results.warnings': '警告',
  'playground.results.panelNav': '结果面板',
  'playground.results.explain': '这是什么？',
  'playground.stack.title': '栈机模拟器',
  'playground.stack.comingSoon': 'Coming Soon',
  'playground.empty.title': '输入 Policy 或选择一个场景',
  'playground.empty.subtitle': '开始探索 Bitcoin 花费路径',
  'compare.comingSoon': '对比模式即将推出',
  'compare.description': '并排对比两个 Policy 的编译结果与花费路径',
  'compare.featureList.title': '计划功能',
  'compare.feature.1': '并排对比两个 Policy 的编译结果',
  'compare.feature.2': '花费路径差异可视化',
  'compare.feature.3': '脚本大小与手续费对比',
  'compare.feature.4': '导出 Markdown / JSON 报告',

  // Resources page
  'resources.title': 'Resource 资源',
  'resources.subtitle': 'Miniscript 学习资料、工具链接与常见问题解答，帮你更快理解比特币花费条件。',
  'resources.faq.label': '常见问题',
  'resources.faq.title': '你可能想知道的问题',
  'resources.faq.subtitle': '从入门概念到进阶用法，这里汇总了关于 Miniscript 最常见的疑问。',
  'resources.links.label': '外部资源',
  'resources.links.title': '推荐阅读与工具',
  'resources.links.subtitle': '以下资源由社区整理，点击可跳转到相应网站或文档。内容持续补充中。',
  'resources.links.placeholder': '资源链接即将添加，敬请期待。',

  // FAQ section headers
  'resources.faq.section.foundation': '基础概念',
  'resources.faq.section.language': 'Miniscript 语言基础',
  'resources.faq.section.technical': 'Miniscript 技术细节',
  'resources.faq.section.tooling': '工具与安全',

  // FAQ items
  'resources.faq.q1': '什么是 Miniscript？它和 Bitcoin Script 有什么区别？',
  'resources.faq.a1': `**Miniscript 是 Bitcoin Script 的结构化子集**，用 \`pk()\`、\`and()\`、\`or()\`、\`thresh()\` 等可组合的策略函数来描述花费条件。

Bitcoin Script 是比特币网络的低级脚本语言，由操作码堆叠构成，难以手写和审计。Miniscript 则由工具自动编译为链上脚本。

核心优势：
- 语义清晰：用高级策略函数替代低级操作码
- 可组合：策略可以灵活嵌套和组合
- 可形式化验证：编译器验证脚本安全性
- 编译约束检查：结果经过安全审查`,

  'resources.faq.q5': '什么是 Descriptor（输出描述符）？为什么需要它？',
  'resources.faq.a5': `**Descriptor 是对"如何生成一个比特币地址"的完整描述**，例如 \`wsh(thresh(2,pk(A),pk(B),pk(C)))\` 表示使用 SegWit v0 P2WSH 包裹一个 2-of-3 多签脚本。

它包含了地址类型（P2PKH / P2WPKH / P2WSH / P2TR 等）和脚本内容，让钱包软件可以精确还原地址和花费逻辑。

为什么需要：
- 精确还原：钱包可以从 Descriptor 重新生成地址和花费方式
- 标准化：社区统一的描述格式，便于交换和存储
- 无需记忆：不需要用户记忆底层操作码和脚本细节
- 跨工具兼容：符合 SLIP-0380 标准，支持多个钱包实现`,

  'resources.faq.q2': '什么是 Policy？它和 Miniscript 的关系是什么？',
  'resources.faq.a2': `**Policy 是更高层次的策略描述语言**，语法更接近业务逻辑，例如 \`or(pk(Alice), and(pk(Bob), older(144)))\`。

三层抽象关系：

1. **Policy**：最高层，用人类可读的逻辑描述花费条件
2. **Miniscript**：中间层，Policy 编译后的产物，更贴近 Bitcoin Script 结构，包含 witness 类型和 wrapper 信息
3. **Bitcoin Script**：最低层，链上实际执行的操作码序列

工作流程：
- 用户只需编写 Policy
- 工具自动编译为最优 Miniscript
- 再进一步编译为链上 Script`,

  'resources.faq.q9': '花费路径（Spending Path）是什么意思？',
  'resources.faq.a9': `**花费路径是满足策略条件的一种具体组合方式**。

例子：策略 \`or(pk(Alice), and(pk(Bob), older(144)))\` 有两条路径：

- 路径 1：Alice 签名（条件满足）
- 路径 2：Bob 签名 + 等待 144 个区块

条件模拟器的作用：
- 勾选签名：模拟指定人员的签名状态
- 拖动时间滑块：调整区块高度，检查时间锁
- 实时反馈：显示当前哪条路径可用，还缺哪些条件`,

  'resources.faq.q3': '`older()` 和 `after()` 有什么区别？',
  'resources.faq.a3': `**两种时间锁的核心差异在于计算方式**。

\`older(n)\` - 相对时间锁：
- 基于 \`nSequence\` 字段实现
- 表示"从这笔资金被锁定起，至少经过 n 个区块后才能花费"
- 常见场景：遗产继承、备用恢复等

\`after(n)\` - 绝对时间锁：
- 基于 \`nLockTime\` 字段实现
- 表示"比特币区块高度达到 n 之后才能花费"
- 常见场景：约定在特定时间点解锁的合约、定时发行等

选择建议：
- 相对时间锁更灵活，因为计算从交易确认时开始
- 绝对时间锁更清晰，直接指定解锁的具体区块`,

  'resources.faq.q4': '什么是 thresh()？和 and() / or() 有什么不同？',
  'resources.faq.a4': `**\`thresh()\` 是通用的门限操作符**，表示"N 个条件中至少满足 k 个即可花费"。

基本关系：

- \`and(a, b)\` ≈ \`thresh(2, a, b)\`（两个都必须满足）
- \`or(a, b)\` ≈ \`thresh(1, a, b)\`（满足其中任一即可）
- \`thresh(2, pk(Alice), pk(Bob), pk(Carol))\` = 三人中任意两人签名即可花费

为什么需要 \`thresh()\`：
- 灵活性：支持任意 k-of-N 组合，无需单独定义 \`and()\` 和 \`or()\`
- 表达力：能描述更复杂的门限条件
- 效率：编译器可以针对不同的 k 值进行专门优化`,

  'resources.faq.q6': '什么是 P2WSH？和 P2PKH、P2WPKH 有什么区别？',
  'resources.faq.a6': `**三种地址格式的主要差异在于脚本的大小和 Witness 处理方式**。

P2PKH（传统格式）：
- 完整脚本存储在 scriptSig 中
- 手续费较高，不适合复杂脚本

P2WPKH（SegWit v0 单签格式）：
- 仅用于单个公钥的标准支付
- Witness 数据分离，手续费更低

P2WSH（SegWit v0 脚本哈希格式）：
- 适合复杂的多签或时间锁脚本
- Witness 数据独立于交易主体
- 脚本以哈希形式存储，节省空间
- 是 Miniscript 默认支持的格式

说明：
- Miniscript Lab 当前 MVP 仅支持 P2WSH
- Taproot（P2TR）将在未来版本支持`,

  'resources.faq.q7': '这个工具生成的地址可以在主网使用吗？',
  'resources.faq.a7': `**不可以**。Miniscript Lab 是一个纯教学工具，所有地址均基于测试网生成。

重要限制：
- 只支持 Bitcoin Testnet / Signet 网络
- 不连接任何区块链网络
- 不处理私钥、助记词或真实签名
- 无法进行真实交易签名

正确用途：
- 学习和理解 Miniscript 语法
- 设计和原型化花费条件
- 测试多签和时间锁逻辑

警告：
- 请勿将此处生成的地址用于主网资金存储
- 请勿用真实私钥导入工具
- 此工具仅为教育目的`,

  'resources.faq.q8': '可视化构建器（画布模式）与直接写 Policy 有什么区别？',
  'resources.faq.a8': `**两种方式在底层是等价的**——画布操作会实时生成对应的 Policy 文本，反之亦然。

不同场景的适用性：

画布模式（可视化构建器）：
- 直观理解策略结构和层次
- 避免语法错误
- 适合初学者和快速原型设计
- 限制：暂不支持 \`after()\` 和哈希锁等高级语法

文本编辑模式（Policy 编辑器）：
- 更快速和灵活
- 适合熟悉语法的用户
- 支持全部 Miniscript 特性
- 可编写任意复杂的策略

特殊情况：
- 当 Policy 包含画布不支持的语法时，画布进入"只读快照模式"
- 你仍可以继续编辑 Policy 文本
- 同步按钮可重新尝试解析`,

  'resources.faq.q10': '为什么有些路径标注为"可延展（Malleable）"？',
  'resources.faq.a10': `**可延展性是指交易 Witness 数据可被第三方修改而不改变交易本质**。

什么是可延展性：
- 第三方可以修改 Witness 栈中的数据
- 这会改变交易 ID（txid）
- 但交易的语义（花费了哪笔资金）不变

SegWit 的改进：
- SegWit 将 Witness 数据分离出来
- 解决了主要的交易 ID 延展性问题
- 但某些复杂的 Miniscript 结构仍可能有 Witness 层面的可延展路径

在本工具中：
- 可延展性标注为警告（非严重错误）
- 不影响基本功能验证
- 适合教学场景下理解问题所在

生产环境建议：
- 应尽量避免可延展的路径
- 使用形式化验证工具检查脚本
- 在部署前进行充分审计`,

  // New FAQ items (11-18)
  'resources.faq.q11': 'Policy 支持哪些基本操作符？',
  'resources.faq.a11': `**Policy 支持的核心操作符**用于组合花费条件。

签名和时间锁：
- \`pk(key)\` - 单个公钥签名
- \`older(n)\` - 相对时间锁（n 个区块）
- \`after(n)\` - 绝对时间锁（区块高度）

哈希锁：
- \`sha256(h)\`, \`hash256(h)\` - SHA-256 哈希锁
- \`ripemd160(h)\`, \`hash160(h)\` - RIPEMD-160 哈希锁

组合操作符：
- \`and(cond1, cond2)\` - 两个条件都满足
- \`or(cond1, cond2)\` - 满足其一
- \`thresh(k, cond1, ...)\` - k-of-N 门限
- \`andor(cond1, cond2, cond3)\` - 条件分支

其他优化：
- \`multi(k, key1, ...)\` - 直接多签
- \`just_key(key)\` - 优化单签`,

  'resources.faq.q12': '什么是 `andor()` 和 `or_c()`？何时使用它们？',
  'resources.faq.a12': `**\`andor()\` 是条件分支的一种形式**，语义为"如果 cond1 满足，则 cond2 也必须满足；否则 cond3 必须满足"。

实际例子：

\`andor(pk(Alice), pk(Bob), older(52560))\` 表示：
- 常规情况：Alice 和 Bob 都要签名
- 超时情况（超过 52560 个区块）：Alice 可单独签名

何时使用：
- 资金恢复路径
- 多人管理中的超时备份
- 防止某一方失联导致资金锁定

\`or_c()\` 的区别：
- \`or_c()\` 是另一种条件分支编码
- 编译策略不同，影响 Witness 大小和费用
- 选择建议：常用路径应编译得更小`,

  'resources.faq.q13': '如何用 Policy 描述常见的多签和恢复场景？',
  'resources.faq.a13': `**常见场景示例**。

基本多签：
- 2-of-2：\`and(pk(A), pk(B))\`
- 2-of-3：\`thresh(2, pk(A), pk(B), pk(C))\`
- 3-of-5：\`thresh(3, pk(A), pk(B), pk(C), pk(D), pk(E))\`

带恢复路径的多签：
- \`or(thresh(2, pk(A), pk(B)), older(52560))\` 表示"常规时期需要 A、B 二人签，但若 52560 个区块（约 1 年）无动作则任意一人可独自恢复"

遗产继承模式：
- \`andor(pk(Alice), pk(Bob), or(pk(Carol), older(52560)))\` 表示"Alice 和 Bob 联合管理，Bob 必须同意，但若 Bob 失联 1 年则 Carol 可接管"`,

  'resources.faq.q14': 'Miniscript 的类型系统是什么？为什么需要 B、V、K、W 四种类型？',
  'resources.faq.a14': `**每个 Miniscript 片段都有一个类型签名**，确保正确组合。

四种类型：
- \`B\` (Boolean)：脚本可作为顶级脚本执行
- \`V\` (Verify)：脚本执行后在栈顶留下真值
- \`K\` (Key)：脚本接受密钥或签名参数
- \`W\` (Wrapped)：脚本的满足方式是非标准的

为什么需要类型系统：
- 保证脚本正确组合：不是所有片段都可以嵌套
- 防止错误组合：类型必须兼容
- 例子：\`and(B, B)\` 有效，但 \`and(V, V)\` 无效

形式化验证：
- 消除了手写脚本的错误
- 编译器自动验证所有类型约束
- 确保最终脚本安全可执行`,

  'resources.faq.q15': 'Miniscript 中的修饰符（Modifiers）是什么？',
  'resources.faq.a15': `**修饰符是片段前的单字母标记**，调整脚本的性质。

常见修饰符：
- \`z:\` - 零删除：脚本确保栈上没有空值
- \`o:\` - 一扩展：脚本可以在栈上推入任意值
- \`n:\` - 无数字：脚本不依赖栈上的数字解释
- \`d:\` - 代码可解析：脚本包含 witness 栈的完整反序列化信息
- \`u:\` - 无满足：脚本可能无法满足

作用：
- 编译器验证脚本的安全性
- 检查栈污染和类型错误
- 优化脚本编译结果
- 指导编译过程中的决策`,

  'resources.faq.q16': '什么是常见的 Miniscript 片段和 Wrapper？',
  'resources.faq.a16': `**片段是基本的脚本构建块**，Wrapper 调整它们的属性。

常见片段：
- \`pk_k(key)\` - 最小化的单签检查
- \`pk_h(key)\` - 哈希公钥，减小 witness 大小
- \`multi(k, keys...)\` - k-of-N 多签
- \`thresh(k, conds...)\` - 通用门限

常见 Wrapper：
- \`c:\` - 将验证型转为布尔型
- \`v:\` - 添加 \`OP_VERIFY\` 后缀
- \`d:\` - 添加反序列化支持
- \`s:\` - 交换栈顶两元素
- \`a:\` - 添加 \`OP_ADD\`
- \`j:\` - 添加 \`OP_IF\` 分支
- \`n:\` - 删除栈顶元素

优化建议：
- 正确使用片段和 wrapper 能显著减小脚本大小
- 减少手续费
- 提高 Witness 效率`,

  'resources.faq.q17': '脚本大小、操作码数等有什么限制？如何优化？',
  'resources.faq.a17': `**P2WSH 脚本的资源限制**。

主要限制：
- 脚本最大 10000 字节
- 操作码最多 201 个（某些操作码如 \`OP_CHECKSIG\` 计数为 1，其他不同）
- Witness 栈最多 1000 项
- 单个 stack item 最大 520 字节

编译器优化策略：

1. 结构优化：
- 常用分支编译为更紧凑的脚本结构
- 选择最优的编码方式

2. 权重指示符：
- 在 \`thresh()\` 中使用 \`9@\` 语法
- 例如：\`thresh(2, 9@pk(A), pk(B), pk(C))\`
- 编译器优先优化高权重（更常用）的路径

实践建议：
- 为常见路径设置更高的权重
- 避免深度嵌套
- 使用 wrapper 优化片段大小`,

  'resources.faq.q18': '这个工具可以用于生产环境吗？',
  'resources.faq.a18': `**绝对不可以**。Miniscript Lab 仅是教育工具。

严重限制：
- 仅支持 Bitcoin Testnet / Signet
- 不连接实际区块链网络
- 不处理私钥或真实签名
- 无法进行真实交易

如果计划主网部署：

1. 使用生产级工具链：
- 专业钱包软件
- libminiscript C++ 库
- 经过充分审计的工具

2. 安全检查：
- 进行充分的安全审计
- 形式化验证脚本
- 多方 code review

3. 渐进式部署：
- 先在测试网小额测试
- 逐步增加资金规模
- 妥善备份所有密钥

4. 文档保存：
- 保留所有 Descriptor
- 备份恢复密钥
- 记录脚本设计意图`,
};

