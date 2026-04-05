# Miniscript Lab Agent Guide

## Document Priority

- 判断产品目标、需求、交互规格：以 `SPEC.md` 为准。
- 判断当前实现现状：以实际代码为准。
- 判断仓库结构、关键入口、修改落点、已知实现限制：以 `agent.md` 为准。
- 如果 `SPEC.md` 与当前代码不一致，应理解为“需求与实现之间仍有差距”，不要把它当作文档互相冲突。

## 1. 项目一句话

Miniscript Lab 是一个 **场景优先、以花费路径为中心** 的 Bitcoin Miniscript 教学实验室。它不是钱包，也不是链上工具；它的核心目标是先让用户看懂“谁能花、什么时候能花、需要什么条件”，再展示 Policy、Miniscript、Script、Descriptor 和 Address。

## 2. 产品边界

- 纯前端应用，没有后端 API、没有数据库、没有区块链连接。
- 不处理私钥、助记词、签名、交易构造或广播。
- 地址只用于 `testnet` / `signet` 教学展示，绝不能扩展为主网默认行为。
- 当前 MVP 只真正支持 `P2WSH`；`P2TR` 只是类型占位，UI 里也被禁用。
- 所有计算都在浏览器本地完成，不依赖 LLM 或外部服务。

## 3. 技术栈

- 框架：Next.js 14 App Router + React 18
- 语言：TypeScript strict
- 状态管理：Zustand
- 编辑器：CodeMirror 6
- 可视化：React Flow (`@xyflow/react`)；**scenario** 路径图用 Dagre TB（`src/lib/flow/tree-to-flow.ts`），**build** 策略树用自实现递归 TB 布局（`src/lib/builder/tree-to-flow.ts`，非 Dagre）
- 动画：framer-motion
- 样式：Tailwind CSS + 少量 shadcn/ui 基础设施
- Bitcoin 相关库：
  - `@bitcoinerlab/miniscript-policies`
  - `@bitcoinerlab/miniscript`
  - `@bitcoinerlab/descriptors`
  - `bitcoinjs-lib`

## 4. 运行与验证

### 常用命令

```bash
npm install
npm run dev
npm run build
npm run lint
npx vitest run
```

说明：

- `package.json` 里没有 `test` script，测试要直接用 `npx vitest run`。
- dev server 默认跑在 `http://localhost:3000`；如果 3000 被占用会自动尝试其他可用端口（以终端输出为准）。

## 5. 路由与页面职责

- `/`
  - 场景画廊首页。
  - 入口组件：`src/app/page.tsx`
  - 核心组件：`src/components/scenarios/*`

- `/`
  - 首页，产品登陆入口。
  - 入口组件：`src/app/page.tsx`（Server Component）
  - 子组件：`HomepageHero`（Hero 区）、`HomepageMiniscriptExplainer`（科普区，标题合并定义，下方三卡片纵向堆叠对比传统 Script vs Miniscript）、`HomepageMission`（我们为什么做这个，纯居中文本）、`HomepageFeatures`（核心能力）、`HomepageHowItWorks`（使用流程）、`ScenarioGallery`（场景卡片）
  - **首页预加载**：用 `requestIdleCallback` 在浏览器空闲时预热所有 Playground 模块，确保用户从首页进入 Playground 时体验丝滑
  - **窄屏提示**：`md` 以下在 Hero 与页面底部 CTA 区域展示 `home.playground.desktopHint`（i18n），提醒用户在桌面端或更大屏幕打开 Playground 以获得完整体验；与 `/playground` 的 `MobileFallback` 文案一致为「桌面优先」预期管理

