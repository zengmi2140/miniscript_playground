# Miniscript Lab

把 Bitcoin 的花费条件讲清楚。

一个**场景优先、以花费路径为中心**的 Bitcoin Miniscript 教学实验室。

---

## 核心理念

在展示 Policy / Miniscript / Script 技术细节之前，先让用户看清楚：**谁能花这笔钱，什么时候能花，需要哪些条件**。

## 功能特性

- **场景画廊** — 6 个预设场景：个人单签、多签、2FA 双重验证、遗产继承、退化多签金库、保险柜
- **Playground** — 三栏 IDE，实时编译 Policy → Miniscript → Script → Descriptor → Address
- **花费路径地图** — React Flow 可视化，节点颜色实时反映当前条件满足状态（framer-motion 300ms 过渡动画）
- **条件模拟** — 勾选已有密钥、已知哈希原像、拖动时间滑块，实时预览哪条路径可用
- **GlossaryTooltip** — 悬停节点查看 `pk`、`older`、`after`、`sha256` 等操作符的双语解释
- **双语支持** — 中文 / English 完整双语，一键切换
- **分享链接** — 将 Policy、变量、模式等编码为 `?s=` 参数，一键复制分享；通过该链接可还原会话

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

Descriptor 库使用 `@bitcoinerlab/descriptors/dist/descriptors` 入口，并通过构建别名避免打入 Ledger 硬件钱包 SDK；说明见 `SPEC.md`「关键实现细节」第 5 条。

## 设计约束

- **纯前端** — 零后端、零 API 请求、零区块链连接
- **无 LLM / AI** — 所有计算完全本地确定性执行
- **MVP 仅支持 P2WSH (SegWit v0)** — Taproot 为 V2 规划
- **地址仅生成测试网** — 永不生成主网地址

## 本地运行

```bash
npm install
npm run dev
```

启动后访问终端输出的地址（通常是 http://localhost:3000）。

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 场景画廊首页
│   ├── playground/         # Playground 页
│   ├── compare/            # 对比页（Coming Soon）
│   └── opengraph-image.tsx # 动态 OG 图片
├── components/
│   ├── flow/               # React Flow 节点与路径图
│   ├── layout/             # Header
│   ├── playground/         # 三栏布局与各面板
│   ├── results/            # 右侧结果标签页
│   ├── scenarios/          # 场景画廊组件
│   └── shared/             # 公共组件（GlossaryTooltip 等）
└── lib/
    ├── engine/             # 编译引擎（compiler, parser, path-analyzer）
    ├── flow/               # tree-to-flow 转换
    ├── glossary/           # Miniscript 术语词典
    ├── i18n/               # 双语翻译文件
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
