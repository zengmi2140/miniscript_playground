# Miniscript Lab -- 完整产品规格与实施计划

> **本文档是产品的唯一真相来源（Single Source of Truth）。**  
> 任何 AI 开发工具（Claude Code、Codex、Cursor、v0、Replit、Bolt、Wrap 等）均应依据本文档实现产品。  
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

## 2. 设计系统

### 2.1 设计原则

1. **克制** -- Miniscript 天然信息密度高，UI 必须留白充分，单屏最多一个焦点
2. **温暖** -- 比特币社区是温暖的，用暖色调，不用冷色调
3. **诚实** -- 不要花哨装饰，每个视觉元素都传递信息
4. **分层** -- 默认只展示一层抽象，底层细节"可达"但不"扑面而来"

### 2.2 色彩系统

#### 深色模式（默认）

使用 Tailwind `stone` 暖灰色阶作为基底，比特币橙作为品牌点缀。

```css
/* ===== 背景层级 ===== */
--bg-base:      #0C0A09;  /* stone-950, 最深背景 */
--bg-surface:   #1C1917;  /* stone-900, 卡片/面板背景 */
--bg-elevated:  #292524;  /* stone-800, 悬停/抬升表面 */
--bg-overlay:   #44403C;  /* stone-700, 下拉/弹出覆盖 */

/* ===== 比特币橙色阶 ===== */
--orange-50:    #FFF8F0;
--orange-100:   #FFECD4;
--orange-200:   #FFD6A5;
--orange-300:   #FFBA6B;
--orange-400:   #FF9F35;
--orange-500:   #F7931A;  /* ★ 主品牌色 */
--orange-600:   #D97706;
--orange-700:   #B45309;
--orange-800:   #92400E;
--orange-900:   #78350F;

/* ===== 文字 ===== */
--text-primary:   #FAFAF9;  /* stone-50, 主要文字 */
--text-secondary: #A8A29E;  /* stone-400, 次要文字 */
--text-muted:     #78716C;  /* stone-500, 弱化文字 */
--text-inverse:   #0C0A09;  /* 橙色按钮上的文字 */

/* ===== 边框 ===== */
--border-subtle:  #292524;  /* stone-800 */
--border-default: #44403C;  /* stone-700 */
--border-hover:   #57534E;  /* stone-600 */
--border-active:  #F7931A;  /* 激活态用橙色 */

/* ===== 语义色（路径可视化） ===== */
--semantic-key:       #EAB308;  /* yellow-500, 暖金色 = 签名/密钥 */
--semantic-timelock:  #F7931A;  /* 比特币橙 = 时间条件 */
--semantic-hashlock:  #A78BFA;  /* violet-400, 柔紫 = 哈希/密码学 */
--semantic-satisfied: #22C55E;  /* green-500 = 已满足 */
--semantic-locked:    #57534E;  /* stone-600 = 锁定/不可用 */
--semantic-warning:   #EF4444;  /* red-500 = 警告 */
```

#### 亮色模式

```css
--bg-base:        #FAFAF9;  /* stone-50 */
--bg-surface:     #FFFFFF;
--bg-elevated:    #F5F5F4;  /* stone-100 */
--text-primary:   #1C1917;  /* stone-900 */
--text-secondary: #57534E;  /* stone-600 */
--text-muted:     #A8A29E;  /* stone-400 */
--border-subtle:  #E7E5E4;  /* stone-200 */
--border-default: #D6D3D1;  /* stone-300 */
```

#### 语义色使用规则


| 语义      | 颜色                         | 用在哪                          |
| ------- | -------------------------- | ---------------------------- |
| 签名 / 密钥 | `--semantic-key` 暖金        | pk() 节点、密钥 chip、签名开关         |
| 时间条件    | `--semantic-timelock` 比特币橙 | older() / after() 节点、时间滑块    |
| 哈希条件    | `--semantic-hashlock` 柔紫   | sha256() / hash160() 节点、哈希开关 |
| 已满足     | `--semantic-satisfied` 绿   | 满足条件的路径边框/背景                 |
| 锁定/不可用  | `--semantic-locked` 暖灰     | 不可满足的路径、灰化的节点                |
| 警告/错误   | `--semantic-warning` 红     | 编译错误、安全警告                    |


### 2.3 字体

```css
/* 正文 / 标题 */
font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;

/* 代码 / 等宽 */
font-family: "IBM Plex Mono", ui-monospace, "Cascadia Code", monospace;
```

均通过 `next/font/google` 加载，字体文件自动托管。

#### 字号层级


| 用途          | 大小               | 字重             | 字体                |
| ----------- | ---------------- | -------------- | ----------------- |
| 页面标题        | 32px / 2rem      | 700 (Bold)     | Plus Jakarta Sans |
| 区域标题        | 20px / 1.25rem   | 600 (SemiBold) | Plus Jakarta Sans |
| 正文          | 14px / 0.875rem  | 400 (Regular)  | Plus Jakarta Sans |
| 次要说明        | 12px / 0.75rem   | 400            | Plus Jakarta Sans |
| 代码 / Policy | 13px / 0.8125rem | 400            | IBM Plex Mono     |
| 状态标签（大号）    | 18px / 1.125rem  | 600            | Plus Jakarta Sans |
| 条件 chip     | 12px / 0.75rem   | 500 (Medium)   | Plus Jakarta Sans |


### 2.4 间距与圆角

- 基础间距单位：4px
- 面板内边距：16px（紧凑）或 24px（宽松）
- 卡片圆角：12px
- 按钮圆角：8px
- Chip/Tag 圆角：6px
- 图节点圆角：10px

### 2.5 组件规范

#### 按钮


| 类型        | 背景                   | 文字                 | 边框                 | 用途         |
| --------- | -------------------- | ------------------ | ------------------ | ---------- |
| Primary   | `--orange-500`       | `--text-inverse`   | 无                  | 编译、主要操作    |
| Secondary | `--bg-elevated`      | `--text-primary`   | `--border-default` | 次要操作       |
| Ghost     | 透明                   | `--text-secondary` | 无                  | Tab 切换、工具栏 |
| Danger    | `--semantic-warning` | 白                  | 无                  | 清除、删除      |


hover 态：Primary → `--orange-600`；Secondary → `--bg-overlay`

#### 条件 Chip

```
┌─────────────────────┐
│ 🔑 Alice 签名        │  ← semantic-key 背景色 10% 透明度 + 左侧色条
└─────────────────────┘
┌─────────────────────┐
│ ⏳ 等待 30 天         │  ← semantic-timelock 背景色 10% 透明度 + 左侧色条
└─────────────────────┘
┌─────────────────────┐
│ 🔐 揭示 Secret       │  ← semantic-hashlock 背景色 10% 透明度 + 左侧色条
└─────────────────────┘
```

每个 chip 高度 28px，内边距 6px 12px，左侧 3px 色条标识类型。

#### 路径卡片

```
┌──────────────────────────────────────────┐
│ 路径 A: 正常花费  ●  可满足                │  ← 标题 + 状态
│──────────────────────────────────────────│
│ 🔑 Alice  🔑 Service                     │  ← 条件 chips
│──────────────────────────────────────────│
│ 预估费用: ~110 vB                         │  ← 成本信息
└──────────────────────────────────────────┘
```

激活态（当前条件可满足）：左边框变为 `--semantic-satisfied` 绿色 3px。
不可用态：整体透明度降低到 50%，灰色左边框。