- `/playground`
  - 三栏 Playground，是项目主界面。
  - 入口组件：`src/app/playground/page.tsx`（直接 import `PlaygroundClient`）
  - 客户端组件：`src/app/playground/PlaygroundClient.tsx`（含 `'use client'`，负责读取 URL 分享参数 `?s=`、场景参数 `?scenario=`；首屏调用 `clearSession()` 清理遗留的 `miniscript-lab-session` 键、**不再**从 localStorage 恢复 Playground 会话；并挂载 `useCompiler`、`useBuilderSync`）
  - **视口与窄屏**：`PlaygroundClient` 内 `matchMedia('(min-width: 768px)')` 判定；窄视口只渲染 `MobileFallback`（`playground.mobile.*` i18n），引导用户在桌面端或更大屏幕使用；用户可见文案**不写像素数字**。`mode === 'loading'` 时先渲染三栏再解析媒体查询，可能出现极短暂的三栏闪现再切到 fallback（已知可接受）。
  - **渐进式加载架构**：服务端渲染三栏框架 HTML 用户立即看到完整框架；`CenterPanel` 中 `BuilderCanvas` 和 `PathMap` 用 `dynamic({ ssr: false })` 懒加载显示 spinner 骨架屏；`layout.tsx` 加 `<link rel="prefetch">` 让浏览器提前获取文档；scenario 模式停留 2 秒后后台预加载 Builder 代码。

- `/compare`
  - 当前只是 Coming Soon 占位页。
  - 入口组件：`src/app/compare/page.tsx`

- `/opengraph-image`
  - 动态 OG 图。
  - 入口：`src/app/opengraph-image.tsx`

## 6. 目录地图

```text
src/
  app/              Next.js 路由、布局、动态 OG、globals.css
    playground/
      page.tsx          纯 Server Component，dynamic 加载 PlaygroundClient
      PlaygroundClient.tsx  客户端组件，含所有 hooks 和三栏布局
  components/
    providers.tsx   Theme + I18n 根 Provider
    ui/             shadcn 基础组件（如 button）
    builder/        build 模式：可视化策略树画布（BuilderCanvas、节点、BuilderPopover/AddChildOptions/OperatorSwitchPopover、同步横幅）
    flow/           scenario 模式：花费路径图与 React Flow 节点/边
    home/           首页组件（HomepageHero、HomepageHowItWorks、HomepageFeatures）
    layout/         顶部导航（Header）
    playground/     三栏布局（ThreeColumnLayout）、左/中/右各面板
    results/        右侧结果 tabs
    scenarios/      首页场景卡片
    shared/         代码块、tooltip、popover 等通用组件
  lib/
    engine/         编译、路径分析、Miniscript 解析、时间工具、类型
    builder/        可视化构建：StrategyNode、序列化、tree-to-flow（递归 TB）、路径高亮、节点操作
    editor/         CodeMirror Policy 语法高亮
    flow/           语义树 -> React Flow 图（scenario 路径图，Dagre TB）
    glossary/       术语解释
    hooks/          useCompiler、useBuilderSync（build 同步）
    i18n/           轻量双语系统
    scenarios/      预设场景和标签
    stores/         Zustand 单一主 store
    theme/          深浅色主题
    utils/          分享、存储、class merge
```

## 7. 核心运行链路

### 应用装配

- `src/app/layout.tsx`
  - 注入字体、metadata、全局样式。
- `src/components/providers.tsx`
  - 统一挂载 `ThemeProvider` 和 `I18nProvider`。
- `src/components/layout/Header.tsx`
  - 顶部导航、语言切换、主题切换、移动端菜单。

### Playground 状态中心

- 单一事实源是 `src/lib/stores/playground-store.ts`。
- 里面既放业务状态，也放 UI 状态：
  - `playgroundMode`：`'scenario' | 'build'`（**自己动手** 进入 `build`；`loadScenario` 进入 `scenario`）
  - policy 文本
  - **build 模式**：`strategyTree`（`StrategyNode`）、`builderSyncState`、`selectedBuilderNodeId`（节点参数编辑浮层）、`operatorSwitchNodeId`（操作符切换浮层，与前者互斥）、`lastBuilderPolicySnapshot`；`enterBuildMode()` 会清空场景相关状态并置入根占位节点；`updateStrategyTree()` 等维护树与 Policy 字符串
  - key variables
  - context / network
  - compilation result / error / semantic tree / spending paths
  - 模拟条件：available keys / hashes / current time blocks
  - UI：active tab、左右面板开关

