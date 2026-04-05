# Build 模式：AND/OR 二元子节点 — 实施计划（与仓库状态对齐）

本文档是 **可视化 Builder 约束** 与 **Policy/编译管线** 的单一事实来源；实施时请按 **§0 基线** 区分「已落地」与「待办」，避免与真实代码脱节。

---

## 0. 仓库当前基线（与本文档对齐）

### 0.1 已实现（无需重复开发，除非回归修复）

| 能力 | 位置 | 说明 |
|------|------|------|
| **Policy 序列化二元折叠** | [`src/lib/builder/serialize.ts`](../src/lib/builder/serialize.ts) | `all`/`any` 在序列化时输出 **右嵌套** 的 `and(a,and(b,c))` / `or(a,or(b,c))`，避免多参数 `and`/`or` 导致 `compilePolicy` 失败。 |
| **编译失败时清空语义树与路径** | [`src/lib/hooks/useCompiler.ts`](../src/lib/hooks/useCompiler.ts) | 无 `output.result` 时清空 `compilationResult`、`semanticTree`、`spendingPaths`，减轻「画布已更新、底部仍显示上一次成功」的错位。 |
| **序列化 / 编译相关单测** | [`serialize.test.ts`](../src/lib/builder/__tests__/serialize.test.ts)、[`compiler.test.ts`](../src/lib/engine/__tests__/compiler.test.ts) 等 | 覆盖嵌套 Policy 字符串与（若运行环境 ecc 正常）完整 `compile`。 |

### 0.2 已实现（与 Phase A–F 对齐）

| 目标 | 说明 |
|------|------|
| **A** | [`node-ops.ts`](../src/lib/builder/node-ops.ts)：`canAddChildToBinaryGroup`、`addChildNode` 拦截；[`BuilderPopover.tsx`](../src/components/builder/BuilderPopover.tsx) 前置校验。 |
| **B** | [`tree-to-flow.ts`](../src/lib/builder/tree-to-flow.ts)：二元组满员不渲染虚拟「+」。 |
| **C** | `changeGroupOp` 切换到 `all`/`any` 时 `children.slice(0,2)`；[`playground-store`](../src/lib/stores/playground-store.ts) `switchNodeOperator` + 底部 toast；i18n `builder.op.binaryTrimNotice`。 |
| **D** | [`from-semantic-tree.ts`](../src/lib/builder/from-semantic-tree.ts)：`foldBinaryGroupChildren` 右深二叉。 |
| **E** | 根占位与用户构建的树满足 ≤2 子于 `all`/`any`；单测 fixtures（`templates.ts`）已对齐。 |
| **F** | [`SPEC.md`](../SPEC.md)、[`agent.md`](../agent.md) 已补充二元规则与文件职责。 |

---

## 1. 目标与不变量（产品 + 数据）

### 1.1 目标

- **`strategyTree` 中** `op === 'all'` 或 `op === 'any'` 的分组：**`children.length ≤ 2`**（子占位符计入槽位）。
- 满员：**不渲染**虚拟「+ 添加条件」；**所有**向该父节点追加子节点的 API **不得**增加第三子。
- **`op === 'threshold'`**：行为保持现状（多子 + `k`）。
- **Phase C + D** 与 UI 规则 **同一版本交付**，否则 Policy 回写或「切换操作符」会再次产生 **宽 `all`/`any`**，与画布规则矛盾。

### 1.2 子节点计数（验收基准）

| 树内节点 | 占槽 |
|----------|------|
| `signature` / `timelock` / `hashlock` / 子 `group` | 各占 1 |
| `placeholder`（`child`） | 占 1 |
| `builderAddChild`（仅 React Flow） | 不占槽；空组靠它完成第一次添加 |

**满员**：`all`/`any` 且 `children.length >= 2`。

### 1.3 与已实现「序列化折叠」的关系

- **序列化折叠**保证：即使内存中曾存在宽树（旧存档、未完成迁移），**导出 Policy** 仍合法。
- **UI 二元约束**保证：用户 **正常操作** 下不再构造宽 `all`/`any`，与「画布即所见」一致。
- 两者 **叠加**：推荐 **UI 约束 + 保留序列化折叠**（不删除 `serialize` 中的 `foldBinaryAnd`/`foldBinaryOr`）。

---

## 2. 边界条件与处理策略

| ID | 场景 | 策略 | 验收要点 |
|----|------|------|----------|
| E1 | 空 `all`/`any`（0 子） | 显示「+ 添加条件」 | 仅 1 个虚拟添加入口 |
| E2 | 1 子 | 显示「+」 | 可再添加至 2 子 |
| E3 | 2 子（两实节点或 `实+占位`） | **不**显示「+」；`addChild*` 拒绝 | 树 `children.length` 仍为 2 |
| E4 | `wrapNodeInGroup` → `[node, placeholder]` | 已满 2 槽，同 E3 | 与 `tree-to-flow` 一致 |
| E5 | **threshold → all/any**，子数 >2 | **Phase C**：裁剪为 2 子（建议 `slice(0,2)`）+ i18n | 切换后 `all`/`any` 无 3+ 子；`serialize` 可编译 |
| E6 | **`importFromSemanticTree`**，语义树 N 叉 `and`/`or` | **Phase D**：转为 **右深二叉** `StrategyNode`（与 `serialize` 右嵌套 Policy 一致） | DFS 任意 `all`/`any` 满足 `children.length ≤ 2` |
| E7 | 根占位起手 / 画布构建的树 | 凡 `all`/`any` 子数 ≤2；需嵌套则用嵌套 `group` | 常见结构可编译 |
| E8 | 删除子节点 | 2→1 子后 **恢复**「+」 | 手工 + 单测 |
| E9 | 嵌套空 `group` | 子组按 **自身** `op` 递归应用 A/B 规则 | 空 AND 子组仍可显示「+」 |
| E10 | Policy **手粘**宽 `and` | 编译失败走现有逻辑；**可选**依赖 `serialize` 折叠修复旧存档导入 | 不强制画布与非法文本一致 |
| E11 | **`addChildNode` 被直接调用**（测试/未来功能） | 与 Popover 一致：父为 `all`/`any` 且已满 → no-op | `node-ops` 单测 |
| E12 | Build 模式 + 非空 Policy + **编译失败** + `strategyTree === null`（如 `restoreSession` 后从未成功编译） | `builderSyncState: compile-error`；若无树则 `createRootPlaceholderTree()`，避免画布长期停在「正在编译并同步画布…」 | [`useBuilderSync.ts`](../src/lib/hooks/useBuilderSync.ts)、[`useBuilderSync.test.ts`](../src/lib/hooks/__tests__/useBuilderSync.test.ts) |

