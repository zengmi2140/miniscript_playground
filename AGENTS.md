# AGENTS.md

## 你的角色

你是 ScriptWise 的开发 Agent。

本项目是一个**纯前端**的 Bitcoin Miniscript 教学实验室：以花费路径为中心，让用户理解「谁能花、何时能花、需要哪些条件」，再展示 Policy / Miniscript / Script / Descriptor / Address。技术栈为 Next.js App Router + React + TypeScript + Zustand + React Flow（版本号以 `package.json` 为准）。

## 开始前阅读

分两个阶段执行：

### 阶段 1：定位（理解任务属于哪个领域）

读完本文件后，如果仅凭角色描述无法理解用户意图，按需补读：
- 不理解产品做什么 / 功能范围 → 读 [docs/PRODUCT.md](docs/PRODUCT.md)
- 不理解技术结构 / 模块划分 → 读 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 不清楚当前进度 / 待办任务 → 读 [docs/task/TASKS.md](docs/task/TASKS.md)

### 阶段 2：执行（确定实现所需的阅读深度）

理解任务后，按以下优先级确定最小阅读集；如果任务涉及多个改动维度，取各匹配项的并集：

**1. Quick Tasks（仅读括号内文件）**
- i18n 文案修改（仅改 `zh.ts` / `en.ts`，必须中英文同时添加）
- CSS / Tailwind 类名微调（仅 `DESIGN.md` + 目标组件）
- 测试快照更新（仅目标测试文件）
- 文档 typo 修复（仅目标文档）
- 依赖版本升级（仅 `package.json` + `package-lock.json`，不跨大版本）

**2. 按改动类型的最小阅读集**

| 改动类型 | 最小阅读集 |
|----------|----------|
| i18n 文案 | `zh.ts` / `en.ts` |
| 样式 / 设计 token | DESIGN.md + 目标组件 |
| 引擎 / 编译 / 路径分析 | ARCHITECTURE.md |
| 路由 / 产品范围 / 预设场景 | PRODUCT.md |
| 新增 `src/lib/` 子目录或跨模块重构 | ARCHITECTURE.md + PRODUCT.md |
| 通用功能（跨多层） | 全部文件 |

**3. 兜底：阅读全部**
以上两条都不适用时，阅读 PRODUCT.md + ARCHITECTURE.md + TASKS.md，改样式时另读 DESIGN.md。

**运行时行为以代码为准**；若文档与代码冲突，以代码为准并修正文档。
若用户最新需求与文档冲突，以用户明确表达的需求为准，但必须同步更新相关文档。

## 工作原则

- 一次只处理一个明确目标；需求不明确先向用户提问。
- 不擅自增加产品范围之外的功能。
- 改动落地后，在同一批改动中同步更新受影响的文档（详见下方「文档同步触发矩阵」）。
  - 每轮开发结束后，更新 [docs/task/TASKS.md](docs/task/TASKS.md)：将已完成的任务条目从「未完成」区**移动**到「已完成」区（不是仅在原位打勾）

### 文档同步触发矩阵

| 改动类型 | 需更新的文档 |
|----------|-------------|
| 新增 / 删除路由 | PRODUCT.md |
| 新增 / 删除 `src/lib/` 子目录 | ARCHITECTURE.md |
| 新增 / 修改颜色变量、字号或设计 token | DESIGN.md |
| 新增 / 修改预设场景 | PRODUCT.md「预设场景」段 |
| 改变编译管线、数据流或核心链路 | ARCHITECTURE.md「核心运行链路」段 |
| 修改硬边界（如新增允许的网络请求） | AGENTS.md「不允许做的事」段 |
| 仅修改组件内部实现、不改变对外接口 | 无需更新文档 |

> 判断原则：如果改动影响了文档中**事实性描述**的准确性，就必须同步更新；仅涉及内部实现细节且未改变对外行为时可跳过。
- 新增预设场景时，按 [docs/RUNBOOKS.md「新增预设场景」](docs/RUNBOOKS.md#新增预设场景) 执行必改项、条件联动点与验收清单。
- 文档「最低标准」：合并后的文档不得与本次改动在事实层面矛盾；改动与文档已有描述完全无关时不必为改而改。
- 面向用户的界面文案优先走 i18n（`zh.ts` / `en.ts`），不在引擎或组件里写死中文串。

## 不允许做的事（硬边界）

> **本段是项目硬边界的单一事实源。** 其他文档（README.md、ARCHITECTURE.md 等）仅引用本段，不重复声明。若需修改硬边界，只改此处。

- 不引入后端 / 数据库 / 登录 / 云同步；保持纯前端。
- 不连接钱包、不查询 UTXO、不构造或广播交易、不处理私钥 / 助记词 / 真实签名。
- 不上传用户策略；唯一允许的网络请求是**只读**拉取主网链尖高度。
- 不把主网地址作为默认；地址仅用于 testnet / signet 教学展示。
- 不手改 `src/lib/engine/block-height-fallback.generated.ts`（构建产物）。
- 仅使用 npm（锁文件 `package-lock.json`）；勿提交 pnpm / yarn 锁。

> **编码约定与反模式**：见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)「编码约定」与「反模式」段落。

## 完成标准

只有满足以下全部量化条件，才能说明任务完成：

- 改动按预期工作，并已实际验证（运行 / 测试 / 查看输出，而非仅推断）。
- `npm run lint` → **0 error**（warning 不阻塞）。
- `npm run typecheck` → **0 error**。
- `npm run test` → **全部通过**（无失败用例）。
- 改动文档时 `npm run doc:health` → **通过**（校验链接路径、锚点、反引号代码文件名引用）。
- `npm run build` → 成功（可选，视改动范围；涉及编译管线、路由、SSR 时必须验证）。
- 新增逻辑在对应 `__tests__/` 旁补了测试（参考既有覆盖；引擎与 builder 覆盖率阈值 70%）。
- 受影响的 PRODUCT.md / ARCHITECTURE.md / docs/DESIGN.md 已同步更新。
- [docs/task/TASKS.md](docs/task/TASKS.md) 已更新（勾选已完成项，写明已验证 / 未验证与下一步）。

> 上述 `lint / typecheck / test / doc:health` 已由 `.github/workflows/ci.yml` 在 PR / push 上强制执行（不跑 `build`，因其 prebuild 会联网）。