### 自动编译

- `src/lib/hooks/useCompiler.ts`
  - 监听 policy、keyVariables、network、模拟条件变化。
  - 500ms debounce 后调用 `compile(...)`。
  - 用 generation counter 丢弃过期异步结果。
  - Policy 为空或仅空白时同步清空 `compilationResult`、`semanticTree`、`spendingPaths`（避免右栏仍显示上一份策略）；`compile` 抛错时同样清空上述派生结果。

### 编译管线

- `src/lib/engine/compiler.ts`
  - 编译顺序：
    1. `compilePolicy(policy)` 生成 Miniscript
    2. 用 `keyVariables` 把 policy 里的别名替换成真实公钥
    3. `compileMiniscript(...)` 生成 ASM
    4. 用 descriptor 库构造 `wsh(...)`
    5. 派生地址和 scriptPubKey
    6. 调用 `satisfier()` 枚举花费路径
    7. 交给 `analyzeSpendingPaths(...)` 做结构化分析
  - 输出 `CompilationResult` 含 `policy`、`policyWithKeys`、`miniscript`、`miniscriptWithKeys` 等。`policy`/`miniscript` 保留角色名供路径图解析；`policyWithKeys`/`miniscriptWithKeys` 含真实公钥供右栏 Tab 展示。
  - 错误经 `policy-errors.ts` 的 `mapError` 映射为 `FriendlyError`（`category`、`friendly` zh/en、`hints` 等），再由 `policy-error-highlight.ts` 的 `attachErrorHighlight(policy, err)` 尝试附加 `highlight` 区间。
  - **Descriptor 与构建**：从 `@bitcoinerlab/descriptors/dist/descriptors` 导入 `DescriptorsFactory`（避免包主入口拉入 Ledger PSBT 等）；`next.config.mjs` 与 `vitest.config.ts` 将 `@ledgerhq/ledger-bitcoin` 别名为 `src/lib/shims/ledger-bitcoin-stub.js`，不依赖真实 Ledger SDK。详见 `SPEC.md`「关键实现细节」第 5 条。

### 语义树与路径图（scenario 模式）

- `src/lib/engine/miniscript-parser.ts`
  - 将编译出来的 Miniscript 字符串（`result.miniscript`，含角色名）解析成自定义 `MiniscriptNode` 语义树。
  - 会剥离 wrapper 前缀，例如 `v:`、`c:`、`sln:`。

- `src/lib/flow/tree-to-flow.ts`
  - 把语义树转成 React Flow nodes/edges。
  - 用 Dagre 自动布局。
  - 节点状态只分为 `satisfied` / `pending` / `missing`。
  - 对 `multi(k, key1,...,keyn)` 片段做可视化层的展开：在语义树中仍是 `type: 'multi'`，但在图上渲染为一个 “k-of-n” 根/操作节点，下挂每个参与者 key 的叶子节点（例如 2-of-3 多签显示为一个 “2-of-3” 节点，下方连 Alice / Bob / Charlie）。

- `src/components/flow/*`
  - `PathMap.tsx` 挂载 React Flow。
  - `FlowNodes.tsx` 定义 root/operator/condition 三类节点。
  - `PathEdge.tsx` 用实线/虚线/颜色表示 and/or/threshold 与满足状态。
  - `NodeInternalsSync.tsx` 在节点尺寸变化时触发布局同步。

### 可视化构建（build /「自己动手」模式）

