# Miniscript Lab -- 完整产品规格与实施计划

> **本文档是产品与体验行为的唯一真相来源（Single Source of Truth）。**  
> 视觉与设计 token、Scenario 路径图节点尺寸见 [`DESIGN.md`](DESIGN.md)。  
> 任何 AI 开发工具（Claude Code、Codex、Cursor、v0、Replit、Bolt、Wrap 等）均应依据本文档与 `DESIGN.md`（如适用）实现产品。  
> 如有歧义，以本文档为准。

---

## 1. 产品概述

### 1.1 一句话定位

**"一个场景优先、以花费路径为中心的 Miniscript 教学实验室：先让用户看懂'谁能在什么时候怎么花'，再暴露 Policy、Miniscript、Script 和 Address。"**

它不是 "Miniscript IDE with education features"，而是 **"以花费路径为中心的教学实验室，IDE 只是其中一个视图"**。

### 1.2 核心差异化

别人展示语法树，我们展示**资金在时间和条件里的运动**。

市面上已有的工具（sipa.be、min.sc、miniscript.fun、adys.dev）全部以"语法/编译"为中心。**没有任何工具**做到：

- 让新手一眼看懂"钱到底怎么花出去"
- 用时间滑块演示 `older()` 和 `after()` 的区别
- 用条件开关模拟"谁签了名、谁没签"
- 以中文提供教育内容

### 1.3 目标用户


| 用户层级 | 描述                      | 核心需求                     |
| ---- | ----------------------- | ------------------------ |
| 入门者  | 听过比特币多签/时间锁，但没写过 Policy | 看懂场景 → 理解路径 → 建立直觉       |
| 学习者  | 正在学习 Miniscript，需要动手实验  | 编辑 Policy → 看编译结果 → 理解差异 |
| 实践者  | 自我托管用户或开发者，要设计真实策略      | 搭建策略 → 分析路径/成本 → 导出/分享   |


### 1.4 产品边界（不做什么）

- **不处理私钥 / 助记词 / 签名** -- 只碰公钥和测试数据
- **不连接任何区块链网络** -- 纯前端模拟
- **不构造或广播交易** -- 不是钱包
- **地址生成仅支持 testnet / signet**
- **不上传服务器**；主题与语言偏好可存于浏览器 localStorage；Playground 策略与模式**不**自动持久化，可通过分享链接（`?s=`）携带状态
- **MVP 仅支持 P2WSH（SegWit v0）** -- Taproot (P2TR) 在 V2 实现
- **不依赖任何 LLM / AI API** -- 所有功能纯确定性计算，无外部 API 调用

---


> **视觉与设计系统**（色板、字体、Scenario 路径图节点尺寸）见 [`DESIGN.md`](DESIGN.md)。

---

## 2. 信息架构

### 2.1 顶部导航

