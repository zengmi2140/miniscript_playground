# session-handoff.md

> 任务交接文档：不同 Agent 接手时，先读此文了解项目进行到哪一步、接下来该做什么。
> 约定：已完成任务前打 `[x]`，未完成打 `[ ]`。每轮开发结束后更新本文（勾选状态 + 已验证 / 未验证 + 下一步）。
> 配合阅读 [AGENTS.md](AGENTS.md)、[docs/PRODUCT.md](docs/PRODUCT.md)、[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 未完成 / 待处理

- [ ] 暂无待处理任务。新任务由用户布置后追加到本节。

## 已完成

> 以下为已落地并验证的主要工作（依据项目历史与现有实现整理，作为交接示例与模板）。

### 核心功能

- [x] 首页通识区重构：Hero / Hook / Transition / ScriptComplexity / MeetMiniscript / Applications / Wallets / FAQ / 双路径 CTA，全部走 i18n。
- [x] Playground 三栏工作台（左栏预设 + Key + Context、中栏 Policy 编辑器 + 路径图、右栏路径列表 + 技术 Tab）。
- [x] scenario 模式：Policy → 编译 → 花费路径图与满足态（React Flow + Dagre）。
- [x] build 模式：受约束策略树 ↔ Policy 双向同步（`useBuilderSync`）。
- [x] 编译管线：`compilePolicy` → miniscript → `wsh(...)` descriptor → 地址 / scriptPubKey → satisfier → 花费路径分析。
- [x] 分享与会话：状态编码为 `?s=`（Base64 JSON）+ 形状校验；`?scenario=` / `?mode=build` URL 同步。
- [x] 预设场景库（含「穿越牛熊」`holder-timelock`）与首页 Applications 6 条卡片对齐。

### 修复 / 加固（按 P 级别）

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

### 文档

- [x] 重构 Harness 文档结构：精简 [AGENTS.md](AGENTS.md)，拆出 [docs/PRODUCT.md](docs/PRODUCT.md) 与 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)，建立本 session-handoff.md。

## 未验证

- [ ] 暂无待验证项。

## 下一步最佳动作

1. 阅读 [AGENTS.md](AGENTS.md) → [docs/PRODUCT.md](docs/PRODUCT.md) → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) → 本文件。
2. 等待用户布置新任务；将其拆解后追加到「未完成 / 待处理」。
3. 开发中遵循 AGENTS.md 的工作原则与硬边界；落地后同步相关文档。
4. 完成后按 AGENTS.md「完成标准」自检：`npm run lint` / `typecheck` / `test` 通过，文档同步，更新本文 checkbox。