- `src/lib/builder/tree-to-flow.ts`：将 `StrategyNode` 转为 React Flow 图；**递归 TB 布局**（子树宽度自下而上、节点自上而下，父在直接子行上水平居中；**`all`/`any` 未满员时**有虚拟「+ 添加条件」；**门限分组若已有树内子 placeholder 槽则不再挂虚拟「+」**）。Flow 节点数据用 `addChildSlotKind`：`virtual`（`add_child:父组 id`）与 `treePlaceholder`（子占位节点 id）。可选 `labels.addConditionLine` 由 `BuilderCanvas` 注入以统一「+ 添加条件」文案。节点上叠加满足态；与 `types.ts`、`serialize.ts`、`node-ops.ts`、`path-highlighting.ts`、`status.ts` 等配合。
- `src/components/builder/BuilderCanvas.tsx`：build 模式主画布；在画布容器内右上角挂载 `BuilderPopover`（选中节点编辑）与 `OperatorSwitchPopover`（`operatorSwitchNodeId` 对应的 Group 操作符切换），二者互斥；向 `builderTreeToFlow` 传入 `labels.addConditionLine`；`OperatorSwitchPopover` 的 `realChildCount` 使用 `countRealChildren`（与 `childCount` 一致）。只读态由 `builderSyncState !== 'synced'` 控制；嵌套超过 5 层时显示黄色警告 toast；从 threshold 切到 AND/OR 且子节点被裁剪为两个时显示底部提示 toast。
- `src/components/builder/AddChildOptions.tsx`：「添加条件」浮层内签名 / 时间锁 / 嵌套组按钮的纯 UI；由 `BuilderPopover` 在 `add-child` 模式下渲染，`onPick` 对接 `handleAddChildType`（内部区分 `convertChildPlaceholder` 与 `addChildNode`）。
- `src/components/builder/BuilderNodes.tsx`：`BuilderAddChildNode` 按 `addChildSlotKind` 设置 `selectedBuilderNodeId`（不再依赖 `isAddButton`）。
- `src/lib/hooks/useBuilderSync.ts`：在 `playgroundMode === 'build'` 时双向同步 Policy 文本与 `strategyTree`；挂载于 `PlaygroundClient.tsx`。成功导入时用 `updateStrategyTree` 统一树与 Policy 字符串；Policy 为空时将 `strategyTree` 重置为根占位节点（`createRootPlaceholderTree()`），并清空 `lastBuilderPolicySnapshot`，与 `enterBuildMode` 的空白 scratch 一致。Policy 非空但编译失败时：`builderSyncState` 为 `compile-error`（画布只读）；若尚无 `strategyTree` 则植入根占位，避免无限「等待画布」。
- `src/lib/playground/add-next-key-variable.ts`：`createNextKeyVariable` / `generateRandomPubkey`，供左栏 `KeyVariableManager` 与 `BuilderPopover`（签名编辑「新建角色」）共用同一套「下一个角色」逻辑；浮层内一键创建后会 `updateSignatureRole` + `updateStrategyTree`。
- **操作符切换**：`changeGroupOp(tree, nodeId, newOp, newThreshold?)` 允许 Group 节点在 AND / OR / threshold 之间自由切换；切换到 threshold 时默认 k 为 `defaultThresholdK(realChildCount)`（等价于 `min(2, max(1, realChildCount))`），传入的 k 经 `clampThresholdK` 钳制；切换到 AND/OR 且子节点多于 2 个时**裁剪为前两个子条件**。UI 入口为 Group 节点上的可点击操作符徽章；`OperatorSwitchPopover` 在 **画布右上角** 渲染（非节点下方），由 `operatorSwitchNodeId` 驱动，避免遮挡子树。
- **二元 AND/OR 与 Policy**：`addChildNode` 对已满员的 `all`/`any` 父节点不再追加子节点；`serializeStrategyTree` 将 `all`/`any` 序列化为嵌套二元 `and`/`or`，对 `thresh` 输出前钳制 k；`importFromSemanticTree` 将 N 叉语义 `and`/`or` 折叠为嵌套二叉 `StrategyNode`。
- **节点包裹**：`wrapNodeInGroup(tree, nodeId, wrapperOp, wrapperThreshold?)` 将任意节点（签名、时间锁、Group）包裹进新的父级 Group，原节点成为第一个子节点，同时添加 placeholder 子槽；包裹为门限时对默认/显式 k 做与单真实子节点数一致的钳制。UI 入口为所有节点浮层底部的「包裹进新组」三按钮。
- **子占位填写 vs 追加**：`convertChildPlaceholder` 替换树内子槽；`addChildNode` / `addSignatureChild` 等向父组追加；勿对 placeholder id 调用 `addChildNode`。
- **嵌套深度检测**：`computeTreeDepth(tree)` 计算最大嵌套层数；包裹操作后若深度超过 5 层，`BuilderCanvas` 会显示 4 秒自动消失的警告 toast。
- 专项设计与范围见 `docs/plans/2026-03-13-visual-builder-mvp-design.md`。

