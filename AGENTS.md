# ScriptWise — 开发指南（AGENTS.md）

## 文档维护（本仓库硬约束）

每次**已落地**的代码改动（新功能、行为调整、路由/目录/状态机变更、对用户可见流程、测试布局、已知限制等），若会影响「协作者如何理解或修改本项目」，**应在同一批改动中同步更新本文**（以及 [`DESIGN.md`](DESIGN.md)，若涉及视觉或设计 token），使文档与当前实现**一致**。

- **有值得写进文档的差异就写**；若改动与文档已有描述完全无关，**不必**为改而改。  
- **最低标准**：合并后的 `AGENTS.md` 不得与本次改动在事实层面矛盾（例如改了路由却未更新 §4、改了目录却未更新 §5）。  

是否由工具「自动先读」本文件取决于 Cursor 规则、`CLAUDE.md` 等配置；**在本仓库协作时**，将上述约定视为与代码同等重要的交付项。

---

本文档是仓库内**唯一**的开发说明：合并了产品意图与实现地图。**运行时行为以代码为准**；若本文与代码不一致，以代码为准并应修正本文。**视觉与设计 token** 见 [`DESIGN.md`](DESIGN.md)。**依赖版本**以 `package.json` / `package-lock.json` 为准。

---

## Document Priority

1. **代码** — 最高优先级。
2. **本文（AGENTS.md）** — 产品与边界、路由、目录、链路、限制、改动入口。
3. **[DESIGN.md](DESIGN.md)** — 色板、字体、Scenario 节点尺寸等。

**给 AI / 贡献者**：改功能时至少对照 §4（路由）、§5（目录）、§6（链路）、§9（限制）、§10（文件入口）；改样式时对照 DESIGN + `globals.css`；提交前在本地跑 `npm run lint` 与 `npm run test`。**合并前**按上文「文档维护」检查是否需更新本文 / `DESIGN.md`。

---

## 1. 产品与边界

**定位**：场景优先、以花费路径为中心的 Bitcoin **Miniscript 教学**实验室——先让用户理解「谁能花、何时能花、需哪些条件」，再展示 Policy、Miniscript、Script、Descriptor 与 Address。

**不是**：钱包、链上工具、IDE 替代品；不连接区块链；不构造或广播交易；不处理私钥 / 助记词 / 真实签名；**不上传**用户策略到服务器。

**技术边界**：纯前端；无后端 API / 数据库；所有计算在浏览器本地完成，**不依赖 LLM 或外部服务**。地址仅用于 **testnet / signet** 教学展示，**不得**将主网地址作为默认或隐式行为。**MVP** 实际编译与地址以 **P2WSH** 为主；**P2TR** 可为占位，UI 中通常禁用（以代码为准）。

**与「不连接区块链」的区分**：应用**不会**作为钱包去查询 UTXO、广播交易或同步链状态。唯一例外是 Playground 为教学展示 **after(区块高度)** 与混合时间轴，**只读**请求公共 API 获取**当前主网链尖高度**（实现上为多个端点顺序回退；短 TTL 内存缓存；全部失败时使用 [`block-height-fallback.generated.ts`](src/lib/engine/block-height-fallback.generated.ts) 中**构建时写入**的回退高度，由 `npm run build` 的 `prebuild` 抓取主网链尖并生成该文件；抓取失败时写入脚本内固定桩值，以免阻塞构建）。这不改变「不上传策略、不托管密钥」的边界。

---

## 2. 技术栈

- 框架：Next.js 14 App Router + React 18；TypeScript strict；Zustand。  
- 可视化：React Flow（`@xyflow/react`）；**scenario** 路径图 Dagre TB（`src/lib/flow/tree-to-flow.ts`）；**build** 策略树自实现递归 TB（`src/lib/builder/tree-to-flow.ts`）。  
- 其余依赖：见 `package.json`。

---

## 3. 运行与验证

```bash
npm install
npm run dev
npm run build          # 会先运行 prebuild：生成 block-height-fallback.generated.ts
npm run lint
npm run test
```

- **`generate:block-height-fallback`**：单独抓取主网链尖并写入 `block-height-fallback.generated.ts`（与 `prebuild` 相同逻辑；可在不跑完整 `next build` 时刷新仓库内该文件）。  
- **仅使用 npm**；锁文件为 `package-lock.json`（勿提交 pnpm/yarn 锁）。  
- `npm run test` 即 `vitest run`（配置：`vitest.config.ts`；全局 setup：`src/test/setup.ts`）。  
- dev server 默认 `http://localhost:3000`（端口占用时以终端为准）。

