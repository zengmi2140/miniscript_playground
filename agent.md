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
- 可视化：React Flow (`@xyflow/react`) + Dagre
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

- `/playground`
  - 三栏 Playground，是项目主界面。
  - 入口组件：`src/app/playground/page.tsx`
  - 负责读取 URL 分享参数 `?s=`、场景参数 `?scenario=`、以及本地缓存会话。

- `/compare`
  - 当前只是 Coming Soon 占位页。
  - 入口组件：`src/app/compare/page.tsx`

- `/opengraph-image`
  - 动态 OG 图。
  - 入口：`src/app/opengraph-image.tsx`

## 6. 目录地图

```text
src/
  app/              Next.js 路由、布局、OG
  components/
    flow/           花费路径图与 React Flow 节点/边
    layout/         顶部导航
    playground/     三栏工作台、编辑器、条件面板
    results/        右侧结果 tabs
    scenarios/      首页场景卡片
    shared/         代码块、tooltip、popover 等通用组件
  lib/
    engine/         编译、路径分析、Miniscript 解析、时间工具、类型
    editor/         CodeMirror Policy 语法高亮
    flow/           语义树 -> React Flow 图
    glossary/       术语解释
    hooks/          自动编译、自动保存
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
  - policy 文本
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
  - 错误会被映射成中英文友好的 `FriendlyError`。

### 语义树与路径图

- `src/lib/engine/miniscript-parser.ts`
  - 将编译出来的 Miniscript 字符串（`result.miniscript`，含角色名）解析成自定义 `MiniscriptNode` 语义树。
  - 会剥离 wrapper 前缀，例如 `v:`、`c:`、`sln:`。

- `src/lib/flow/tree-to-flow.ts`
  - 把语义树转成 React Flow nodes/edges。
  - 用 Dagre 自动布局。
  - 节点状态只分为 `satisfied` / `pending` / `missing`。

- `src/components/flow/*`
  - `PathMap.tsx` 挂载 React Flow。
  - `FlowNodes.tsx` 定义 root/operator/condition 三类节点。
  - `PathEdge.tsx` 用实线/虚线/颜色表示 and/or/threshold 与满足状态。

### 花费路径分析

- `src/lib/engine/path-analyzer.ts`
  - 从 `satisfier()` 的 ASM、`nSequence`、`nLockTime` 推导 `SpendingPath`。
  - 输出签名、相对时间锁、绝对时间锁、哈希锁等条件。
  - UI 的 `Paths`、`Warnings`、`StatusBanner` 都依赖这份结构化结果。

### 自动保存与分享

- `src/lib/hooks/useAutoSave.ts`
  - 800ms debounce 保存到 localStorage。
- `src/lib/utils/storage.ts`
  - localStorage key: `miniscript-lab-session`
- `src/lib/utils/share.ts`
  - 分享链接把 payload 编码进 `?s=`。

## 8. 关键 UI 结构

### 左栏（240px）

- `src/components/playground/LeftPanel.tsx`
  - 预设场景列表（含"自己动手"Coming Soon 占位卡片）
  - Key 变量管理
  - Context / Network 选择

- `src/components/playground/KeyVariableManager.tsx`
  - 维护 policy 名称和公钥映射
  - 可随机生成测试公钥

### 中栏（flex-1）

- `src/components/playground/CenterPanel.tsx`
  - 顶部：Policy 编辑器（可折叠）
  - 中部：花费路径图
  - 路径图下方：状态结论横幅
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

7. 移动端没有完整 Playground。
   - `src/app/playground/page.tsx` 在移动端会显示 Desktop Required fallback。

8. `regtest` 网络已从 UI 和类型中移除。
   - `Network` 类型只有 `'testnet' | 'signet'`。

9. 路径图根节点已与第一层操作符合并。
   - 根节点直接显示顶层条件逻辑类型（都需要/任选一/k-of-n），而非通用的"花费条件"。
   - 单一叶子条件的策略不再创建根节点，直接显示条件节点。

10. `playgroundMode` 状态字段已在 store 中预留（`'scenario' | 'build'`），但 `'build'` 模式尚未实现。
   - 左栏中"自己动手"卡片目前只是 Coming Soon 占位。

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

### 修改路径图展示

- `src/lib/flow/tree-to-flow.ts`
- `src/components/flow/FlowNodes.tsx`
- `src/components/flow/PathEdge.tsx`

### 修改 Policy 编辑器

- `src/components/playground/PolicyEditor.tsx`（编辑器组件，现位于中栏顶部）
- `src/components/playground/CenterPanel.tsx`（编辑器的容器/折叠逻辑）
- `src/lib/editor/policy-language.ts`（CodeMirror 高亮规则）

### 修改右侧输出面板

- `src/components/playground/RightPanel.tsx`（上部花费路径 + 下部 Tab 分区 + 拖拽分割条）
- `src/components/results/*`
- 若要补充概念说明，也看 `src/components/shared/ExplainPopover.tsx`

### 修改全局视觉或主题

- `src/app/globals.css`
- `tailwind.config.js`
- `src/lib/theme/context.tsx`

### 修改分享、恢复、持久化

- `src/app/playground/page.tsx`
- `src/lib/hooks/useAutoSave.ts`
- `src/lib/utils/storage.ts`
- `src/lib/utils/share.ts`

## 12. 测试覆盖现状

当前测试集中在 `src/lib/engine/__tests__/`：

- `compiler.test.ts`
- `miniscript-parser.test.ts`
- `time-utils.test.ts`

这意味着：

- 编译管线和时间工具有基本覆盖。
- UI、i18n、store、React Flow 交互几乎没有自动化测试。
- 如果改动 UI 逻辑，至少要自己跑一遍 Playground 的关键路径。

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

- `replit.md`
  - 一份较接近“架构速览”的实现说明，可作为补充。

---

如果你是 AI IDE，请把这个仓库理解成：

> 一个以 Zustand 为状态中心、以 bitcoinerlab 编译链路为计算核心、以 React Flow 为教学可视化载体的 Next.js 客户端应用。

主工作面在 `/playground`，主风险点在 `compiler.ts`、`path-analyzer.ts`、`miniscript-parser.ts` 和 `tree-to-flow.ts`，主产品约束是“纯前端、本地确定性、只做教学、不碰主网生产用途”。
