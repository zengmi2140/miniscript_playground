# ScriptWise 内容改进建议

本文从「一个想了解 Miniscript 的新用户」视角，整理当前网站在内容层面的缺失与改进方向。重点不是推翻现有产品形态，而是把已有的可视化 Playground 与场景演示，补成一条更完整的学习路径：让用户从“看得懂”走向“能判断、能迁移、能继续学习”。

## 总体判断

当前网站最强的是交互演示：用户可以看到 Policy、Miniscript、Script、Descriptor、Address 之间的转换，也可以通过条件开关理解不同花费路径。

但作为一个 Miniscript 学习产品，它还更像一个优秀的 **Playground / Demo Lab**，尚未完全形成完整的 **Learning Path**。新用户可能会有这样的感受：

> 我能看到 policy 怎么变成 miniscript，也能点条件看花费路径；但我还不确定自己是否真的理解了 Miniscript、什么时候该用它、它有哪些坑、下一步该怎么学。

因此，后续内容建设建议围绕三条主线展开：

1. **入门路径**：先学什么、再看什么、每层概念是什么。
2. **推导过程**：现实需求如何一步步变成 Policy。
3. **判断能力**：什么时候该用、有什么限制、哪里容易误用。

---

## P0：补一条“从零开始”的学习路径

### 问题

首页和 Playground 已经能展示 Miniscript 的核心链路，但缺少一个明确的新手学习梯度。用户可能知道“这里能编译”，但不知道自己应该先理解哪几个概念。

尤其是以下问题目前需要更直接地回答：

- Policy、Miniscript、Script、Descriptor、Address 分别是什么？
- 哪一层是人类写的？
- 哪一层是编译出来的？
- 哪一层钱包真正使用？
- 哪一层最终会影响链上花费？
- Descriptor 和 Miniscript 是什么关系？

### 建议

新增一个固定入口，例如：

- 「5 分钟理解 Miniscript」
- 「Miniscript 入门导览」
- 「先读这个，再玩 Playground」

建议结构：

1. Bitcoin Script 解决什么问题？
2. 为什么直接写 Script 很难？
3. Policy 是什么？
4. Miniscript 是什么？
5. Descriptor 是什么？
6. Wallet 最终需要什么？
7. ScriptWise 里看到的每一层分别代表什么？

首页 CTA 可以形成双路径：

- 「先读 5 分钟解释」
- 「直接打开 Playground」

这样可以照顾两类用户：想先理解概念的人，以及想直接上手试的人。

---

## P0：补“先备知识”的温和铺垫

### 问题

Miniscript 不是用户遇到的第一个门槛。真正的新用户在进入 Miniscript 前，通常还需要理解一些 Bitcoin 基础概念：

- UTXO
- scriptPubKey / witness
- P2WSH / P2TR
- 公钥、签名、哈希锁、时间锁
- absolute timelock vs relative timelock
- Descriptor
- Policy vs spending path

如果这些概念没有铺垫，用户在 Playground 里看到 `pk(Alice)`、`older(144)`、`after(840000)`、`hash160(...)` 时，可能知道它们“能点亮路径”，但不知道它们对应现实里的什么。

### 建议

增加一个「你需要知道的 Bitcoin 基础」小节。不要做成完整 Bitcoin 教程，只解释和 Miniscript 直接相关的概念。

可以采用表格形式：

| 概念 | 用户需要理解的重点 |
|---|---|
| 公钥签名 | “谁能花” |
| 哈希锁 | “知道某个 secret 才能花” |
| 时间锁 | “什么时候才能花” |
| 多签 | “几个人同意才能花” |
| Descriptor | “钱包如何描述一个收款条件” |
| Witness | “花费时提供的证明材料” |

这部分能显著降低用户第一次进入 Playground 的认知负担。

---

## P0：更直接地回答“为什么我应该关心 Miniscript”

### 问题