---

## 3. 信息架构

### 3.1 顶部导航

固定在页面顶部，高度 56px。

```
┌──────────────────────────────────────────────────────────────┐
│  ₿ Miniscript Lab    [场景]  [Playground]  [对比]    🌐 中/EN │
└──────────────────────────────────────────────────────────────┘
```

- Logo: `₿` 符号 + "Miniscript Lab" 文字，点击回首页
- 导航项：场景（首页）、Playground、对比（V2 标注 "Coming Soon"）
- 右侧：语言切换（中/EN）、主题切换（日/月图标）

### 3.2 页面结构


| 路由                       | 页面               | 描述           |
| ------------------------ | ---------------- | ------------ |
| `/`                      | 场景画廊             | 首页，场景卡片入口    |
| `/playground`            | Playground       | 三栏工作台 + 底部抽屉 |
| `/playground?s=<base64>` | Playground（分享链接） | 从 URL 恢复状态   |
| `/compare`               | 对比模式（V2）         | 双面板 diff     |


---

## 4. 页面规格

### 4.1 首页（`/`）

产品着陆页：顶部 `Header`、Hero（「把 Bitcoin 的花费条件讲清楚」）、Miniscript 科普区（三卡片对比传统 Script / Policy）、使命区「我们为什么做这个」、「三步理解」流程、核心能力 2×2、**场景库**（6 张场景卡片）、底部 CTA；另有「或者自己写」入口。实现：`src/app/page.tsx`（Server Component）；组件：`HomepageHero`、`HomepageMiniscriptExplainer`、`HomepageMission`、`HomepageFeatures`、`HomepageHowItWorks`、`ScenarioGallery`。i18n：`home.hero.*`、`home.explainer.*`、`home.how.*`、`home.features.*`、`home.cta.*`。

**场景卡片**：顶色条 4px（语义色）、Lucide 图标 32px、标题、一句话描述、条件类型 tag；桌面 3 列 / 平板 2 列 / 手机 1 列；hover 上移 + 阴影；点击 `/playground?scenario=<id>`。

**预加载**：`requestIdleCallback` 预热 Playground 相关模块（三栏、画布、编译器），减少进入 `/playground` 的等待。

**窄屏**：`md` 以下 Hero 与底部 CTA 展示 `home.playground.desktopHint`，与 Playground 内说明一致（桌面优先）。

### 4.2 Playground 页（`/playground`）

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

#### 4.2.1 左栏：场景导航与配置

宽度 240px，从上到下排列以下区域（可折叠的 section）：

**区域 A: 场景选择器**

- 场景列表（卡片形式，点击切换场景）
- 第一个位置为 **「自己动手」** 入口卡片（可点击；`playgroundMode === 'build'` 时呈激活态）。点击后进入 **可视化构建（build）模式**（`playgroundMode: 'build'`）：清空当前场景-derived 状态，中央画布以根占位节点（虚线「选择策略类型」）为首屏；用户点击根占位后在右侧浮窗选择策略类型（单签、门限、AND、OR），**不继承**用户此前在场景模式下的 Policy / 角色变量 / 编译结果。从场景模式切换到普通预设场景仍通过下方场景卡片完成（`loadScenario` 会回到 `scenario` 模式）。
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

#### 4.2.2 中栏：编辑、可视化与模拟

这是产品的**核心创新区**。中栏由上到下分为四个区域。

**顶部：Policy 编辑器**

- CodeMirror 6 编辑器，内嵌在中栏顶部（可折叠）
- 高度自适应（最小 80px，最大 300px）
- 语法高亮（见 §6.5）
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

这样用户从图的顶部就能直接看到花费所需的逻辑关系，无需通过实线/虚线判断。

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

- 中栏 **不再** 单独展示与 scenario 相同的那张「花费路径图」；改为 **受约束的策略树编辑器**（`BuilderCanvas`，`src/components/builder/*`），在同一 React Flow 画布上编辑结构并叠加满足态（已满足 / 等待 / 缺失）。布局由 `src/lib/builder/tree-to-flow.ts` 负责：**自下而上计算子树宽度、自上而下放置**，父节点在**整行直接子节点（含未满员时的虚拟「+ 添加条件」）**的水平包围盒上居中；**不**使用 Dagre，以避免仅平移父节点时与兄弟子树重叠等问题。
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
- **不在 MVP 范围内**：自由拖线构图、`after()`/哈希锁的画布编辑、移动端完整 Builder；未来可在此模式上叠加「引导搭建」等（见 §11）。

**节点尺寸规格（Scenario 路径图）：**

| 节点类型           | 宽度    | 高度   | 说明                              |
| -------------- | ----- | ---- | ------------------------------- |
| RootNode       | 200px | 44px | 动态显示顶层条件逻辑类型（都需要/任选一/k-of-n） |
| OperatorNode   | 120px | 36px | 显示 "都需要" / "任选一" / "k-of-n"   |
| ConditionNode  | 160px | 40px | 显示叶子条件（签名/时间锁/哈希锁），内容居中        |

- 所有节点圆角 10px，边框 2px solid
- React Flow 画布背景 transparent，不显示网格点
- 边框颜色和背景色根据上述状态规则（绿/琥珀/灰）动态变化
- 节点内部水平 padding 12px，文字 font-size 13px，font-weight 500

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
  - 12,960 blocks ≈ 90 天
  - 52,560 blocks ≈ 1 年

#### 4.2.3 右栏：结果与分析

右栏分为**上下两个区域**，中间有可拖拽的分割条（默认高度比约 60:40，上部：下部）。

**上部：花费路径（固定展示）**

花费路径始终展示在右栏上部，不是 Tab 成员。标题区域有 `?` 解释按钮。

每条路径显示为一个卡片（见下方"花费路径 Tab 详细规格"）。

**下部：技术细节面板（左侧垂直选项卡 + 右侧内容）**

下半部分再细分为左右两列：

- 左列：宽度约 100px 的垂直 Tab 导航，仅显示文字标签（Policy / Miniscript / Script / Descriptor / Address / 警告），当前选中项通过左侧竖线 + 浅色背景 + 加粗文字高亮。
- 右列：技术细节内容区，占据剩余宽度。

一次只展示一个 Tab 内容：

| Tab        | 内容                         | 格式                                      |
| ---------- | -------------------------- | --------------------------------------- |
| Policy     | 当前 Policy（变量名已替换为真实公钥，可复制） | 等宽字体 + 语法高亮 + 自动换行 + 复制按钮          |
| Miniscript | 编译后的 Miniscript（含真实公钥，可复制）     | 等宽字体 + 格式化显示 + 自动换行 + 复制按钮         |
| Script     | Bitcoin Script ASM         | 等宽字体 + opcode 着色 + 自动换行 + 复制按钮     |
| Descriptor | 输出描述符 (wsh(...) 或 tr(...)) | 等宽字体 + 自动换行 + 复制按钮                   |
| Address    | 生成的地址                      | 等宽字体 + 自动换行 + 网络标注 + 复制按钮          |
| 警告         | 安全/有效性警告                   | 列表，每条有图标 + 说明                       |

所有技术 Tab 的长文本均在右栏内容区域宽度内自动换行，优先占用竖向空间；默认不出现水平滚动条，只有在内容极端冗长时才通过下部区域的垂直滚动查看更多。

