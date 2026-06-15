# TASKS.md

> 跨会话任务交接看板。默认只读本文件了解当前状态；历史记录见
> [`TASKS-ARCHIVE.md`](TASKS-ARCHIVE.md)，除非明确要求追溯历史，否则不读取归档。
> 每轮开发结束后，将完成项从「当前任务」移动到「最近完成」，并记录实际验证结果。

## 当前任务

- [ ] **SEC-P2-07 GitHub Actions 供应链加固**：仓库内加固已完成；待在 GitHub 为 `main` 启用 branch protection，要求 `checks` CI、严格同步分支并禁止管理员绕过。

## 接下来

> 发布前安全任务按 P1 → P2 → P3 执行。每项的风险依据、复现信息和推荐实现均链接至
> [`SECURITY-REVIEW-2026-06-15.md`](SECURITY-REVIEW-2026-06-15.md)。

### P1：发布硬门槛

### P2：发布前建议完成

### P3：低风险加固

- [ ] **SEC-P3-01 自托管钱包展示图标**：将授权明确的固定图标放入 `public/`，其余使用 initials，移除 Google favicon 取源依赖并收紧图片白名单。详见[安全审查：Google favicon 静态资源外连](SECURITY-REVIEW-2026-06-15.md#p3google-favicon-静态资源外连)。
- [ ] **SEC-P3-02 生产偏好 Cookie 添加 Secure**：HTTPS 环境追加 `Secure`，本地 HTTP 开发保持可用；继续使用固定 Cookie 名和值白名单。详见[安全审查：偏好 Cookie 缺少 Secure](SECURITY-REVIEW-2026-06-15.md#p3偏好-cookie-缺少-secure-标记)。
- [ ] **SEC-P3-03 建立开源漏洞报告渠道**：新增 `SECURITY.md`，声明支持版本、私密报告入口、响应时限和协调披露流程。详见[安全审查：缺少开源漏洞报告渠道](SECURITY-REVIEW-2026-06-15.md#p3缺少开源漏洞报告渠道)。

## 阻塞

- **SEC-P2-07 外部设置**：内置浏览器当前未登录 GitHub，本机无 `gh`，现有 GitHub connector 未提供 branch protection API。用户登录 GitHub 后继续配置。

## 最近完成

### 2026-06-15：SEC-P2-03 修复 dev 依赖 advisory

- [x] **测试工具链升级**：Vitest 与 coverage 同步升级至 4.1.8，传递 Vite 升至 8.0.16；Vite 8 不再保留旧 esbuild 依赖，完整 `npm audit` 从 2 critical / 3 high 降为 0。
- [x] **Vite 8 兼容**：Vitest 配置改用 Oxc automatic JSX transform，保持项目 `tsconfig` 的 Next.js `jsx: preserve` 契约不变。
- [x] **持续门禁**：CI 新增 `npm audit --omit=dev --audit-level=high`，Dependabot 每周检查 npm 与 GitHub Actions。
- 验证结果：完整 audit 与生产 audit 均 0 漏洞；lint 0 error，typecheck、doc:health、build:check 通过；coverage 50 files / 347 tests 全过，engine lines 88.73% / functions 96.2%。

### 2026-06-15：SEC-P2-06 链尖响应完整性与多源共识

- [x] **共享严格校验**：运行时与构建脚本共用 `block-height-consensus.mjs`，仅接受纯数字安全整数、合理主网高度范围，以及相对可信参考不超过 10,080 块的漂移。
- [x] **并行双源共识**：三个端点并行请求，至少两个来源在 2 块容差内一致才采用；双源分歧时取较低值，单源离群值被忽略。
- [x] **可信回退**：无共识时运行时使用既有可信缓存或 generated fallback；构建保留现有 generated 高度，缺失时继续遵守 CI fail-closed 契约。
- 验证结果：响应格式、漂移、离群值、双源一致、无共识与构建回退共 27 项定向测试通过；doc:health、build:check 通过。

### 2026-06-15：SEC-P2-05 链尖请求隐私最小化

- [x] **最小化 fetch**：三个链尖端点统一显式使用只读 GET、`credentials: omit`、`referrerPolicy: no-referrer`、`cache: no-store` 与单请求超时。
- [x] **网络白名单**：enforced CSP 的 `connect-src` 仅允许同源与 mempool.space、blockstream.info、blockchain.info。
- 验证结果：fetch options 与 CSP 契约测试通过；lint 0 error，typecheck、doc:health、build:check 通过。

### 2026-06-15：SEC-P2-02 基础安全响应头与 CSP

- [x] **baseline headers**：全站设置 `Referrer-Policy: no-referrer`、`X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、Permissions-Policy 与 `Cross-Origin-Opener-Policy: same-origin`。
- [x] **nonce enforced CSP**：Middleware 每请求生成 nonce，Next 框架脚本与主题首帧脚本共用 nonce；`script-src` 使用 `strict-dynamic`，连接域名与 Worker 来源按最小集合限制。
- [x] **生产验证**：本地 production response 返回 enforced CSP 和全部 baseline headers；fragment 恢复与 Worker / WASM 编译在 CSP 下正常，浏览器控制台无 warning/error。
- 验证结果：CSP / header 契约测试 3 项通过；lint 0 error，typecheck、doc:health、build:check 通过。

### 2026-06-15：SEC-P1-02 Policy 编译资源隔离

- [x] **确定性输入预算**：编译、分享与 legacy session 共用 4KB 文本、64 节点、32 层嵌套、单门限 8 分支、32 个 Key、64 字符 ID 与规范公钥校验；超限返回 `limit` 友好错误，不调用 WASM。
- [x] **Worker 故障边界**：完整 `compile + parseMiniscript` 移入 Web Worker；主线程保留 500ms debounce、generation 淘汰和 5 秒超时，超时、crash、WASM abort / OOM / assertion 后终止并重建 Worker。
- [x] **恢复回归**：覆盖预算真值表、超时、fatal 重建、旧请求淘汰，以及恶意门限输入失败后 `pk(Alice)` 仍可成功编译。
- 验证结果：lint 0 error；typecheck、doc:health、build:check 通过；coverage 47 files / 337 tests 全过，engine lines 88.09% / functions 95.89%；浏览器实测 2-of-3 Worker 编译出 3 条路径且控制台无 warning/error。

### 2026-06-15：SEC-P2-04 默认开发服务仅监听 localhost

- [x] **安全默认值**：`dev` / `start` 显式绑定 `127.0.0.1`；当前 Next 15 默认不传 `-H` 仍会暴露 Network 地址，因此未依赖框架默认值。
- [x] **显式 LAN 入口**：新增 `dev:lan` / `start:lan`，仅在贡献者主动选择时监听 `0.0.0.0`；ARCHITECTURE 运行命令同步更新。
- 验证结果：`npm run dev` 启动输出的 Local 与 Network 均为 `http://127.0.0.1:3000`。

### 2026-06-15：SEC-P1-01 分享链接隐私迁移

- [x] **fragment-only 分享**：分享链接改为 `/playground#s=<payload>`，使用无 padding Base64URL；Playground 监听初始 hash 与 `hashchange` 恢复会话。
- [x] **清理旧格式**：按本轮产品决定不兼容旧 `?s=`，query 中的 `s` 不再读取，场景与 build query 仍按原优先级工作。
- [x] **隐私防线**：全站增加 `Referrer-Policy: no-referrer`，PRODUCT / ARCHITECTURE / Runbook 与文档路由契约同步更新。
- 验证结果：分享、URL 状态和 doc-health 定向测试 29 项通过；typecheck、doc:health、build:check 通过。

### 2026-06-15：SEC-P2-01 分享 payload 解码前限长

- [x] **统一分享上限**：生成端与恢复端共用 4KB Policy、32 个 Key、64 字符名称 / ID、66 字符公钥与 16KB decoded payload 上限；应用不再生成自身无法恢复的链接。
- [x] **解码前拒绝恶意输入**：在 `atob()` 前校验 Base64URL 规范字符集、padding 禁止、encoded 字符数与预估 decoded bytes，覆盖超长和非法字符回归。
- 验证结果：定向测试 22 项通过；typecheck、doc:health、build:check 通过。

### 2026-06-15：发布前安全审查文档

- [x] **安全风险梳理**：从发布前安全视角审查纯前端部署、分享 payload、外部网络请求、XSS sink、依赖审计、Vercel / Next 安全头与客户端 DoS 风险。
- [x] **审查报告沉淀**：新增 `docs/task/SECURITY-REVIEW-2026-06-15.md`，记录风险分级、潜在后果、发布前推荐修复顺序与已确认的正面安全项。
- [x] **二次复核完善**：逐项对照代码与生产响应，补充每个问题的复核结论和最佳解决方案；新增 WASM 编译实例污染、链尖响应完整性、GitHub Actions 供应链与 `SECURITY.md` 风险，并修正 HSTS、query 长度和 favicon 隐私影响判断。
- [x] **安全任务排期**：将 12 项风险按 P1 / P2 / P3 写入「接下来」，每项使用稳定 ID，并链接回安全审查中的问题详情与最佳解决方案。
- 验证结果：`npm audit --omit=dev --json` 生产依赖 0 漏洞；完整 audit 为 2 critical / 3 high；lint / typecheck / doc:health / coverage（45 files、320 tests）/ build:check 全部通过，构建未改写链尖 generated 文件；生产站点已有 HSTS，约 36KB query 返回 414。

### 2026-06-14：ScriptWise 产品亮点建议文档

- [x] **建议沉淀**：将面向 bitcoiner 与 Miniscript 技术用户的亮点增强建议整理为 `docs/task/IMPROVEMENT-PROPOSALS.md`（原 `SCRIPTWISE-WOW-IDEAS.md` 与 `CONTENT-ROADMAP.md` 合并）。
- [x] **优先级梳理**：明确路径透镜、Witness Stack 展示、Policy Health Check 为最推荐的前三个方向，并补充威胁模型、反向解释、成本 / 隐私 / 可用性比较等后续增强。
- 验证结果：`npm run doc:health` 通过。

### 2026-06-12：README 社区化重写

- [x] **定位重构**：将 README 从产品、工程与内部约束混杂的说明，重写为面向比特币开源社区访客的项目介绍。
- [x] **内容精简**：保留项目价值、主要体验、安全边界、本地启动与参与入口；移除完整技术栈、目录树、内部构建说明和 Roadmap。
- [x] **贡献入口修正**：贡献者阅读材料仅保留产品与架构文档，不把面向开发 Agent 的 `AGENTS.md` 列为人类贡献者必读项。
- [x] **事实约束**：未虚构 LICENSE、CONTRIBUTING 或线上 Demo；详细产品与工程信息继续委托现有文档。
- 验证结果：`doc:health` / lint / typecheck 通过；coverage 45 files、320 tests 全过。

### 2026-06-12：README 与历史引用清理

- [x] **README 精炼**：场景画廊改为首页 6 个应用场景，导航统一为“首页 / Playground / 资源”，删除废弃对比模式 Roadmap，并移除易过时的具体动画时长描述。
- [x] **对比占位清理**：删除废弃页面及 PRODUCT / ARCHITECTURE / i18n 引用，资源导航改用 `nav.resources`。
- [x] **历史快照目录清理**：删除 ARCHITECTURE、TypeScript exclude 与文档健康检查中的旧目录约定；保留协议名 `SegWit v0`。
- 验证结果：`doc:health` / lint / typecheck 通过；coverage 45 files、320 tests 全过。
- 构建结果：`npm run build:check` 成功，路由清单不再包含废弃对比页，链尖 generated 文件构建前后 SHA-256 一致。

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
