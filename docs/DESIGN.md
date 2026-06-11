# Miniscript Lab — 设计系统

> **本文档是视觉与设计规格的参考来源。**  
> 色彩、字体、间距、组件与 Scenario 路径图节点尺寸以本文为准；**运行时实现**以 [`src/app/globals.css`](../src/app/globals.css) 与 [`tailwind.config.js`](../tailwind.config.js) 为准。若文档与代码不一致，以代码为准；改稿时应同步更新本文与样式文件。

产品与路由级**意图**见 [`PRODUCT.md`](PRODUCT.md)；具体布局与实现以代码与 [`ARCHITECTURE.md`](ARCHITECTURE.md) 为准。

---

## 1. 设计原则

1. **克制** -- Miniscript 天然信息密度高，UI 必须留白充分，单屏最多一个焦点
2. **温暖** -- 比特币社区是温暖的，用暖色调，不用冷色调
3. **诚实** -- 不要花哨装饰，每个视觉元素都传递信息
4. **分层** -- 默认只展示一层抽象，底层细节"可达"但不"扑面而来"

### 首页通识区（`/`）

首屏与 **HomepageHero**、**HomepageWallets**、底部 CTA 与全站一致；**页尾 CTA 区**为双按钮：主按钮 **橙色实心**（`btc-500` / `hover:bg-btc-400`，`home.cta.primary`）指向 `/playground`，次按钮（`home.cta.secondary`）指向 `/resources`。中间各节（**TransitionSection**：地址背后的脚本 + 单签 vs 多签；**ScriptComplexitySection**：Script 复杂性四堵墙；**MeetMiniscriptSection**：定义 + 竖向概念板块 + 特性卡；**IntroApplicationsSection**：场景卡片，实现为 `src/components/home/*` 与 `src/components/intro/*`）使用与全站一致的 **surface / border / btc-500 / text-*** token。大节标题与引导句可采用 **居中** 排版以区分于 Playground 工作台；正文卡片与代码块仍遵循 §4 间距与圆角。

**Applications「原子交换」**：Policy / Miniscript / Bitcoin Script 三列以 **`HEX`** 表示 hash160 摘要占位（非具体 hex）；Playground 中栏与路径图在 `htlc-atomic` 预设下语义一致（`--semantic-hashlock` 仍用于哈希条件节点与 chip）。

---

## 2. 色彩系统

### 深色模式（默认）

使用 Tailwind `stone` 暖灰色阶作为基底，比特币橙作为品牌点缀。

```css
/* ===== 背景层级 ===== */
--bg-base:      #0C0A09;  /* stone-950, 最深背景 */
--bg-surface:   #1C1917;  /* stone-900, 卡片/面板背景 */
--bg-elevated:  #292524;  /* stone-800, 悬停/抬升表面 */
--bg-overlay:   #44403C;  /* stone-700, 下拉/弹出覆盖 */

/* ===== 比特币橙色阶 ===== */
--orange-50:    #FFF8F0;
--orange-100:   #FFECD4;
--orange-200:   #FFD6A5;
--orange-300:   #FFBA6B;
--orange-400:   #FF9F35;
--orange-500:   #F7931A;  /* ★ 主品牌色 */
--orange-600:   #D97706;
--orange-700:   #B45309;
--orange-800:   #92400E;
--orange-900:   #78350F;

/* ===== 文字 ===== */
--text-primary:   #FAFAF9;  /* stone-50, 主要文字 */
--text-secondary: #A8A29E;  /* stone-400, 次要文字 */
--text-muted:     #78716C;  /* stone-500, 弱化文字 */
--text-inverse:   #0C0A09;  /* 橙色按钮上的文字 */

/* ===== 边框 ===== */
--border-subtle:  #292524;  /* stone-800 */
--border-default: #44403C;  /* stone-700 */
--border-hover:   #57534E;  /* stone-600 */
--border-active:  #F7931A;  /* 激活态用橙色 */

/* ===== 语义色（路径可视化） ===== */
--semantic-key:       #EAB308;  /* yellow-500, 暖金色 = 签名/密钥 */
--semantic-timelock:  #F7931A;  /* 比特币橙 = 时间条件 */
--semantic-hashlock:  #A78BFA;  /* violet-400, 柔紫 = 哈希/密码学 */
--semantic-satisfied: #22C55E;  /* green-500 = 已满足 */
--semantic-locked:    #57534E;  /* stone-600 = 锁定/不可用 */
--semantic-warning:   #EF4444;  /* red-500 = 警告 */
```

### 亮色模式

```css
--bg-base:        #FAFAF9;  /* stone-50 */
--bg-surface:     #FFFFFF;
--bg-elevated:    #F5F5F4;  /* stone-100 */
--text-primary:   #1C1917;  /* stone-900 */
--text-secondary: #57534E;  /* stone-600 */
--text-muted:     #A8A29E;  /* stone-400 */
--border-subtle:  #E7E5E4;  /* stone-200 */
--border-default: #D6D3D1;  /* stone-300 */
```

### 语义色使用规则