网站已经展示了应用场景，但还可以更明确地回答：

- 我为什么不用普通多签？
- 我为什么不用钱包内置模板？
- Miniscript 到底解决了谁的痛点？

用户需要明白，Miniscript 的价值不是“更酷的语法”，而是让复杂资金控制规则变得可读、可分析、可组合、可迁移。

### 建议

把核心价值表达得更直接：

Miniscript 解决的不是单纯“写复杂脚本”的问题，而是：

1. 让复杂花费条件可读。
2. 让钱包能分析这些条件。
3. 让不同钱包 / 工具可以迁移同一套条件。
4. 让花费路径、签名需求、潜在费用更可预测。
5. 减少手写 Bitcoin Script 的风险。

可以增加一个对比：

```text
普通钱包模板：
  2-of-3 多签

Miniscript / Policy：
  Alice + Bob 可以立即花
  或 Alice 单独等待 90 天后花
  或 Recovery key + Emergency key 可以应急花
```

这样用户会更快理解：Miniscript 的重点是更精确地表达资金控制规则，而不只是生成一段脚本。

---

## P1：增加 Policy / Miniscript 语法速查表

### 问题

Playground 里会出现很多表达式，但用户缺少一个可随时查阅的语法地图。

### 建议

新增一个「Policy / Miniscript 速查」页面，或者在 Playground 里提供帮助入口。

基础表达式可以先覆盖：

| 写法 | 含义 |
|---|---|
| `pk(Alice)` | Alice 签名即可花费 |
| `and(pk(A), pk(B))` | A 和 B 都要签名 |
| `or(pk(A), pk(B))` | A 或 B 任一方签名 |
| `thresh(2, pk(A), pk(B), pk(C))` | 三人中任意两人签名 |
| `older(144)` | 等待约 1 天后可花 |
| `after(840000)` | 到某个区块高度后可花 |
| `hash160(H)` | 提供对应 secret 后可花 |

再给出组合例子：

```text
or(
  and(pk(Alice), pk(Bob)),
  and(pk(Alice), older(12960))
)
```

解释为：

> Alice + Bob 可以立即花；如果 Bob 不配合，Alice 等约 90 天后也可以单独花。

这类内容非常适合放在 Resources 页面，或作为 Playground 右侧的“帮助 / 速查”入口。

---

## P1：补“从场景到 Policy”的逐步拆解

### 问题

当前预设场景能展示最终 Policy 和花费路径，但新用户会希望知道：

> 这个现实场景是怎么一步步翻译成 Policy 的？

如果只展示最终表达式，用户容易把 Policy 当成一段“看起来很技术”的结果，而不是自己也能推导的表达方式。

### 建议

为每个重要预设增加一个「How this policy is built」或「这个策略如何构造」说明。

例如继承场景可以拆成：

1. 正常状态：本人可以花  
   `pk(Owner)`
2. 过一段时间后：继承人可以花  
   `and(pk(Heir), after(...))`
3. 两条路径合并  
   `or(pk(Owner), and(pk(Heir), after(...)))`

每个场景建议包含：

- 现实需求
- 花费路径列表
- 如何翻译成 Policy
- 编译后得到什么
- 用户可以在 Playground 里操作哪些条件
- 常见变体

这样可以把现有 Playground 从“演示器”提升为“交互教材”。

---

## P1：补“安全边界与误用提醒”

### 问题

项目本身有清晰边界：不是钱包、不连接链、不处理私钥、不应默认主网使用。但这些边界如果只存在于开发文档里，对普通用户是不够的。

用户可能会误解：

- 这个地址能不能真的收钱？
- testnet / signet 地址能不能主网用？
- 这里生成的 Descriptor 能不能直接放进钱包？
- P2TR 是否已经支持？
- Miniscript 是否自动意味着安全？
- 复杂 Policy 是否会导致高费用或不可花？

### 建议

增加一个面向用户的「不要这样用」或「安全边界」区块。

