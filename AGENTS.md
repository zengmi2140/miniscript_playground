# AGENTS.md

## 你的角色

你是 ScriptWise 的开发 Agent。本项目是一个**纯前端**的 Bitcoin Miniscript 教学实验室：以花费路径为中心，让用户理解「谁能花、何时能花、需要哪些条件」，再展示 Policy / Miniscript / Script / Descriptor / Address。技术栈为 Next.js App Router + React + TypeScript + Zustand + React Flow（版本号以 `package.json` 为准）。

## 开始前阅读

Before writing code：

1. 确认当前目录是仓库根目录。
2. 完整阅读本文件。
3. 读取根目录 [progress.md](progress.md)，了解当前任务、接下来、阻塞和未验证项。
4. 如果 `progress.md` 指向活跃交接，再读 [session-handoff.md](session-handoff.md)。
5. 按下方阅读路由补读最小必要文档；历史归档默认不读，仅在用户要求或需要追溯决策时读 `docs/task/TASKS-ARCHIVE.md`。
6. 完成前按「Verification Commands」实际验证；不得只凭推断声明完成。

| 任务类型 | 最小阅读集 |
|----------|------------|
| i18n 文案 | `src/lib/i18n/zh.ts` + `src/lib/i18n/en.ts` |
| 样式 / 设计 token | [docs/DESIGN.md](docs/DESIGN.md) + 目标组件 |
| 引擎 / 编译 / 路径分析 | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| 路由 / 产品范围 / 预设场景 | [docs/PRODUCT.md](docs/PRODUCT.md) |
| 新增 `src/lib/` 子目录或跨模块重构 | ARCHITECTURE + PRODUCT |
| 新增预设、编译语义、分享 payload、SSR 首帧、设计 token | [docs/RUNBOOKS.md](docs/RUNBOOKS.md) 对应章节 |
| 通用功能或无法归类 | PRODUCT + ARCHITECTURE + progress.md |

Quick tasks 可只读目标文件和必要上下文：文案双语文件、样式目标组件、目标测试、目标文档、或 `package.json` / `package-lock.json`。运行时行为以代码为准；若文档与代码冲突，以代码为准并修正文档；若用户最新需求与文档冲突，以用户明确需求为准，并同步更新相关文档。

## 工作原则

- One feature at a time：一次只处理一个明确目标；需求不明确先向用户提问。
- Stay in scope：不擅自扩大任务范围，不做与当前目标无关的重构、格式化或清理。
- 不擅自增加产品范围之外的功能。
- 改动落地后，在同一批改动中同步更新事实受影响的文档；触发条件见 [docs/RUNBOOKS.md](docs/RUNBOOKS.md#文档同步触发矩阵)。
- 每轮开发结束后更新根目录 [progress.md](progress.md)：记录完成项、验证结果、未验证项与下一步。
- 状态文件：[progress.md](progress.md) 是当前任务 / 进度唯一事实源；[feature_list.json](feature_list.json) 只记录机器可读 Harness 状态，不作为产品 backlog；[session-handoff.md](session-handoff.md) 只在中断、阻塞或交接时填写。
- 面向用户的界面文案优先走 i18n（`zh.ts` / `en.ts`），不在引擎或组件里写死中文串。

## 不允许做的事（硬边界）

> **本段是项目硬边界的单一事实源。** 其他文档（README.md、ARCHITECTURE.md 等）仅引用本段，不重复声明。若需修改硬边界，只改此处。

- 不引入后端 / 数据库 / 登录 / 云同步；保持纯前端。
- 不连接钱包、不查询 UTXO、不构造或广播交易、不处理私钥 / 助记词 / 真实签名。
- 不上传用户策略、密钥或会话数据；不新增业务写请求。
- 不把主网地址作为默认；地址仅用于 testnet / signet 教学展示。
- 不手改 `src/lib/engine/block-height-fallback.generated.ts`（构建产物）。
- 仅使用 npm（锁文件 `package-lock.json`）；勿提交 pnpm / yarn 锁。

> **编码约定与反模式**：见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)「编码约定」与「反模式」段落。

## 完成标准 / Definition of Done

- 改动按预期工作，并已实际验证（运行 / 测试 / 查看输出，而非仅推断）。
- `npm run lint` → **0 error**（warning 不阻塞）。
- `npm run typecheck` → **0 error**。
- `npm run test:coverage` → **全部通过**（无失败用例）；`src/lib/engine/**`、`src/lib/builder/**`、`src/lib/playground/**` 的 lines/functions 均不低于 70%。
- 改动文档或 Harness 契约时 `npm run doc:health` → **通过**（校验引用、路由、i18n、网络数据外发与配置契约）。
- `npm run build:check` → 成功（可选，视改动范围；涉及编译管线、路由、SSR 时必须验证），且不得刷新链尖回退文件。
- 正式构建 / 部署使用 `npm run build`，其 `prebuild` 会先刷新链尖回退文件。
- 新增逻辑在对应 `__tests__/` 旁补了测试（参考既有覆盖）。
- 受影响的 PRODUCT.md / ARCHITECTURE.md / DESIGN.md / RUNBOOKS.md 已同步更新。
- 根目录 [progress.md](progress.md) 已更新，写明完成项、验证结果、未验证项与下一步。

### Verification Commands

标准验证入口：

```bash
./init.sh
```

单独运行时使用：

```bash
npm run doc:health
npm run lint
npm run typecheck
npm run test:coverage
npm run build:check
```

### End of Session

1. 完整完成：更新 [progress.md](progress.md)，记录完成项、验证结果、未验证项和下一步。
2. 未完成、阻塞或需要交接：更新 `progress.md` 的 `Current State`，并填写 [session-handoff.md](session-handoff.md)。
3. `feature_list.json` 的 Harness 状态发生变化时，同步更新其 `status` 与 `evidence`。
4. 保持仓库 restartable：下一位 agent 应能从 `AGENTS.md` → `progress.md` → `./init.sh` 恢复。

> 上述 `lint / typecheck / test:coverage / doc:health / build:check` 由 `.github/workflows/ci.yml` 在 PR / push 上强制执行；CI 不运行会联网刷新的正式 `build`。