### 花费路径分析

- `src/lib/engine/path-analyzer.ts`
  - 从 `satisfier()` 的 ASM、`nSequence`、`nLockTime` 推导 `SpendingPath`。
  - 输出签名、相对时间锁、绝对时间锁、哈希锁等条件。
  - UI 的 `Paths`、`Warnings`、`StatusBanner` 都依赖这份结构化结果。

### 分享与会话存储

- **Playground 不自动持久化**：刷新或再次进入 `/playground` 使用 store 初始状态；不再 `loadSession` / `saveSession`。
- `src/lib/utils/storage.ts`
  - `clearSession()` 移除 `miniscript-lab-session`（首屏调用，清理历史残留）。
- `src/lib/utils/share.ts`
  - 分享链接把 payload 编码进 `?s=`（`SharePayload` 可含 `policy`、`keyVariables`、`context`、`network`、`playgroundMode`）；`PolicyEditor`「分享」写入剪贴板；`decodeSharePayload` 仅接受 `playgroundMode` 为 `scenario` 或 `build`，否则忽略该字段。

## 8. 关键 UI 结构

### 左栏（240px）

- `src/components/playground/LeftPanel.tsx`
  - 预设场景列表；首项为 **「自己动手」** 入口，点击进入 `enterBuildMode()`（`build` 模式）
  - Key 变量管理
  - Context / Network 选择

- `src/components/playground/KeyVariableManager.tsx`
  - 维护 policy 名称和公钥映射；「添加」通过 `createNextKeyVariable` + `addKeyVariable`，与构建器签名浮层「新建角色」一致
  - 可随机生成测试公钥

### 中栏（flex-1）

- `src/components/playground/CenterPanel.tsx`
  - 顶部：Policy 编辑器（可折叠）
  - 中部：`playgroundMode === 'build'` 时为 `BuilderCanvas`（可视化策略树）；否则为 `PathMap` 花费路径图
  - 主画布下方：状态结论横幅
  - 底部：条件切换 + 时间滑块

- `src/components/playground/PolicyEditor.tsx`
  - CodeMirror 编辑器
  - 支持格式化、清空、复制、分享
  - 高亮定义在 `src/lib/editor/policy-language.ts`

- `src/components/playground/ConditionToggles.tsx`
  - 从 `semanticTree` 自动收集 key/hash 条件。

- `src/components/playground/TimeSlider.tsx`
  - 从 `semanticTree` 收集 timelock 节点并提供拖动模拟。

- `src/components/playground/StatusBanner.tsx`
  - 位于路径图下方、条件模拟面板上方。
  - 根据 `spendingPaths` 给出“可花费 / 还需等待 / 仍不可花费”的总结。

### 右栏（320px，上下分区）

- `src/components/playground/RightPanel.tsx`
  - 上部：花费路径（始终展示，非 Tab），标题区域有 `ExplainPopover` 解释按钮。
  - 中间：可拖拽分割条（调节上下区域高度）。
  - 下部：技术细节面板，布局为「左侧垂直 Tab 导航（约 100px 宽）+ 右侧内容区」：
    - 左列导航只显示文字标签（policy / miniscript / script / descriptor / address / warnings），当前选中项用左侧竖线 + 浅色背景 + 加粗文字高亮。
    - 右列内容区根据当前 Tab 渲染对应组件（统一在 `src/components/results/*Tab.tsx` 中）。
    - **右栏所有 Tab 统一为「可复制的真实输出」**：Policy Tab 展示 `policyWithKeys`，Miniscript Tab 展示 `miniscriptWithKeys`，均含真实公钥（非 Alice 等角色名），便于用户复制到钱包或链上工具。中栏 Policy 编辑器和路径图已用角色名直观展示，右栏专注技术输出。
    - 带 glossary 的 Tab（policy / miniscript / descriptor）在标签上悬停 2 秒后，会在右侧内容区域内弹出术语解释卡片，内容来自 `src/lib/glossary/data.ts`。