带 glossary 的 Tab（当前为 Policy / Miniscript / Descriptor）在标签上**悬停 2 秒**后，会在内容区域左侧上方弹出一张微教学卡片，使用术语表（Glossary）里的中英文标题与解释文本。

默认选中 Policy Tab。

**花费路径 Tab 详细规格：**

每条路径显示为一个卡片：

```
┌──────────────────────────────────────┐
│ 路径 1: 正常花费                       │
│ ──────────────────────────────────── │
│ [🔑 User] [🔑 Service]              │
│ ──────────────────────────────────── │
│ Witness 大小: ~110 vB  |  状态: ✅    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 路径 2: 超时恢复                       │
│ ──────────────────────────────────── │
│ [🔑 User] [⏳ 等待 30 天]            │
│ ──────────────────────────────────── │
│ Witness 大小: ~95 vB   |  状态: ⏳    │
│ (还需等待 4,320 区块)                 │
└──────────────────────────────────────┘
```

#### 4.2.4 底部抽屉：栈机模拟器（V2）

- 默认完全收起，只显示一个 24px 高的把手条
- 把手条文字："▲ 栈机模拟器"（灰色）
- 只有当编译成功后才可展开
- 展开后高度 300px（可拖拽调整）
- MVP 阶段此区域显示 "Coming Soon" 占位

---

## 5. 数据模型与 TypeScript 类型

### 5.1 核心类型定义

```typescript
// ===== 场景 =====
interface Scenario {
  id: string;
  icon: string;                 // Lucide icon 名称
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  explanation: { zh: string; en: string };
  policy: string;               // Policy 表达式
  keyVariables: KeyVariable[];
  context: ScriptContext;
}

interface KeyVariable {
  name: string;                 // 显示名，如 "Alice"
  policyName: string;           // Policy 中使用的名称，如 "Alice"
  publicKey: string;            // 测试用压缩公钥 (66 hex) 或 x-only (64 hex)
}

type ScriptContext = 'wsh' | 'tr';
type Network = 'testnet' | 'signet';
type PlaygroundMode = 'scenario' | 'build';

// ===== 编译结果 =====
interface CompilationResult {
  policy: string;             // 用户原始输入（含角色名如 Alice）
  policyWithKeys: string;     // 右栏 Policy Tab 展示：变量名已替换为真实公钥
  miniscript: string;         // 含角色名，供 parseMiniscript → 路径图/ConditionToggles
  miniscriptWithKeys: string; // 右栏 Miniscript Tab 展示：含真实公钥
  asm: string;
  descriptor: string;
  address: string;
  scriptHex: string;
}

// ===== 花费路径 =====
interface SpendingPath {
  index: number;
  label: string;                      // "路径 1: 正常花费"
  conditions: PathCondition[];
  witnessAsm: string;                 // 符号化 witness
  witnessSize: number;                // 估算 vB
  nSequence?: number;
  nLockTime?: number;
  isMalleable: boolean;
  satisfiable: boolean;               // 在当前条件下是否可满足
  missingConditions: PathCondition[]; // 还缺什么
}

type PathCondition =
  | { type: 'signature'; keyName: string }
  | { type: 'timelock_relative'; blocks: number; humanReadable: string }
  | { type: 'timelock_absolute'; value: number; humanReadable: string }
  | { type: 'hashlock'; hashType: 'sha256' | 'hash256' | 'ripemd160' | 'hash160'; hash: string };

// ===== Miniscript 语义树（用于路径图可视化） =====
type MiniscriptNode =
  | { type: 'key'; name: string; wrapper?: string }
  | { type: 'older'; blocks: number; humanReadable: string }
  | { type: 'after'; value: number; humanReadable: string }
  | { type: 'hash'; hashType: string; hash: string }
  | { type: 'and'; children: MiniscriptNode[] }
  | { type: 'or'; children: MiniscriptNode[] }
  | { type: 'threshold'; k: number; n: number; children: MiniscriptNode[] }
  | { type: 'multi'; k: number; keys: string[] }
  | { type: 'just_1' }
  | { type: 'just_0' };

// ===== Playground 状态 =====
interface PlaygroundState {
  // 模式
  playgroundMode: PlaygroundMode;

  // 输入
  policy: string;
  context: ScriptContext;
  network: Network;
  keyVariables: KeyVariable[];
  activeScenarioId: string | null;

  // 编译结果
  compilationResult: CompilationResult | null;
  compilationError: FriendlyError | null;
  semanticTree: MiniscriptNode | null;

  // 路径分析
  spendingPaths: SpendingPath[];

  // 交互状态
  availableKeys: Set<string>;       // 已"签名"的 key 名称
  availableHashes: Set<string>;     // 已"揭示"的 hash
  currentTimeBlocks: number;        // 时间滑块值（区块数）

  // UI 状态
  selectedPathIndex: number | null;
  activeResultTab: ResultTab;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
}

// ===== 可视化构建（build 模式）：Zustand store 在 PlaygroundState 之上另含
// strategyTree、builderSyncState、selectedBuilderNodeId、operatorSwitchNodeId、lastBuilderPolicySnapshot、builderDepthWarning。
// operatorSwitchNodeId：当前在画布右上角展示「切换操作符」浮层所对应的 Group 节点 id；与 selectedBuilderNodeId 互斥。
// StrategyNode、BuilderSyncState 等见 src/lib/builder/types.ts
// 相关 actions：setOperatorSwitchNodeId、switchNodeOperator、wrapNode、clearDepthWarning =====

type ResultTab = 'policy' | 'miniscript' | 'script' | 'descriptor' | 'address' | 'paths' | 'warnings';

interface FriendlyError {
  raw: string;
  category: FriendlyErrorCategory; // engine_init | syntax | unknown_fragment | duplicate_key | semantic | timelock | security | limit | miniscript | unknown
  friendly: {
    zh: string;
    en: string;
  };
  hints?: { zh: string[]; en: string[] };
  /** 重复出现的 pk(占位名) 列表；由 policy-preflight 等在升级错误时设置 */
  duplicateNames?: string[];
  /** 多段 UTF-16 半开区间 [from, to)，相对应当前 Policy 字符串；优先于 highlight */
  highlights?: { from: number; to: number }[];
  /** 第一段区间；与 highlights[0] 对齐，便于旧代码兼容 */
  highlight?: { from: number; to: number };
  line?: number;
  column?: number;
}
```

（`FriendlyErrorCategory` 的完整枚举与实现以 [`src/lib/engine/types.ts`](/src/lib/engine/types.ts) 为准。）

---

## 6. 引擎集成规格

### 6.1 编译管线

使用 `@bitcoinerlab/miniscript` 和 `@bitcoinerlab/miniscript-policies`。

```
用户输入 Policy
    │
    ▼
compilePolicy(policy)           ← @bitcoinerlab/miniscript-policies
    │ 返回: { miniscript }
    ▼
compileMiniscript(miniscript)   ← @bitcoinerlab/miniscript
    │ 返回: { asm }
    ▼
satisfier(miniscript, opts)     ← @bitcoinerlab/miniscript
    │ 返回: { nonMalleableSats, malleableSats }
    ▼
构建 descriptor + address       ← @bitcoinerlab/descriptors
    │ 拼接 "wsh(<miniscript>)" 字符串
    │ 调用 Descriptor.import() 解析
    │ 调用 .getAddress(network) 生成地址
    ▼
输出 CompilationResult + SpendingPath[]
```

