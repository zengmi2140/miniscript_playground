# ARCHITECTURE.md

> 本文档描述**技术架构、目录结构、核心链路与改动入口**。运行时行为以代码为准；若本文与代码不一致，以代码为准并应修正本文。
> 产品意图与边界见 [PRODUCT.md](PRODUCT.md)；视觉与设计 token 见 [`DESIGN.md`](DESIGN.md)；依赖版本以 `package.json` / `package-lock.json` 为准。

## 技术栈

- 框架：Next.js App Router + React；TypeScript strict。版本号以 `package.json` 为准。
- 状态：Zustand（`src/lib/stores/playground-store.ts` 为 Playground 唯一事实源）。
- 可视化：React Flow（`@xyflow/react`）。
  - **scenario** 路径图：Dagre TB 布局（`src/lib/flow/tree-to-flow.ts`）。
  - **build** 策略树：自实现递归 TB 布局（`src/lib/builder/tree-to-flow.ts`）。
- 编辑器：CodeMirror（`@codemirror/*`，高亮见 `src/lib/editor/policy-language.ts`）。
- UI：shadcn/ui（`src/components/ui/*`）+ Tailwind + Radix primitives；动效用 framer-motion。
- 其余依赖以 `package.json` 为准。

## Quick Reference: 改动入口速查

> 做小改动时可直接查下表定位，无需通读全文。

