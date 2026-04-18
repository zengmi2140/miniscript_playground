# 首页改版 Spec

> 基于 `docs/homepage-review.md` 审视结论与用户反馈，制定的完整改版规格。  
> 日期：2026-04-18  
> 状态：**已执行** ✅（2026-04-18）

---

## 目录

1. [改动总览](#1-改动总览)
2. [H-1 Hero 标题精简 + 产品定位 + 快速通道](#2-h-1)
3. [H-2 Hero 主 CTA 文案调整](#3-h-2)
4. [H-3 Hero 代码卡片微动画](#4-h-3)
5. [H-4 合并 TransitionSection + ScriptComplexitySection](#5-h-4)
6. [H-5 Core Concepts 融入 MeetMiniscriptSection](#6-h-5)
7. [H-6 Applications 编译演示微交互](#7-h-6)
8. [H-7 Applications「上手一试」按钮强化](#8-h-7)
9. [H-8 Applications / Core Concepts 标题 i18n 补全](#9-h-8)
10. [i18n 新增 Key 清单](#10-i18n-新增-key-清单)
11. [改版后首页结构](#11-改版后首页结构)
12. [涉及文件清单](#12-涉及文件清单)
13. [验收标准](#13-验收标准)

---

## 1. 改动总览

| # | 改动 | 来源 | 优先级 | 状态 |
|---|------|------|--------|------|
| H-1 | Hero 标题精简 + 一句话产品定位 + 快速通道 | 用户 §1 §7 + PM §E | P0 | ✅ |
| H-2 | Hero 主 CTA 改为「从一个真实场景开始 ↓」 | 用户 §2 | P0 | ✅ |
| H-3 | Hero 代码卡片增加微动画 | PM §C | P1 | ✅ |
| H-4 | 合并 Transition + ScriptComplexity 为同一视觉区 | 用户 §3 | P0 | ✅ |
| H-5 | Core Concepts 三段内容融入 MeetMiniscript | 用户 §5 | P0 | ✅ |
| H-6 | Applications 编译演示增加微交互 | 用户 §6 | P1 | ✅ |
| H-7 | Applications「上手一试」按钮强化 | PM §D | P1 | ✅ |
| H-8 | Applications / Core Concepts 标题 i18n | PM §F | P0 | ✅ |

---

## 2. H-1：Hero 标题精简 + 产品定位 + 快速通道 {#2-h-1}

### 2.1 标题精简

**现状**：主标题 17 字「读懂 Bitcoin 的花费条件，从 Miniscript 开始」，在首屏太长，缺乏冲击力。

**方案**：拆为**短标题 + 副标题**。

| 语言 | 主标题 | 副标题（保持现有） |
|------|--------|------------------|
| 中文 | **看懂每一笔 Bitcoin 怎么花** | （现有 `home.hero.subtitle` 不变） |
| 英文 | **See How Every Bitcoin Can Be Spent** | （现有 `home.hero.subtitle` 不变） |

**i18n 变更**：修改 `home.hero.title` 的中英文值。

### 2.2 产品定位一句话

**现状**：Hero 区域没有说明 ScriptWise 是什么。

**方案**：在 badge（`Bitcoin Miniscript` 标签）和主标题之间，增加一行小字产品定位。

```
ScriptWise —— Bitcoin Miniscript 交互式学习平台
```

**视觉规格**：
- 字体：`text-xs` / `md:text-sm`
- 颜色：`text-text-muted`
- 位置：badge 下方、h1 上方，`mb-3`
- 不需要独立容器，直接一行 `<p>`

**i18n 新增 key**：`home.hero.tagline`
- zh：`ScriptWise —— Bitcoin Miniscript 交互式学习平台`
- en：`ScriptWise — Interactive Bitcoin Miniscript Learning Lab`

### 2.3 快速通道

**现状**：所有用户走同一条路径，已经懂 Miniscript 的人需要滚过大量教育内容。

**方案**：在 CTA 按钮组下方加一行快速通道链接。

**文案**：
- zh：`已经了解 Miniscript？直接进入 Playground →`
- en：`Already know Miniscript? Jump to the Playground →`

**视觉规格**：
- 字体：`text-xs`
- 颜色：`text-text-muted hover:text-btc-500`
- 无边框，无背景，纯文本链接样式
- 末尾带 `→` 箭头
- 位置：CTA 按钮组下方，`mt-4`，与移动端 `desktopHint` 同级但在其上方
- 过渡：`transition-colors`

**视觉优先级层级**（从强到弱）：
1. 主 CTA 橙色实心按钮 —「从一个真实场景开始 ↓」
2. 次 CTA 描边按钮 —「打开 Playground」
3. 快速通道 — 纯 `text-xs` muted 链接

**i18n 新增 key**：`home.hero.fastTrack`
- zh：`已经了解 Miniscript？直接进入 Playground →`
- en：`Already know Miniscript? Jump to the Playground →`

**链接目标**：`/playground`

### 实现要点（HomepageHero.tsx）

```tsx
{/* badge */}
<div className="mb-5 inline-flex ...">...</div>

{/* 新增: 产品定位 */}
<p className="mb-3 text-xs text-text-muted md:text-sm">
  {t('home.hero.tagline')}
</p>

{/* 主标题 (文案更新) */}
<h1>...</h1>

{/* 副标题 (不变) */}
<p>...</p>

{/* CTA 按钮组 (主 CTA 文案更新, 见 H-2) */}
<div className="flex ...">...</div>

{/* 新增: 快速通道 */}
<Link
  href="/playground"
  className="mt-4 inline-block text-xs text-text-muted transition-colors hover:text-btc-500"
>
  {t('home.hero.fastTrack')}
</Link>

{/* 移动端提示 (不变) */}
<p className="mt-3 text-xs ... md:hidden">...</p>
```

---

## 3. H-2：Hero 主 CTA 文案调整 {#3-h-2}

**现状**：主 CTA 文案为「查看应用场景」/ `View applications`，指向 `/#applications`，引导感不足。

**方案**：修改文案为带引导感的表述。

| 语言 | 新文案 |
|------|--------|
| 中文 | **从一个真实场景开始 ↓** |
| 英文 | **Start from a Real Scenario ↓** |

**i18n 变更**：修改 `home.hero.cta.primary` 的中英文值。

链接目标不变：`/#applications`（锚点滚动）。

---

## 4. H-3：Hero 代码卡片微动画 {#4-h-3}

**现状**：右侧代码卡片完全静态，错失首屏「aha moment」。

**方案**：为代码卡片增加**打字机 + 逐步展示**的微动画序列。

### 动画分为三个阶段

**阶段 1 — 代码逐行出现（打字机效果）**
- 5 行 `CODE_LINES` 依次出现，每行间隔约 300ms
- 每行从左向右逐字符显示，模拟输入
- 使用 `opacity` + `translateY(4px)` 做淡入

**阶段 2 — 编译闪光**
- 所有代码行显示完后，暂停 500ms
- 代码区底部出现一道从左到右的橙色扫描线（`bg-btc-500/30`，`h-px`，CSS `translateX` 动画 600ms）
- 扫描线到达右侧后消失

**阶段 3 — 花费路径依次亮起**
- 扫描线结束后，3 条 `PathRow` 依次从 `opacity-0` 变为 `opacity-100`
- 间隔 200ms
- 每条路径亮起时有轻微的 `scale(0.97→1)` 过渡

### 技术实现

- 使用 `useState` + `useEffect` + `setTimeout` 链式控制阶段
- 不使用外部动画库（framer-motion 未在项目依赖中）
- CSS transition 为主，JS 控制时序
- 动画只执行一次（进入视口时触发，可使用 `IntersectionObserver` 或挂载即触发）
- 总时长约 3-4 秒

### 视觉要求

- 动画要**克制**，符合 DESIGN.md 设计原则「克制」「诚实」
- 不要闪烁、弹跳等过度动效
- 动画结束后静态展示与现有状态一致，确保无功能回归

---

## 5. H-4：合并 TransitionSection + ScriptComplexitySection {#5-h-4}

**现状**：TransitionSection 展示「地址背后是 Script」→ 独立的 ScriptComplexitySection 说「Script 很难」→ 用户感觉被反复告知同一件事。

**方案**：合并为**一个视觉区块**，在同一 `<section>` 中自然过渡。

### 合并后结构

```
┌──────────────────────────────────────────────────────────┐
│  section: 痛点区（bg-surface-card）                       │
│                                                          │
│  ① 标题 + 副标题                                         │
│     「每个地址背后，都有一段脚本」                          │
│     副标题保持不变                                        │
│                                                          │
│  ② 单签 vs 多签 对比卡片                                  │
│     （保留现有布局，grid md:grid-cols-2）                  │
│                                                          │
│  ③ 过渡句                                                │
│     保持现有 footer 文案，作为从 Script 展示到痛点的桥梁    │
│                                                          │
│  ④ 四堵墙 PainCard                                       │
│     （保留现有 grid md:grid-cols-2 的 4 张卡片）           │
│                                                          │
│  ⑤ Outro                                                │
│     「这些问题并非无解——Miniscript 正是为此而生。」         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 视觉规格

- 合并后为单个 `<section>`，使用 `bg-surface-card`
- 原 TransitionSection 的 `title` / `subtitle` 作为合并区块的主标题
- 原 `transition.footer` 作为中间过渡文字，加适当上下间距（`mt-12 mb-12`），居中显示，文字稍大于 `text-sm` 可用 `text-base font-medium`
- 原 ScriptComplexitySection 的 `title` / `subtitle` 不再单独显示（避免重复标题），4 张 PainCard 直接承接过渡句
- 原 ScriptComplexitySection 的 `outro` 作为整个合并区块的结尾

### 实现方式

- 创建新组件 `ScriptPainSection.tsx`（在 `src/components/home/` 目录），合并两者逻辑
- 从 `page.tsx` 移除 `<TransitionSection />` 和 `<ScriptComplexitySection />`，替换为 `<ScriptPainSection />`
- 原 `TransitionSection.tsx` 和 `ScriptComplexitySection.tsx` 保留文件不删除（可能被其他地方引用），但首页不再挂载

### i18n 变更

- 不需要新增 key，复用现有的 `home.transition.*` 和 `home.scriptComplexity.*`
- 中间过渡句使用 `home.transition.footer`
- Outro 使用 `home.scriptComplexity.outro`

---

## 6. H-5：Core Concepts 融入 MeetMiniscriptSection {#6-h-5}

**现状**：MeetMiniscript 展示了 Policy → Miniscript → Script 的 pipeline；Core Concepts 又把 Policy、Miniscript、Descriptor 分别详细解释一遍。首页存在大量内容重复。

**方案**：将 Core Concepts 中的 Policy / Miniscript / Descriptor 三段解释，融入 MeetMiniscriptSection 的 DefinitionBlock 下方，作为「深入理解」子区块。然后从首页移除 `<IntroCoreConceptsSection />`。

### 融合后的 MeetMiniscriptSection 结构

```
┌──────────────────────────────────────────────────────────────┐
│  section: 认识 Miniscript（bg-surface-base）                  │
│                                                              │
│  ① 大标题「认识 Miniscript」+ 副标题                          │
│                                                              │
│  ② DefinitionBlock（保持不变）                                │
│     - 小标题「Miniscript 是什么」                              │
│     - callout 定义                                           │
│     - 三层 Pipeline 横向卡片                                  │
│                                                              │
│  ③ 新增: ConceptCardsBlock                                   │
│     - 三张概念卡片，一行三列（md:grid-cols-3）                 │
│     - 分别对应 Policy / Miniscript / Descriptor               │
│     - 每张卡片:                                               │
│       · 顶部: 小标签（accent badge, 类似 FeatureHeader 风格）  │
│       · 标题: 概念名                                          │
│       · 正文: 简要描述（从 Core Concepts 提炼精简）            │
│       · 底部: 代码示例（mono, surface-elevated 背景）          │
│                                                              │
│  ④ FeaturesBlock（保持不变）                                  │
│     - 可读性 / 可组合性 / 可迁移性 三张大卡                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### ConceptCardsBlock 视觉设计

三列概念卡片采用紧凑但清晰的布局：

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  ⬡ POLICY       │  │  ⬡ MINISCRIPT   │  │  ⬡ DESCRIPTOR   │
│                 │  │                 │  │                 │
│  人怎么想        │  │  工具怎么分析    │  │  钱包怎么迁移    │
│                 │  │                 │  │                 │
│  高级策略语言，  │  │  标准化中间语言，│  │  包含密钥信息的  │
│  用自然语义表达  │  │  可验证可分析的  │  │  可携式输出描述  │
│  谁能花、何时花  │  │  桥梁层          │  │  符              │
│                 │  │                 │  │                 │
│  ┌─────────────┐│  │  ┌─────────────┐│  │  ┌─────────────┐│
│  │ or(pk(A),   ││  │  │ 类型系统    ││  │  │ wsh(andor(  ││
│  │   and(...)) ││  │  │ B/V/K/W     ││  │  │   pk(...),  ││
│  └─────────────┘│  │  └─────────────┘│  │  └─────────────┘│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**每张卡片规格**：
- 外框：`rounded-xl border border-border-default bg-surface-card p-6`
- 顶部标签：类似 FeatureHeader 风格的小 badge
  - Policy → accent `btc`（橙色系）
  - Miniscript → accent `violet`（紫色系）
  - Descriptor → accent `emerald`（绿色系）
- 标题：`text-lg font-semibold text-text-primary`
- 正文：`text-sm text-text-secondary leading-relaxed`，2-3 行精简描述
- 代码区：`rounded-md bg-surface-elevated px-3 py-2 font-mono text-[11px] text-text-secondary`

**移动端**：`grid-cols-1`，三张卡片纵向堆叠，`gap-4`。

### 概念卡片文案（从 Core Concepts 精简提炼）

**Policy**：
- zh 短标题：`人怎么想`
- zh 描述：`高级策略语言，用自然语义表达"谁能花、何时花"。支持任意组合逻辑，无需担心编译后的有效性。`
- zh 代码示例：`or(pk(Alice), and(pk(Bob), after(height)))`
- en 短标题：`How humans think`
- en 描述：`High-level policy language expressing who can spend and when, using natural semantics. Any combinatorial logic is valid.`
- en 代码示例：同上

**Miniscript**：
- zh 短标题：`工具怎么分析`
- zh 描述：`Policy 与 Bitcoin Script 之间的标准化桥梁。每个表达式具有明确类型，可由工具自动验证、分析和优化。`
- zh 代码示例：`andor(pk(A),pk(B),and_v(v:pk(C),older(1000)))`
- en 短标题：`How tools analyze`
- en 描述：`A standardized bridge between Policy and Bitcoin Script. Every expression is typed, enabling automatic verification, analysis, and optimization.`
- en 代码示例：同上

**Descriptor**：
- zh 短标题：`钱包怎么迁移`
- zh 描述：`将 Miniscript 与密钥信息结合的可携式格式。包含生成地址和创建交易所需的全部信息，支持钱包间无缝迁移。`
- zh 代码示例：`wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(R),older(10000))))`
- en 短标题：`How wallets migrate`
- en 描述：`A portable format that combines Miniscript with key info. Contains everything needed to generate addresses and build transactions — enabling seamless wallet migration.`
- en 代码示例：同上

### i18n 新增 key

`home.meetMiniscript.concepts.sectionTitle`
- zh：`深入理解三层结构`
- en：`Understanding the Three Layers`

`home.meetMiniscript.concepts.policy.badge` / `.title` / `.desc` / `.example`
`home.meetMiniscript.concepts.miniscript.badge` / `.title` / `.desc` / `.example`
`home.meetMiniscript.concepts.descriptor.badge` / `.title` / `.desc` / `.example`

（具体值见上方文案）

### page.tsx 变更

```diff
- <IntroCoreConceptsSection hideStack />
```

首页不再挂载 `IntroCoreConceptsSection`。`IntroCoreConceptsSection.tsx` 文件保留（可能被其他路由使用），不删除。

---

## 7. H-6：Applications 编译演示微交互 {#7-h-6}

**现状**：右侧三层编译演示（Policy / Miniscript / Bitcoin Script）为纯静态代码块。

**方案**：增加**切换场景时的编译过渡动画**。

### 微交互设计

**触发时机**：用户点击不同场景标签切换 `activeExample` 时。

**动画序列**（约 800ms 总时长）：

1. **Phase 1（0-200ms）**：三个代码块同时从 `opacity-100` 变为 `opacity-0`，带 `translateY(4px)` 下沉
2. **Phase 2（200-400ms）**：编译箭头区域（`compileArrow`）短暂亮起橙色高亮（文字 `text-btc-500` + `scale(1.1)` 后恢复）
3. **Phase 3（400-800ms）**：新内容分层出现——
   - Layer 1 (Policy) 先出现（400ms），`opacity-0→1` + `translateY(-4px)→0`
   - Layer 2 (Miniscript) 延迟 100ms 出现
   - Layer 3 (Bitcoin Script) 再延迟 100ms 出现
   - 脚本大小区块最后出现

### 技术实现

- 使用 CSS `transition` + React `key` 控制
- 给三个代码块容器加一个统一的 `key={activeExample}`，触发卸载/挂载动画
- 或者用 `useState` 控制一个 `transitioning` 状态，配合 CSS class 切换
- 不引入新依赖

### 视觉要求

- 克制、流畅，不要弹跳或旋转
- 让人感受到「编译是一个过程」，而不只是内容替换

---

## 8. H-7：Applications「上手一试」按钮强化 {#8-h-7}

**现状**：「上手一试」按钮为描边小按钮（`border border-border-default bg-surface-elevated px-3 py-1.5 text-sm`），视觉存在感弱。

**方案**：将按钮改为**半实心橙色风格**，更显眼但不与 Hero 主 CTA 冲突。

### 新按钮样式

```
rounded-button border border-btc-500/40 bg-btc-500/15 px-4 py-2
text-sm font-semibold text-btc-500
hover:bg-btc-500/25 hover:border-btc-500/60
transition-colors
```

**变化对比**：
- 字体：`text-sm font-medium` → `text-sm font-semibold`
- 边框：`border-border-default` → `border-btc-500/40`
- 背景：`bg-surface-elevated` → `bg-btc-500/15`
- 内边距：`px-3 py-1.5` → `px-4 py-2`（略大一些）
- hover：`hover:bg-btc-500/25 hover:border-btc-500/60`

加上右箭头图标：

```tsx
<Link href={playgroundHref} className="...新样式...">
  {t('intro.applications.tryIt')}
  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
</Link>
```

### 文案

不修改文案，保持 `intro.applications.tryIt`（「上手一试」/「Try it」）。

---

## 9. H-8：Applications / Core Concepts 标题 i18n 补全 {#9-h-8}

**现状**：
- `IntroApplicationsSection.tsx` 第 29 行：`<h2>Applications</h2>` — 硬编码英文
- `IntroCoreConceptsSection.tsx` 第 36 行：`<h2>Core Concepts</h2>` — 硬编码英文

**方案**：让标题走 `t()` 路径。

### i18n 新增 key

`intro.applications.title`
- zh：`应用场景`
- en：`Applications`

`home.concepts.title`
- zh：`核心概念`
- en：`Core Concepts`

### 代码变更

**IntroApplicationsSection.tsx**：
```diff
- <h2 className="...">Applications</h2>
+ <h2 className="...">{t('intro.applications.title')}</h2>
```

**IntroCoreConceptsSection.tsx**：
```diff
- <h2 className="...">Core Concepts</h2>
+ <h2 className="...">{t('home.concepts.title')}</h2>
```

> 注意：虽然 H-5 从首页移除了 `IntroCoreConceptsSection`，但该组件仍存在于仓库中，i18n 修复仍应完成。

---

## 10. i18n 新增 Key 清单

### zh.ts 新增/修改

```ts
// 修改
'home.hero.title': '看懂每一笔 Bitcoin 怎么花',
'home.hero.cta.primary': '从一个真实场景开始 ↓',

// 新增
'home.hero.tagline': 'ScriptWise —— Bitcoin Miniscript 交互式学习平台',
'home.hero.fastTrack': '已经了解 Miniscript？直接进入 Playground →',

'home.meetMiniscript.concepts.sectionTitle': '深入理解三层结构',
'home.meetMiniscript.concepts.policy.badge': 'Policy',
'home.meetMiniscript.concepts.policy.title': '人怎么想',
'home.meetMiniscript.concepts.policy.desc': '高级策略语言，用自然语义表达"谁能花、何时花"。支持任意组合逻辑，无需担心编译后的有效性。',
'home.meetMiniscript.concepts.policy.example': 'or(pk(Alice), and(pk(Bob), after(height)))',

'home.meetMiniscript.concepts.miniscript.badge': 'Miniscript',
'home.meetMiniscript.concepts.miniscript.title': '工具怎么分析',
'home.meetMiniscript.concepts.miniscript.desc': 'Policy 与 Bitcoin Script 之间的标准化桥梁。每个表达式具有明确类型，可由工具自动验证、分析和优化。',
'home.meetMiniscript.concepts.miniscript.example': 'andor(pk(A),pk(B),and_v(v:pk(C),older(1000)))',

'home.meetMiniscript.concepts.descriptor.badge': 'Descriptor',
'home.meetMiniscript.concepts.descriptor.title': '钱包怎么迁移',
'home.meetMiniscript.concepts.descriptor.desc': '将 Miniscript 与密钥信息结合的可携式格式。包含生成地址和创建交易所需的全部信息，支持钱包间无缝迁移。',
'home.meetMiniscript.concepts.descriptor.example': 'wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(R),older(10000))))',

'intro.applications.title': '应用场景',
'home.concepts.title': '核心概念',
```

### en.ts 新增/修改

```ts
// 修改
'home.hero.title': 'See How Every Bitcoin Can Be Spent',
'home.hero.cta.primary': 'Start from a Real Scenario ↓',

// 新增
'home.hero.tagline': 'ScriptWise — Interactive Bitcoin Miniscript Learning Lab',
'home.hero.fastTrack': 'Already know Miniscript? Jump to the Playground →',

'home.meetMiniscript.concepts.sectionTitle': 'Understanding the Three Layers',
'home.meetMiniscript.concepts.policy.badge': 'Policy',
'home.meetMiniscript.concepts.policy.title': 'How humans think',
'home.meetMiniscript.concepts.policy.desc': 'High-level policy language expressing who can spend and when, using natural semantics. Any combinatorial logic is valid.',
'home.meetMiniscript.concepts.policy.example': 'or(pk(Alice), and(pk(Bob), after(height)))',

'home.meetMiniscript.concepts.miniscript.badge': 'Miniscript',
'home.meetMiniscript.concepts.miniscript.title': 'How tools analyze',
'home.meetMiniscript.concepts.miniscript.desc': 'A standardized bridge between Policy and Bitcoin Script. Every expression is typed, enabling automatic verification, analysis, and optimization.',
'home.meetMiniscript.concepts.miniscript.example': 'andor(pk(A),pk(B),and_v(v:pk(C),older(1000)))',

'home.meetMiniscript.concepts.descriptor.badge': 'Descriptor',
'home.meetMiniscript.concepts.descriptor.title': 'How wallets migrate',
'home.meetMiniscript.concepts.descriptor.desc': 'A portable format that combines Miniscript with key info. Contains everything needed to generate addresses and build transactions — enabling seamless wallet migration.',
'home.meetMiniscript.concepts.descriptor.example': 'wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(R),older(10000))))',

'intro.applications.title': 'Applications',
'home.concepts.title': 'Core Concepts',
```

---

## 11. 改版后首页结构

```
① Hero（1 屏）
   - badge: Bitcoin Miniscript
   - 产品定位: ScriptWise —— Bitcoin Miniscript 交互式学习平台
   - 短标题: 看懂每一笔 Bitcoin 怎么花
   - 副标题（不变）
   - 主 CTA: 从一个真实场景开始 ↓ (橙色实心)
   - 次 CTA: 打开 Playground (描边)
   - 快速通道: 已经了解 Miniscript？直接进入 Playground → (text-xs muted)
   - 右侧代码卡片（带微动画: 打字 → 编译线 → 路径亮起）

② 痛点区（1 屏，合并原 Transition + ScriptComplexity）
   - 标题: 每个地址背后，都有一段脚本
   - 单签 vs 多签对比
   - 过渡句: 不止于多签……
   - 四堵墙 PainCard
   - Outro: Miniscript 正是为此而生

③ 认识 Miniscript（1-2 屏，保持 + 增强）
   - 标题: 认识 Miniscript
   - DefinitionBlock（不变）
   - ConceptCardsBlock（新增: 三列 Policy/Miniscript/Descriptor 概念卡）
   - FeaturesBlock（不变: 可读性/可组合性/可迁移性 三大卡）

④ Applications（1-2 屏，增强）
   - 标题: 应用场景 (i18n)
   - 7 场景标签 + 编译演示（带切换微交互）
   - 强化「上手一试」按钮

⑤ 钱包 + CTA + Footer（1 屏）
   - HomepageWallets（不变）
   - 底部 CTA（不变）
   - Footer（不变）
```

**精简前后对比**：

| | 精简前 | 精简后 |
|---|--------|--------|
| 顶层区块数 | 9 (Hero / Transition / ScriptComplexity / MeetMiniscript / Applications / CoreConcepts / Wallets / CTA / Footer) | 7 (Hero / ScriptPain / MeetMiniscript / Applications / Wallets / CTA / Footer) |
| 概念讲解 | 2 处重复 (MeetMiniscript + CoreConcepts) | 1 处整合 (MeetMiniscript 含 ConceptCards) |
| 痛点区 | 2 个独立 section | 1 个合并 section |

---

## 12. 涉及文件清单

| 文件 | 操作 | 对应改动 | 状态 |
|------|------|----------|------|
| `src/lib/i18n/zh.ts` | 修改 | H-1 H-2 H-5 H-8 | ✅ |
| `src/lib/i18n/en.ts` | 修改 | H-1 H-2 H-5 H-8 | ✅ |
| `src/components/home/HomepageHero.tsx` | 修改 | H-1 H-2 H-3 | ✅ |
| `src/components/home/ScriptPainSection.tsx` | **新建** | H-4 | ✅ |
| `src/components/home/MeetMiniscriptSection.tsx` | 修改 | H-5 | ✅ |
| `src/components/intro/IntroApplicationsSection.tsx` | 修改 | H-6 H-7 H-8 | ✅ |
| `src/components/intro/IntroCoreConceptsSection.tsx` | 修改 | H-8 (i18n) | ✅ |
| `src/app/page.tsx` | 修改 | H-4 H-5 (替换组件引用) | ✅ |
| `AGENTS.md` | 修改 | 同步路由/结构变更 | ✅ |

---

## 13. 验收标准

### 功能验收

- [x] **H-1a** 首页 Hero 标题在中/英文下分别显示「看懂每一笔 Bitcoin 怎么花」/「See How Every Bitcoin Can Be Spent」
- [x] **H-1b** 标题上方显示产品定位一句话，`text-xs` / `md:text-sm`，muted 颜色
- [x] **H-1c** CTA 按钮组下方显示快速通道链接，点击跳转到 `/playground`
- [x] **H-1d** 快速通道视觉存在感弱于两个 CTA 按钮
- [x] **H-2** 主 CTA 显示「从一个真实场景开始 ↓」，点击平滑滚动到 `#applications`
- [x] **H-3** Hero 代码卡片在页面加载后播放打字机 → 编译线 → 路径亮起动画，总时长 3-4s
- [x] **H-3b** 动画结束后静态状态与改版前一致
- [x] **H-4** TransitionSection + ScriptComplexitySection 合并为单个 `<section>`，无独立的重复标题
- [x] **H-4b** 合并区块内过渡文字自然衔接，四堵墙 PainCard 紧随其后
- [x] **H-5** MeetMiniscriptSection 内，DefinitionBlock 下方出现三列概念卡（Policy / Miniscript / Descriptor）
- [x] **H-5b** 首页不再挂载 `IntroCoreConceptsSection`
- [x] **H-5c** 三列概念卡在移动端变为单列
- [x] **H-6** 切换 Applications 场景时，编译演示区域有淡入淡出 + 分层出现的过渡动画
- [x] **H-7** 「上手一试」按钮为半实心橙色风格，带右箭头图标
- [x] **H-8** Applications 区标题在中文下显示「应用场景」，英文下显示「Applications」
- [x] **H-8b** IntroCoreConceptsSection 标题走 `t()` 路径

### 质量验收

- [x] `npm run lint` 通过
- [x] `npm run test` 通过（220/220）
- [x] `npm run build` 成功
- [ ] 中/英文切换后所有新增文案正确显示（待人工验收）
- [ ] 移动端 `MobileFallback` 不受影响（待人工验收）
- [ ] 页面滚动流畅，无闪烁或布局抖动（待人工验收）
- [ ] 所有动画在低性能设备上不卡顿（待人工验收）
- [x] AGENTS.md 与 page.tsx 实际结构一致

---

## 14. 实现记录

> 以下为执行阶段自动补充的实现细节，与上方 spec 设计互相对照。

### 执行时间

2026-04-18

### 实际实现要点

**H-3 Hero 代码卡片微动画**：使用 `useState` + `useEffect` + `setTimeout` 链式控制 10 个 phase。Phase 1-5 代码行逐行淡入（300ms 间隔，`opacity` + `translateY(4px)`）；Phase 6 橙色扫描线从左到右（CSS `translateX` + `duration-[600ms]`）；Phase 7-9 花费路径依次亮起（`opacity` + `scale(0.97→1)`，200ms 间隔）。总时长约 3.7s。不依赖外部动画库。

**H-4 ScriptPainSection**：新建 `src/components/home/ScriptPainSection.tsx`，将原 `TransitionSection` 的标题/副标题/双列卡片 + 原 `ScriptComplexitySection` 的 PainCard + outro 合并为单个 `<section>`。中间以 `home.transition.footer` 作过渡句（`text-base font-medium`）。原两个组件文件保留未删除。

**H-5 ConceptCardsBlock**：在 `MeetMiniscriptSection.tsx` 内新增 `ConceptCard` 和 `ConceptCardsBlock` 两个内部组件。三列卡片使用 `md:grid-cols-3`，每张卡片顶部有 accent badge（btc/violet/emerald），底部有 mono 代码示例。移动端自动降为单列。

**H-6 Applications 微交互**：通过 `key={activeExample}` 触发右侧编译演示列的 remount，配合内联 `@keyframes fadeSlideIn` 实现 0.5s 的 `opacity` + `translateY` 入场动画。

**H-7 按钮强化**：改为 `border-btc-500/40 bg-btc-500/15` 半实心橙色风格，增加 `ArrowRight` 图标，内边距从 `px-3 py-1.5` 增至 `px-4 py-2`。

### 验证结果

```
npm run lint   → 通过（仅 HomepageWallets 的 <img> 预存 warning）
npm run test   → 28 files, 220 tests passed
npm run build  → 成功，首页 10.8 kB
```