编译失败时：`compiler.ts` 调用 `policy-errors.ts` 的 `mapError(raw)` 得到 `FriendlyError`；再调用 `policy-preflight.ts` 的 `upgradeErrorWithPreflight(policy, err)`（在库仅返回笼统错误时，用轻量扫描将「同一 `pk(占位名)` 多次出现」升级为 `duplicate_key` 并保持 `raw` 不变）；最后调用 `policy-error-highlight.ts` 的 `attachErrorHighlight(policy, err)` 按需写入 `highlights` / `highlight`（启发式区间，见各模块注释）。

**Descriptor 与地址生成：** 具体 API 调用以 **`src/lib/engine/compiler.ts`** 为准（`DescriptorsFactory`、`Output`、网络、`wsh(...)` 拼接、scriptPubKey hex）；概念上与「解析 descriptor → 地址」一致。不在此粘贴易过期的 import 示例。

**关键实现细节：**

1. `compilePolicy` 前需要将 key 变量名替换为实际公钥
2. MVP 仅处理 P2WSH 上下文，descriptor 格式固定为 `wsh(<miniscript>)`。Taproot 相关逻辑不在 MVP 实现
3. 使用 `knowns`/`unknowns` 参数驱动条件开关功能
4. 使用 `@bitcoinerlab/descriptors` 构建 descriptor 字符串，再调用其 `.getAddress(network)` 方法生成地址。该库内部依赖 `bitcoinjs-lib`，需一并安装
5. **构建与 Descriptor 入口（实现约定）**：本站不接硬件钱包，但 `@bitcoinerlab/descriptors` 主入口会顺带拉入 Ledger / PSBT 签名相关模块。当前实现从 `@bitcoinerlab/descriptors/dist/descriptors` 导入 `DescriptorsFactory`，在 `compiler.ts` 中用 `DescriptorsFactory(ecc)` 得到 `Output`，以 `new Output({ descriptor, network })` 解析并生成地址（与上文「解析 descriptor → 地址」语义一致，API 名称以代码为准）。Next.js 的 `webpack.resolve.alias` 将 `@ledgerhq/ledger-bitcoin` 指向仓库内 `src/lib/shims/ledger-bitcoin-stub.js`，**不**安装、**不**打入真实 `@ledgerhq/ledger-bitcoin`；Vitest 配置中同步该别名。若未来需要 Ledger，应移除别名并恢复对真实 peer 依赖的安装。
6. 编译过程应在 Web Worker 中执行以避免阻塞 UI（可选优化）

### 6.2 路径分析器

从 `satisfier()` 输出解析出结构化的 `SpendingPath[]`。入口与类型见 **`src/lib/engine/path-analyzer.ts`**（`analyzeSpendingPaths`）。

**解析逻辑（要点）：**

1. 遍历每个 satisfaction 的 `asm` 字符串
2. **构建公钥反向映射表**：satisfier 输出的 asm 中，key 变量名已被替换为实际公钥（例如 `<sig(02abc...)>`）。路径分析器必须先从 `keyVariables` 构建一个 pubkey → name 反向映射表（`Record<string, string>`），将公钥还原为用户定义的变量名（如 `Alice`）。
3. 用正则提取并还原：
  - `<sig(02abc...)>` → 通过 `pubkeyToName` 还原为 `<sig(Alice)>` → 签名条件
  - `<preimage(hash)>` → 哈希条件
  - `<key>` 和其他占位符
4. 从 `nSequence` 字段提取相对时间锁：
  - `nSequence & 0x00400000` ? 时间模式 (× 512秒) : 区块模式
  - 取低 16 位为值
5. 从 `nLockTime` 字段提取绝对时间锁：
  - `< 500000000` → 区块高度
  - `≥ 500000000` → Unix 时间戳
6. 判断可满足性：
  - 所有签名条件的 key 都在 `availableKeys` 中
  - 所有哈希条件的 hash 都在 `availableHashes` 中
  - 时间锁值 ≤ `currentTimeBlocks`
7. 计算缺失条件（`missingConditions`）
8. **排序**：最终返回的 `SpendingPath[]` 按 `witnessSize` 升序排列（最便宜的路径排在最前面）

### 6.3 Miniscript 简化解析器

将 Miniscript 字符串解析为 `MiniscriptNode` 语义树，用于路径图可视化。解析时使用 `CompilationResult.miniscript`（含角色名），以便路径图节点显示 "Alice" 等可读名称；右栏 Miniscript Tab 则展示 `miniscriptWithKeys`（含真实公钥）供用户复制。

**这不是一个完整的 Miniscript 验证器**，只是用于可视化的简化解析器。编译和验证由 `@bitcoinerlab/miniscript` 负责。

**解析规则：**

1. 先剥离所有 wrapper 前缀（`a:`, `s:`, `c:`, `d:`, `v:`, `j:`, `n:`, `l:`, `u:`, `t:`）
2. 识别 fragment 名称和参数：
  - `pk(name)` / `pk_k(name)` / `pk_h(name)` → `{ type: 'key', name }`
  - `older(n)` → `{ type: 'older', blocks: n, humanReadable: blocksToHuman(n) }`
  - `after(n)` → `{ type: 'after', value: n, humanReadable: afterToHuman(n) }`
  - `sha256(h)` / `hash256(h)` / `ripemd160(h)` / `hash160(h)` → `{ type: 'hash', ... }`
  - `and_v(X,Y)` / `and_b(X,Y)` / `and_n(X,Y)` → `{ type: 'and', children: [X, Y] }`
  - `or_b(X,Z)` / `or_c(X,Z)` / `or_d(X,Z)` / `or_i(X,Z)` → `{ type: 'or', children: [X, Z] }`
  - `andor(X,Y,Z)` → `{ type: 'or', children: [{ type: 'and', children: [X, Y] }, Z] }`
  - `thresh(k,X1,...,Xn)` → `{ type: 'threshold', k, n, children: [...] }`
  - `multi(k,key1,...,keyn)` → `{ type: 'multi', k, keys: [...] }`
  - `multi_a(k,key1,...,keyn)` → 同上（Tapscript 版）
  - `0` → `{ type: 'just_0' }`
  - `1` → `{ type: 'just_1' }`
3. 递归解析：使用括号匹配分割参数（`splitArgs` 等逻辑见源码）。

**实现位置（以源码为准，避免与本文档双处漂移）：** [`src/lib/engine/miniscript-parser.ts`](src/lib/engine/miniscript-parser.ts) — 入口 `parseMiniscript`；含 wrapper 剥离、`fragment(args)` 解析、各 Miniscript fragment 到 `MiniscriptNode` 的映射。

### 6.4 时间工具函数

人类可读时间、`older`/`after` 与滑块相关的辅助函数见 **`src/lib/engine/time-utils.ts`**（及路径分析器中的调用处）。不在此重复粘贴实现代码。

### 6.5 CodeMirror 语法高亮规格

**MVP 实现方式**：`StreamLanguage.define()` + 正则 tokenizer（[`src/lib/editor/policy-language.ts`](src/lib/editor/policy-language.ts)），含可选错误区间装饰 `buildErrorHighlightExtensions`。V2 可升级为 Lezer（见 §11）。

**Token 颜色映射（在 CodeMirror theme 中配置）：**