| 语义      | 颜色                         | 用在哪                          |
| ------- | -------------------------- | ---------------------------- |
| 签名 / 密钥 | `--semantic-key` 暖金        | pk() 节点、密钥 chip、签名开关         |
| 时间条件    | `--semantic-timelock` 比特币橙 | older() / after() 节点、时间滑块    |
| 哈希条件    | `--semantic-hashlock` 柔紫   | sha256() / hash160() 节点、哈希开关 |
| 已满足     | `--semantic-satisfied` 绿   | 满足条件的路径边框/背景                 |
| 锁定/不可用  | `--semantic-locked` 暖灰     | 不可满足的路径、灰化的节点                |
| 警告/错误   | `--semantic-warning` 红     | 编译错误、安全警告                    |

---

## 3. 字体

```css
/* 正文 / 标题 */
font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;

/* 代码 / 等宽 */
font-family: "IBM Plex Mono", ui-monospace, "Cascadia Code", monospace;
```

均通过 `next/font/google` 加载，字体文件自动托管。

### 字号层级

| 用途          | 大小               | 字重             | 字体                |
| ----------- | ---------------- | -------------- | ----------------- |
| 页面标题        | 32px / 2rem      | 700 (Bold)     | Plus Jakarta Sans |
| 区域标题        | 20px / 1.25rem   | 600 (SemiBold) | Plus Jakarta Sans |
| 正文          | 14px / 0.875rem  | 400 (Regular)  | Plus Jakarta Sans |
| 次要说明        | 12px / 0.75rem   | 400            | Plus Jakarta Sans |
| 代码 / Policy | 13px / 0.8125rem | 400            | IBM Plex Mono     |
| 状态标签（大号）    | 18px / 1.125rem  | 600            | Plus Jakarta Sans |
| 条件 chip     | 12px / 0.75rem   | 500 (Medium)   | Plus Jakarta Sans |

---

## 4. 间距与圆角

- 基础间距单位：4px
- 面板内边距：16px（紧凑）或 24px（宽松）
- 卡片圆角：12px
- 按钮圆角：8px
- Chip/Tag 圆角：6px
- 图节点圆角：10px

---

## 5. 组件规范

### 按钮

| 类型        | 背景                   | 文字                 | 边框                 | 用途         |
| --------- | -------------------- | ------------------ | ------------------ | ---------- |
| Primary   | `--orange-500`       | `--text-inverse`   | 无                  | 编译、主要操作    |
| Secondary | `--bg-elevated`      | `--text-primary`   | `--border-default` | 次要操作       |
| Ghost     | 透明                   | `--text-secondary` | 无                  | Tab 切换、工具栏 |
| Danger    | `--semantic-warning` | 白                  | 无                  | 清除、删除      |

hover 态：Primary → `--orange-600`；Secondary → `--bg-overlay`

### 条件 Chip

```
┌─────────────────────┐
│ 🔑 Alice 签名        │  ← semantic-key 背景色 10% 透明度 + 左侧色条
└─────────────────────┘
┌─────────────────────┐
│ ⏳ 等待 30 天         │  ← semantic-timelock 背景色 10% 透明度 + 左侧色条
└─────────────────────┘
┌─────────────────────┐
│ 🔐 揭示 Secret       │  ← semantic-hashlock 背景色 10% 透明度 + 左侧色条
└─────────────────────┘
```

每个 chip 高度 28px，内边距 6px 12px，左侧 3px 色条标识类型。

### 路径卡片

```
┌──────────────────────────────────────────┐
│ 路径 A: 正常花费  ●  可满足                │  ← 标题 + 状态
│──────────────────────────────────────────│
│ 🔑 Alice  🔑 Service                     │  ← 条件 chips
│──────────────────────────────────────────│
│ 预估费用: ~110 vB                         │  ← 成本信息
└──────────────────────────────────────────┘
```

激活态（当前条件可满足）：左边框变为 `--semantic-satisfied` 绿色 3px。  
不可用态：整体透明度降低到 50%，灰色左边框。

---

## 6. Playground：Scenario 路径图节点尺寸

以下仅针对 **scenario 模式**下 React Flow 花费路径图中的节点外观（宽度、高度、圆角、边框、padding、字号）。节点**语义与交互**（根节点显示「都需要」等）见 [`ARCHITECTURE.md`](ARCHITECTURE.md)「语义树与路径图」与 [`PRODUCT.md`](PRODUCT.md)「限制与易误判点」。

| 节点类型           | 宽度    | 高度   | 说明                              |
| -------------- | ----- | ---- | ------------------------------- |
| RootNode       | 200px | 44px | 动态显示顶层条件逻辑类型（都需要/任选一/k-of-n） |
| OperatorNode   | 120px | 36px | 显示 "都需要" / "任选一" / "k-of-n"   |
| ConditionNode  | 160px | 40px | 显示叶子条件（签名/时间锁/哈希锁），内容居中        |

- 所有节点圆角 10px，边框 2px solid
- React Flow 画布背景 transparent，不显示网格点
- 边框颜色和背景色根据状态规则（绿/琥珀/灰）动态变化（规则见上文语义色）
- 节点内部水平 padding 12px，文字 font-size 13px，font-weight 500
