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

---

## 3. 分阶段实施（剩余工作详解）

### 3.1 Phase A — 添加路径拦截（必做）

**涉及文件**  
[`node-ops.ts`](../src/lib/builder/node-ops.ts)（或新建 `builder/constraints.ts`）、[`BuilderPopover.tsx`](../src/components/builder/BuilderPopover.tsx)、全局搜索 `addChildNode` / `addSignatureChild` / `addTimelockChild`。

**实现要点**

1. `canAddChildToBinaryGroup(parent: StrategyGroupNode): boolean`  
   - `threshold` → `true`（或沿用现有深度策略）  
   - `all`/`any` → `parent.children.length < 2`
2. 在 `addChildNode`（或统一入口）内：若父为 `all`/`any` 且 `!canAddChildToBinaryGroup`，**返回未修改的 `tree`**（禁止静默丢错误，开发环境可 `console.warn`）。
3. `BuilderPopover` 在发起添加前若已满，**不调用** `updateStrategyTree`（双保险）。

**验收标准**

- [ ] `node-ops.test.ts`：构造 `all`/`any` 两子后再次 `addChildNode`，`assert` 树深度与结构不变。
- [ ] `threshold` 组仍可添加多子（≥3）。

---

### 3.2 Phase B — 画布隐藏「+ 添加条件」（必做）

**涉及文件**  
[`tree-to-flow.ts`](../src/lib/builder/tree-to-flow.ts) `buildFlowGraph`（约 `strategyNode.kind === 'group'` 末尾虚拟 `builderAddChild` 段）。

**实现要点**

- 当 `strategyNode.op` 为 `all` 或 `any`，且 `strategyNode.children.length >= 2` 时：**不** `push` 虚拟 `builderAddChild` 节点与边。

**验收标准**

- [ ] `tree-to-flow.test.ts`：对固定 `strategyTree`（含 2 子 `all`/`any`）断言无 `builderAddChild`（或等价 `isAddButton` 节点数）。
- [ ] 手工：两子后无「+」；删回一子后「+」再现。

---

### 3.3 Phase C — `changeGroupOp`：thresh → all/any 裁剪（必做）

**涉及文件**  
[`node-ops.ts`](../src/lib/builder/node-ops.ts) `changeGroupOp`；[`zh.ts`](../src/lib/i18n/zh.ts)、[`en.ts`](../src/lib/i18n/en.ts)；可选：在 `switchNodeOperator` 后触发 toast（[`playground-store.ts`](../src/lib/stores/playground-store.ts)）。

**实现要点**

- 当 `newOp` 为 `all` 或 `any`，且当前 `node.children.length > 2`：  
  `children = node.children.slice(0, 2)`（若需优先保留非占位，可先 `filter` 再 slice，需产品拍板）。
- 文案示例：`已切换为「都需要 / 任选一」，仅保留前两个子条件。`

**验收标准**

- [ ] 单元测试：3 子 `threshold` + 切到 `all` → 仅剩 2 子。
- [ ] `serializeStrategyTree` 输出可 `compile`（测试密钥下）。

---

### 3.4 Phase D — `importFromSemanticTree` 二叉化（必做）

**现状**  
[`from-semantic-tree.ts`](../src/lib/builder/from-semantic-tree.ts) 中 `case 'and':` / `'or':` 使用 `children: node.children.map(convertNode)`，语义树 **N 叉** 时会产生 **宽 `all`/`any`**，与 §1 冲突。

**实现要点**

1. 辅助函数：`foldChildrenToBinaryRight(children: StrategyNode[], op: 'all' | 'any'): StrategyNode`  
   - 若 `children.length <= 1`：直接返回单节点或需与 `group` 包装策略一致（见现有 `miniscript` 语义）。  
   - 若 `length === 2`：**一个** `group` 节点 `{ op, children: [c0,c1] }`。  
   - 若 `length > 2`：右结合：`group(op, [c0, foldRest(children.slice(1))])` 等价于嵌套 `all`/`any`。
2. `case 'and':` / `'or':` 使用 `foldChildrenToBinaryRight(convertedChildren, 'all'|'any')` 替代平铺 `map`。

**验收标准**

- [ ] `from-semantic-tree.test.ts`：构造 3+ 子 `MiniscriptNode` `and`/`or`，导入后 **DFS** 所有 `group` 且 `op` 为 `all`/`any` → `children.length <= 2`。
- [ ] 导入后 `serializeStrategyTree(tree)` 与直接 `compile` 无 Policy 语法错误（与现有密钥测试一致）。
- [ ] `useBuilderSync` 集成路径：编译成功回写画布后，树满足不变量（可抽一条 hook 测试或 E2E 说明）。

---

### 3.5 Phase E — 测试 fixtures 与矩阵（必做）

**文件**  
[`templates.ts`](../src/lib/builder/templates.ts)（`singleSigTemplate` / `sharedControlTemplate` / `nestedRecoveryLikeTree` 等测试用工厂）、[`serialize.test.ts`](../src/lib/builder/__tests__/serialize.test.ts)、[`templates.test.ts`](../src/lib/builder/__tests__/templates.test.ts)、`store-builder`/`storage-share` 等。

**实现要点**

- 遍历 fixtures：凡 `all`/`any`，子节点数 ≤2；若需三条件并列语义，改为 **嵌套 `group`**（与 `serialize` 右嵌套一致）。
- 全量 `vitest` + `lint`；CI 若存在 ecc 问题，对 `compiler` 全量测试的处理与现网一致即可。

**验收标准**

- [ ] `npm run lint` 通过。
- [ ] `npx vitest run`（或项目约定命令）通过。
- [ ] 代表性策略树（含嵌套 and/or）在本地可编译。

---

### 3.6 Phase F — SPEC.md 与 agent.md（必做）

**内容要求**（与 §8 旧稿一致，此处略作压缩）

| 文档 | 必须写清 |
|------|----------|
| **SPEC.md** | Build 画布：`all`/`any` 最多两直接子；「+」满员隐藏；thresh 多子；切换操作符时裁剪；语义树导入 N 叉→嵌套二叉。 |
| **agent.md** | 与 SPEC 对齐的 **二元 AND/OR**、**C/D 配套**、**serialize 已折叠**；修改清单含 `node-ops`、`tree-to-flow`、`from-semantic-tree`。 |

**验收标准**

- [ ] 全文搜索无「AND/OR 下可挂任意多个平铺子节点」类过时描述。
- [ ] 新人只读 `agent.md` 能定位到约束与相关文件。

---

## 4. 合并前自检清单（执行者）

1. `npm run lint`
2. `npx vitest run`（或项目脚本）
3. **Build 模式手工**：§2 中 E1–E4、E8；E5–E6；根占位选类型与画布编辑
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

- 旧分享链接 / localStorage 中 **宽树** 迁移脚本（一次性）。
- Build 模式 **仅**在 `compilationError` 时展示「底部条件来自上一成功编译」的副文案（与 `useCompiler` 清空策略协调，避免重复）。

---

*章节号若随 SPEC 变动，以标题关键词检索更新。*