| Token 类型       | 匹配规则                                                                                              | 颜色                         |
| -------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| keyword        | `pk`, `pkh`, `and`, `or`, `thresh`, `older`, `after`, `sha256`, `hash256`, `ripemd160`, `hash160` | `--orange-400`             |
| variableName   | `pk(...)` 括号内的标识符                                                                                 | `--semantic-key` 暖金        |
| number         | `older(数字)`, `after(数字)`, `thresh(数字,...)`                                                        | `--orange-300`             |
| meta           | `99@`                                                                                             | `--text-muted` 斜体          |
| string         | 64 或 40 字符的十六进制串                                                                                  | `--semantic-hashlock` 柔紫   |
| punctuation    | `(`, `)`, `,`                                                                                     | `--text-secondary`         |
| comment        | `//` 到行尾                                                                                          | `--text-muted` 斜体          |
| invalid        | 无法识别的 token                                                                                       | `--semantic-warning` 红色下划线 |


### 6.6 友好错误信息映射


| 错误模式                             | 中文友好信息                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------- |
| "Unknown fragment" 或 parse error | 策略语法错误：无法识别 '{name}'。可用的函数有：pk()、older()、after()、sha256()、and()、or()、thresh() |
| 括号不匹配                            | 括号不匹配，请检查是否遗漏了 ')'                                                            |
| Timelock 混用                      | 时间锁冲突：同一条花费路径中不能同时使用区块高度和时间戳类型的时间锁                                            |
| 无签名路径                            | ⚠️ 安全警告：存在不需要任何签名就能花费的路径，这意味着任何人都可能花掉这笔钱                                      |
| Script 超过大小限制                    | 脚本大小超过 {context} 限制（{size} 字节 > {limit} 字节）                                   |
| thresh k > n                     | thresh 的阈值 k={k} 不能大于条件数量 n={n}                                               |
| older(0) 或 after(0)              | 时间锁的值不能为 0                                                                    |

### 6.7 错误与空状态行为

定义所有异常和边界场景下的 UI 行为，确保用户始终有清晰的视觉反馈。

**编译失败时：**

- 编辑器下方显示错误摘要（`FriendlyError`，中英随语言切换），可展开查看 `raw`、复制、查看 `hints`；若存在 `highlights`/`highlight`，在编辑器内做启发式区间标记。
- **`useCompiler` 行为（与实现对齐）**：当本次编译**没有**返回 `output.result` 时，清空 `compilationResult`、`semanticTree`、`spendingPaths`，避免路径图/右栏继续展示**过期**的成功结果。中栏与右栏进入空或错误态（见下方）；**不再**保留「上一次成功编译」的路径图与 Tab 输出。
- 路径图区域与状态横幅随空结果表现为无可用路径或引导空状态。

**空白 Playground（无 Policy 输入）：**

- 编辑器区域显示 placeholder 文本：`"输入 Policy 语言，例如: and(pk(Alice),pk(Bob))"`（`--text-muted` 色）
- 中栏路径图区域显示居中引导提示：
  ```
  ┌─────────────────────────────────────────┐
  │                                         │
  │   📝 在左侧输入 Policy 或选择一个场景     │
  │      开始探索 Bitcoin 花费路径             │
  │                                         │
  └─────────────────────────────────────────┘
  ```
  背景 `--bg-surface`，文字 `--text-secondary`，圆角 12px，虚线边框 `--bg-overlay`
- 右栏显示空状态，各 Tab 内容区域显示 "等待编译结果..."

**satisfier 返回 0 条路径：**

- 中栏路径图正常渲染语义树，但所有叶子节点显示为灰色（未满足）
- 路径卡片区域显示提示："此 Policy 无可用花费路径。所有路径当前条件下不可满足。"
- 状态横幅显示红色："❌ 当前条件下无法花费"

**首次进入 Playground（无场景参数 ?scenario=…）：**

- 加载空白 Playground（同上述"空白 Playground"状态）
- 左栏场景选择区域高亮显示，带脉冲动画引导用户选择场景或手动输入


---

## 7. 场景数据

### 7.1 六个 MVP 场景

**场景 1: 个人单签**

```typescript
{
  id: 'single-key',
  icon: 'Key',
  title: { zh: '个人单签', en: 'Single Key' },
  description: {
    zh: '只有你一个人可以花这笔钱。最简单的情况。',
    en: 'Only you can spend. The simplest case.'
  },
  explanation: {
    zh: '这是最基础的比特币花费条件：一把私钥对应一个公钥，用这把私钥签名就能花费。优点是简单，缺点是私钥丢了就永远无法恢复。',
    en: 'The most basic Bitcoin spending condition...'
  },
  policy: 'pk(Alice)',
  keyVariables: [
    { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' }
  ],
  context: 'wsh',
}
```

**场景 2: 2-of-3 多签**

```typescript
{
  id: 'multisig-2of3',
  icon: 'Users',
  title: { zh: '2-of-3 多签', en: '2-of-3 Multisig' },
  description: {
    zh: '三把钥匙，任意两把就能花。适合团队或家庭共管。',
    en: 'Three keys, any two can spend. Great for teams or families.'
  },
  explanation: {
    zh: '经典的多签方案。三个参与者各持一把私钥，任意两人合作即可花费资金。常用于公司金库、家庭共管账户等场景。即使丢了一把钥匙，另外两把仍然可以恢复资金。',
    en: '...'
  },
  policy: 'thresh(2,pk(Alice),pk(Bob),pk(Charlie))',
  keyVariables: [
    { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
    { name: 'Bob', policyName: 'Bob', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
    { name: 'Charlie', policyName: 'Charlie', publicKey: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9' },
  ],
  context: 'wsh',
}
```

**场景 3: 2FA + 超时恢复**

```typescript
{
  id: '2fa-recovery',
  icon: 'ShieldCheck',
  title: { zh: '2FA + 超时恢复', en: '2FA with Timeout Recovery' },
  description: {
    zh: '平时双重验证花费；服务商失联 30 天后你可以自己恢复。',
    en: 'Two-factor to spend normally; self-recovery after 30 days if service goes offline.'
  },
  explanation: {
    zh: '日常花费需要你和 2FA 服务商同时签名（双保险）。但如果服务商倒闭或失联，等待 30 天（约 4,320 个区块）后，你可以独自签名恢复资金。Policy 中的 99@ 是编译器优化提示，不影响实际花费逻辑。',
    en: '...'
  },
  policy: 'and(pk(User),or(99@pk(Service),older(4320)))',
  keyVariables: [
    { name: 'User', policyName: 'User', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
    { name: 'Service', policyName: 'Service', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
  ],
  context: 'wsh',
}
```

**场景 4: 遗产继承**

```typescript
{
  id: 'inheritance',
  icon: 'Heart',
  title: { zh: '遗产继承', en: 'Inheritance Plan' },
  description: {
    zh: '平时你自己花；一年不活跃后，继承人也能花。',
    en: 'You spend normally; after 1 year of inactivity, your heir can access funds.'
  },
  explanation: {
    zh: '这是一个简单的继承方案：你随时可以用自己的私钥花费资金。但如果你有 1 年（约 52,560 个区块）没有移动这笔 UTXO，继承人就获得花费权。注意：你需要每年至少"刷新"一次（把钱转给自己的新地址），以重置计时器。',
    en: '...'
  },
  policy: 'or(99@pk(Owner),and(pk(Heir),older(52560)))',
  keyVariables: [
    { name: 'Owner', policyName: 'Owner', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
    { name: 'Heir', policyName: 'Heir', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
  ],
  context: 'wsh',
}
```