建议明确写出：

- 不要把这里生成的地址当主网收款地址。
- 不要在没理解 Descriptor 和备份流程前使用真实资金。
- Miniscript 能帮助分析脚本，但不能替代密钥管理。
- 时间锁条件依赖链上高度 / 时间语义，不等于自然语言里的“某一天”。
- 复杂脚本可能带来更高见证体积和手续费。
- 当前站点以 P2WSH 教学为主，P2TR / Taproot 不是完整实现。

这类内容不仅能避免误用，也会提升站点的可信度。

---

## P1：补费用、体积与实用性解释

### 问题

用户学到一定程度后，会自然提出：

- 这个策略是不是很贵？
- 哪条花费路径成本最高？
- 多一个 fallback 会增加多少链上成本？
- 为什么钱包需要分析 satisfaction cost？

当前站点重点是“谁能花、何时能花、需要什么条件”，这是正确的第一层。但如果要继续往实用教育走，还需要解释复杂策略的成本。

### 建议

可以先做教学型解释，不一定一开始就实现精确 fee estimator。

建议覆盖：

- 每条花费路径大概需要多少 witness 元素。
- 签名数量如何影响体积。
- 多签和门限条件的成本差异。
- 哈希锁 / 时间锁是否增加花费复杂度。
- Descriptor 地址本身看不出所有复杂性，复杂性通常在花费时体现。

后续如果产品继续深化，可以考虑在路径列表里展示“相对花费成本”或“路径复杂度”。

---

## P1：增加 Miniscript 限制章节

### 问题

用户容易误以为 Miniscript 可以表达所有 Bitcoin Script，或者以为 Policy 一定能编译成功。

### 建议

新增「Miniscript 不能做什么？」章节，建立正确预期。

建议说明：

- Miniscript 是 Bitcoin Script 的一个结构化子集，不是全部 Script。
- 它追求可分析、可组合、可安全推理。
- 不是所有任意 Script 都能写成 Miniscript。
- 有些高级 Covenant / introspection 类型需求不是当前 Bitcoin Script / Miniscript 能表达的。
- Taproot 下的 Miniscript 支持情况和 P2WSH 不完全一样。
- Policy 编译可能失败；不是所有 Policy 都能得到满意的 Miniscript。

这部分有助于避免用户对 Miniscript 能力边界产生误解。

---

## P2：产品化术语表入口

### 问题

项目已有 glossary 数据，但可以在用户体验上更主动地暴露出来。

### 建议

增加一个可见入口，例如：

- 首页：「术语不懂？看这里」
- Playground：内联 tooltip / 术语解释 popover
- Resources：核心术语列表

每个术语建议分成一句话版本和技术版本。

示例：

### Policy

一句话：

> 人类更容易读写的花费规则。

技术版：

> Policy 是 Miniscript 编译前的高层表达，描述不同 spending paths 的逻辑组合。

### Descriptor

一句话：

> 钱包用来恢复和监控地址的一段完整说明。

技术版：

> Descriptor 描述 script template、key origin、derivation path、checksum 等信息，使钱包能重建地址和花费条件。

---

## P2：增加交互练习 / 小测验

### 问题

作为学习网站，仅展示是不够的。用户需要通过小任务确认自己是否真的理解了概念。

### 建议

增加轻量练习，例如：

1. “让 Alice 和 Bob 任意一人可花，应该用 `and` 还是 `or`？”
2. “三个人里任意两人同意，应该用哪个表达？”
3. “如果 Alice 等 30 天后可以单独取回资金，该怎么写？”
4. “这条 Policy 有几条花费路径？”
5. “点亮哪些条件可以让资金可花？”

这类内容可以放在 Playground 旁边，形成“学完马上试”的闭环。

---

## P2：补与钱包生态的连接

### 问题

用户学完基础后，会关心：