### 测试代码布局

- 引擎 / 工具：`src/lib/engine/__tests__/`、`src/lib/builder/__tests__/`、`src/lib/hooks/__tests__/`、`src/lib/utils/__tests__/`、`src/lib/playground/__tests__/`、`src/lib/scenarios/__tests__/`、`src/lib/stores/__tests__/`
- 组件：`components/**/__tests__/`（如 `BuilderPopover`、`LeftPanel`）
- 新增逻辑应优先在对应目录旁补测试；`compiler`、`node-ops`、`useBuilderSync` 等已有覆盖可参考。

---

## 4. 路由与信息架构

### 路由速查

| 路由 | 用途 |
|------|------|
| `/` | 首页：`HomepageHero` → `TransitionSection` → `ScriptComplexitySection` → `MeetMiniscriptSection` → Applications 等 → `HomepageWallets` → 页尾 CTA → 画布 |
| `/intro` | **重定向到** `/` |
| `/playground` | 三栏；默认 **scenario** |
| `/playground?mode=build` | **build**（自己动手） |
| `/playground?scenario=<id>` | 加载预设 `id` |
| `/playground?s=<payload>` | 分享链接恢复（见 §6「分享与会话」） |
| `/resources` | 外部工具链接 + 推荐阅读区（`resources.*` i18n） |
| `/compare` | V2 占位 |
| `/opengraph-image` | 动态 OG |

顶栏：**首页**、**Playground**、**Resource 资源**（文案以 i18n 为准）。

### Playground 意图（三栏）

- **左栏**：预设（含「自己动手」→ build）、Key 变量、Context / Network。预设顺序与首页 Applications 对齐：`APPLICATION_PLAYGROUND_SCENARIO_IDS` + `sortScenariosForPlayground()`（见 §10「预设场景」）。  
- **中栏**：Policy 编辑器；**scenario** → 花费路径图，**build** → 受约束策略树画布；状态横幅；条件开关与时间滑块。  
- **右栏**：花费路径列表；技术 Tab（policy / miniscript / script / descriptor / address）— **可复制真实公钥等**；中栏/路径图可用角色名。  
- **桌面优先**：窄视口 `MobileFallback`（`PlaygroundClient`）。  
- **会话**：不自动持久化整段 Playground 状态；分享用 `?s=`。

### 双模式

- **scenario**：Policy（预设或自写）→ 编译 → 路径图与满足态。  
- **build**：受限策略树 ↔ Policy 双向同步；**非**自由拖线流程图；结构不兼容时进入 `text-led` / `compile-error` 等（`useBuilderSync.ts`）。

### 各路由实现要点

- **`/`** — `src/app/page.tsx`。顺序：`HomepageHero` → `TransitionSection` → `ScriptComplexitySection`（Bitcoin Script 复杂性的四堵墙 + 过渡尾句，作为进入 Miniscript 前的独立过渡章节） → `MeetMiniscriptSection`（两段式：`DefinitionBlock` ①Miniscript 是什么，含 Policy → Miniscript → Script 三层横向流水线 → `FeaturesBlock` ②可读性 / 可组合性 / 可迁移性 三张卡）→ `IntroApplicationsSection` → `IntroCoreConceptsSection`（`hideStack`；纵向四层堆栈含 Descriptor，与 `MeetMiniscriptSection` 的横向三层形成差异化）→ `HomepageWallets` → 底部 CTA + footer。Applications **7** 条卡片与 `playgroundScenarioId` 见 `src/components/intro/data.ts`（含 **「穿越牛熊」** `holder-timelock`）；其余未列入 Applications 的预设由 `sortScenariosForPlayground()` 排在末尾（见 `src/lib/scenarios/data.ts`）。**「原子交换」** 三列可用 `HEX` 作 hash160 占位，与 `htlc-atomic` Playground 展示一致，右栏真实输出见 §7。`requestIdleCallback` 可预热 Playground；窄屏 `home.playground.desktopHint`。历史首页区块 `IntroChallengeSection`、`IntroWhyMattersSection` 仍保留在 `components/intro/`，当前首页未挂载（见 §9）。  
- **`/intro`** — `src/app/intro/page.tsx`：`redirect('/')`。  
- **`/playground`** — `src/app/playground/page.tsx` → `PlaygroundClient.tsx`：处理 `?s=`、`?scenario=`、`?mode=build`；`clearSession()`；挂载时 `fetchBlockTipHeight`；`useCompiler` + `useBuilderSync`；渐进式加载（`dynamic` 画布、`prefetch` 等）。  
- **`/resources`** — `src/app/resources/page.tsx`：外链网格 +「推荐阅读」（数据：`src/lib/resources/recommended-reading.ts`）。  
- **`/compare`** — `src/app/compare/page.tsx`：Coming Soon。

