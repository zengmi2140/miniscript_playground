# PRODUCT.md

> 本文档描述**产品意图、范围与边界**。运行时行为以代码为准；若本文与代码不一致，以代码为准并应修正本文。
> 技术实现见 [ARCHITECTURE.md](ARCHITECTURE.md)；视觉与设计 token 见 [`DESIGN.md`](DESIGN.md)。

## 产品名称

ScriptWise。

## 产品简介

ScriptWise 是一个**场景优先、以花费路径为中心**的 Bitcoin **Miniscript 教学实验室**。

它先让用户理解「谁能花、何时能花、需要哪些条件」，再展示这背后的 Policy、Miniscript、Script、Descriptor 与 Address。所有计算都在浏览器本地完成，不连接钱包、不广播交易、不上传用户策略。

## 目标用户

正在学习比特币脚本、Miniscript、多签 / 时间锁 / 哈希锁等花费条件的开发者、学生与爱好者。

## 核心问题

比特币脚本与 Miniscript 信息密度高、抽象层多，初学者常遇到：

- 看到一段 Policy / Miniscript，不知道「到底谁能在什么条件下花这笔钱」。
- 多签、时间锁、哈希锁组合后，难以判断当前是否满足花费条件。
- Policy → Miniscript → Script → Descriptor → Address 各层关系不直观。
- 想动手搭一个花费策略，但缺少安全、即时反馈的环境。

ScriptWise 用「花费路径图 + 即时编译 + 时间/条件模拟」把这些抽象变得可见、可玩。

## 产品边界（不是什么）

- **不是**钱包、链上工具、IDE 替代品。
- 不连接区块链做钱包行为：不查询 UTXO、不构造或广播交易、不同步链状态。
- 不处理私钥 / 助记词 / 真实签名。
- **不上传**用户策略到任何服务器；纯前端，无后端 API / 数据库。
- 不依赖 LLM 或外部服务做核心计算。

**唯一的网络例外**：Playground 为教学展示「`after(区块高度)`」与混合时间轴，会**只读**请求公共 API 获取**当前主网链尖高度**（多端点顺序回退 + 短 TTL 缓存；全部失败时使用构建时写入的回退高度）。这不改变「不上传策略、不托管密钥」的边界。详见 ARCHITECTURE.md「链尖高度」。

## 技术边界

- 地址仅用于 **testnet / signet** 教学展示，**不得**将主网地址作为默认或隐式行为。
- **MVP** 实际编译与地址以 **P2WSH（wsh）** 为主；**P2TR（tr）** 为占位，UI 中通常禁用。若 `context === 'tr'`，编译器返回明确的「暂不支持」错误，不产出地址。
- 无 regtest。

## 路由与信息架构

| 路由 | 用途 |
|------|------|
| `/` | 首页：通识科普 + 双路径 CTA（去做 / 去读） |
| `/intro` | **重定向到** `/` |
| `/playground` | 三栏工作台；默认 **scenario** 模式 |
| `/playground?mode=build` | **build** 模式（自己动手搭策略树） |
| `/playground?scenario=<id>` | 加载预设场景 `id` |
| `/playground?s=<payload>` | 分享链接恢复会话（Base64 JSON） |
| `/resources` | 外部工具链接 + 推荐阅读 |
| `/compare` | V2 占位（Coming Soon），导航实际指向 Resources |
| `/opengraph-image` | 动态 OG 图 |

顶栏导航：**首页**、**Playground**、**Resource 资源**（文案以 i18n 为准）。

### 首页结构（`/`）

顺序：`HomepageHero` → `HookSection` → `TransitionSection` → `ScriptComplexitySection` → `MeetMiniscriptSection` → `IntroApplicationsSection` → `HomepageWallets` → `FAQSection` → 双路径 CTA + footer。所有 section 经 `ScrollReveal` 滚动淡入（尊重 `prefers-reduced-motion`）。**所有首页文案均走 `t()` 读取 i18n**（`home.*` 命名空间，中英文齐全）。

### Playground 三栏意图

- **左栏**：预设场景（含「自己动手」→ build）、Key 变量、Context / Network。
- **中栏**：Policy 编辑器；scenario → 花费路径图，build → 受约束策略树画布；状态横幅、条件开关、时间滑块。
- **右栏**：花费路径列表 + 技术 Tab（policy / miniscript / script / descriptor / address），可复制真实公钥等。
- **桌面优先**：窄视口显示 `MobileFallback`，无完整 Playground。
- **会话**：不自动持久化整段状态；分享通过 `?s=`。

### 双模式

- **scenario**：Policy（预设或自写）→ 编译 → 花费路径图与满足态。
- **build**：受约束策略树 ↔ Policy 双向同步；**非**自由拖线流程图；结构不兼容时进入 `text-led` / `compile-error` 等状态。

### 预设场景

预设数据在 `src/lib/scenarios/data.ts`。首页 Applications **6** 条卡片（见 `src/components/intro/data.ts`，含「穿越牛熊」`holder-timelock`）与 Playground 预设顺序对齐（`APPLICATION_PLAYGROUND_SCENARIO_IDS` + `sortScenariosForPlayground()`）；未列入 Applications 的预设排在末尾。

## 限制与易误判点

1. 仅 **wsh** 有实际编译产出；**tr** 为占位（禁用），`context === 'tr'` 时编译器返回明确错误。
2. **时间模拟**：`older()` 与区块高度型 **`after()`** 可结合链尖在时间轴上混合排序；Unix 时间戳型 `after()` 等可能简化或未完全模拟（以代码为准）。区块高度型 `after()` 在链尖未就绪时一律视为 pending。
3. **signet** 地址派生可能复用 testnet 网络对象（教学折中）。
4. **/compare** 未实现；导航指向 Resources。
5. **移动端**无完整 Playground（桌面优先）。
6. 无 regtest。
7. 路径图**根节点**即顶层逻辑（都需要 / 二选一 / k-of-n），单叶子可无根节点。
8. **build** 为 MVP：受约束树 + 同步，非任意拖线。
9. **htlc-atomic**：UI 以 `HEX` 占位展示 hash160 摘要，右栏给真实 hex。

## 暂不支持（当前版本范围之外）

- 钱包功能、UTXO 查询、交易构造 / 广播。
- 私钥 / 助记词 / 真实签名。
- 后端数据库、云同步、用户登录、团队协作。
- 主网作为默认网络、regtest。。
- 移动端完整 Playground。