- 对应 Tab 组件都在 `src/components/results/`。

## 9. i18n、主题、样式

- i18n：
  - `src/lib/i18n/context.tsx`
  - 词条：`src/lib/i18n/zh.ts`、`src/lib/i18n/en.ts`
  - 默认中文，localStorage key 为 `miniscript-lab-locale`

- 主题：
  - `src/lib/theme/context.tsx`
  - 默认 dark，localStorage key 为 `miniscript-lab-theme`

- 设计 token：
  - `src/app/globals.css`
  - `tailwind.config.js`

## 10. 当前真实限制与容易误判的点

这些点对 AI 工具很重要，修改前必须先知道：

1. `context` 虽然有 `'wsh' | 'tr'`，但当前实际只支持 `wsh`。
   - `ContextSelector` 里 `tr` 是禁用状态。
   - `compiler.ts` 里 descriptor 仍然硬编码成 `wsh(...)`。

2. `after()` 绝对时间锁还没有完整模拟。
   - `tree-to-flow.ts` 中 `after` 只会显示为 `pending`。
   - `path-analyzer.ts` 中 `timelock_absolute` 目前总是被视为缺失条件。
   - 所以当前时间滑块主要对 `older()` 有效。

3. `signet` 地址派生实际上复用了 `bitcoinjs-lib` 的 testnet network。
   - 这是教学层面的折中，不要把它误当成完整 signet 基础设施。

4. `/compare` 还没做。

5. `@supabase/supabase-js` 已安装，但当前代码里没有实际接入。

6. 这是一个“以交互为主的客户端应用”。
   - 虽然基于 Next.js App Router，但大部分页面和组件都是 `'use client'`。

7. 移动端没有完整 Playground（**桌面优先**）。
   - 窄视口不满足 `matchMedia('(min-width: 768px)')` 时仅渲染 `MobileFallback`，无法使用三栏与 Build 画布；判定与 UI 在 `src/app/playground/PlaygroundClient.tsx`（`playground.mobile.*` i18n），**不是**在 `page.tsx` 里分支。
   - 首页 `md` 以下在 Hero 与底部 CTA 展示 `home.playground.desktopHint`，与 Playground 内文案一致，引导用户在桌面端或更大屏幕获得完整体验；**用户可见文案不写像素数字**。

8. `regtest` 网络已从 UI 和类型中移除。
   - `Network` 类型只有 `'testnet' | 'signet'`。

9. 路径图根节点已与第一层操作符合并。
   - 根节点直接显示顶层条件逻辑类型（都需要/任选一/k-of-n），而非通用的"花费条件"。
   - 单一叶子条件的策略不再创建根节点，直接显示条件节点。

10. **build 模式**（自己动手）已实现为 MVP：受约束策略树 + Policy 双向同步；并非任意拖线流程图。不支持的结构会进入 `text-led`，详见 `useBuilderSync` 与 `docs/plans/2026-03-13-visual-builder-mvp-design.md`。

11. **渐进式加载**：`playground/page.tsx` 直接 import `PlaygroundClient`（服务端渲染三栏框架 HTML，用户进入页面立即看到完整框架）；`PlaygroundContent` 移除了 `mode === 'loading' → null` 逻辑；`CenterPanel` 中 `BuilderCanvas` 和 `PathMap` 用 `dynamic({ ssr: false })` 懒加载，期间显示带 spinner 骨架屏；`layout.tsx` 加 `<link rel="prefetch">` 提前获取 Playground 页面；首页 `requestIdleCallback` 预热所有 Playground 模块（三栏组件、两个画布、编译器），同 Tab 内来回切换命中浏览器模块缓存无需重新加载，刷新后命中 HTTP 缓存（Next.js 文件名含 hash）极快恢复。

