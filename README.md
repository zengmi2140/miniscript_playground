# Miniscript Lab

把 Bitcoin 的花费条件讲清楚。

一个**场景优先、以花费路径为中心**的 Bitcoin Miniscript 教学实验室。

---

## 核心理念

在展示 Policy / Miniscript / Script 技术细节之前，先让用户看清楚：**谁能花这笔钱，什么时候能花，需要哪些条件**。

## 功能特性

- **场景画廊** — 9 个预设场景（另含「自己动手」）：2-of-3 多签、多签 + 时间锁定、恢复密钥（`recoverykey`）、退化多签金库、保险柜、原子交换 HTLC（`htlc-atomic`）、DLC 简化（`dlc-simple`）、批量支付（`batch-payment`）、穿越牛熊（`holder-timelock`）
- **Playground** — 三栏 IDE，实时编译 Policy → Miniscript → Script → Descriptor → Address
- **编译错误体验** — 中英文摘要、可展开原始错误与复制、分类与建议（hints）；启发式在 Policy 编辑器内标出可能问题区间（非 IDE 级精度）
- **花费路径地图** — React Flow 可视化，节点颜色实时反映当前条件满足状态（framer-motion 300ms 过渡动画）
- **条件模拟** — 勾选已有密钥、已知哈希原像、拖动时间滑块，实时预览哪条路径可用
- **GlossaryTooltip** — 悬停节点查看 `pk`、`older`、`after`、`sha256` 等操作符的双语解释
- **双语支持** — 中文 / English 完整双语，一键切换
- **分享链接** — 将 Policy、变量、模式等编码为 `?s=` 参数，一键复制分享；通过该链接可还原会话
- **钱包支持** — 首页展示「已支持 Miniscript 的钱包」板块（软件 / 硬件两组）；旧 `/intro` 已重定向至首页
- **首页** — Miniscript 通识长文（挑战与对比、核心概念与技术栈、应用场景与局限等）；**页尾 CTA** 为双按钮：主按钮 `home.cta.primary` 进入 `/playground`，次按钮 `home.cta.secondary` 进入 `/resources`。Applications 内 **Try it / 上手一试**：有对应预设时跳转 `/playground?scenario=<id>`；`playgroundScenarioId` 为 `null` 时仅进入 `/playground`（详见 `src/components/intro/data.ts`）。「原子交换」卡片三列使用 `HEX` 占位表示 hash160；Playground 中栏与路径图见 [`AGENTS.md`](AGENTS.md) §4、§7、§9
- **首页导航** — 顶栏：首页 / Playground / Resources（`nav.scenarios` 等 i18n）

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 14 (App Router) + React 18 |
| 语言 | TypeScript (strict) |
| 状态管理 | Zustand |
| Bitcoin 库 | `@bitcoinerlab/miniscript-policies`, `@bitcoinerlab/miniscript`, `@bitcoinerlab/descriptors` |
| 可视化 | `@xyflow/react` (React Flow) + `dagre` |
| 动画 | `framer-motion` |
| 编辑器 | CodeMirror 6 |
| 样式 | Tailwind CSS + shadcn/ui |
| i18n | 自定义轻量 Context（无第三方依赖） |

Descriptor 库使用 `@bitcoinerlab/descriptors/dist/descriptors` 入口，并通过构建别名避免打入 Ledger 硬件钱包 SDK；说明见 [`AGENTS.md`](AGENTS.md)「编译管线」中 Descriptor 与构建。

视觉与设计 token（色板、字体、Scenario 路径图节点尺寸等）见 [`docs/DESIGN.md`](docs/DESIGN.md)。

## 设计约束

- **纯前端 / 不连接区块链** — 不连接钱包或节点、不查询 UTXO、不广播交易，也不上传策略到服务器；唯一的只读外部请求是为教学用的 `after(<height>)` 时间轴获取**当前主网链尖高度**（公共端点顺序回退 + 短 TTL 内存缓存；全部失败时使用 `prebuild` 生成的 [`block-height-fallback.generated.ts`](src/lib/engine/block-height-fallback.generated.ts)）
- **无 LLM / AI** — 所有计算完全本地确定性执行
- **MVP 仅支持 P2WSH (SegWit v0)** — Taproot 为 V2 规划
- **地址仅生成测试网** — 永不生成主网地址

## 本地运行

依赖安装请使用 **npm**，并以仓库根目录的 [`package-lock.json`](package-lock.json) 为准；不要使用 pnpm / yarn 另生成锁文件，以免与团队安装结果不一致。

```bash
npm install
npm run dev
```

代码检查：`npm run lint`。类型检查：`npm run typecheck`。测试：`npm run test`（Vitest）。

启动后访问终端输出的地址（通常是 http://localhost:3000）。

## 项目结构

完整开发说明见 **[`AGENTS.md`](AGENTS.md)**（产品与实现合并为单一文档）。以下为目录简版：

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 首页（通识长页）
│   ├── intro/              # 旧 /intro 路由，重定向至 /
│   ├── playground/         # Playground 页
│   ├── resources/          # 外部工具链接 + 推荐阅读
│   ├── compare/            # 对比页（Coming Soon）
│   └── opengraph-image.tsx # 动态 OG 图片
├── components/
│   ├── flow/               # React Flow 节点与路径图
│   ├── home/               # 首页各区块（Hero、Wallets 等，介绍页复用部分）
│   ├── intro/              # 介绍页各区块组件
│   ├── layout/             # Header
│   ├── playground/         # 三栏布局与各面板
│   ├── results/            # 右侧结果标签页
│   ├── scenarios/          # 场景画廊组件
│   └── shared/             # 公共组件（GlossaryTooltip 等）
└── lib/
    ├── engine/             # 编译引擎（compiler, policy-errors, policy-error-highlight, parser, path-analyzer）
    ├── flow/               # tree-to-flow 转换
    ├── glossary/           # Miniscript 术语词典
    ├── i18n/               # 双语翻译文件
    ├── playground/         # HTLC 展示遮蔽（htlc-display-mask）、add-next-key-variable 等
    ├── scenarios/          # 预设场景数据
    ├── stores/             # Zustand store
    └── utils/              # 工具函数（share, storage, time）
```

## Roadmap

- [ ] Taproot (P2TR) 支持
- [ ] /compare 对比模式
- [ ] 栈机模拟器（逐步执行 Script）
- [ ] 更多场景模板
- [ ] 移动端完整体验

---

> Miniscript Lab 仅用于教学目的。不产生任何主网地址，不连接任何区块链节点。
