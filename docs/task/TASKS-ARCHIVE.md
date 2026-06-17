---
default_read: false
read_when: "仅在用户明确要求或需要追溯历史决策时读取"
---

# Tasks 已归档

> 本文件保存已完成的历史任务，默认不读取。当前状态与下一步只看
> [`../../progress.md`](../../progress.md)。

## 2026-06-16：站点与发布收尾

- [x] 首页移动端横向溢出修复：Transition 卡片与钱包 Marquee 在移动端正确收缩；lint、typecheck、doc:health、coverage 通过，桌面 / 移动 Browser 实测无横向溢出。
- [x] 接入 Vercel Web Analytics：调整硬边界，挂载 `@vercel/analytics`，同步 PRODUCT / ARCHITECTURE；lint、typecheck、doc:health、生产依赖 audit、coverage、build:check 通过。
- [x] v0.1.0 开源首发准备：版本标记为 `0.1.0`，完成 GitHub Release，README 移除 Release badge；lint、typecheck、doc:health、coverage、build:check、生产依赖 audit 通过。

## 2026-06-15：生产配置、供应链与安全加固

- [x] 生产站点配置、i18n 收尾与 Git 历史瘦身：新增 `.env.production`，补齐中英文文案，清理 `.next` 历史；lint、typecheck、doc:health、build:check、coverage、生产依赖 audit 通过，Vercel production 部署成功。
- [x] 降低 Dependabot 版本更新噪声：npm / GitHub Actions 仅允许 minor / patch，合并更新 PR 并收紧并发；YAML 解析、lint、typecheck、test:coverage、doc:health 通过。
- [x] SEC-P3-02 生产偏好 Cookie 添加 Secure 标记：`https:` 追加 `Secure`，`http:` 本地保持不变，补测试；lint、typecheck、coverage 通过。
- [x] SEC-P2-07 GitHub Actions 供应链加固：Actions 固定 SHA，CI 只读权限，checkout 关闭凭据持久化，新增生产依赖 audit，配置 Dependabot，`main` branch protection 生效。
- [x] SEC-P2-03 修复 dev 依赖 advisory：Vitest / coverage 升级至 4.1.8，Vite 升至 8.0.16，完整 audit 和生产 audit 均 0；lint、typecheck、doc:health、build:check、coverage 通过。
- [x] SEC-P2-06 链尖响应完整性与多源共识：运行时与构建脚本共用严格校验，三端点并行双源共识，保留可信回退；定向测试、doc:health、build:check 通过。
- [x] SEC-P2-05 链尖请求隐私最小化：fetch 显式只读 GET、omit credentials、no-referrer、no-store 和超时；CSP `connect-src` 白名单收紧；契约测试、lint、typecheck、doc:health、build:check 通过。
- [x] SEC-P2-02 基础安全响应头与 CSP：设置 baseline headers、nonce enforced CSP 与 strict-dynamic；响应头契约测试、lint、typecheck、doc:health、build:check 通过。
- [x] SEC-P1-02 Policy 编译资源隔离：输入预算、Worker 隔离、超时 / crash / WASM fatal 重建和恢复回归；lint、typecheck、doc:health、build:check、coverage 通过，浏览器实测 2-of-3 编译正常。
- [x] SEC-P2-04 默认开发服务仅监听 localhost：`dev` / `start` 绑定 `127.0.0.1`，新增显式 LAN 入口；`npm run dev` 输出 Local 与 Network 均为 localhost。
- [x] SEC-P1-01 分享链接隐私迁移：分享改为 fragment-only `/playground#s=`，不兼容旧 `?s=`；分享 / URL / doc-health 定向测试、typecheck、doc:health、build:check 通过。
- [x] SEC-P2-01 分享 payload 解码前限长：统一分享上限，Base64URL 解码前拒绝超长和非法输入；定向测试、typecheck、doc:health、build:check 通过。
- [x] 发布前安全审查文档：完成纯前端部署、分享 payload、外部请求、XSS、依赖、响应头与客户端 DoS 风险梳理；生产依赖 audit 0，lint、typecheck、doc:health、coverage、build:check 通过。

## 2026-06-14：产品亮点建议

- [x] 将面向 bitcoiner 与 Miniscript 技术用户的亮点增强建议整理为 `docs/task/IMPROVEMENT-PROPOSALS.md`，明确路径透镜、Witness Stack 展示、Policy Health Check 为前三方向；`npm run doc:health` 通过。

## 2026-06-12：Harness 工程与文档治理

- [x] 新增 `docs/RUNBOOKS.md`，将预设场景改动拆分为必改项、条件联动点、测试与人工验收。
- [x] 统一 AI 工具目录忽略规则，清理可再生成的工具依赖、数据库与日志。
- [x] 新增 `.github/workflows/ci.yml`，在 PR / push 上执行 `doc:health / lint / typecheck / test`。
- [x] README 场景列表与 `src/lib/` 目录树去重复，委托代码、PRODUCT 与 ARCHITECTURE。
- [x] 深化 `scripts/check-doc-health.mjs`：新增锚点存在性与代码文件名存在性校验。
- [x] 修复 TASKS 的悬空引用和审计报告锚点。
- [x] 将任务交接文档迁移至当前任务看板（现为根目录 `progress.md`），建立按日期命名的文档审计报告。
- [x] AGENTS 增加最小阅读矩阵、Quick Tasks、文档同步触发矩阵和量化完成标准。
- [x] ARCHITECTURE 增加 Quick Reference、编码约定与反模式。
- [x] DESIGN 增加设计 token 与代码的映射方式。
- [x] 根目录内容建议归档为 `docs/task/IMPROVEMENT-PROPOSALS.md`（原 `CONTENT-ROADMAP.md` 已合并）。

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