固定在页面顶部，高度 56px。

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ₿ Miniscript Lab   [首页] [Playground] [Resource 资源]           中/EN │
└────────────────────────────────────────────────────────────────────────────┘
```

- Logo: `₿` 符号 + "Miniscript Lab" 文字，点击回首页
- 导航项：**首页**（`/`）、Playground（`/playground`）、Resource 资源（`/resources`）
- 右侧：语言切换（中/EN）、主题切换（日/月图标）

### 2.2 页面结构


| 路由                       | 页面               | 描述                        |
| ------------------------ | ---------------- | ------------------------- |
| `/`                      | 首页               | 产品着陆：Miniscript 通识长页（见 §3.1） |
| `/intro`                 | 重定向             | **永久**重定向至 `/`（兼容旧书签与外链） |
| `/playground`            | Playground       | 三栏工作台 + 底部抽屉；**预设场景**从左栏进入（`ScenarioGallery` 仅在 Playground 内使用） |
| `/playground?s=<base64>` | Playground（分享链接） | 从 URL 恢复状态                |
| `/playground?scenario=<id>` | Playground（预设场景） | 打开指定预设场景（与左栏 `SCENARIOS` 的 `id` 一致） |
| `/resources`             | Resource 资源      | FAQ + 外部资源链接（原 `/compare`） |
| `/compare`               | 对比模式（V2，保留路由）    | 双面板 diff，暂未实现             |


---

## 3. 页面规格

### 3.1 首页（`/`）

产品着陆页：顶部 `Header`、`HomepageHero`（「把 Bitcoin 的花费条件讲清楚」）、Miniscript 通识区块（`src/components/intro/*`：The Challenge、Core Concepts 含 Technical Stack、Applications、Limitations & Tradeoffs、Why Miniscript Matters）、**钱包支持区**（`HomepageWallets`）、底部双按钮 CTA、全站 footer。实现：`src/app/page.tsx`（`'use client'`）。

**Hero 主 CTA**：主按钮锚点 `/#applications`（滚动至 Applications 区块）；次按钮进入 `/playground`。

**Applications**：多场景标签切换 + Policy / Miniscript / Script 三层示例；各场景标题旁 **「上手一试」/ `Try it`**（`intro.applications.tryIt`）。数据在 `src/components/intro/data.ts`：`playgroundScenarioId` 为字符串时跳转 `/playground?scenario=<id>`（`<id>` 须为 `src/lib/scenarios/data.ts` 中 `SCENARIOS[].id`）；为 `null` 时链接为 `/playground`（无预设加载）。示例顺序前两条为「多重签名」「多签 + 时间锁定」，第三条「恢复密钥」与预设 `recoverykey`（左栏展示为「恢复密钥」，`or(pk(Main),and(pk(Recovery),after(10000)))`）同一 Policy。另有 **原子交换 / DLC / 批量支付** 等卡片与预设 `htlc-atomic`、`dlc-simple`、`batch-payment` 对齐。**「原子交换」** 卡片三列 Policy / Miniscript / Script 使用 **`HEX`** 表示 hash160 摘要占位（非具体 hex）；Playground 中栏与路径图见 `AGENTS.md` §8 / §10.13，右栏技术输出仍为真实摘要。

**Playground 左栏预设 `SCENARIOS`**（不含「自己动手」）当前 **8** 条：`multisig-2of3`（2-of-3 多签）、`multisig-or-timelock`（多签 + 时间锁定）、`recoverykey`（**恢复密钥**，`Main`/`Recovery` + `after(10000)`）、`degrading-multisig`（退化多签金库）、`vault-hot-cold`（保险柜）、`htlc-atomic`（原子交换 HTLC，固定教学 hash160）、`dlc-simple`（DLC 简化，纯 `pk` + `Oracle_A`/`Oracle_B`）、`batch-payment`（批量支付，Alice/Bob/Charlie + `after`）。**已移除**预设：`single-key`（个人单签）、`2fa-recovery`（2FA + 超时恢复）。**历史**：该预设曾使用 `id`：`inheritance`，已改为 `recoverykey`；旧链接 `?scenario=inheritance` 不再加载此预设。退化金库与保险柜仅在 Playground 左栏提供，**不在**首页 Applications 七条卡片中。首页七条里 **「支付通道」** 无对应预设（`playgroundScenarioId: null`）；其余六条与预设 `multisig-2of3`、`multisig-or-timelock`、`recoverykey`、`htlc-atomic`、`dlc-simple`、`batch-payment` 对齐（详见 `src/components/intro/data.ts`）。

**不含**：首页不再展示旧版「科普区 / 使命 / 三步 / 功能」与 **首页场景卡片**（`ScenarioGallery` 仍用于 **Playground 左栏** 场景选择）。

**预加载**：`requestIdleCallback` 预热 Playground 相关模块（三栏、画布、编译器），减少进入 `/playground` 的等待。

**窄屏**：`md` 以下 Hero 与底部 CTA 展示 `home.playground.desktopHint`，与 Playground 内说明一致（桌面优先）。

**i18n**：`home.hero.*`、`home.wallets.*`、`home.cta.*`、`intro.applications.tryIt`；Intro 长文正文目前以组件内中文为主。

#### 旧路由 `/intro`（重定向）

访问 `/intro` **重定向至 `/`**（`src/app/intro/page.tsx`），兼容旧书签与外链。

### 3.1b Resource 资源页（`/resources`）

原导航中的「对比」标签已更名为「Resource 资源」并指向此路由。页面由两个区域组成：

**FAQ 区域**：展示 18 条 Miniscript 常见问题与解答，按学习递进顺序分为四大部分：

- **基础概念**（Q1、Q5、Q2、Q9）：Miniscript 定义与优势、Descriptor 输出描述符、Policy 三层抽象、花费路径概念
- **Miniscript 语言基础**（Q3、Q4、Q11、Q12、Q13）：时间锁差异、thresh() 操作符、操作符列表、andor() 条件分支、多签和恢复场景
- **Miniscript 技术细节**（Q14、Q15、Q16、Q17、Q10）：类型系统（B/V/K/W）、修饰符、常见片段和 Wrapper、资源限制和优化、可延展性
- **工具与安全**（Q6、Q7、Q8、Q18）：P2WSH 地址格式、测试网声明、画布 vs 文本编辑、生产环境建议

答案排版支持富文本格式：
- **加粗核心定义**：用 `**文本**` 包裹，渲染为 `font-semibold text-text-primary`
- **列表项**：用 `- 项目` 开头，每行单独，渲染为带左侧 `btc-500` 符号的列表
- **段落分离**：用双换行 `\n\n` 分隔，创造清晰的信息层次
- **内联代码**：用 backtick 包裹，渲染为等宽字体 + `btc-500` 色

**Resource 资源区域**：预留外部链接区域，初始显示占位提示文字（`resources.links.placeholder`），后续由维护者填充相关工具、规范、教程的外部链接。

实现：`src/app/resources/page.tsx`（`'use client'` 组件，增强的 `renderAnswer()` 函数支持富文本解析）。i18n：`resources.*`（含 `resources.faq.*` 共 66 个词条、`resources.links.*` 共 4 个词条、`resources.faq.section.*` 共 4 个小节标题）。风格遵循设计系统，使用 `surface-base`/`surface-elevated`/`btc-500` 等语义 token，`rounded-2xl` 卡片，折叠区域 `ChevronDown` 旋转动画。

这是产品的核心页面。

#### 桌面优先与窄视口

- **产品策略**：完整 Playground（三栏工作台 + Build 画布）以**桌面端 / 宽视口**为设计目标；窄视口下不提供完整界面，仅展示全屏说明（`MobileFallback`）与返回场景入口等引导。
- **实现**：`PlaygroundClient` 使用 `matchMedia('(min-width: 768px)')` 分支；窄视口渲染 `MobileFallback`（文案键 `playground.mobile.*`）；首页在 `md` 断点以下于 Hero 与底部 CTA 展示 `home.playground.desktopHint`，与 Playground 内说明一致。
- **用户可见文案**：不出现像素数字，表述为建议在桌面端或更大屏幕以获得完整体验。

#### 渐进式加载架构

目标：页面切换像 App 内导航一样丝滑——三栏框架立即可见，只有画布区域异步加载。

- **框架立即可见**：`playground/page.tsx` 直接 import `PlaygroundClient`（有 `'use client'`），Next.js 在服务端渲染完整三栏 HTML 框架；`PlaygroundContent` 不再在 `mode === 'loading'` 时返回 `null`，避免服务端输出空 HTML 导致白屏。

- **画布懒加载**：`CenterPanel` 中 `BuilderCanvas` 和 `PathMap` 用 `dynamic({ ssr: false })` 懒加载，下载期间显示带 spinner 的骨架屏（`CanvasSkeleton`），用户不会看到空白。

- **后台预加载（scenario 模式）**：`CenterPanel` 在用户浏览 scenario 模式 2 秒后，后台触发 `BuilderCanvas`、`BuilderNodes` 的预加载，切换到"自己动手"模式时无需等待。

- **首页全量预热**：首页用 `requestIdleCallback` 预热所有 Playground 模块（三栏组件 + 两画布 + 编译器），用户从首页导航进入 Playground 时所有代码已就绪。

- **文档级预取**：`layout.tsx` 加 `<link rel="prefetch" href="/playground" as="document">`，让浏览器提前获取 Playground 页面 HTML，无论从哪个页面导航过来都更快。

- **缓存行为**：同 Tab 内来回切换命中浏览器**模块内存缓存**，完全不触发网络请求；普通刷新命中 **HTTP 缓存**（Next.js JS 文件名含 hash），极快恢复；仅强制刷新才重新下载。

#### 整体布局

```
┌──────────────────────────────────────────────────────────────────┐
│                          Header (56px)                            │
├──────────┬────────────────────────────────┬──────────────────────┤
│ 左栏      │         中栏                    │ 右栏                 │
│ 240px    │         flex: 1                 │ 320px                │
│ 可折叠    │                                │ 可折叠                │
│          │  Policy 编辑器 (可折叠)          │                      │
│ 场景选择   │  ─────────────────────          │  花费路径 (固定)      │
│ (含自己   │  主画布：场景=路径图/build=策略树   │  路径卡片列表          │
│  动手)   │  (React Flow, 可缩放)           │  ── 可拖拽分割条 ──   │
│ ───────  │  ─────────────────────          │  Tab 面板:           │
│ 角色变量   │  状态结论横幅                     │   Policy             │
│ ───────  │  ─────────────────────          │   Miniscript         │
│ 地址类型   │  条件开关:                       │   Script/ASM         │
│          │  🔑A 🔑B 🔐H                    │   Descriptor         │
│          │  时间滑块:                       │   Address            │
│          │  T0 ◀━━━━━▶ 1y                 │   Warnings           │
├──────────┴────────────────────────────────┴──────────────────────┤
│              底部抽屉: 栈机模拟器 (V2, 默认收起)                      │
└──────────────────────────────────────────────────────────────────┘
```

左右栏可通过按钮折叠，折叠后中栏占据全部宽度。移动端默认左右栏折叠为底部 sheet。

#### 3.2.1 左栏：场景导航与配置

宽度 240px，从上到下排列以下区域（可折叠的 section）：

**区域 A: 场景选择器**

- 场景列表（卡片形式，点击切换场景）
- 第一个位置为 **「自己动手」** 入口卡片（可点击；`playgroundMode === 'build'` 时呈激活态）。点击后进入 **可视化构建（build）模式**（`playgroundMode: 'build'`）：清空当前场景-derived 状态，中���画布以根占位节点（虚线「选择策略类型」）为首屏；用户点击根占位后在右侧浮窗选择策略类型（单签、门限、AND、OR），**不继承**用户此前在场景模式下的 Policy / 角色变量 / 编译结果。从场景模式切换到普通预设场景仍通过下方场景卡片完成（`loadScenario` 会回到 `scenario` 模式）。
- 通过分享链接 `?s=` 恢复的 **build** 会话可携带已有 Policy；与从场景模式**主动**点「自己动手」进入时的空白 scratch（清空场景派生状态）不同。
- 切换场景（非「自己动手」）时自动填充 Policy 和 Key 变量

**区域 B: 角色与 Key 变量**

- 可折叠面板，标题 "🔑 角色变量"
- 列表：变量名（如 Alice）→ 对应公钥（可编辑，默认用测试密钥）
- [+ 添加] [🎲 随机生成] [恢复默认] 按钮
- 密钥格式提示：MVP 使用压缩公钥（66 字符 hex，用于 P2WSH）

**区域 C: 地址类型选择**

- 单选按钮组：SegWit v0 (P2WSH) | Taproot (Coming Soon)
  - P2WSH：可选择，为 MVP 默认值
  - Taproot：按钮置灰不可选择，右侧显示 "Coming Soon" 标签（小号、`--text-muted` 色、斜体）
- 网络：Testnet | Signet

#### 3.2.2 中栏：编辑、可视化与模拟

这是产品的**核心创新区**。中栏由上到下分为四个区域。

**顶部：Policy 编辑器**

- CodeMirror 6 编辑器，内嵌在中栏顶部（可折叠）
- 高度自适应（最小 80px，最大 300px）
- 语法高亮（见 §5.5）
- 编辑后 500ms 防抖自动编译
- 编译错误在编辑器下方显示（警告色摘要，随 locale 中英切换）；可展开「技术详情」查看并复制 `raw`；可选 `hints` 列表；若存在 `FriendlyError.highlights`（或兼容字段 `highlight`），在 CodeMirror 内对 Policy 文本对应区间做背景标记（启发式，非 IDE 级定位）。`duplicate_key` 等类别可对多处区间标红（例如重复 `pk(角色名)` 时标出每一处角色名）。
- 工具栏：[格式化] [清空] [复制] [分享🔗]（Build 模式与 Scenario 模式一致，无额外按钮）
- **Build 模式**下编辑器与可视化画布双向同步：画布操作更新 Policy；用户编辑 Policy 时，若结构仍在构建器支持范围内则回写 `strategyTree`，否则进入「文本主导」状态（`builderSyncState: 'text-led'`），不强行破坏画布。同步逻辑见 `useBuilderSync`（`src/lib/hooks/useBuilderSync.ts`）。
  - 成功从语义树回写时通过 `updateStrategyTree` 写入，编辑器中的 Policy 与 `serializeStrategyTree(strategyTree)` 对齐为规范串。
  - Policy 为空（或仅空白）时：`useCompiler` 清空编译结果与语义树/路径；`useBuilderSync` 将 `strategyTree` 重置为根占位节点，并将 `lastBuilderPolicySnapshot` 置空，与「主动进入 build」的空白 scratch 一致。
  - Policy 非空但**编译失败**且当前尚无 `strategyTree`（例如会话恢复后从未成功编译）：`useBuilderSync` 将 `builderSyncState` 置为 `compile-error`，并植入根占位树，避免画布长期停在「正在编译并同步画布…」；若已有树则只读保留快照。见 `src/lib/hooks/useBuilderSync.ts` 与 `src/lib/hooks/__tests__/useBuilderSync.test.ts`。

**主画布（按 `playgroundMode` 二选一）**

**Scenario 模式（`playgroundMode === 'scenario'`）：路径图区域 — React Flow 路径图**

将 Miniscript 编译结果转化为简化的语义决策树（不是原始 AST）。

路径图的**根节点直接显示顶层条件逻辑类型**，不再显示通用的"花费条件"标题：

- 若策略根为 AND → 根节点显示"都需要"
- 若策略根为 OR → 根节点显示"任选一"
- 若策略根为 thresh(k,...) 或编译后退化为 multi(k,...) → 根节点显示 "k-of-n"
- 若策略为单一叶子条件 → 直接显示该条件节点（无根节点）

这样从图的顶部就能直接看到花费所需的逻辑关系，无需通过实线/虚线判断。

其他节点：

- AND 节点：显示为"都需要"的并列条件
- OR 节点：显示为分支选择
- 叶子节点：条件（签名/时间锁/哈希锁），用语义 chip 样式
- thresh(k,...) 节点：显示为 "k-of-n" 圆角矩形
- multi(k, key1,...,keyn) 在语义树中仍以 `type: 'multi'` 表示，但在路径图上会被**展开**成一个 "k-of-n" 节点，下挂每个参与者 key 的叶子节点（例如 2-of-3 多签场景下根节点为 "2-of-3"，下面是 Alice / Bob / Charlie）。

节点状态根据条件开关和时间滑块实时变化：

- 已满足：绿色边框 + 绿色背景 10%
- 暂不可满足（时间未到）：琥珀色边框 + 橙色背景 10%
- 缺条件（签名/哈希缺失）：灰色边框 + 灰色背景

边（连线）样式：

- AND 分支：实线，表示"都要"
- OR 分支：虚线，表示"任选"
- 满足路径上的边：颜色加深为绿色

图布局（**scenario 模式**花费路径图）：使用 Dagre 自顶向下（TB）布局，节点间距 60px 垂直 / 40px 水平（实现见 `src/lib/flow/tree-to-flow.ts`）。

**Build 模式（`playgroundMode === 'build'`）：可视化策略树画布**

- 中栏 **不再** 单独展示与 scenario 相同的那张「花费路径图」；改为 **受约束的策略树编辑器**（`BuilderCanvas`，`src/components/builder/*`），在同一 React Flow 画布上编辑结构并叠加满足态（已满足 / 等待 / 缺失）。**满足态计算**以 `src/lib/builder/status.ts` 的 `computeBuilderStatus` 为唯一实现；`src/lib/builder/tree-to-flow.ts` 在生成节点前调用它并将结果用于连线「是否已满足」与节点着色。布局由 `tree-to-flow.ts` 负责：**自下而上计算子树宽度、自上而下放置**，父节点在**整行直接子节点（含未满员时的虚拟「+ 添加条件」）**的水平包围盒上居中；**不**使用 Dagre，以避免仅平移父节点时与兄弟子树重叠等问题。
- **`all`（都需要）与 `any`（任选一）分组**在 `strategyTree` 中**最多两个直接子节点**（子占位符占槽）；满员则**不**再渲染「+ 添加条件」，且 `node-ops` 不向该父节点追加第三子。`threshold`（门限）分组仍允许多子。Policy 字符串由 `serializeStrategyTree`（`src/lib/builder/serialize.ts`）输出为**嵌套二元** `and`/`or`，与 Miniscript Policy 语法一致。从编译结果回写画布时，`importFromSemanticTree`（`src/lib/builder/from-semantic-tree.ts`）将语义树里 N 叉的 `and`/`or` **折叠**为嵌套二叉分组。用户将节点从 **threshold** 切换为 **AND/OR** 且子节点多于 2 个时，**仅保留前两个子条件**（画布底部可显示提示 toast）。
- 领域模型为 `StrategyNode`（`src/lib/builder/types.ts`），与 `MiniscriptNode` 分离；MVP 支持签名、`all` / `any` / 阈值组、相对时间锁 `older()` 等；`after()` 与哈希锁在类型与未来扩展上预留，首版 UI 可不开放编辑。
- 右栏花费路径列表与 scenario 一致；在 build 模式下点击路径卡片可 **高亮** 画布上与该路径相关的分支（`path-highlighting.ts`）。
- 签名节点编辑浮层（`BuilderPopover`）固定在 **画布区域右上角**（`absolute right-4 top-4`）；其中的「新建角色」与左栏 **角色变量** 的「添加」共用 `src/lib/playground/add-next-key-variable.ts` 中的「下一个角色」规则（优先 `Alice`…`Frank`，否则 `Key{n}`，测试公钥来自 `DEFAULT_TEST_KEYS` 或随机）；**一键**创建角色并将 **当前签名节点** 绑定到该角色（无需在浮层内输入名称）。
- **操作符切换**：Group 节点（根节点和嵌套 Group）上的操作符标签（都需要 / 任选一 / k-of-n）可点击，在 **画布区域右上角** 打开 `OperatorSwitchPopover`（与 `BuilderPopover` 同一定位槽位），允许在 AND / OR / threshold 之间自由切换；切换到 threshold 时 k 值重置为 `min(2, realChildCount)`。若当前子节点多于 2 个且目标为 AND/OR，`changeGroupOp` 会裁剪为前两个子条件（见上条）。Store 用 `operatorSwitchNodeId` 与 `selectedBuilderNodeId` **互斥**，避免两块浮层同时遮挡画布。
- **节点包裹**：所有叶子节点（签名、时间锁）和 Group 节点的编辑浮层底部有「包裹进新组」三按钮（都需要 / 任选一 / 门限），点击后当前节点被包裹进一个新的父级 Group，原节点成为第一个子节点，同时添加一个 placeholder 子槽。
- **门限 k、序列化与子占位（实现约定）**：
  - `node-ops.ts` 提供 `countRealChildren`、`defaultThresholdK`、`clampThresholdK`：`changeGroupOp` 切到 threshold 时默认 k 为 `min(2, max(1, realChildCount))`，显式传入的 k 会钳制到不超过当前非占位直接子节点数；`wrapNodeInGroup` 包裹为门限时按「包裹后仅 1 个真实子节点」设定默认 k（通常为 1），避免树状态出现 k 大于可序列化子策略数。
  - `serializeStrategyTree` 输出 `thresh(k,…)` 前将 k 钳制到非占位子策略个数（防御性；正常路径由上述树操作保证合法）。
  - **追加**与 **填写占位**：向父 Group 末尾追加子节点使用 `addChildNode` / `addSignatureChild` 等；**替换**树内 `placeholderType: 'child'` 的槽位使用 `convertChildPlaceholder`；根占位「选择策略类型」仍使用 `convertRootPlaceholder`。
  - 画布 Flow 数据用 `addChildSlotKind` 区分槽位：`virtual` 表示虚拟「+ 添加条件」（选中后 `selectedBuilderNodeId = add_child:{父 Group id}`）；`treePlaceholder` 表示树内子占位（选中后为占位节点自身 id）。**门限分组**若已存在子 placeholder 槽，则**不再**渲染额外的虚拟「+」，避免与「填写子槽」重复。
  - 「添加条件」面板 UI 抽为 `AddChildOptions`（`src/components/builder/AddChildOptions.tsx`），与虚拟添加、子占位填写共用同一套按钮；`BuilderPopover` 内 `handleAddChildType` 根据是否选中子占位在 `convertChildPlaceholder` 与 `addChildNode` 系之间分支。
  - `OperatorSwitchPopover` 的「真实子节点数」与 `countRealChildren` 一致（不含 placeholder）。`BuilderCanvas` 调用 `builderTreeToFlow` 时传入 `labels.addConditionLine`（例如 `+` 与 `builder.node.addChild` 译文拼接），使画布上虚拟加号与子占位标签与 i18n 一致。
- **嵌套深度检测**：包裹操作后若嵌套深度超过 5 层，画布底部显示黄色警告 toast（4 秒自动消失，可手动关闭），提示用户保持在 5 层以内。
- **不在 MVP 范围内**：自由拖线构图、`after()`/哈希锁的画布编辑、移动端完整 Builder；未来可在此模式上叠加「引导搭建」等（见 §10）。

**节点尺寸与视觉规格（Scenario 路径图）：** 见 [`DESIGN.md`](DESIGN.md) §6。

**状态结论横幅**

位于路径图**下方**、条件模拟面板**上方**，紧贴条件面板。一行大字显示当前结论：

```
✅ 可花费: Alice + Service 签名即可 (路径 A, ~110 vB)
```

或

```
⏳ 还需等待 23 天，恢复路径才可用
```

或

```
❌ 当前条件下无法花费，还缺 Bob 的签名
```

横幅背景色随状态变化（绿/橙/灰），内边距 12px，圆角 8px。

**底部：条件模拟面板**

紧贴状态横幅下方：

```
┌──────────────────────────────────────────┐
│ 条件开关:                                 │
│ [🔑 Alice ✓] [🔑 Bob ✗] [🔐 Secret ✗]   │
│                                          │
│ 时间: ◀━━━━━━━●━━━━━━━━━━━━━━━━▶         │
│       T0     30天              1年        │
│       当前: 第 4,320 区块 ≈ 30 天          │
└──────────────────────────────────────────┘
```

- 条件开关：根据 Policy 中出现的 key 和 hash 自动生成
- 每个开关是一个可切换的 chip（点击切换开/关）
- 开 = 填充色 + 勾号；关 = 边框 + 叉号
- 时间滑块：
  - 范围：0 到 max(所有 timelock 值 * 1.5, 52560 blocks)
  - 刻度标记：在每个 timelock 值处显示刻度线 + 标签
  - 滑块当前值以"区块数 + 人类时间"双显示
  - 拖动时路径图实时更新
- 时间换算规则：
  - 1 block ≈ 10 分钟
  - 144 blocks ≈ 1 天
  - 1,008 blocks ≈ 1 周
  - 4,320 blocks ≈ 30 天
