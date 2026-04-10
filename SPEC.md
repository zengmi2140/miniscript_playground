# Miniscript Lab SPEC

## 3. 页面规格

### 3.1 首页（`/`）

产品着陆页：顶部 `Header`、`HomepageHero`（「把 Bitcoin 的花费条件讲清楚」）、Miniscript 通识区块（`src/components/intro/*`：The Challenge、Core Concepts 含 Technical Stack、Applications、Why Miniscript Matters）、**钱包支持区**（`HomepageWallets`）、**底部单一主按钮 CTA**（`home.cta.build`，橙色 `btc-500`，链接 `/playground?mode=build`）、全站 footer。实现：`src/app/page.tsx`（`'use client'`）。

**Hero 主 CTA**：主按钮锚点 `/#applications`（滚动至 Applications 区块）；次按钮进入 `/playground`（默认 scenario 模式，非 build）。

**Applications**：多场景标签切换 + Policy / Miniscript / Script 三层示例；各场景标题旁 **「上手一试」/ `Try it`**（`intro.applications.tryIt`）。数据在 `src/components/intro/data.ts`：当前 **6** 条每条均有 `playgroundScenarioId`（字符串）并跳转 `/playground?scenario=<id>`（`<id>` 须为 `src/lib/scenarios/data.ts` 中 `SCENARIOS[].id`）；若将来某条为 `null` 则仅 `/playground`（无预设加载）。示例顺序前两条为「多重签名」「多签 + 时间锁定」，第三条「恢复密钥」与预设 `recoverykey`（左栏展示为「恢复密钥」，`or(pk(Main),and(pk(Recovery),older(10000)))`）同一 Policy。另有 **原子交换 / DLC / 批量支付** 等卡片与预设 `htlc-atomic`、`dlc-simple`、`batch-payment` 对齐。**「原子交换」** 卡片三列 Policy / Miniscript / Script 使用 **`HEX`** 表示 hash160 摘要占位（非具体 hex）；Playground 中栏与路径图见 `AGENTS.md` §8 / §10.13，右栏技术输出仍为真实摘要。

**Playground 左栏预设 `SCENARIOS`**（不含「自己动手」）当前 **8** 条（`src/lib/scenarios/data.ts` 数组顺序）：`multisig-2of3`（2-of-3 多签）、`multisig-or-timelock`（多签 + 时间锁定）、`recoverykey`（**恢复密钥**，`Main`/`Recovery` + `older(10000)`）、`degrading-multisig`（退化多签金库）、`vault-hot-cold`（保险柜）、`htlc-atomic`（原子交换 HTLC，固定教学 hash160）、`dlc-simple`（DLC 简化，纯 `pk` + `Oracle_A`/`Oracle_B`）、`batch-payment`（批量支付，Alice/Bob/Charlie + `older(500)`）。**左栏 UI 展示顺序**与首页 Applications 一致（`APPLICATION_PLAYGROUND_SCENARIO_IDS`），未出现在 Applications 的预设（退化金库、保险柜）排在列表末尾；列表区域有限高度，首屏约 6 条可滚动。**已移除**预设：`single-key`（个人单签）、`2fa-recovery`（2FA + 超时恢复）。**历史**：该预设曾使用 `id`：`inheritance`，已改为 `recoverykey`；旧链接 `?scenario=inheritance` 不再加载此预设。退化金库与保险柜仅在 Playground 左栏提供，**不在**首页 Applications **六**条卡片中。首页 Applications **六**条均带 `playgroundScenarioId`，与预设 `multisig-2of3`、`multisig-or-timelock`、`recoverykey`、`htlc-atomic`、`dlc-simple`、`batch-payment` 对齐（详见 `src/components/intro/data.ts`）。

**不含**：首页不再展示旧版「科普区 / 使命 / 三步 / 功能」与 **首页场景卡片**。Playground 左栏场景列表由 `LeftPanel` 内联卡片渲染（`src/components/scenarios/ScenarioGallery.tsx` 保留在仓库，当前路由未挂载）。

**预加载**：`requestIdleCallback` 预热 Playground 相关模块（三栏、画布、编译器），减少进入 `/playground` 的等待。

**窄屏**：`md` 以下 Hero 与底部 CTA 展示 `home.playground.desktopHint`，与 Playground 内说明一致（桌面优先）。

**i18n**：`home.hero.*`、`home.wallets.*`、`home.cta.*`、`intro.applications.tryIt`；`src/lib/i18n/zh.ts` / `src/lib/i18n/en.ts` 采用嵌套结构，`t()` 通过 dot-path 解析；新增文案需同时补齐中英文与类型可达路径。Intro 长文正文目前以组件内中文为主。