---

## 5. 仓库结构、目录与架构概览

### 根目录（工程配置）

| 文件 / 目录 | 作用 |
|-------------|------|
| `package.json` / `package-lock.json` | 依赖与脚本（含 `prebuild` → 链尖回退生成） |
| `scripts/generate-block-height-fallback.mjs` | 构建前抓取主网高度 → `block-height-fallback.generated.ts` |
| `next.config.mjs` | Next 配置；Ledger 等别名 |
| `tailwind.config.js` / `postcss.config.js` | Tailwind / PostCSS |
| `tsconfig.json` | TypeScript；`exclude` 含 **`v0/`**（历史快照不参与主应用类型检查） |
| `vitest.config.ts` | 单元测试 |
| `components.json` | shadcn/ui 组件配置 |
| `v0/` | 旧页面快照；**勿**当主应用源码 |

### `src/app/`（App Router）

| 路径 | 说明 |
|------|------|
| `layout.tsx` | 根布局、字体、metadata |
| `globals.css` | 全局样式 |
| `page.tsx` | 首页 |
| `intro/page.tsx` | 重定向 `/` |
| `playground/page.tsx` | Playground 页壳 |
| `playground/PlaygroundClient.tsx` | Playground 客户端逻辑（URL、三栏、编译与 build 同步） |
| `resources/page.tsx` | 资源页 |
| `compare/page.tsx` | 对比占位 |
| `opengraph-image.tsx` | OG 图 |

### `src/components/`（按域划分）

| 目录 | 内容 |
|------|------|
| `layout/` | `Header` 等全站布局 |
| `providers.tsx` | `ThemeProvider`、`I18nProvider` |
| `playground/` | 三栏、`LeftPanel`、`CenterPanel`、`RightPanel`、`PolicyEditor`、条件/时间/状态 |
| `builder/` | build 画布、`BuilderCanvas`、`BuilderPopover`、`OperatorSwitchPopover`、`BuilderNodes` 等 |
| `flow/` | scenario 路径图：`PathMap`、`FlowNodes`、`PathEdge` |
| `results/` | 右栏各 Tab（Policy / Miniscript / Script / Descriptor / Address / Paths） |
| `intro/` | 首页通识区块与 `data.ts`（Applications） |
| `home/` | `HomepageHero`、`HomepageWallets` 等 |
| `scenarios/` | `ScenarioCard`、`ScenarioGallery`（未挂载路由时可仍存在） |
| `shared/` | `ExplainPopover`、`GlossaryTooltip`、`CodeBlock` 等 |
| `ui/` | shadcn 基础组件（`button` 等） |

### `src/lib/`（业务与基础设施）

| 目录 | 内容 |
|------|------|
| `stores/` | `playground-store.ts` — Playground 唯一状态源 |
| `hooks/` | `useCompiler.ts`、`useBuilderSync.ts` |
| `engine/` | `compiler.ts`、`miniscript-parser.ts`、`path-analyzer.ts`、`block-height.ts`（链尖缓存与 `fetchBlockTipHeight`）、`block-height-fallback.generated.ts`（**构建生成**，勿手改）、policy 错误与预检、`*__tests__/` |
| `builder/` | 策略树模型、`serialize`、`node-ops`、`from-semantic-tree`、`status`、`tree-to-flow`、`__tests__/` |
| `flow/` | scenario：`tree-to-flow.ts`（Dagre） |
| `editor/` | `policy-language.ts`（CodeMirror 高亮等） |
| `i18n/` | `context.tsx`、`zh.ts`、`en.ts` |
| `scenarios/` | 预设数据、`playground-order.ts`、`tags.ts` |
| `playground/` | `htlc-display-mask.ts`、`add-next-key-variable.ts`、`apply-playground-search-params.ts`（`?s=` / `scenario` / `mode` 与 store 同步） |
| `glossary/` | 术语数据 |
| `resources/` | `recommended-reading.ts` |
| `theme/` | 主题 Context |
| `utils/` | `share.ts`、`storage.ts`、`cn.ts` 等 |
| `shims/` | `ledger-bitcoin-stub.js` |

