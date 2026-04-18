# 首页审视与建议

> 审视对象：ScriptWise 首页（`src/app/page.tsx`）  
> 日期：2026-04-17

---

## 当前首页结构（从上到下）

| # | 区块 | 组件 | 内容概要 |
|---|------|------|----------|
| ① | Hero | `HomepageHero` | 标题 + 副标题 + 两个 CTA + 右侧代码预览卡片 |
| ② | Transition | `TransitionSection` | 「每个地址背后都有一段脚本」——单签 vs 多签对比 |
| ③ | Script 复杂性 | `ScriptComplexitySection` | Bitcoin Script 的四堵墙（低级/易错/难组合/难分析） |
| ④ | 认识 Miniscript | `MeetMiniscriptSection` | 定义 + 三层 pipeline + 可读性卡 + 可组合性卡 + 可迁移性卡 |
| ⑤ | Applications | `IntroApplicationsSection` | 7 个场景标签切换 + policy→miniscript→script 编译演示 |
| ⑥ | Core Concepts | `IntroCoreConceptsSection` | Policy / Miniscript / Descriptor 详细解释（hideStack） |
| ⑦ | 钱包生态 | `HomepageWallets` | 已支持 Miniscript 的软件/硬件钱包跑马灯 |
| ⑧ | CTA | 内联 | 「准备好自己设计了吗？」→ 画布搭建策略 |
| ⑨ | Footer | 内联 | 一句话定位 + 版权 |

---

## 一、用户视角（第一次访问的比特币开发者 / 爱好者）

### ✅ 做得好的地方

1. **叙事弧线清晰**：「地址 → Script 很难 → Miniscript 解救 → 看真实应用 → 自己动手」，这条线是连贯的。
2. **Hero 右侧代码卡片**直觉上很好——一眼就能感受到「这个东西输出什么」。
3. **Applications 7 个真实场景**非常有说服力，policy → miniscript → script 三层编译演示是核心差异化。
4. **钱包跑马灯**是很好的社会证明。

### ⚠️ 痛点与建议

#### 1. Hero 标题过长，缺乏冲击力

**现状**：「读懂 Bitcoin 的花费条件，从 Miniscript 开始」——17 个字的主标题在首屏被一堆副标题和两个 CTA 包围，用户眼睛没有焦点。

**建议**：拆成**一句短标题 + 一个副句**。例如：
- 中文主标题：「**看懂每一笔 Bitcoin 怎么花**」（10 字）
- 英文主标题：「**See how every Bitcoin can be spent**」
- 副标题保持不变即可。简洁 = 记忆点。

#### 2. Hero 两个 CTA 优先级不够分明

**现状**：「查看应用场景」（锚点滚动到 #applications）和「打开 Playground」——用户第一次来，不知道该点哪个。点「查看应用场景」只是滚动到本页下方，体验上有点「空」。

**建议**：主 CTA 应该指向**最高价值动作**：
- 如果目标是「让人用 Playground」，那主 CTA 就是 Playground
- 如果目标是「先教育」，那主 CTA 滚到场景没问题，但应更明确地写成「**从一个真实场景开始 ↓**」这样带引导感的文案

#### 3. TransitionSection 和 ScriptComplexitySection 之间有认知重复

**现状**：TransitionSection 已经展示了 Script，紧接着 ScriptComplexity 又说「Script 很难」。用户感觉被「反复告知同一件事」。

**建议**：
- 方案 A：**合并**这两个区块——TransitionSection 展示 Script，然后*在同一视觉区域内*自然过渡到「四堵墙」，不需要分成两个 section 各有标题和 subtitle
- 方案 B：TransitionSection 仅做一句话过渡（不需要独立 section），直接进入 ScriptComplexity

#### 4. MeetMiniscriptSection 太长

**现状**：定义 + 三层 pipeline + 可读性卡 + 可组合性卡 + 可迁移性卡——这是一个巨大的区块。用户如果从 Hero 一路滚下来，到这里已经「疲倦」了，而最有价值的 Applications 在更下面。

**建议**：**精简 MeetMiniscript 到 definition + pipeline 就够了**，三大特性（可读/可组合/可迁移）可以用一行三列紧凑卡片替代详细展开，或者直接移入 Core Concepts 区。先让用户快速理解「Miniscript 是什么」→ 立刻看到应用场景 → 被吸引后再深入。

#### 5. Core Concepts 和 MeetMiniscript 有大量重复

**现状**：MeetMiniscript 已经展示了 Policy → Miniscript → Script 三层 pipeline；Core Concepts 又把 Policy、Miniscript、Descriptor 分别详细解释一遍。虽然 `hideStack` 已经做了部分工作，但 Core Concepts 区的三个大段仍然与 MeetMiniscript 的定义区高度重叠。

**建议**：首页只保留一处完整的概念讲解——要么在 MeetMiniscript 内完成，要么在 Core Concepts 内完成，**不要两处都讲**。

#### 6. Applications 区的编译演示是静态的

**现状**：右半侧三层编译演示是纯静态代码块。

**建议**（进阶，不急于实现）：加一个**微交互**——比如点击 Policy 中的 `pk(Alice)` 高亮对应的 Miniscript 和 Script 部分——会极大增强「编译过程可理解」的教学效果。

#### 7. 页面缺少「ScriptWise 是什么」的一句话定位

**现状**：Hero 直接讲 Miniscript，对于不知道 ScriptWise 的人，没有一句话告诉他们「这是一个教学工具/Playground」。footer 有一句定位，但太晚了。