**场景 5: 退化多签金库**

```typescript
{
  id: 'degrading-multisig',
  icon: 'Vault',
  title: { zh: '退化多签金库', en: 'Degrading Multisig Vault' },
  description: {
    zh: '平时 3-of-3 全员签名；90 天后降级为 2-of-3。',
    en: '3-of-3 normally; degrades to 2-of-3 after 90 days.'
  },
  explanation: {
    zh: '这是一个巧妙的策略：正常情况下需要三个管理员全部签名（最安全）。但如果其中一人失联超过 90 天（约 12,960 个区块），剩余两人即可花费。thresh(3,...) 配合 older() 实现了"时间锁当作第四把钥匙"的效果。',
    en: '...'
  },
  policy: 'thresh(3,pk(Alice),pk(Bob),pk(Charlie),older(12960))',
  keyVariables: [
    { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
    { name: 'Bob', policyName: 'Bob', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
    { name: 'Charlie', policyName: 'Charlie', publicKey: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9' },
  ],
  context: 'wsh',
}
```

**场景 6: 保险柜 (Hot + Cold)**

```typescript
{
  id: 'vault-hot-cold',
  icon: 'Lock',
  title: { zh: '保险柜', en: 'Hot + Cold Vault' },
  description: {
    zh: '日常热钱包 + 冷钱包双签；紧急情况下恢复密钥 120 天后介入。',
    en: 'Hot + Cold dual-sign daily; recovery key kicks in after 120 days.'
  },
  explanation: {
    zh: '双层安全设计：日常使用需要热钱包和冷钱包同时签名。如果冷钱包丢失或损坏，恢复密钥在 120 天（约 17,280 个区块）后可以独立花费。99@ 表示正常双签路径更常用。',
    en: '...'
  },
  policy: 'or(99@and(pk(Hot),pk(Cold)),and(pk(Recovery),older(17280)))',
  keyVariables: [
    { name: 'Hot', policyName: 'Hot', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
    { name: 'Cold', policyName: 'Cold', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
    { name: 'Recovery', policyName: 'Recovery', publicKey: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9' },
  ],
  context: 'wsh',
}
```

### 7.2 默认测试密钥

MVP 使用固定的测试压缩公钥（取自 Bitcoin 的 Generator Point 及其衍生）：

```typescript
const DEFAULT_TEST_KEYS: Record<string, string> = {
  Alice:    '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Bob:      '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Charlie:  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
  User:     '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Service:  '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Owner:    '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Heir:     '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Hot:      '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  Cold:     '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  Recovery: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
};
```

---

## 8. 术语表与 i18n

### 8.1 核心术语表

```typescript
const GLOSSARY: Record<string, { zh: string; en: string; explain_zh: string; explain_en: string }> = {
  'pk': {
    zh: '公钥签名', en: 'Public Key',
    explain_zh: '要求指定公钥对应的私钥进行签名。这是最基本的花费条件。',
    explain_en: 'Requires a signature from the specified public key.'
  },
  'older': {
    zh: '相对时间锁', en: 'Relative Timelock',
    explain_zh: '从 UTXO 被创建开始算，必须等待指定数量的区块后才能花费。常用于恢复路径、惩罚窗口等。不是固定日期——每次你重新花费到新地址，计时器就会重置。',
    explain_en: 'Must wait a specified number of blocks after the UTXO is created before spending.'
  },
  'after': {
    zh: '绝对时间锁', en: 'Absolute Timelock',
    explain_zh: '必须等到指定的区块高度或日期之后才能花费。与 older 不同，这是一个固定的截止点，不会因为转账而重置。',
    explain_en: 'Cannot spend until a specific block height or date is reached.'
  },
  'and': {
    zh: '且（AND）', en: 'AND',
    explain_zh: '所有子条件都必须同时满足才能花费。',
    explain_en: 'All sub-conditions must be satisfied simultaneously.'
  },
  'or': {
    zh: '或（OR）', en: 'OR',
    explain_zh: '满足任意一个子条件即可花费。可以用 N@ 标注分支权重提示（仅用于编译优化，不影响花费逻辑）。',
    explain_en: 'Any one sub-condition is sufficient to spend.'
  },
  'thresh': {
    zh: '阈值条件', en: 'Threshold',
    explain_zh: 'N 个条件中需要满足 K 个。多签是最常见的例子，但条件不限于签名——时间锁也可以作为其中一个条件。',
    explain_en: 'K out of N conditions must be met.'
  },
  'sha256': {
    zh: 'SHA256 哈希锁', en: 'SHA256 Hash Lock',
    explain_zh: '需要揭示一个 32 字节的原像（preimage），其 SHA256 哈希值等于指定值。常用于原子交换和闪电网络 HTLC。',
    explain_en: 'Requires revealing a 32-byte preimage whose SHA256 hash matches.'
  },
  'descriptor': {
    zh: '输出描述符', en: 'Output Descriptor',
    explain_zh: '描述一类比特币输出的模板。包含脚本类型（如 wsh、tr）和具体的 Miniscript。可以从描述符直接推导出地址。',
    explain_en: 'A template describing a class of Bitcoin outputs.'
  },
  'satisfaction': {
    zh: '满足条件', en: 'Satisfaction',
    explain_zh: '能够解锁脚本、花费资金的一组见证数据（签名、原像、时间锁等）。一个脚本可能有多种满足方式，对应不同的花费路径。',
    explain_en: 'A set of witness data that unlocks the script.'
  },
  'witness': {
    zh: '见证数据', en: 'Witness',
    explain_zh: '花费交易中附带的数据，用于证明你有权花费这笔钱。包括签名、公钥、哈希原像等。见证数据的大小直接影响交易手续费。',
    explain_en: 'Data attached to a spending transaction proving authorization.'
  },
  'non-malleable': {
    zh: '不可延展', en: 'Non-malleable',
    explain_zh: '见证数据无法被第三方修改为另一种有效形式。使用不可延展的满足方式可以防止攻击者篡改你的交易大小和费率。',
    explain_en: 'The witness cannot be modified into another valid form by a third party.'
  },
  'miniscript': {
    zh: 'Miniscript', en: 'Miniscript',
    explain_zh: '一种结构化的比特币脚本子集表示法。它让复杂的花费条件变得可分析、可组合、可预测。Policy 编译后得到 Miniscript，Miniscript 再编码为真正的 Bitcoin Script。',
    explain_en: 'A structured representation of a subset of Bitcoin Script.'
  },
  'policy': {
    zh: '策略语言', en: 'Policy Language',
    explain_zh: '一种高层级、人类可读的语言，用于描述花费条件。比 Miniscript 更简洁易懂，编译器会自动将其优化为最经济的 Miniscript。',
    explain_en: 'A high-level, human-readable language for describing spending conditions.'
  },
};
```

### 8.2 UI 文本 i18n

使用简单的 React Context + JSON 文件方案（不用 next-intl，降低复杂度）：