12. **首页设计**：新增 `HomepageMiniscriptExplainer`（标题区定义"什么是 Miniscript"，下方三卡片纵向堆叠对比传统 Script vs Miniscript，代码块与左侧文本在 `md` 断点用 `items-center` 对齐）、`HomepageMission`（纯居中文本说明"我们为什么做这个"，无 CTA 按钮）。首页完整流程：Hero → 科普区 → 使命区 → 使用流程 → 核心功能 → 场景库 → 底部 CTA。

## 11. 常见改动从哪里入手

### 新增或修改预设场景

- 主入口：`src/lib/scenarios/data.ts`
- 如果场景标签或卡片顶部颜色也要改：
  - `src/lib/scenarios/tags.ts`
  - `src/components/scenarios/ScenarioCard.tsx`

### 修改 Policy 语法支持

通常至少要同时检查这些文件：

- `src/lib/editor/policy-language.ts`
- `src/lib/engine/compiler.ts`
- `src/lib/engine/miniscript-parser.ts`
- `src/lib/glossary/data.ts`
- `src/lib/engine/__tests__/compiler.test.ts`
- `src/lib/engine/__tests__/miniscript-parser.test.ts`

### 修改花费路径判定或模拟逻辑

- `src/lib/engine/path-analyzer.ts`
- `src/lib/engine/time-utils.ts`
- `src/components/playground/StatusBanner.tsx`
- `src/components/playground/ConditionToggles.tsx`
- `src/components/playground/TimeSlider.tsx`
- `src/components/results/PathsTab.tsx`
- `src/components/results/WarningsTab.tsx`

### 修改路径图展示（scenario 模式）

- `src/lib/flow/tree-to-flow.ts`
- `src/components/flow/FlowNodes.tsx`
- `src/components/flow/PathEdge.tsx`

### 修改可视化构建（build 模式）

- `src/lib/builder/tree-to-flow.ts`、`src/lib/builder/types.ts`、`src/lib/builder/serialize.ts`（嵌套二元 `and`/`or` + `thresh` k 钳制）、`src/lib/builder/from-semantic-tree.ts`（导入语义树时折叠 N 叉 `and`/`or`）、`src/lib/builder/node-ops.ts`（含 `countRealChildren`、`defaultThresholdK`、`clampThresholdK`、`canAddChildToBinaryGroup`、`addChildNode`、`convertChildPlaceholder`、`changeGroupOp`、`wrapNodeInGroup`、`computeTreeDepth`）
- `src/lib/playground/add-next-key-variable.ts`（角色「下一个」命名与公钥，与左栏共用）
- `src/components/builder/BuilderCanvas.tsx`（主画布 + 右上角 `BuilderPopover` / `OperatorSwitchPopover` + 深度警告 toast + 裁剪子节点提示 toast + `builderTreeToFlow` 的 `labels`）、`BuilderNodes.tsx`（操作符徽章；`addChildSlotKind` 点击路由）、`BuilderPopover.tsx` / `AddChildOptions.tsx`（添加条件面板；包裹按钮）、`OperatorSwitchPopover.tsx`（操作符切换浮层，由画布挂载）
- `src/lib/hooks/useBuilderSync.ts`、`src/lib/stores/playground-store.ts`（`enterBuildMode`、`updateStrategyTree`、`setOperatorSwitchNodeId`、`switchNodeOperator`、`wrapNode`、`clearDepthWarning`、`clearBinaryTrimNotice` 等）

### 修改 Policy 编辑器

- `src/components/playground/PolicyEditor.tsx`（编辑器组件，现位于中栏顶部；错误摘要、可折叠 `raw`、hints、Compartment 错误装饰）
- `src/components/playground/CenterPanel.tsx`（编辑器的容器/折叠逻辑）
- `src/lib/editor/policy-language.ts`（CodeMirror 高亮规则、`buildErrorHighlightExtensions`、`.cm-policy-error-highlight` 主题）
- `src/lib/engine/policy-errors.ts`、`src/lib/engine/policy-error-highlight.ts`（错误文案与启发式区间）

