# Miniscript Lab — Claude Code

Bitcoin Miniscript 教学 Playground（Next.js App Router）：Policy → Miniscript → Script → Descriptor → Address，路径可视化与条件模拟。**纯前端**，仅 testnet/signet，不生成主网地址。

## Commands

```bash
npm install && npm run dev
npm run build && npm run lint && npm run test
```

## Read next

- **`AGENTS.md`**（中文）— 目录地图、运行链路、build/scenario 分工、已知限制、改动入口、测试位置（含首页通识区 `components/intro` 与 `v0/` exclude）。
- **`SPEC.md`** — 产品与体验规格（SSOT）。
- **`DESIGN.md`** — 视觉与设计系统（色板、字体、组件、Scenario 节点尺寸）。

Do not duplicate long architecture lists here; keep them in `AGENTS.md`.

**预设与首页 Applications**：左栏 `SCENARIOS` 条数、`htlc-atomic` 中栏展示与 `HEX` 占位、右栏真实输出等，以 **`AGENTS.md`**（§8、§10.13、§11）与 **`SPEC.md`** §3.1 为准。首页页尾主 CTA 为单一橙色按钮，进入 `/playground?mode=build`（build / 画布）。