```typescript
// src/i18n/zh.json (部分示例)
{
  "nav.scenarios": "场景",
  "nav.playground": "Playground",
  "nav.compare": "对比",
  "header.language": "中/EN",
  "header.theme.light": "亮色",
  "header.theme.dark": "暗色",
  "scenarios.title": "₿ Miniscript Lab",
  "scenarios.subtitle": "把 Bitcoin 的花费条件讲清楚",
  "scenarios.openBlank": "打开空白 Playground →",
  "playground.editor.title": "Policy 编辑器",
  "playground.editor.placeholder": "在这里输入策略，例如：pk(Alice)",
  "playground.editor.compile": "编译",
  "playground.editor.format": "格式化",
  "playground.editor.clear": "清空",
  "playground.editor.copy": "复制",
  "playground.editor.share": "分享",
  "playground.keys.title": "🔑 角色变量",
  "playground.keys.add": "添加",
  "playground.keys.random": "🎲 随机",
  "playground.keys.restore": "恢复默认",
  "playground.context.title": "地址类型",
  "playground.context.wsh": "SegWit v0 (P2WSH)",
  "playground.context.tr": "Taproot",
  "playground.pathmap.title": "花费路径地图",
  "playground.conditions.title": "条件模拟",
  "playground.timeslider.label": "时间流逝",
  "playground.timeslider.blocks": "区块",
  "playground.timeslider.current": "当前: 第 {blocks} 区块 ≈ {human}",
  "playground.status.canSpend": "✅ 可花费: {path}",
  "playground.status.waiting": "⏳ 还需等待 {time}，{path}才可用",
  "playground.status.cannotSpend": "❌ 当前条件下无法花费，还缺 {missing}",
  "playground.results.policy": "Policy",
  "playground.results.miniscript": "Miniscript",
  "playground.results.script": "Script",
  "playground.results.descriptor": "Descriptor",
  "playground.results.address": "Address",
  "playground.results.paths": "花费路径",
  "playground.results.warnings": "警告",
  "playground.results.explain": "这是什么？",
  "playground.stack.title": "▲ 栈机模拟器",
  "playground.stack.comingSoon": "Coming Soon"
}
```

---

## 9. 技术栈与项目结构

### 9.1 技术栈


| 类别         | 选型                                | 版本                   | 说明                                                          |
| ---------- | --------------------------------- | -------------------- | ----------------------------------------------------------- |
| 框架         | Next.js (App Router)              | latest               | SSR + SEO + 分享预览                                            |
| 语言         | TypeScript                        | strict mode          | 全项目强类型                                                      |
| 样式         | Tailwind CSS                      | v3.x（见 `package.json`） | 工具类优先                                                       |
| UI 组件      | shadcn/ui                         | latest               | 按需引入，不是完整库                                                  |
| 编辑器        | CodeMirror 6                      | latest               | @codemirror/state + @codemirror/view + @codemirror/language |
| 路径图        | @xyflow/react (React Flow v12)    | latest               | 节点/边交互                                                      |
| 图布局        | dagre + 自实现递归 TB             | latest / 内置        | **scenario** 路径图：`src/lib/flow/tree-to-flow.ts` 用 Dagre TB；**build** 策略树：`src/lib/builder/tree-to-flow.ts` 用递归 TB（父相对子行居中；`all`/`any` 未满员时有虚拟「+」；门限且已有子 placeholder 时不重复虚拟「+」；`addChildSlotKind` + 可选 `labels`） |
| 动画         | framer-motion                     | latest               | 状态过渡动画                                                      |
| 状态管理       | zustand                           | latest               | 轻量 store                                                    |
| 图标         | lucide-react                      | latest               | 统一图标库                                                       |
| Miniscript | @bitcoinerlab/miniscript          | latest               | 编译 + satisfier                                              |
| Policy 编译  | @bitcoinerlab/miniscript-policies | latest               | Policy → Miniscript                                         |
| Descriptor | @bitcoinerlab/descriptors         | latest               | descriptor 解析 + 地址生成（`dist/descriptors` 入口与 Ledger stub，见 6.1 关键实现细节第 5 条） |
| 比特币基础库    | bitcoinjs-lib                     | latest               | @bitcoinerlab/descriptors 的底层依赖，提供网络定义和脚本编码              |
| 字体         | Plus Jakarta Sans + IBM Plex Mono | via next/font/google |                                                             |


**不使用的：**

- next-intl（太重，自建简单 i18n）
- Redux（太重，用 zustand）
- D3.js（用 React Flow 代替）
- Styled Components / CSS Modules（用 Tailwind）

### 9.2 项目结构

```
miniscript-lab/
├── public/                                  # 可选静态资源（仓库中可为空）
├── src/
│   ├── app/
│   │   ├── layout.tsx                       # 根布局（字体、Providers、Header）
│   │   ├── page.tsx                         # 首页：场景画廊
│   │   ├── globals.css                      # Tailwind 入口 + CSS 变量
│   │   ├── opengraph-image.tsx              # 动态 OG 图（`/opengraph-image`）
│   │   ├── compare/
│   │   │   └── page.tsx                     # 对比页占位
│   │   └── playground/
│   │       └── page.tsx                     # Playground 页
│   │
│   ├── components/
│   │   ├── providers.tsx                    # ThemeProvider + I18nProvider
│   │   ├── ui/                              # shadcn/ui（按需生成；当前仓库以 `button` 等为主）
│   │   │   └── button.tsx
│   │   │
│   │   ├── layout/
│   │   │   └── Header.tsx                   # 顶部导航
│   │   │
│   │   ├── scenarios/
│   │   │   ├── ScenarioGallery.tsx          # 场景卡片网格
│   │   │   └── ScenarioCard.tsx             # 单个场景卡片
│   │   │
│   │   ├── playground/                      # 三栏工作台：左/中/右与 Policy 编辑等
│   │   │   ├── ThreeColumnLayout.tsx
│   │   │   ├── LeftPanel.tsx                # 含「自己动手」入口
│   │   │   ├── CenterPanel.tsx              # scenario=PathMap / build=BuilderCanvas
│   │   │   ├── RightPanel.tsx
│   │   │   ├── PolicyEditor.tsx
│   │   │   ├── KeyVariableManager.tsx
│   │   │   ├── ContextSelector.tsx
│   │   │   ├── ConditionToggles.tsx
│   │   │   ├── TimeSlider.tsx
│   │   │   └── StatusBanner.tsx
│   │   │
│   │   ├── flow/                            # Scenario 模式：花费路径图
│   │   │   ├── PathMap.tsx
│   │   │   ├── FlowNodes.tsx / PathEdge.tsx / NodeInternalsSync.tsx
│   │   │   └── （布局：Dagre TB）lib/flow/tree-to-flow.ts
│   │   │
│   │   ├── builder/                         # Build 模式：可视化策略树画布
│   │   │   ├── BuilderCanvas.tsx
│   │   │   ├── BuilderNodes.tsx / BuilderEdge.tsx
│   │   │   ├── BuilderPopover.tsx / AddChildOptions.tsx / OperatorSwitchPopover.tsx / BuilderSyncBanner.tsx
│   │   │   └── （布局：递归 TB，父相对子行居中）lib/builder/tree-to-flow.ts
│   │   │
│   │   ├── results/                         # 右栏技术 Tab 内容（由 RightPanel 组合）
│   │   │   └── PolicyTab.tsx, MiniscriptTab.tsx, ScriptTab.tsx, DescriptorTab.tsx,
│   │   │       AddressTab.tsx, PathsTab.tsx, WarningsTab.tsx
│   │   │
│   │   └── shared/
│   │       ├── GlossaryTooltip.tsx          # 术语悬停提示
│   │       ├── CopyButton.tsx               # 复制到剪贴板
│   │       ├── CodeBlock.tsx                # 等宽代码展示块（自动换行，优先竖向展示）
│   │       └── ConditionChip.tsx            # 条件 chip 组件
│   │
│   ├── lib/
│   │   ├── engine/
│   │   │   ├── compiler.ts                  # 编译管线 + descriptor / 地址派生（无单独 descriptor 文件）
│   │   │   ├── path-analyzer.ts             # satisfier 输出 → SpendingPath[]
│   │   │   ├── miniscript-parser.ts         # Miniscript string → MiniscriptNode tree
│   │   │   ├── time-utils.ts                # 时间锁编码/解码/人类可读转换
│   │   │   └── types.ts                     # 核心引擎类型（§5 的部分内容）
│   │   │
│   │   ├── builder/                         # 可视化构建：StrategyNode、序列化、路径高亮
│   │   │   └── types.ts, tree-to-flow.ts, serialize.ts, node-ops.ts, ...
│   │   │
│   │   ├── flow/                            # Scenario：MiniscriptNode → React Flow（与 components/flow 配合）
│   │   │   └── tree-to-flow.ts
│   │   │
│   │   ├── editor/
│   │   │   └── policy-language.ts           # CodeMirror Policy 语法高亮
│   │   │
│   │   ├── scenarios/
│   │   │   └── data.ts                      # 6 个场景的完整数据
│   │   │
│   │   ├── glossary/
│   │   │   └── data.ts                      # 术语表数据
│   │   │
│   │   ├── i18n/
│   │   │   ├── context.tsx                  # LocaleContext + useI18n
│   │   │   ├── zh.ts                        # 中文翻译
│   │   │   └── en.ts                        # 英文翻译
│   │   │
│   │   ├── utils/
│   │   │   ├── share.ts                     # URL 编码/解码分享链接（可含 playgroundMode）
│   │   │   └── storage.ts                   # 遗留会话键清理（clearSession）；不再自动读写 Playground 会话
│   │   │
│   │   ├── playground/
│   │   │   └── add-next-key-variable.ts     # 左栏「添加」与签名浮层「新建角色」共用的下一角色逻辑
│   │   │
│   │   ├── stores/
│   │   │   └── playground-store.ts          # Zustand store（§5.1 + 可视化构建状态）
│   │   │
│   │   └── hooks/
│   │       ├── useCompiler.ts               # 编译 hook（防抖 + 错误处理）
│   │       └── useBuilderSync.ts            # build 模式：Policy ↔ strategyTree 同步
│   │
│   └── test/
│       └── setup.ts                         # Vitest / Testing Library 全局设置
│
├── tailwind.config.js                       # Tailwind 配置（含 §2.2 色彩变量）
├── postcss.config.js
├── vitest.config.ts                         # Vitest
├── tsconfig.json
├── next.config.mjs
├── package.json
└── README.md
```