- 哪些钱包 / 工具真的在用 Miniscript 或 Descriptor？
- 我学完这个能在哪里继续实践？
- 不同工具支持到什么程度？

### 建议

在 Resources 或 Wallets 相关区块补充生态说明，候选内容包括：

- Bitcoin Core descriptors
- Bitcoin Core Miniscript 支持状态
- Liana
- Ledger / hardware wallet 相关限制
- Specter / Sparrow / Caravan / Revault 等工具（以事实核查为准）
- rust-miniscript
- miniscript.fun / sipa miniscript docs
- Bitcoin Optech Miniscript 文章

注意不要笼统说“支持 Miniscript”，而要区分：

- 支持 descriptors
- 支持 miniscript descriptors
- 支持 policy 编译
- 支持 P2WSH
- 支持 Taproot miniscript
- 只支持 watch-only / import

---

## P2：补常见误解 FAQ

### 问题

当前 FAQ 可以继续强化，尤其是加入更贴近新手误解的问题。

### 建议

可以增加这些问题：

- Miniscript 是新的链上协议吗？
- 用 Miniscript 需要软分叉吗？
- Miniscript 会让地址看起来不同吗？
- Miniscript 和 Descriptor 是一回事吗？
- Policy 是不是会出现在链上？
- 矿工 / 节点需要理解 Miniscript 吗？
- Miniscript 是否保证资金一定能花？
- 时间锁里的“90 天”为什么常用区块数表示？
- P2WSH 和 P2TR 的区别是什么？
- 为什么有些 Policy 编译不出来？

这些问题非常适合作为首页 FAQ 或 Resources 页面的一部分。

---

## P2：增加案例反例

### 问题

现有内容主要展示正向场景，但用户也需要学习哪些设计是危险的、脆弱的或过度复杂的。

### 建议

增加「反例」或「策略设计陷阱」内容。

示例：

### 反例 1：没有 recovery path

```text
and(pk(Alice), pk(Bob))
```

解释：

> 如果 Bob 丢钥或不配合，Alice 永远无法单独取回资金。

### 反例 2：时间锁太短

```text
or(pk(HotKey), and(pk(RecoveryKey), older(6)))
```

解释：

> 6 个区块大约一小时，不适合作为长期恢复窗口。

### 反例 3：过度复杂

```text
or(and(pk(A), older(10)), and(pk(B), after(900000)), thresh(...))
```

解释：

> 表达能力变强不代表策略越复杂越好。复杂策略会增加备份、解释、测试和花费成本。

这些反例可以帮助用户形成策略设计判断，而不只是学会语法。

---

## 建议优先级路线图

如果只先做三件，建议优先级如下：

### 1. 先做「5 分钟理解 Miniscript」

目标：让完全新用户理解 Policy / Miniscript / Script / Descriptor / Address 的关系。

预期收益：降低首页到 Playground 的断层，让用户知道自己看到的每个技术产物代表什么。

### 2. 再做「从场景到 Policy」的逐步拆解

目标：把现有预设从 demo 变成教材。

预期收益：让用户不仅能看懂最终结果，还能学会如何自己构造策略。

### 3. 最后补「语法速查 + 常见误解」

目标：降低 Playground 使用门槛，减少误解和错误期待。

预期收益：提高用户自助学习能力，让 Resources 页面承担更强的学习入口作用。

---

## 总结

当前网站已经具备很好的可视化基础：它能把抽象的花费条件、编译结果和路径满足状态展示出来。

下一阶段最值得补强的是内容系统：

- 让新用户知道从哪里开始。
- 让用户理解现实需求如何变成 Policy。
- 让用户知道 Miniscript 的边界、成本和误用风险。
- 让用户能通过速查、练习和反例逐步建立判断能力。

补上这些内容后，ScriptWise 会从一个“很酷的 Miniscript 演示工具”，进一步变成一个真正能带人入门并建立正确心智模型的 Miniscript 学习站。