### 修改右侧输出面板

- `src/components/playground/RightPanel.tsx`（上部花费路径 + 下部 Tab 分区 + 拖拽分割条）
- `src/components/results/*`
- 若要补充概念说明，也看 `src/components/shared/ExplainPopover.tsx`

### 修改全局视觉或主题

- `src/app/globals.css`
- `tailwind.config.js`
- `src/lib/theme/context.tsx`

### 修改分享、恢复、持久化

- `src/app/playground/PlaygroundClient.tsx`
- `src/lib/utils/storage.ts`
- `src/lib/utils/share.ts`

## 12. 测试覆盖现状

引擎与工具测试在 `src/lib/engine/__tests__/`：

- `compiler.test.ts`
- `mapError.test.ts`
- `policy-error-highlight.test.ts`
- `miniscript-parser.test.ts`
- `time-utils.test.ts`

可视化构建相关补充测试（非穷尽）：

- `src/lib/stores/__tests__/playground-store-builder.test.ts`
- `src/lib/builder/__tests__/`（含 `serialize`、`templates`、`from-semantic-tree` 等）
- `src/lib/hooks/__tests__/useBuilderSync.test.ts`、`src/lib/hooks/__tests__/useCompiler.test.ts`
- `src/lib/utils/__tests__/storage-share-builder.test.ts`
- `src/components/playground/__tests__/LeftPanelBuildEntry.test.tsx`
- `src/components/builder/__tests__/`（如 `BuilderPopover`）
- `src/lib/playground/__tests__/add-next-key-variable.test.ts`
- `src/components/results/__tests__/PathsTabSelection.test.tsx`

这意味着：

- 编译管线和时间工具有基本覆盖；构建器与同步逻辑有部分单元测试。
- 大量 UI、i18n、React Flow 交互仍依赖手动验证。
- 如果改动 UI 逻辑，至少要自己跑一遍 Playground 的关键路径（含 scenario 与 **自己动手** build 流程）。

## 13. AI 工具改动本项目时的工作准则

1. 先判断改动属于哪一层：场景数据、store、编译引擎、语义树、可视化、结果输出、样式。
2. 不要把它当成钱包项目处理；这里是教学 playground。
3. 任何涉及地址、context、network 的改动，都要再次确认“不生成主网地址”这条约束。
4. 任何新增语法或条件类型，都要同步考虑：
   - 编辑器高亮
   - 编译错误提示
   - 语义树解析
   - 路径分析
   - 中栏模拟控件
   - 右栏结果展示
   - glossary / 文案 / 测试
5. 如果某项功能涉及 `after()`、`P2TR`、`compare`，优先确认当前只是部分实现或未实现，不要在旧假设上继续堆代码。

## 14. 进一步参考文档

- `README.md`
  - 面向人类读者的项目介绍与快速运行说明。

- `SPEC.md`
  - 更完整的产品规格和设计意图，适合做大功能时参考。

- `docs/plans/2026-03-13-visual-builder-mvp-design.md` / `2026-03-13-visual-builder-mvp-implementation-plan.md`
  - 「自己动手」可视化构建 MVP 的产品与实现说明。

- `replit.md`
  - 一份较接近“架构速览”的实现说明，可作为补充。

---

如果你是 AI IDE，请把这个仓库理解成：

> 一个以 Zustand 为状态中心、以 bitcoinerlab 编译链路为计算核心、以 React Flow 为教学可视化载体的 Next.js 客户端应用。

主工作面在 `/playground`，主风险点在 `compiler.ts`、`path-analyzer.ts`、`miniscript-parser.ts`、`lib/flow/tree-to-flow.ts`（scenario）与 **`lib/builder/*` + `useBuilderSync.ts`（build）**，主产品约束是“纯前端、本地确定性、只做教学、不碰主网生产用途”。
