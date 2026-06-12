# TASKS.md

> 跨会话任务交接看板：不同 Agent 接手时，先读此文了解项目进行到哪一步、接下来该做什么。
> 约定：
> - 未完成任务前打 `[ ]`，完成后打 `[x]` 并**将该条目移动到「已完成」区**（不是在原位仅打勾）。
> - 每轮开发结束后更新本文：移动已完成条目、补充已验证 / 未验证与下一步。
> 配合阅读 [AGENTS.md](../../AGENTS.md)、[docs/PRODUCT.md](../PRODUCT.md)、[docs/ARCHITECTURE.md](../ARCHITECTURE.md)。

## 未完成 / 待处理

暂无待处理任务。

## 最近改动摘要（2025-06-12 Harness 工程二次审视 · 收尾）

- **HARNESS-P2-1**：新增 `docs/RUNBOOKS.md`，将预设场景改动拆分为必改项、条件联动点、测试与人工验收；明确 `playground-order.ts` 和 tags 通常自动派生，避免固化过时的「固定六处」清单。
- **HARNESS-P3-1**：五类 AI 工具目录统一由根 `.gitignore` 忽略；移除仓库内 `.codegraph/.gitignore`，清理 `.kilo/node_modules` 与 CodeGraph 数据库 / 日志，保留工具设置、依赖清单和会话元数据。
- **HARNESS-P1-1**：新增 `.github/workflows/ci.yml`，在 PR / push 上强制执行 `doc:health / lint / typecheck / test`（不跑 `build`，因 prebuild 联网）；同步在 AGENTS.md「完成标准」加入 doc:health 与 CI 说明。
- **HARNESS-P1-2**：README 服从单一事实源——场景列表去掉错误的「9 个」与不存在条目，改委托 `src/lib/scenarios/data.ts` + PRODUCT.md；`src/lib/` 目录树由过时的逐目录列举收敛为顶层概览 + 委托 ARCHITECTURE.md「仓库结构」。
- **HARNESS-P0-1**：深化 `scripts/check-doc-health.mjs`，在「链接路径存在」之外新增 ①`*.md#anchor` 锚点存在性校验（按 GitHub slug 规则从标题生成）②反引号代码文件名在仓库中存在性校验。负向测试确认三类校验均能正确报错。
- **HARNESS-P0-2**：修复 TASKS.md 两处悬空引用（`AGENTS.md「Harness 工程标准流程」` 章节不存在）+ §11/§12 锚点漏写 `--已解决`。
- 验证：doc:health 通过 / lint 0 error / typecheck 0 error / test 314 passed。
- HARNESS-P0~P3 已全部完成。

## 已完成

> 以下为已落地并验证的主要工作，按轮次倒序排列。仅保留最近 2–3 轮详细记录，更早的归档到折叠区。

### 2025-06-12 轮次：Harness 工程二次审视 P2 + P3

- [x] **HARNESS-P2-1** 新增预设场景 Runbook，记录真实必改项、条件联动点、测试和人工验收，并从 AGENTS.md / ARCHITECTURE.md / PRODUCT.md 提供入口。
- [x] **HARNESS-P3-1** 统一 AI 工具目录忽略规则，移除冗余的 `.codegraph/.gitignore`，清理可再生成的 Kilo 依赖与 CodeGraph 数据文件。
- 验证：`git check-ignore` 确认五类目录均由根 `.gitignore` 覆盖；`.kilo/node_modules` 与 CodeGraph 数据库 / 日志已清理；doc:health / lint 0 / typecheck 0 / test 314 passed 全部通过。

### 2025-06-12 轮次：Harness 工程二次审视 P0 + P1