### 数据流（概念）

```text
用户编辑 Policy / 操作画布
    → playground-store（Zustand）
    → Playground 挂载：fetchBlockTipHeight → blockTipHeight / blockTipHeightReady
    → useCompiler（debounce）→ compiler → miniscript、descriptor、地址、spendingPaths
    → scenario：miniscript-parser → tree-to-flow → PathMap（链尖就绪后传入 blockTipHeight 用于区块高度型 after）
    → build：strategyTree ↔ useBuilderSync ↔ Policy 文本
    → 右栏 Tabs / StatusBanner / ConditionToggles / TimeSlider
```

### 与外部库的分界

- Miniscript / Policy：`@bitcoinerlab/miniscript-policies`、`@bitcoinerlab/miniscript`  
- Descriptor：`@bitcoinerlab/descriptors/dist/descriptors`（细入口，避免拉 Ledger）  
- 比特币工具：`bitcoinjs-lib` 等（见 `package.json`）

---

## 6. 核心运行链路

### 应用装配

- `layout.tsx`、`providers.tsx`、`Header.tsx`（首页 / Playground / Resources）。

### Playground 状态

- 单一事实源：`src/lib/stores/playground-store.ts`（`playgroundMode`、`policy`、`strategyTree`、`builderSyncState`、编译结果、模拟条件、`blockTipHeight` / `blockTipHeightReady`、UI 等）。

### 自动编译

- `useCompiler.ts`：500ms debounce；Policy 空或编译失败时清空派生结果。

### 编译管线

- `compiler.ts`：`compilePolicy` → 替换 key → `compileMiniscript` → `wsh(...)` descriptor → 地址 / scriptPubKey → `satisfier` → `analyzeSpendingPaths`。若 **`context === 'tr'`**，在编译 Policy 之前即返回 **`limit` 类友好错误**（不产出地址），与左栏 P2TR 占位一致，避免误以为已生成 Taproot 输出。  
- 错误链：`policy-errors` → `policy-preflight` → `policy-error-highlight`（编辑器标红区间）。  
- **Descriptor**：从 `@bitcoinerlab/descriptors/dist/descriptors` 导入；`@ledgerhq/ledger-bitcoin` → `ledger-bitcoin-stub`（`next.config` / `vitest.config`）。

### 语义树与路径图（scenario）

- `miniscript-parser.ts` → `tree-to-flow.ts`（Dagre）；`multi(k,…)` 在图上展开为 k-of-n 与各 key 叶子：**嵌套** multi 为 operator 框 + 父→k-of-n 合成边；**根级** multi 为 **单层** root 型 k-of-n 框直连各 key（避免多余顶层节点）。共源多边叠画时边带 `zIndex`，使已满足边在上层，减轻灰线盖住绿线（`PathEdge`）。  
- **区块高度型 `after()`**：条件满足态依赖当前链尖（`blockTipHeight`）；在链尖首次拉取完成前不向 `tree-to-flow` 传入高度，避免占位高度误判。  
- 组件：`PathMap`、`FlowNodes`、`PathEdge` 等。

### 可视化构建（build）

核心模块：`src/lib/builder/`（`types`、`serialize`、`node-ops`、`from-semantic-tree`、`status.ts`、`tree-to-flow.ts`）、`src/components/builder/*`、`useBuilderSync.ts`。要点：二元 `all`/`any`、门限与 `clampThresholdK`、虚拟「+」与子占位、`OperatorSwitchPopover` / `BuilderPopover`、包裹进组、深度 ≤5 提示。细节以源码为准。

### 花费路径

- `path-analyzer.ts` → `Paths`、`StatusBanner`。同一 **公钥** 在 `keyVariables` 中重复出现时，路径标签取 **首次出现** 的变量名。路径卡片标题由 `path-analyzer` 产出 `labelVariant`，UI 经 `path-label.ts` 的 `formatSpendingPathLabel` 按当前语言拼接（不再在引擎内写死中文串）。

### 分享与会话