---

## 10. MVP 交付说明与回归要点

MVP 阶段（基础设施 → 引擎 → 首页与场景 → Playground → 路径图 → 结果面板 → 分享与 i18n → 打磨）**已交付**。历史任务拆分与分阶段记录不再单独维护在仓库文档中，以 **Git 历史**为准。

本 `SPEC.md` 为**产品与体验层唯一 SSOT**。实现落点、目录与「当前代码与规格差距」以仓库源码为准。

### 10.1 Build 模式：`all` / `any` 二元约束（不变量）

与 Policy 编译器一致，画布侧 **`all`（AND 组）/ `any`（OR 组）** 在 `strategyTree` 中**最多两个直接子节点**（子占位符占槽）；满员则**不**再渲染虚拟「+ 添加条件」，`addChildNode` 等不得追加第三子。`threshold` 组仍可多子。

- **序列化**：`serializeStrategyTree` 输出**右嵌套**二元 `and`/`or`（见 `src/lib/builder/serialize.ts`），避免多参数 `and`/`or` 与 `compilePolicy` 不兼容。
- **自编译回写**：`importFromSemanticTree` 将 N 叉语义 `and`/`or` **折叠**为右深二叉（`src/lib/builder/from-semantic-tree.ts`）。
- **操作符切换**：从 threshold 切到 `all`/`any` 且子节点多于 2 个时**裁剪为前两个子条件**（toast：`builder.op.binaryTrimNotice`）。
- **编译失败 + build**：见 `useBuilderSync` 中 `compile-error` 与根占位植入逻辑，避免画布长期停在「等待同步」。

### 10.2 发布或大改前回归（手工 + 自动化）

- **自动化**：`npm run lint`、`npm run test`。
- **Playground / scenario**：加载场景、路径图、条件开关、时间滑块、右栏 Tab 与复制、分享链接 `?s=`。
- **Build**：左栏「自己动手」、根占位选策略、AND/OR/threshold、Policy ↔ 画布同步、`text-led` / `compile-error`、路径卡片高亮画布分支。
- **i18n**：中/英切换无裸露 key。
- **持久化**：正常编辑不依赖 `localStorage` 会话恢复；状态以 `?s=` / `?scenario=` 为准。

---

## 11. V2 路线图（MVP 之后）

按优先级排列，仅供参考，不在 MVP 实施范围内：

1. **栈机模拟器** -- 底部抽屉展开，逐步执行选中路径的 Bitcoin Script
2. **对比模式** -- 并排双 Playground + 共享时间轴 + diff 视图
3. **Taproot 完整支持** -- P2TR descriptor / x-only 公钥格式 / `multi_a` / 脚本树可视化（script path tree）
4. **交互式课程** -- 渐进式教程 + 小测验 + 进度追踪
5. **移动端阅读页** -- 场景浏览 + 教程 + 分享 + 结果查看
6. **Lift / 反向分析** -- Script → Miniscript → Policy
7. **引导搭建** -- 在 `build` 模式内提供向导式分步搭建（与已上线的「可视化构建」并列）
8. **导出代码** -- 生成 bitcoinjs-lib / BDK 代码片段
9. **CodeMirror 完整 Lezer 语法** -- 替换 StreamLanguage 正则 tokenizer 为基于 @lezer/lr 的完整语法定义
10. **rust-miniscript WASM 引擎** -- 替换 JS 引擎为最权威实现

---

## 12. 避坑清单

1. **不要一上来让用户写 Miniscript** -- 默认入口是场景卡片或 Policy 编辑器
2. **不要引入任何 LLM API 依赖** -- 所有功能（编译、分析、可视化、解释文字）均为确定性实现，不调用外部 AI 服务
3. **不要默认展示太多底层细节** -- Miniscript/Script/ASM 全部在 Tab 里
4. **不要把栈机做成首页英雄位** -- 先看懂路径，再看 opcode 执行
5. **不要从零写 Bitcoin Script 执行器** -- 先由引擎算出 witness，再做教学可视化
6. **不要支持私钥 / 助记词** -- 只碰公钥、测试 key、testnet
7. **不要把"图"误当成"理解"** -- 理解来自状态变化和分支解释
8. **不要默认进入「自己动手」构建模式** -- 新手仍应以场景与 Policy 编辑为主；`build` 模式是左栏明确的进阶入口，不应作为首次加载默认态
9. **不要在任何功能中引入 AI/LLM** -- 编译/类型检查/sanity/satisfaction/解释文字全部确定性实现，无需网络请求
10. **不要生成 mainnet 地址** -- 教育工具只用 testnet/signet