- [x] **HARNESS-P0-1** 深化 `scripts/check-doc-health.mjs`：新增锚点存在性校验 + 反引号代码文件名存在性校验（原仅校验链接路径）。负向测试确认能正确报错；`npm run doc:health` 通过。
- [x] **HARNESS-P0-2** 修复 TASKS.md 两处悬空引用（`AGENTS.md「Harness 工程标准流程」` 章节不存在）+ §11/§12 锚点漏写 `--已解决`。
- [x] **HARNESS-P1-1** 新增 `.github/workflows/ci.yml`，PR / push 强制 `doc:health / lint / typecheck / test`；AGENTS.md「完成标准」补充 doc:health 与 CI 说明。
- [x] **HARNESS-P1-2** README 场景列表与 `src/lib/` 目录树去重复，委托 `data.ts` / PRODUCT.md / ARCHITECTURE.md，消除「9 个」等事实矛盾。
- 验证：doc:health / lint 0 / typecheck 0 / test 314 passed 全部通过。

### 2025-06-12 轮次：文档归档架构重构

- [x] 将任务交接文档从根目录迁移至 `docs/task/TASKS.md`，审计报告重命名为按日期归档（`DOC-AUDIT-2025-06-12.md`），统一存入活跃任务区。
- [x] 更新 `AGENTS.md`：明确「开始前阅读」（阶段 1 定位 / 阶段 2 执行）与「工作原则」「完成标准」流程、审计报告命名规范、所有文档路径同步至新位置。

### 2025-06 轮次：文档工程 P3 收尾

- [x] **P3 #11** 根目录「改进建议.md」归档至 `docs/CONTENT-ROADMAP.md` → [详情 §11](DOC-AUDIT-2025-06-12.md#11-改进建议md-放在仓库根目录但不在-docs-下--已解决)
- [x] **P3 #12** 新增 `scripts/check-doc-health.mjs` 文档健康度自检（`npm run doc:health`） → [详情 §12](DOC-AUDIT-2025-06-12.md#12-缺少文档健康度自检机制--已解决)

### 2025-06 轮次：AGENTS.md 精简

- [x] 将「约定与反模式」整体迁移至 ARCHITECTURE.md，AGENTS.md 从 129 行精简至 95 行，仅保留一行引用。

### 2025-06 轮次：文档工程 P2 改进

- [x] **P2 #2** AGENTS.md 增加「按改动类型的最小阅读矩阵」 → [详情 §2](DOC-AUDIT-2025-06-12.md#2-agentsmd-的开始前必须阅读列表缺少条件分支)
- [x] **P2 #6** AGENTS.md 增加文档同步触发矩阵 → [详情 §6](DOC-AUDIT-2025-06-12.md#6-缺少文档同步的具体触发规则)
- [x] **P2 #7** ARCHITECTURE.md 将「常见改动入口」提取为顶部 Quick Reference 速查节 → [详情 §7](DOC-AUDIT-2025-06-12.md#7-architecturemd-混合了是什么和怎么改)
- [x] **P2 #8** DESIGN.md 补充 Token 使用方式说明（Tailwind 类名 vs CSS var()） → [详情 §8](DOC-AUDIT-2025-06-12.md#8-designmd-缺少与代码的双向映射)

### 2025-06 轮次：文档工程 P1 改进

- [x] **P1 #3** 任务交接文档按轮次/日期重组，增加「最近改动摘要」区域 → [详情 §3](DOC-AUDIT-2025-06-12.md#3-taskmd-的已完成列表过长且没有时间线)
- [x] **P1 #4** AGENTS.md 增加 Quick Tasks 例外清单，允许低风险改动跳过全文阅读 → [详情 §4](DOC-AUDIT-2025-06-12.md#4-agentsmd-缺少不需要读文档的快捷通道)
- [x] **P1 #5** 量化完成标准（lint/typecheck/test/build 的通过阈值） → [详情 §5](DOC-AUDIT-2025-06-12.md#5-完成标准缺少量化验收条件)
- [x] **P1 #9** 集中整理项目约定与反模式（Conventions & Anti-patterns） → [详情 §9](DOC-AUDIT-2025-06-12.md#9-缺少约定与反模式文档)

### 2025-06 轮次：文档工程修复