- 不自动持久化 Playground；`share.ts` 将状态编码为 `?s=`（Base64 JSON），并对 `network` / `context` / `keyVariables` 形状做校验；`storage.ts` 的 legacy `loadSession` 使用相同规则。  
- `PlaygroundClient`：`searchParams` **每次变化**（含客户端路由）时按 **`applyPlaygroundSearchParams`** 应用：**`s` 解码成功** → `restoreSession`；**否则** 若有 `scenario` → `loadScenario`；**否则** 若 `mode=build` → `enterBuildMode`。无上述参数时不 `reset()`，避免误清编辑中状态。挂载时仍 `clearSession()` 并拉取链尖。  
- 分享链接过长时 `PolicyEditor` 会提示（阈值见 `share.ts`）；超大策略不宜仅依赖 URL 分享。

---

## 7. 关键 UI 结构

左栏 `LeftPanel`（240px）、中栏 `CenterPanel`、右栏 `RightPanel`（320px）。`PolicyEditor`（含 `htlc-atomic` 的 `hash160(HEX)` 展示与 `onDocChangeRef`、分享链接过长提示）、`ConditionToggles`、`TimeSlider`（顶行仅展示主网链尖高度；分段线性锚点；`older()` 与区块高度型 `after()` 统一为相对区块语义后混排；模拟流逝在滑块上方单行显示，水平位置随拇指并限制在轨道内避免裁切）、`StatusBanner`；右栏 Tab 与 `htlc` 真实摘要规则见上文与 `htlc-display-mask.ts`。

---

## 8. i18n、主题、样式

- i18n：`zh.ts` / `en.ts`，`t()` dot-path。  
- 主题：`ThemeProvider`。  
- Token：[DESIGN.md](DESIGN.md)；`globals.css`、`tailwind.config.js`。

---

## 9. 限制与易误判点

1. 仅 **wsh** 有实际编译产出；左栏 **tr** 为占位（禁用）。若 `context === 'tr'`，编译器返回明确错误（见 §6 编译管线）。  
2. **时间模拟**：`older()` 与区块高度型 **`after()`** 可与链尖结合，在时间轴上混合排序；**Unix 时间戳型 `after()`** 等路径仍可能简化或未完全模拟（以代码为准）。  
3. **signet** 地址派生可能复用 testnet 网络对象（教学折中）。  
4. **/compare** 未实现；导航指向 **Resources**。  
5. 多数页面为 **'use client'**。  
6. **移动端**无完整 Playground（桌面优先）。  
7. 无 **regtest**。  
8. 路径图**根节点**即顶层逻辑（都需要 / **二选一** / k-of-n），单叶子可无根节点。  
9. **build** 为 MVP：受约束树 + 同步；非任意拖线。  
10. **渐进式加载**、首页 **单一橙色 CTA** → `?mode=build`。  
11. **htlc-atomic**：`HEX` 展示 vs 右栏真实 hex；见 §7 与 `htlc-display-mask.ts`。  
12. **`IntroChallengeSection` / `IntroWhyMattersSection`**：源码仍在 `components/intro/`，**未**挂载于当前首页；若复用需自行挂到路由。

---

## 10. 常见改动入口

| 目标 | 入口 |
|------|------|
| 预设场景 | `src/lib/scenarios/data.ts`、`playground-order.ts`、`intro/data.ts`、tags / `ScenarioCard` |
| Policy 语法 / 编译 | `policy-language.ts`、`compiler.ts`、`miniscript-parser.ts`、`glossary/data.ts`、`*__tests__/*` |
| 路径判定 / 模拟 | `path-analyzer.ts`、`time-utils.ts`、`block-height.ts`、`block-height-fallback.generated.ts`（`prebuild`）、`StatusBanner`、`ConditionToggles`、`TimeSlider`、`PathsTab` |
| scenario 路径图 | `tree-to-flow.ts`、`PathMap`（传入 `blockTipHeight`）、`FlowNodes`、`PathEdge` |
| build 画布 | `src/lib/builder/*`、`BuilderCanvas`、`useBuilderSync.ts`、`playground-store.ts` |
| Policy 编辑器 | `PolicyEditor.tsx`、`htlc-display-mask.ts`、`policy-errors` 等 |
| 右栏结果 | `RightPanel.tsx`、`components/results/*` |
| 资源页 | `src/app/resources/page.tsx`、`recommended-reading.ts`、`resources.*` |
| 首页 / Intro | `src/app/page.tsx`、`src/components/home/*`（Hero / Transition / ScriptComplexity / MeetMiniscript / Wallets 等）、`src/components/intro/*` |
| 设计 token | [DESIGN.md](DESIGN.md) |
