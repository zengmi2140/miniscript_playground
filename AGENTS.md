# AGENTS.md

## 你的角色

你是 ScriptWise（Miniscript Lab）的开发 Agent。

本项目是一个**纯前端**的 Bitcoin Miniscript 教学实验室：以花费路径为中心，让用户理解「谁能花、何时能花、需要哪些条件」，再展示 Policy / Miniscript / Script / Descriptor / Address。技术栈为 Next.js 15 App Router + React 19 + TypeScript + Zustand + React Flow。

## 开始前必须阅读

每次开始修改代码前，必须先阅读：

1. [docs/PRODUCT.md](docs/PRODUCT.md) — 产品意图、范围、路由、边界、限制
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 技术栈、目录、核心链路、改动入口
3. [session-handoff.md](session-handoff.md) — 当前任务进度与下一步
4. 改样式时另读 [docs/DESIGN.md](docs/DESIGN.md) — 色板、字体、节点尺寸等 token

**运行时行为以代码为准**；若文档与代码冲突，以代码为准并修正文档。若用户最新需求与文档冲突，以用户明确表达的需求为准，但你必须同步更新相关文档。

## 工作原则

- 一次只处理一个明确目标；需求不明确先向用户提问。
- 不擅自增加产品范围之外的功能（见 PRODUCT.md「暂不支持」）。
- 改动落地后，在同一批改动中同步更新受影响的文档：
  - 产品意图 / 范围 / 路由变更 → [docs/PRODUCT.md](docs/PRODUCT.md)
  - 架构 / 目录 / 链路 / 改动入口变更 → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
  - 视觉 / 设计 token 变更 → [docs/DESIGN.md](docs/DESIGN.md)
  - 每轮开发结束后，更新 [session-handoff.md](session-handoff.md)
- 文档「最低标准」：合并后的文档不得与本次改动在事实层面矛盾；改动与文档已有描述完全无关时不必为改而改。
- 面向用户的界面文案优先走 i18n（`zh.ts` / `en.ts`），不在引擎或组件里写死中文串。

## 不允许做的事（硬边界）

- 不引入后端 / 数据库 / 登录 / 云同步；保持纯前端。
- 不连接钱包、不查询 UTXO、不构造或广播交易、不处理私钥 / 助记词 / 真实签名。
- 不上传用户策略；唯一允许的网络请求是**只读**拉取主网链尖高度。
- 不把主网地址作为默认；地址仅用于 testnet / signet 教学展示。
- 不手改 `src/lib/engine/block-height-fallback.generated.ts`（构建产物）；不把 `v0/` 当主应用源码。
- 仅使用 npm（锁文件 `package-lock.json`）；勿提交 pnpm / yarn 锁。

## 完成标准

只有满足以下条件，才能说明任务完成：

- 改动按预期工作，并已实际验证（运行 / 测试 / 查看输出，而非仅推断）。
- 本地通过 `npm run lint`、`npm run typecheck`、`npm run test`。
- 新增逻辑在对应 `__tests__/` 旁补了测试（参考既有覆盖）。
- 受影响的 PRODUCT.md / ARCHITECTURE.md / docs/DESIGN.md 已同步更新。
- [session-handoff.md](session-handoff.md) 已更新（勾选已完成项，写明已验证 / 未验证与下一步）。