- [x] 重构 Harness 文档结构：精简 [AGENTS.md](../../AGENTS.md)，拆出 [docs/PRODUCT.md](../PRODUCT.md) 与 [docs/ARCHITECTURE.md](../ARCHITECTURE.md)，建立本 TASKS.md。
- [x] **P0 文档工程修复**（2025-06）：README 标题改为 ScriptWise、技术栈版本号改为引用 `package.json`、硬边界以 AGENTS.md 为单一事实源、ARCHITECTURE.md 「重要边界」段简化为引用。已验证 lint/typecheck/test 全绿。
  - [x] **P0 #1** 修复 README 技术栈版本不一致 → [详情 §1](DOC-AUDIT-2025-06-12.md#1-readme-与-agentsmd--architecturemd-存在大量重复且版本不一致)
  - [x] **P0 #10** 确立「单一事实源 + 引用」原则 → [详情 §10](DOC-AUDIT-2025-06-12.md#10-文档之间缺少单一事实源原则的严格执行)

### 2025-06 轮次：修复 / 加固

- [x] P1-01：统一 `after(<height>)` 语义（编译 → 路径分析 → 路径图 → StatusBanner → build 节点状态共用 `time-utils`）。
- [x] P1-02：`KeyVariable` 身份以 `policyName` 为稳定 ID。
- [x] P1-03：token-aware key 名替换，避免前缀 / 片段污染。
- [x] P1-04：Policy 回退到上一快照时恢复 builder 同步状态。
- [x] P1-05：升级 Next.js → 15.5.18、React → 19，清理传递依赖漏洞。
- [x] P1-06~10：键盘 / 屏幕阅读器无障碍修复 + reduced-motion 兜底。
- [x] P2 系列：依赖收紧、`typecheck` 脚本、`effectiveThresholdK` / `clampStoredThresholdK` 抽取、链尖回退保留已有高度、cookie 持久化 locale / theme（SSR 一致）、桌面 bootstrap 延迟到视口确认、分享 payload 解码加固。
- [x] P3 系列：footer 双 CTA、钱包 pills 迁移 `next/image`、统一 OG metadata、核心覆盖率基线。
- [x] StatusBanner 按最近路径呈现缺失条件，修复多签 k-of-n 误导文案。
- [x] 移除旧版首页区块与对应 i18n key，精简 `home.*` 命名空间。

### 2025-06 轮次：核心功能

- [x] 首页通识区重构：Hero / Hook / Transition / ScriptComplexity / MeetMiniscript / Applications / Wallets / FAQ / 双路径 CTA，全部走 i18n。
- [x] Playground 三栏工作台（左栏预设 + Key + Context、中栏 Policy 编辑器 + 路径图、右栏路径列表 + 技术 Tab）。
- [x] scenario 模式：Policy → 编译 → 花费路径图与满足态（React Flow + Dagre）。
- [x] build 模式：受约束策略树 ↔ Policy 双向同步（`useBuilderSync`）。
- [x] 编译管线：`compilePolicy` → miniscript → `wsh(...)` descriptor → 地址 / scriptPubKey → satisfier → 花费路径分析。
- [x] 分享与会话：状态编码为 `?s=`（Base64 JSON）+ 形状校验；`?scenario=` / `?mode=build` URL 同步。
- [x] 预设场景库（含「穿越牛熊」`holder-timelock`）与首页 Applications 6 条卡片对齐。

## 未验证

- [ ] 暂无待验证项。

## 下一步最佳动作

1. 阅读 [AGENTS.md](../../AGENTS.md) → [docs/PRODUCT.md](../PRODUCT.md) → [docs/ARCHITECTURE.md](../ARCHITECTURE.md) → 本文件。
2. 等待用户布置新任务；按 AGENTS.md「开始前阅读」与「工作原则」拆解后追加到「未完成 / 待处理」。
3. 开发中遵循 AGENTS.md 的工作原则与硬边界；落地后同步相关文档。
4. 完成后按 AGENTS.md「完成标准」自检：`npm run lint` / `typecheck` / `test` 通过，文档同步，将已完成条目**移动**到「已完成」区。
