---
default_read: false
read_when: "仅在用户明确要求或需要追溯历史决策时读取"
---

# Tasks 已归档

> 本文件保存已完成的历史任务，默认不读取。当前状态与下一步只看
> [`TASKS.md`](TASKS.md)。

## 2026-06-12：Harness 工程与文档治理

- [x] 新增 `docs/RUNBOOKS.md`，将预设场景改动拆分为必改项、条件联动点、测试与人工验收。
- [x] 统一 AI 工具目录忽略规则，清理可再生成的工具依赖、数据库与日志。
- [x] 新增 `.github/workflows/ci.yml`，在 PR / push 上执行 `doc:health / lint / typecheck / test`。
- [x] README 场景列表与 `src/lib/` 目录树去重复，委托代码、PRODUCT 与 ARCHITECTURE。
- [x] 深化 `scripts/check-doc-health.mjs`：新增锚点存在性与代码文件名存在性校验。
- [x] 修复 TASKS 的悬空引用和审计报告锚点。
- [x] 将任务交接文档迁移至 `docs/task/TASKS.md`，建立按日期命名的文档审计报告。
- [x] AGENTS 增加最小阅读矩阵、Quick Tasks、文档同步触发矩阵和量化完成标准。
- [x] ARCHITECTURE 增加 Quick Reference、编码约定与反模式。
- [x] DESIGN 增加设计 token 与代码的映射方式。
- [x] 根目录内容建议归档为 `docs/CONTENT-ROADMAP.md`。

详细问题背景与原始建议见 [`DOC-AUDIT-2026-06-12.md`](DOC-AUDIT-2026-06-12.md)。

## 2026-05：修复与加固

- [x] 统一 `after(<height>)` 在编译、路径分析、路径图、StatusBanner 和 builder 中的语义。
- [x] `KeyVariable.policyName` 作为稳定身份，并实现 token-aware key 重命名。
- [x] 修复 Policy 回退时的 builder 同步状态。
- [x] 升级 Next.js 15 / React 19 并收紧依赖。
- [x] 完成键盘、屏幕阅读器与 reduced-motion 无障碍加固。
- [x] 抽取 threshold 共享逻辑，增强分享 payload 校验和 SSR locale/theme 一致性。
- [x] 建立核心模块覆盖率基线，修复 StatusBanner 多签缺失条件文案。

## 2026-05：核心功能

- [x] 首页通识内容、Applications、Wallets、FAQ 与双路径 CTA。
- [x] Playground 三栏工作台和 scenario / build 双模式。
- [x] Policy → Miniscript → Script → Descriptor → Address 编译管线。
- [x] 花费路径图、条件模拟、分享链接与预设场景库。