**建议**：在 Hero badge 附近或 subtitle 中加入**一句定位**：「ScriptWise —— Bitcoin Miniscript 交互式学习平台」。

---

## 二、产品经理视角（转化、留存、信息架构）

### A. 首页太长，信息密度递减严重

**问题**：从 Hero 到 CTA，共 9 个区块，用户需要滚动约 6-8 个屏高。到达 CTA 时已经失去注意力。转化瓶颈在于：用户看了 MeetMiniscript 就觉得「我懂了」然后离开，没有到达 Playground 入口。

**建议**：**缩短首页到 4-5 屏**：Hero → Script 的痛点（合并 ②③）→ Miniscript 一句话解救（精简 ④）→ Applications（保留，核心差异化）→ CTA。Wallets 和 Core Concepts 可以放到 `/resources` 或作为 Playground 的侧边信息。

### B. 缺乏「社会认证」和「权威感」

**问题**：钱包跑马灯不错，但用户还想知道：这个工具谁做的？被多少人用过？有没有 GitHub star 数？有没有引用 Pieter Wuille 的原始论文？

**建议**：加一小行「Based on research by Pieter Wuille, Andrew Poelstra & Sanket Kanjalkar」+ GitHub star badge（如果开源）。这对技术受众极其有效。

### C. Hero 代码卡片是静态的，错失「aha moment」

**问题**：右侧代码卡片完全静态——错失了一个巨大的首屏演示机会。

**建议**：让代码卡片带一个**微动画**：Policy 输入 → 自动展示编译后的 Miniscript → 亮起花费路径。类似 Stripe 首页那种「产品即演示」的效果。用户在首屏就能感受到产品的核心价值。

### D. Applications 区「上手一试」按钮太弱

**问题**：这是首页最核心的转化按钮之一——用户看到一个场景感兴趣，应该被强烈引导去 Playground 体验。当前按钮太小、太弱。

**建议**：把「上手一试」改成更显眼的按钮样式，或者让整个场景卡片可点击跳转。

### E. 没有针对不同受众的分层入口

**问题**：首页对「完全不懂 Miniscript 的人」和「已经懂但想找工具的人」用的是同一条路径。后者不需要看 TransitionSection / ScriptComplexity / MeetMiniscript，他们只想快速到 Playground。

**建议**：在 Hero 区增加一个**快速通道**：「已经了解 Miniscript？→ 直接进入 Playground」，跳过教育内容。

### F. Applications / Core Concepts 的标题 i18n 不完整

**问题**：`IntroApplicationsSection` 第 29 行的 `<h2>Applications</h2>` 和 `IntroCoreConceptsSection` 第 36 行的 `<h2>Core Concepts</h2>` 硬编码为英文，没有走 `t()` 函数。

**建议**：补全 i18n，让这两个标题也走 `t()` 路径。

---

## 三、推荐的精简首页结构

```
① Hero（1 屏）
   - 短标题（≤10 字）+ 一句产品定位
   - 代码动画卡片（微动画：输入 → 编译 → 路径亮起）
   - 主 CTA：进入 Playground（或「从场景开始」）
   - 次 CTA：看场景 / 打开 Playground
   - 快速通道：「已懂 Miniscript？直接进入 Playground →」

② 痛点区（1 屏，合并原 ② + ③）
   - 一句话过渡：「每个地址背后都有一段脚本」
   - 紧凑展示：单签 vs 多签（可选保留或简化）
   - 四堵墙（低级/易错/难组合/难分析）
   - 结尾一句话：「Miniscript 正是为此而生」

③ Miniscript 解法（1 屏，精简原 ④）
   - 一句话定义 + callout
   - 三层 pipeline（Policy → Miniscript → Script）保留
   - 三大特性改为**一行三列紧凑卡片**（标题 + 一句话），不再展开详细演示
   - 删除或合并原 ⑥ Core Concepts 的内容到这里

④ Applications（1-2 屏，保持不变 + 强化）
   - 7 个场景标签切换
   - 编译演示（远期加微交互）
   - **强化「上手一试」按钮**
   - 补全 i18n

⑤ 社会证明 + CTA（1 屏，合并原 ⑦ + ⑧）
   - 钱包跑马灯
   - 学术引用 / GitHub badge
   - 最终 CTA：「准备好自己设计了吗？」
   - Footer
```

### 精简前后对比

| | 精简前 | 精简后 |
|---|--------|--------|
| 区块数 | 9 | 5 |
| 预估屏数 | 6-8 屏 | 4-5 屏 |
| 概念讲解次数 | 2 次（MeetMiniscript + Core Concepts） | 1 次 |
| 痛点区块数 | 2 个独立 section | 1 个合并 section |
| 到达 CTA 的滚动距离 | 很远 | 缩短约 40% |

### 优先级排序

| 优先级 | 改动 | 工作量 |
|--------|------|--------|
| P0 | 合并 Transition + ScriptComplexity | 中 |
| P0 | 精简 MeetMiniscript（砍三张详细卡 → 三列紧凑卡） | 中 |
| P0 | Hero 标题缩短 + 加产品定位 | 小 |
| P1 | 删除/合并 Core Concepts（首页不再重复讲） | 小 |
| P1 | 补全 Applications / Core Concepts 标题 i18n | 小 |
| P1 | 强化「上手一试」按钮样式 | 小 |
| P2 | Hero 代码卡片微动画 | 大 |
| P2 | 增加学术引用 / GitHub badge | 小 |
| P2 | Hero 分层入口（快速通道） | 小 |
| P3 | Applications 编译演示微交互 | 大 |