| 目标 | 入口 |
|------|------|
| 预设场景 | [RUNBOOKS.md「新增预设场景」](RUNBOOKS.md#新增预设场景)；入口为 `scenarios/data.ts`，首页联动、图标与 tags 按条件修改 |
| Policy 语法 / 编译 | [RUNBOOKS「修改编译或时间锁语义」](RUNBOOKS.md#修改编译或时间锁语义)；`policy-language.ts`、`compiler.ts`、`miniscript-parser.ts`、`glossary/data.ts` |
| 路径判定 / 模拟 | [RUNBOOKS「修改编译或时间锁语义」](RUNBOOKS.md#修改编译或时间锁语义)；`path-analyzer.ts`、`time-utils.ts`、`block-height.ts`、`StatusBanner`、`TimeSlider` |
| Key 名替换 / 重命名 | `utils/policy-identifiers.ts`、`compiler.ts`（`replaceKeyNames`）、`playground-store.ts`（`renameKeyVariable`）、`KeyVariableManager.tsx`、`share.ts` |
| scenario 路径图 | `flow/tree-to-flow.ts`、`PathMap`、`FlowNodes`、`PathEdge` |
| build 画布 | `lib/builder/*`（含 `threshold.ts`）、`BuilderCanvas`、`useBuilderSync.ts`、`playground-store.ts` |
| Policy 编辑器 | `PolicyEditor.tsx`、`htlc-display-mask.ts`、`policy-errors` |
| 右栏结果 | `RightPanel.tsx`、`components/results/*` |
| SSR 语言 / 主题首帧 | `preferences.ts`、`app/layout.tsx`、`providers.tsx`、`i18n/context.tsx`、`theme/context.tsx` |
| Playground 首屏与桌面 bootstrap | `PlaygroundClient.tsx`、`useDesktopBootstrap.ts`、`apply-playground-search-params.ts` |
| 分享 payload / URL 恢复 | [RUNBOOKS「修改分享 Payload」](RUNBOOKS.md#修改分享-payload)；`share.ts`、`storage.ts`、`apply-playground-search-params.ts`、`playground-store.ts` |
| 路由 / SSR 首帧 | [RUNBOOKS「新增路由或修改 SSR 首帧」](RUNBOOKS.md#新增路由或修改-ssr-首帧)；`app/layout.tsx`、`preferences.ts`、Providers |
| 资源页 | `resources/page.tsx`、`recommended-reading.ts`、`resources.*` |
| 首页 | `app/page.tsx`、`components/home/*`、`components/intro/*` |
| 设计 token | [RUNBOOKS「新增或修改设计 Token」](RUNBOOKS.md#新增或修改设计-token)；`DESIGN.md`、`globals.css`、`tailwind.config.js` |

## 项目性质

纯前端、本地优先应用：无业务后端 API / 数据库，所有计算在浏览器本地完成。自动网络行为限于**只读**拉取主网链尖高度（见下文「链尖高度」）和加载公共静态展示资源；不上传策略、密钥、会话数据或遥测信息。

## 运行与验证

```bash
nvm use                # 读取 .nvmrc，统一使用 Node 22
npm ci
npm run dev            # 默认 http://localhost:3000
npm run build          # 会先运行 prebuild：生成 block-height-fallback.generated.ts
npm run build:check    # 直接 next build，不刷新或改写链尖回退文件
npm run lint
npm run typecheck
npm run test           # vitest run
npm run test:coverage  # 正式测试门禁；engine / builder / playground 各 70%
npm run generate:block-height-fallback   # 单独刷新链尖回退文件
```

- **Node 22 是唯一受支持的开发 / CI 主版本**，以 `.nvmrc` 为单一事实源；`package.json` 的 engines 为 `>=22 <23`。
- **仅使用 npm**；锁文件为 `package-lock.json`（勿提交 pnpm / yarn 锁）。
- 测试配置：`vitest.config.ts`；全局 setup：`src/test/setup.ts`。
- `build` 用于正式构建 / 部署，会先联网刷新链尖回退高度；`build:check` 用于 CI 和代码验收，只验证生产构建，不运行 `prebuild`。

## 仓库结构

### 根目录（工程配置）

| 文件 / 目录 | 作用 |
|-------------|------|
| `package.json` / `package-lock.json` | 依赖与脚本（含 `prebuild` → 链尖回退生成） |
| `.nvmrc` | Node 22 版本单一事实源；CI、Vercel 与本地 `nvm use` 共用 |
| `scripts/generate-block-height-fallback.mjs` | 构建前抓取主网高度 → `block-height-fallback.generated.ts` |
| `next.config.mjs` | Next 配置；Ledger 等别名 |
| `tailwind.config.js` / `postcss.config.js` | Tailwind / PostCSS |
| `tsconfig.json` | TypeScript；`exclude` 含 `v0/`（历史快照不参与类型检查） |
| `vitest.config.ts` | 单元测试 |
| `components.json` | shadcn/ui 组件配置 |
| `v0/` | 旧页面快照，**勿**当主应用源码 |

### `src/app/`（App Router）

| 路径 | 说明 |
|------|------|
| `layout.tsx` | 根布局、字体、metadata；server 端按 cookie 输出 `<html lang>` 与主题（no-flash script） |
| `fonts/` | 自托管的 Plus Jakarta Sans / IBM Plex Mono latin 字体与 SIL OFL 许可证 |
| `globals.css` | 全局样式与动画 keyframes |
| `page.tsx` | 首页 |
| `intro/page.tsx` | `redirect('/')` |
| `playground/page.tsx` | Playground 页壳 |
| `playground/PlaygroundClient.tsx` | Playground 客户端逻辑（URL、三栏、编译与 build 同步） |
| `resources/page.tsx` | 资源页 |
| `compare/page.tsx` | 对比占位 |
| `opengraph-image.tsx` | OG 图 |

### `src/components/`（按域划分）

| 目录 | 内容 |
|------|------|
| `layout/` | `Header` 等全站布局 |
| `providers.tsx` | `ThemeProvider`、`I18nProvider`（接收 server 传入的 `initialLocale` / `initialTheme`） |
| `playground/` | 三栏、`LeftPanel`、`CenterPanel`、`RightPanel`、`PolicyEditor`、`ConditionToggles`、`TimeSlider`、`StatusBanner` 等 |
| `builder/` | build 画布：`BuilderCanvas`、`BuilderPopover`、`OperatorSwitchPopover`、`BuilderNodes` 等 |
| `flow/` | scenario 路径图：`PathMap`、`FlowNodes`、`PathEdge` |
| `results/` | 右栏各 Tab（Policy / Miniscript / Script / Descriptor / Address / Paths） |
| `intro/` | 首页 Applications 区块与 `data.ts` |
| `home/` | `HomepageHero`、`HookSection`、`TransitionSection`、`ScriptComplexitySection`、`MeetMiniscriptSection`、`HomepageWallets`、`FAQSection`、`ScrollReveal` 等 |
| `scenarios/` | `ScenarioCard`、`ScenarioGallery`（未必挂载路由） |
| `shared/` | `ExplainPopover`、`GlossaryTooltip`、`CodeBlock` 等 |
| `ui/` | shadcn 基础组件 |

### `src/lib/`（业务与基础设施）

| 目录 | 内容 |
|------|------|
| `stores/` | `playground-store.ts` — Playground 唯一状态源 |
| `hooks/` | `useCompiler.ts`、`useBuilderSync.ts`、`useDesktopBootstrap.ts` |
| `engine/` | `compiler.ts`、`miniscript-parser.ts`、`path-analyzer.ts`、`time-utils.ts`、`block-height.ts`、`block-height-fallback.generated.ts`（**构建生成，勿手改**）、policy 错误与预检 |
| `builder/` | 策略树模型：`types`、`serialize`、`node-ops`、`from-semantic-tree`、`status`、`tree-to-flow`、`threshold` |
| `flow/` | scenario：`tree-to-flow.ts`（Dagre） |
| `editor/` | `policy-language.ts`（CodeMirror 高亮） |
| `i18n/` | `context.tsx`、`zh.ts`、`en.ts` |
| `scenarios/` | 预设数据、`playground-order.ts`、`tags.ts` |
| `playground/` | `htlc-display-mask.ts`、`add-next-key-variable.ts`、`apply-playground-search-params.ts` |
| `glossary/` | 术语数据 |
| `resources/` | `recommended-reading.ts` |
| `theme/` | 主题 Context |
| `preferences.ts` | locale / theme cookie key、解析与 `localeToHtmlLang` helper |
| `utils/` | `share.ts`、`storage.ts`、`policy-identifiers.ts`、`path-label.ts`、`cn.ts` 等 |
| `shims/` | `ledger-bitcoin-stub.js` |

## 核心运行链路

### 数据流（概念）

```text
用户编辑 Policy / 操作画布
    → playground-store（Zustand）
    → PlaygroundClient（desktop 确认后）useDesktopBootstrap：clearSession + fetchBlockTipHeight → blockTipHeight / blockTipHeightReady
    → useCompiler（debounce 500ms）→ compiler → miniscript、descriptor、地址、spendingPaths
    → scenario：miniscript-parser → tree-to-flow → PathMap（链尖就绪后传入 blockTipHeight）
    → build：strategyTree ↔ useBuilderSync ↔ Policy 文本
    → 右栏 Tabs / StatusBanner / ConditionToggles / TimeSlider
```

### 应用装配

`layout.tsx`（server）通过 `next/font/local` 装配仓库内字体，读取 `scriptwise-locale` / `scriptwise-theme` cookie，输出 `<html lang>` 与主题 class / `color-scheme`，注入 no-flash theme script；`providers.tsx` 把同一初值传给 `I18nProvider` / `ThemeProvider` 避免 hydration mismatch。

### 自动编译

`useCompiler.ts`：500ms debounce；Policy 空或编译失败时清空派生结果。

### 编译管线（`compiler.ts`）

`compilePolicy` → 替换 key → `compileMiniscript` → `wsh(...)` descriptor → 地址 / scriptPubKey → `satisfier` → `analyzeSpendingPaths`。

- 若 `context === 'tr'`，在编译前即返回 `limit` 类友好错误，不产出地址（与左栏 P2TR 占位一致）。
- 错误链：`policy-errors` → `policy-preflight` → `policy-error-highlight`（编辑器标红区间）。
- **Descriptor** 从 `@bitcoinerlab/descriptors/dist/descriptors` 细入口导入（避免拉 Ledger）；`@ledgerhq/ledger-bitcoin` → `ledger-bitcoin-stub`（`next.config` / `vitest.config`）。
- **Key 名替换** `replaceKeyNames` 走共享 helper `src/lib/utils/policy-identifiers.ts` 做 **token-aware**（`\b<name>\b`）替换，保证 `pk(A)` 与 `pk(Alice)`、`Key1` 与 `Key10`、名为 `or` 的 key 与 `or_b` / `or_i` 不互相吞噬（同一 helper 也用于原子重命名）。

### 链尖高度与 `after(<height>)`

- `compile()` 接受可选 `blockTipHeight`；`useCompiler` 在 `blockTipHeightReady` 之前传 `undefined`。
- `block-height.ts` 多端点顺序回退 + 短 TTL 内存缓存；全部失败时用 `block-height-fallback.generated.ts` 的构建时高度。
- 该文件由 `npm run build` 的 `prebuild`（`scripts/generate-block-height-fallback.mjs`）抓取主网链尖生成；抓取失败时**优先保留**已有高度（不回退到更旧值）；若文件不存在或解析失败，CI（`process.env.CI`）下非零退出失败，本地写入脚本内桩值以免阻塞构建。
- `path-analyzer`、scenario `tree-to-flow`、`StatusBanner` 以及 build 的 `builder/status.ts` 共用 `time-utils.ts` 的 `isPathTimelockSatisfied` / `getPathTimelockRemainingBlocks`，确保 `after(<height>)` 与 `older()` 在「编译 → 路径分析 → 路径图 → 状态横幅 → build 节点状态」全链路语义一致（`blockTipHeight + currentTimeBlocks ≥ afterValue`）。

### 语义树与路径图（scenario）

`miniscript-parser.ts` → `tree-to-flow.ts`（Dagre）→ `PathMap` / `FlowNodes` / `PathEdge`。`multi(k,…)` 在图上展开为 k-of-n 与各 key 叶子（嵌套 multi 为 operator 框 + 合成边；根级 multi 为单层 root 型 k-of-n 框直连各 key）。共源多边带 `zIndex`，已满足边在上层。区块高度型 `after()` 在链尖首次拉取完成前不传高度，避免占位高度误判。

### 可视化构建（build）

核心：`src/lib/builder/`（`types`、`serialize`、`node-ops`、`from-semantic-tree`、`status`、`tree-to-flow`、`threshold`）+ `src/components/builder/*` + `useBuilderSync.ts`。要点：二元 `all` / `any`、门限通过 `threshold.ts` 的 `effectiveThresholdK`（读取层）/ `clampStoredThresholdK`（写入层）共享 clamp、虚拟「+」与子占位、`OperatorSwitchPopover` / `BuilderPopover`、包裹进组、深度 ≤5 提示。细节以源码为准。

### 花费路径与状态横幅

- `path-analyzer.ts` → `Paths` / `StatusBanner`。同一公钥在 `keyVariables` 中重复出现时，标签取首次出现的变量名。卡片标题由 `path-analyzer` 产出 `labelVariant`，UI 经 `path-label.ts` 的 `formatSpendingPathLabel` 按当前语言拼接（不在引擎内写死中文）。
- **Key 身份**：`KeyVariable.policyName` 是稳定 ID，贯穿 semantic tree、`availableKeys`、`PathCondition.keyName`、builder `roleId`；`name` 仅作 UI 显示标签。重命名走 `playground-store` 的 `renameKeyVariable`（原子改 `name` / `policyName` + token-aware 重写 policy）。`share.ts` / 旧 session 解码额外校验 `policyName` 合法且唯一。
- **StatusBanner** 三档 `canSpend` / `waiting` / `cannotSpend`：
  - `canSpend`：任一路径满足。
  - `waiting`：某路径全部签名就绪、仅缺时间锁 → 显示「还需等待 X」。
  - `cannotSpend`：进入 `formatClosestMissing(...)`，按 `missingConditions.length` 取最少缺失条件的若干等价路径；路径内多缺失以 AND 连接，多条等价路径以 OR 并列。单条件描述统一走 `describeCondition`。这修掉了旧聚合行为在 k-of-n 多签下「挤出已点亮 key」的误导文案（详见 `StatusBanner.tsx` 注释）。

### 分享与会话

- 不自动持久化 Playground；`share.ts` 将状态编码为 `?s=`（Base64 JSON），并校验 `network` / `context` / `keyVariables` 形状；`storage.ts` 的 legacy `loadSession` 用相同规则。
- `PlaygroundClient`：`searchParams` 每次变化按 `applyPlaygroundSearchParams` 应用——`s` 解码成功 → `restoreSession`；否则有 `scenario` → `loadScenario`；否则 `mode=build` → `enterBuildMode`。无上述参数时不 `reset()`。`s` 解码失败触发一次性 `invalidPayload` 提示。桌面初始化（`clearSession` + 拉链尖）由 `useDesktopBootstrap` 在 `mode === 'desktop'` 时触发。
- 分享链接过长时 `PolicyEditor` 提示（阈值见 `share.ts`）。

## 关键 UI 结构

左栏 `LeftPanel`（240px）、中栏 `CenterPanel`、右栏 `RightPanel`（320px）。`PolicyEditor`（含 `htlc-atomic` 的 `hash160(HEX)` 展示、`onDocChangeRef`、分享链接过长提示）、`ConditionToggles`、`TimeSlider`（顶行仅展示主网链尖高度；分段线性锚点；`older()` 与区块高度型 `after()` 统一相对区块语义后混排）、`StatusBanner`。右栏 Tab 与 `htlc` 真实摘要规则见 `htlc-display-mask.ts`。

## i18n、主题、样式

- i18n：`zh.ts` / `en.ts`，`t()` dot-path；`I18nProvider` 首值来自 server cookie，切换语言同步 cookie / localStorage 与 `document.documentElement.lang`。
- 主题：`ThemeProvider` 首值来自 server cookie；`layout.tsx` no-flash script 保证首帧一致，客户端切换同步 cookie / localStorage 与 `color-scheme`。
- Token：见 `DESIGN.md`、`globals.css`、`tailwind.config.js`。动效兜底：`globals.css` 的 `@media (prefers-reduced-motion: reduce)`；动画 keyframes 集中在 `globals.css`。

## 与外部库的分界

- Miniscript / Policy：`@bitcoinerlab/miniscript-policies`、`@bitcoinerlab/miniscript`。
- Descriptor：`@bitcoinerlab/descriptors/dist/descriptors`（细入口，避免拉 Ledger）。
- 比特币工具：`bitcoinjs-lib`、`@bitcoinerlab/secp256k1` 等。

## 测试布局

- 引擎 / 工具：`src/lib/{engine,builder,hooks,utils,playground,scenarios,stores}/__tests__/`。
- 组件：`src/components/**/__tests__/`。
- 新增逻辑应优先在对应目录旁补测试；`compiler`、`node-ops`、`useBuilderSync` 等已有覆盖可参考。

## 编码约定（Conventions）

> 以下约定散落在代码各处，集中记录以避免写出「看起来正确但违反项目规范」的代码。

### 导入与依赖

- **Bitcoin 库导入必须用 dist 子路径**：`@bitcoinerlab/descriptors/dist/descriptors`（避免拉入 Ledger SDK）。「与外部库的分界」已提及入口，此处强调必须走 dist 子路径。
- **`@ledgerhq/ledger-bitcoin` 已 shim**：`next.config.mjs` 与 `vitest.config.ts` 均将其 alias 到 `src/lib/shims/ledger-bitcoin-stub.js`，勿移除该 alias。
- **引擎层 (`src/lib/engine/`) 不引用 React**：引擎是纯计算模块，不依赖 React 生命周期。

### 状态与数据流

- **组件不直接读 `playground-store`**：通过 `usePlaygroundStore` selector 获取所需字段，避免整 store 订阅。
- **Key 身份以 `policyName` 为稳定 ID**：`name` 仅作 UI 显示标签；重命名、分享校验、builder 角色绑定均使用 `policyName`。「花费路径与状态横幅」已描述完整机制。
- **Key 名替换必须 token-aware**：使用 `src/lib/utils/policy-identifiers.ts` 的 `replaceIdentifierToken`（`\b` 边界匹配），禁止简单 `String.replace`。「编译管线」已描述完整机制。

### i18n 与文案

- **新增 i18n key 必须中英文同时添加**：`zh.ts` 和 `en.ts` 同步，不允许只加一个语言。
- **面向用户的文案走 i18n**：不在引擎或组件里写死中文/英文字符串；用 `t()` 读取。

### 测试

- **测试文件与源文件同目录旁 `__tests__/`**：不放全局 `test/` 目录。
- **覆盖率阈值**：`src/lib/engine/**`、`src/lib/builder/**` 和 `src/lib/playground/**` 均为 70% lines/functions（见 `vitest.config.ts`）。

## 重要边界

> 完整的「不允许做的事（硬边界）」以 [`../AGENTS.md`](../AGENTS.md) 为单一事实源。以下仅列出与架构决策直接相关的技术边界：

- `block-height-fallback.generated.ts` 为构建产物，**勿手改**；`v0/` 为历史快照，勿当源码。

## 反模式（不要这样做）

- ❌ 在 `src/lib/engine/` 下 `import React`
- ❌ 直接 `policy.replace('oldName', 'newName')` 而非 token-aware 替换
- ❌ 只在 `zh.ts` 加 key 而不同步 `en.ts`
- ❌ 在组件内硬编码用户可见的文案
- ❌ 移除 `next.config.mjs` 或 `vitest.config.ts` 中的 Ledger alias
- ❌ 手改 `block-height-fallback.generated.ts`
- ❌ 提交 `pnpm-lock.yaml` 或 `yarn.lock`