---

## 3. 分阶段实施（历史记录与验收证据）

> 与 §6 一致：Phase A–F 已落地。本节保留设计摘要；**验收以仓库内测试为准**（避免与 §6 冲突）。

### 3.1 Phase A — 添加路径拦截

**涉及文件**  
[`node-ops.ts`](../src/lib/builder/node-ops.ts)、[`BuilderPopover.tsx`](../src/components/builder/BuilderPopover.tsx)。

**实现要点（摘要）**  
`canAddChildToBinaryGroup`；`addChildNode` 在满员 `all`/`any` 上返回未修改树；Popover 前置校验。

**验收证据**  
[`node-ops.test.ts`](../src/lib/builder/__tests__/node-ops.test.ts)。

---

### 3.2 Phase B — 画布隐藏「+ 添加条件」

**涉及文件**  
[`tree-to-flow.ts`](../src/lib/builder/tree-to-flow.ts)。

**实现要点（摘要）**  
`all`/`any` 且 `children.length >= 2` 时不生成虚拟 `builderAddChild`。

**验收证据**  
[`tree-to-flow.test.ts`](../src/lib/builder/__tests__/tree-to-flow.test.ts)。

---

### 3.3 Phase C — `changeGroupOp`：thresh → all/any 裁剪

**涉及文件**  
[`node-ops.ts`](../src/lib/builder/node-ops.ts)、[`playground-store.ts`](../src/lib/stores/playground-store.ts)、i18n `builder.op.binaryTrimNotice`。

**验收证据**  
[`node-ops.test.ts`](../src/lib/builder/__tests__/node-ops.test.ts)、[`serialize.test.ts`](../src/lib/builder/__tests__/serialize.test.ts)。

---

### 3.4 Phase D — `importFromSemanticTree` 二叉化

**涉及文件**  
[`from-semantic-tree.ts`](../src/lib/builder/from-semantic-tree.ts)。

**验收证据**  
[`from-semantic-tree.test.ts`](../src/lib/builder/from-semantic-tree.test.ts)。

---

### 3.5 Phase E — 测试 fixtures 与矩阵

**验收证据**  
[`templates.test.ts`](../src/lib/builder/__tests__/templates.test.ts)、[`serialize.test.ts`](../src/lib/builder/__tests__/serialize.test.ts)；全量 `npm run lint`、`npx vitest run`（见 [`CLAUDE.md`](../CLAUDE.md)）。

---

### 3.6 Phase F — SPEC.md 与 agent.md

**验收证据**  
[`SPEC.md`](../SPEC.md)、[`agent.md`](../agent.md) 中 Build / 二元 AND/OR / `useBuilderSync` 相关节。

---

## 4. 合并前自检清单（执行者）

1. `npm run lint`
2. `npx vitest run`（或项目脚本）
3. **Build 模式手工**：§2 中 E1–E4、E8；E5–E6、**E12**；根占位选类型与画布编辑
4. **Scenario 模式**：`loadScenario`、非 build 路径无回归
5. 若改动 i18n：中英键齐全

---

## 5. 风险与产品决策

| 风险 | 缓解 |
|------|------|
| Phase C 静默裁剪 | i18n 说明；或改为「禁止切换直至子数 ≤2」（需产品重开） |
| Phase D 改变画布形状 | 短提示「已拆成嵌套 AND/OR」 |
| 与 `serialize` 双重嵌套 | 右深二叉 `StrategyNode` 与 `serialize` 右嵌套 Policy **一致**，避免重复嵌套过深；若深度过大，沿用现有 `builderDepthWarning` |

---

## 6. 任务分解小结

| 阶段 | 内容 | 状态 |
|------|------|------|
| **Serialize 折叠** | `serialize.ts` 二元 Policy | **已完成** |
| **useCompiler 清空** | 无 `result` 时清空语义树/路径 | **已完成** |
| **A** | 拦截加子 | **已完成** |
| **B** | `tree-to-flow` 隐藏「+」 | **已完成** |
| **C** | `changeGroupOp` 裁剪 + i18n | **已完成** |
| **D** | `importFromSemanticTree` 二叉化 | **已完成** |
| **E** | fixtures + 测试 | **已完成** |
| **F** | SPEC + agent | **已完成** |

---

## 7. 可选后续（非必须）

- 旧分享链接中 **宽树** 迁移脚本（一次性）（Playground 已不再依赖 localStorage 会话恢复）。
- Build 模式 **仅**在 `compilationError` 时展示「底部条件来自上一成功编译」的副文案（与 `useCompiler` 清空策略协调，避免重复）。
- 暂缓或非本次范围的 QA 项见 [`qa-known-issues.md`](qa-known-issues.md)。

---

*章节号若随 SPEC 变动，以标题关键词检索更新。*
