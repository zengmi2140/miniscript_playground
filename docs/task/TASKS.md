# TASKS.md

> 跨会话任务交接看板。默认只读本文件了解当前状态；历史记录见
> [`TASKS-ARCHIVE.md`](TASKS-ARCHIVE.md)，除非明确要求追溯历史，否则不读取归档。
> 每轮开发结束后，将完成项从「当前任务」移动到「最近完成」，并记录实际验证结果。

## 当前任务

暂无进行中的任务。

## 接下来

暂无排队任务。

## 阻塞

暂无阻塞项。

## 最近完成

### 2026-06-12：P2 Harness 加固

- [x] **HARNESS-P2-1 文档事实检查**：`doc:health` 增加 App Router / PRODUCT 路由一致性、zh/en i18n AST 结构、网络数据外发和 Node / CI / coverage / build 配置契约检查。
- [x] **HARNESS-P2-2 Runbook 扩充**：新增编译与时间锁语义、分享 payload、路由与 SSR 首帧、设计 token 四类高风险改动清单，并从 AGENTS / ARCHITECTURE 提供入口。
- [x] **HARNESS-P2-3 Node 版本固定**：`.nvmrc` 固定 Node 22，package engines 收紧为 `>=22 <23`，CI 与 Vercel 通过仓库契约使用 Node 22。
- 验证环境：Node `v22.19.0`；`npm ci` 成功。
- 验证结果：`doc:health` / lint / typecheck 通过；coverage 45 files、320 tests 全过；6 个检查器 fixture 测试覆盖路由、i18n、网络与配置的正负场景。
- 构建结果：`npm run build:check` 成功，链尖 generated 文件构建前后 SHA-256 一致。

### 2026-06-12：Harness 契约与构建验收闭环

- [x] **HARNESS-P1-1 网络契约对齐**：允许只读获取主网链尖高度与加载公共静态展示资源；继续禁止上传 Policy、密钥、会话或遥测数据，以及钱包连接、交易广播和业务写请求。
- [x] **HARNESS-P1-2 交接年份修正**：审计报告及交接记录统一为 2026 年，文件重命名为 `DOC-AUDIT-2026-06-12.md`。
- [x] **HARNESS-P1-3 覆盖率闭环**：CI 使用 `npm run test:coverage`；engine / builder / playground 的 lines/functions 阈值均为 70%。
- [x] **HARNESS-P1-4 可重复构建验收**：正式 `build` 保留链尖刷新；新增不运行 `prebuild` 的 `build:check` 给 CI；Plus Jakarta Sans / IBM Plex Mono 改为本地托管并附 SIL OFL。
- [x] **HARNESS-P1-5 TASKS 收敛**：旧历史迁入默认不读取的 `TASKS-ARCHIVE.md`，当前看板只保留当前、接下来、阻塞与最近完成。
- 验证：`doc:health` / lint / typecheck 通过；coverage 44 files、314 tests 全过；`build:check` 成功且链尖文件哈希不变；正式 `build` 从 mempool.space 刷新高度至 `953334` 后成功。
- 人工验收：首页与 Playground 生产页面正常；字体从站内 `/_next/static/media/` 加载；Playground 显示当前主网高度 `953,334`。

### 2026-06-12：Harness 工程二次审视

- [x] 新增预设场景 Runbook，记录必改项、条件联动点、测试和人工验收。
- [x] 新增并深化 `doc:health`，校验 Markdown 链接路径、锚点与代码文件引用。
- [x] 新增 CI，强制执行文档健康、lint、类型检查和测试。
- [x] README 的场景与目录事实委托 PRODUCT / ARCHITECTURE 等单一事实源。
- 验证：`npm run doc:health`、`npm run lint`、`npm run typecheck`、`npm run test` 均通过（314 tests）。

## 未验证

暂无未验证项。
