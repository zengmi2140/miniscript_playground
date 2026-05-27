# Code Review Report — Miniscript Playground
生成时间：2026-05-26
范围：完整只读 Code Review，覆盖核心逻辑、Playground 状态链路、Builder、UI/UX、可访问性、性能、测试、依赖、构建与文档一致性。
## 验证结果
- `git status --short`：审查前为空；生成本报告前仍无代码改动。
- `npm run lint`：通过；有 1 个 warning：`src/components/home/HomepageWallets.tsx:43` 使用原生 `<img>`。
- `npm run test`：通过；28 个测试文件，220 个测试。
- `./node_modules/.bin/tsc --noEmit --incremental false`：通过。
- `npm run typecheck`：失败，缺少脚本。
- `npm audit --omit=dev --audit-level=moderate`：失败；15 个 production vulnerability（8 moderate，7 high），包含 direct `next` advisory。
- `npm run build`：本次审查未运行，因为 `prebuild` 会写入被 git 跟踪的 generated source。
## 总览
P0：未发现。
P1：10 项。主要集中在核心时间锁语义、keyVariables 身份/替换、Builder 状态同步、依赖安全与关键可访问性。
P2：15 项。主要是构建/文档/依赖维护、主题/语言 SSR、移动端挂载、分享载荷、状态语义和性能。
P3：7 项。主要是文档细节、lint warning、测试覆盖度、旧域名和 token 漂移。
## 整改状态（已更新）
> 截至当前分支最新提交（含批次 1/2/3），状态按「已解决 / 未解决」汇总如下；下文原始问题明细保留作归档，具体状态以本节为准。

### 已解决
- **P1**：P1-01、P1-02、P1-03、P1-04、P1-06、P1-07、P1-08、P1-09、P1-10
- **P2**：P2-01、P2-02、P2-03、P2-04、P2-05、P2-06、P2-07、P2-08、P2-09、P2-10、P2-11、P2-12、P2-13、P2-15
- **P3**：P3-01、P3-02、P3-03、P3-04、P3-05、P3-06、P3-07

### 未解决
- **P1-05（Audit / 依赖安全门禁）**：`npm audit --omit=dev --audit-level=moderate` 仍失败（当前 8 个漏洞，含 `next` 相关项）；需独立依赖升级专项继续处理。
- **P2-14（暂缓）**：首页/Playground 预加载策略，待性能专项（bundle analyzer + 指标基线）后再排期。
## 建议处理顺序
1. **第一批 — 核心正确性**：P1-01 + P1-02 + P1-03 合并处理。三者都触及「编译 / 路径 / key 身份 / 时间语义」，共享同一套回归测试集（`after(tip±N)`、`name !== policyName`、key rename、`A` vs `Alice` 子串冲撞）。
2. **第一批 — 顺手修**：P1-04（builder snapshot 卡死）独立小补丁，与第一批一起出。
3. **第一批 — 低成本动效兜底**：P1-10 与 P2-15 一起做。全局 `prefers-reduced-motion` + marquee 副本 `aria-hidden`，成本低、风险低，没有理由放后面。
4. **第二批 — 可访问性集中整改**：P1-06、P1-07、P1-08、P1-09 按组件批量处理（separator、Builder 节点 button 化、tooltip 统一、隐藏按钮 focus 策略）。
5. **第二批 — 安全与工程门禁**：
   - P1-05 先在 Next 14.x 内寻找 patched 版本（pin 到最新 14.x 补丁），并把 14 → 16 major 升级**单独立项**，配套 lint/test/typecheck/build 与重点回归；本批不直接跨大版本。
   - P2-01、P2-02、P2-04、P2-05、P2-06 一并补齐。
   - P2-03 仅采用半量修复：保留 `prebuild` 与 generated source 跟踪策略（这是 AGENTS §1/§3 写明的「构建可复现 + 离线可用」trade-off），仅修改「全端点失败时保留现有高度或在 CI fail，不再写更旧的固定 stub」。
6. **第三批 — UI/状态/分享/移动**：P2-07~13。其中：
   - **P2-14 暂缓**：首页 server 化收益依赖实际 bundle 数据，且涉及 `ScrollReveal` / 动画 / i18n context 的 client island 切分风险，本轮**先不改**，留待用 bundle analyzer 量化后再排期。
7. **最后 — 文档与小清理**：P3。
## P0 Blocking
未发现阻断级问题。
## P1 Major
### P1-01 `after(<block-height>)` 的模拟流逝没有贯穿 PathMap、路径分析与状态横幅
问题：`TimeSlider` 已把区块高度型 `after()` 转成相对 offset，但后续状态计算没有使用同一语义。`tree-to-flow` 对 `after` 只判断 `blockTipHeight >= node.value`，忽略 `currentTimeBlocks`；`path-analyzer` 对任何 `timelock_absolute` 直接标记不可满足；`StatusBanner` 只会为 relative timelock 生成等待文案。
影响：用户写 `and(pk(Alice), after(currentTip + 100))` 后，即使拖动时间滑块超过 100 blocks，路径图仍 pending，路径列表仍 locked；如果 `after(height)` 已经过链尖，路径图可能显示满足，但右侧路径和状态横幅仍不可花费，核心教学链路自相矛盾。
证据：
- `src/components/playground/TimeSlider.tsx:20-34`
- `src/lib/flow/tree-to-flow.ts:50-55`
- `src/lib/engine/path-analyzer.ts:81-88`
- `src/lib/engine/path-analyzer.ts:161-168`
- `src/lib/hooks/useCompiler.ts:10-17`
- `src/lib/hooks/useCompiler.ts:44-52`
- `src/components/playground/StatusBanner.tsx:51-56`
建议：把 `blockTipHeight` 与 ready 状态传入 `compile()` / `analyzeSpendingPaths()`；区块高度型 `after` 使用 `blockTipHeight + currentTimeBlocks >= afterValue`，或复用 `isAfterSatisfied()`。`tree-to-flow`、路径列表和 `StatusBanner` 使用同一 helper。补 `after(tip+N)`、`after(tip-N)`、Unix timestamp `after()` 的回归测试。
### P1-02 keyVariables 的 `name` / `policyName` 身份链路不一致，重命名会破坏 Policy 映射
问题：Key 管理器重命名时把 `name` 和 `policyName` 同时改成新值，但不会同步改 Policy 文本。分享 payload 又允许 `name !== policyName`。ConditionToggles 从 semantic tree/policy token toggle key，path-analyzer 却把同一 pubkey 映射到 `kv.name` 后再用 `availableKeys.has(cond.keyName)` 判断。
影响：用户把 Alice 重命名为 Guardian 后，原策略 `pk(Alice)` 仍在编辑器里，但替换表只认 Guardian，编译失败。分享或 legacy session 若含 `{ name: 'Alice', policyName: 'A' }`，UI 会 toggle `A`，路径分析检查 `Alice`，签名按钮永远无法让路径满足。
证据：
- `src/components/playground/KeyVariableManager.tsx:18-23`
- `src/lib/engine/compiler.ts:31-36`
- `src/components/playground/ConditionToggles.tsx:23-29`
- `src/components/playground/ConditionToggles.tsx:40-45`
- `src/lib/engine/path-analyzer.ts:18-22`
- `src/lib/engine/path-analyzer.ts:70-73`
- `src/lib/utils/share.ts:40-52`
建议：明确一个稳定条件 ID，建议用 `policyName` 贯穿 semantic tree、availableKeys、PathCondition；`name` 只做显示标签。或在重命名时原子 rewrite policy 与 strategy roleId。share/session 解码应校验唯一性、合法 identifier，并迁移旧 payload。
### P1-03 key 名替换使用裸 `replaceAll`，可能替换非 key token 或标识符子串
问题：`replaceKeyNames()` 对每个 `policyName` 在整个 policy/miniscript 字符串里做裸 `replaceAll`。按长度排序只能处理一部分前缀冲突，不能保证只替换 key operand。
影响：如果用户或分享 payload 添加名为 `or` 的 keyVariable，编译后的 miniscript 中 `or_b` / `or_i` 可能被替换损坏。如果 `policyName='A'` 且策略里有 `pk(Alice)`，会把 `Alice` 的子串替换掉，产生难以理解的 Miniscript 错误或错误的 `policyWithKeys` 展示。
证据：
- `src/lib/engine/compiler.ts:27-37`
- `src/components/playground/KeyVariableManager.tsx:15-23`
- `src/lib/utils/share.ts:40-52`
建议：不要对整段字符串做裸替换；改为 token-aware 替换，只替换 `pk(...)`、`multi(...)`、miniscript key 参数位置。至少使用 identifier 边界并跳过不在当前 compiled policy key set 中的 keyVariables。对 `A` vs `Alice`、`Key1` vs `Key10`、reserved fragment 名称补测试。
### P1-04 build 模式从 compile-error/text-led 恢复到旧快照时会卡在只读态
问题：`useBuilderSync` 在 `policy === lastBuilderPolicySnapshot` 时直接 return，发生在 compile-error/text-led 处理之前。如果用户把 Policy 文本改坏导致 `builderSyncState='compile-error'`，再把文本改回上一次 builder 生成的完全相同 policy，effect 会在快照相等处提前返回，不会把 `builderSyncState` 设回 `synced`。
影响：画布仍显示只读或错误状态，`BuilderCanvas` 根据 `builderSyncState !== 'synced'` 禁止编辑。用户必须再做一次无意义文本变更或重新进入 build mode 才能恢复。
证据：
- `src/lib/hooks/useBuilderSync.ts:42-47`
- `src/lib/hooks/useBuilderSync.ts:60-64`
- `src/components/builder/BuilderCanvas.tsx:49`
- `src/lib/hooks/__tests__/useBuilderSync.test.ts:164-181`
建议：在 `policy === lastBuilderPolicySnapshot` 且当前无 `compilationError` 时显式 `setBuilderSyncState('synced')`，或把快照 early-return 移到错误态 reconciliation 之后。新增 “invalid -> previous snapshot -> synced” 的 hook 测试。
### P1-05 Production audit 因 direct Next dependency 失败
问题：`npm audit --omit=dev --audit-level=moderate` 非零退出，包含 direct `next` high severity advisory。当前 direct dependency 是 `next@^14.2.15`。
影响：任何启用 production audit 的 CI/deploy 会失败；公开或自托管部署会继承 Next 相关 DoS/cache/request handling advisory，直到升级或缓解。
证据：
- `package.json:43`
- `package-lock.json:36`
- audit 输出：`next severity=high direct=True`，可通过 `next@16.2.6` 修复但属于 semver-major。
建议：**优先在 Next 14.x 内寻找 patched release，pin 到最新 14.x 补丁版以缓解 direct advisory**。14 → 16 跨双 major（App Router、缓存语义、headers/cookies API 等均有 breaking change），**作为独立维护任务**单独立项，先做依赖兼容性评估（`@bitcoinerlab/*`、`bitcoinjs-lib`、React 18 → 19 等连锁影响），再配套跑 lint/test/typecheck/build 与重点回归。本轮 Code Review 落地范围内只做 14.x 补丁升级 + audit 复测，不直接跨 major。
### P1-06 右栏分割手柄只能鼠标/触控拖动，键盘和读屏不可操作
问题：右栏上下分割手柄是普通 `<div>`，只有 pointer handlers，没有 `role="separator"`、`tabIndex`、`aria-valuenow/min/max` 或键盘事件。
影响：键盘用户无法调整“花费路径”和技术 Tab 的高度；读屏用户不知道这里是可调分隔条。
证据：
- `src/components/playground/RightPanel.tsx:88-117`
- `src/components/playground/RightPanel.tsx:130-139`
建议：改为可聚焦 separator：`role="separator"`、`aria-orientation="horizontal"`、`aria-valuemin/max/now`、`tabIndex={0}`。支持 ArrowUp/ArrowDown/Home/End 调整比例，补 focus ring、`pointercancel`、`lostpointercapture`。
### P1-07 Builder 画布节点是可点击 `<motion.div>`，但缺少键盘语义
问题：`NodeWrapper`、root placeholder、add-child 节点使用 `<motion.div onClick>` 承载编辑/添加动作，未提供 button role、tabIndex 或 Enter/Space 键处理。React Flow 的 `nodesFocusable={true}` 只能让节点被选中，不能触发这些自定义 click 动作。
影响：build 模式的主要任务（选节点、添加条件、编辑策略）对键盘用户基本不可完成。
证据：
- `src/components/builder/BuilderNodes.tsx:41-70`
- `src/components/builder/BuilderNodes.tsx:236-244`
- `src/components/builder/BuilderNodes.tsx:268-276`
- `src/components/builder/BuilderCanvas.tsx:147`
建议：把可操作节点内部动作改成真实 `<button>`，或给节点容器加 `role="button"`、`tabIndex={0}`、`aria-label`、Enter/Space 触发与 focus 样式。注意 operator switch badge 与节点编辑动作不要嵌套冲突。
### P1-08 Tooltip / 术语解释只对 hover/pointer 可用，缺少焦点和读屏关系
问题：路径图条件节点、右栏 tab hover card、`GlossaryTooltip` 都依赖 pointer/mouse enter。tooltip `role="tooltip"` 没有与触发元素通过 `aria-describedby` 关联，也没有 focus/blur 触发。
影响：键盘与读屏用户拿不到 glossary 解释；触屏用户也很难触发 hover-only 说明。术语解释是教学产品核心信息。
证据：
- `src/components/flow/FlowNodes.tsx:125-148`
- `src/components/flow/FlowNodes.tsx:156-177`
- `src/components/playground/RightPanel.tsx:154-177`
- `src/components/shared/GlossaryTooltip.tsx:49-85`
建议：统一 tooltip 实现，优先使用 Radix/Base UI tooltip/popover。触发元素支持 hover + focus；为 tooltip 生成稳定 id 并用 `aria-describedby` 关联；触屏可改为点击/长按或显式 “?” 按钮；支持 Escape 关闭。
### P1-09 hover-only 隐藏按钮仍在 Tab 顺序中，且部分 icon-only 按钮无可访问名称
问题：`CodeBlock` 的复制按钮默认 `opacity-0`，只在 `group-hover` 显示；`KeyVariableManager` 的编辑/删除按钮容器也是 `opacity-0 group-hover:opacity-100`，这些 icon-only 按钮缺少 `aria-label`。
影响：键盘用户会 Tab 到看不见的按钮；读屏用户遇到无名称编辑/删除按钮，无法判断动作。用户容易在角色变量管理和复制 descriptor/address 时迷失。
证据：
- `src/components/shared/CodeBlock.tsx:30-34`
- `src/components/playground/KeyVariableManager.tsx:69-77`
建议：加 `group-focus-within:opacity-100`、`focus-visible:opacity-100` 与明确 focus ring。所有 icon-only 控件补 `aria-label` 或 `sr-only` 文本。若保持隐藏，隐藏时 `tabIndex={-1}`，显示后再进入 Tab 顺序。
### P1-10 钱包跑马灯无限运动且重复链接可聚焦
问题：`HomepageWallets` 将钱包数组复制 4 份并全部渲染成真实链接，再套无限 CSS marquee。CSS 只支持 hover 暂停，没有 `prefers-reduced-motion`，也没有键盘/触屏可用暂停机制。
影响：键盘用户需要穿过大量重复外链；对动效敏感用户无法关闭持续运动；触屏和键盘用户不能暂停。也增加无意义 DOM 与图片请求。
证据：
- `src/components/home/HomepageWallets.tsx:61`
- `src/components/home/HomepageWallets.tsx:74-77`
- `src/app/globals.css:145-164`
建议：只让第一组链接可聚焦，其余副本 `aria-hidden="true"` 且 `tabIndex={-1}`。增加显式暂停按钮。在 `@media (prefers-reduced-motion: reduce)` 下禁用 marquee，改为静态或横向滚动列表。
## P2 Minor
### P2-01 直接 import 了未声明的 direct dependency
问题：代码直接 import `@bitcoinerlab/secp256k1`，但 `package.json` 没有把它列为 direct dependency；当前只是通过 transitive dependency 出现在 lockfile。
影响：上游依赖调整后，干净安装可能突然失败；依赖关系不透明。
证据：
- `src/lib/engine/compiler.ts:5`
- `src/lib/playground/add-next-key-variable.ts:3`
- `package.json` 未声明 `@bitcoinerlab/secp256k1`
建议：把 `@bitcoinerlab/secp256k1` 加入 `dependencies`，并刷新 lockfile。
### P2-02 缺少 `typecheck` npm script
问题：`package.json` 暴露 `lint` 和 `test`，但没有 `typecheck`；`npm run typecheck` 失败。`tsconfig.json` 已配置 `noEmit`。
影响：CI 或贡献者无法运行标准 TypeScript quality gate；类型回归只能通过较慢且会触发 `prebuild` 的 `next build` 间接检查。
证据：
- `package.json:8-15`
- `tsconfig.json:8`
建议：添加 `"typecheck": "tsc --noEmit --incremental false"`，并在 README/AGENTS 的验证步骤里加入它。
### P2-03 `prebuild` 在端点全失败时会把 fallback height 写回更旧的固定 stub
问题：`npm run build` 会触发 `prebuild`，脚本请求公共端点并写入 `src/lib/engine/block-height-fallback.generated.ts`。如果所有端点失败，它只 warning 并写入固定 `STUB_ON_FAILURE = 940000`，低于当前文件的 `945597`。
影响：离线或 flaky CI 仍能通过 build，但会**降级** generated fallback；后续运行时一旦再次需要回退，就会用一个比仓库历史更旧的高度来判断 `after(<height>)`，与教学预期不符。
证据：
- `package.json:9-12`
- `scripts/generate-block-height-fallback.mjs:15-23`
- `scripts/generate-block-height-fallback.mjs:52-65`
- `src/lib/engine/block-height-fallback.generated.ts:6`
建议（已按二次评估收敛为半量修复）：**保留**当前 `prebuild` 行为与「跟踪 generated source」策略 — 这是 AGENTS §1/§3 写明的「构建可复现 + 离线可用」trade-off，不要改成 ignored artifact 或挪到显式命令。**只修一处**：脚本在所有端点失败时，**读取现有 `block-height-fallback.generated.ts` 中的高度并保留**（不写回更旧的 stub）；如果文件不存在或解析失败再退化到固定 stub，并在 CI 环境（`process.env.CI`）下以非零退出码 fail 而非静默 warning。
### P2-04 README 的隐私/离线边界与运行时 API 行为矛盾
问题：README 写“零 API 请求、零区块链连接”，但运行时会请求公共 block-tip endpoints 获取链尖高度。AGENTS 已记录了正确例外。
影响：用户和 reviewer 会误解网络行为、隐私边界和 offline guarantee；QA 也可能漏测唯一 intentional external request。
证据：
- `README.md:47`
- `src/lib/engine/block-height.ts:4-8`
- `src/lib/engine/block-height.ts:41-52`
- `AGENTS.md:36`
建议：README 改成与 AGENTS 一致：不连接钱包/节点、不查询 UTXO、不广播交易；唯一例外是只读公共链尖高度请求、短 TTL cache 与 generated fallback。
### P2-05 未使用或 CLI-only 包放在 production dependencies，扩大 audit surface
问题：`@base-ui/react` 和 `shadcn` 在 runtime `dependencies`，但源码/配置未见实际 import。`shadcn@4.0.3` 会拉入 `@modelcontextprotocol/sdk`、`@hono/node-server`、`hono` 等 transitive 包，参与 production audit。
影响：production install 和 security scan 包含不需要的包；可避免的 transitive vulnerability 增加维护成本，并可能让 `npm audit --omit=dev` 因非运行时包继续失败。
证据：
- `package.json:18`
- `package.json:46`
建议：未使用则移除 `@base-ui/react`；`shadcn` 移到 `devDependencies` 或使用 `npx shadcn@...`；刷新 `package-lock.json` 后重跑 production audit。
### P2-06 Builder threshold 的存储值、序列化值、状态与高亮使用的 k 不一致
问题：阈值编辑把用户输入的 `newK` 原样写进 tree；序列化时防御性 clamp 到 `1..n`；但 status 和 path highlighting 使用 raw `node.threshold`。`input max` 不能阻止手动键入超出 max 的数，删除子节点后也可能留下 k > real child count。
影响：画布显示或编译出的 policy 可能是有效 `thresh(2,...)`，但 builder status/highlight 仍按 raw `99` 判断，导致节点长期 missing、不高亮，与右栏编译结果不一致。
证据：
- `src/components/builder/BuilderPopover.tsx:550-556`
- `src/lib/builder/node-ops.ts:268-276`
- `src/lib/builder/serialize.ts:79-85`
- `src/lib/builder/status.ts:107-115`
- `src/lib/builder/path-highlighting.ts:102-109`
建议：在 `updateThreshold`、删除子节点、导入/恢复 tree 后统一 clamp。抽出 `effectiveThresholdK(group)` 给 serialize/status/highlighting/label 共用，并补 k > n、删除 child 后 k 回落测试。
### P2-07 路径选择 / Builder 高亮状态是半实现
问题：`BuilderCanvas` 会读取 `selectedPathIndex` 并计算高亮，但 `PathsTab` 只是渲染 PathCard，没有点击/键盘选择逻辑调用 `setSelectedPathIndex`。
影响：代码里存在用户无法触达的功能路径；测试名里有 selection，但实际只验证渲染文本。
证据：
- `src/components/builder/BuilderCanvas.tsx:30`
- `src/components/builder/BuilderCanvas.tsx:57-62`
- `src/components/results/PathsTab.tsx:81-82`
建议：如果要支持路径高亮，让 PathCard 成为 button/listbox option，点击和键盘选择后设置 `selectedPathIndex`。如果暂不做，移除相关状态和高亮逻辑。
### P2-08 locale/theme 只在客户端 localStorage 恢复，SSR 语言与主题状态不可信
问题：根 `<html>` 固定 `lang="zh-CN" className="dark"`；`I18nProvider` 和 `ThemeProvider` 都在客户端 effect 后从 localStorage 恢复。
影响：英文界面时，屏幕阅读器和浏览器仍认为页面是中文；保存 light theme 的用户会先看到 dark SSR 再切换，产生闪烁；SEO metadata 也基本固定中文。
证据：
- `src/app/layout.tsx:69`
- `src/lib/i18n/context.tsx:50-66`
- `src/lib/theme/context.tsx:15-29`
建议：把 locale/theme 持久化到 cookie，由 server layout 或 middleware 决定 `<html lang>` 与初始 class。至少在 locale 切换时同步 `document.documentElement.lang`，并用 no-flash theme script + `color-scheme`。
### P2-09 Mobile fallback 会先挂载桌面 Playground
问题：`useViewportMode()` 初始为 `loading`，但 `PlaygroundContent` 在非 `mobile` 时直接返回 `DesktopPlayground`。移动端首帧也会挂载三栏工作台，并执行 `clearSession`、拉链尖、compiler/builder hooks，随后才切 fallback。
影响：移动端有桌面 UI 闪烁和不必要计算/网络请求；也可能在只想显示 fallback 时触发不需要的 `clearSession()`。
证据：
- `src/app/playground/PlaygroundClient.tsx:19-30`
- `src/app/playground/PlaygroundClient.tsx:72-85`
- `src/app/playground/PlaygroundClient.tsx:102-103`
建议：`loading` 阶段渲染轻量 skeleton/空壳，不挂载 DesktopPlayground。或用 CSS media query / SSR hint 避免移动端挂载桌面逻辑；`clearSession` / `fetchBlockTipHeight` 放到确认 desktop 后执行。
### P2-10 TimeSlider 缺少可访问名称，且轨道/拇指硬编码深色
问题：range input 没有关联 `label`、`id` 或 `aria-label`，只有 `aria-valuetext`。进度轨道和 thumb/border 使用硬编码颜色。
影响：读屏可能只宣布 unnamed slider；亮色主题下 track/边框仍使用深色实现；14px thumb 对触控/精细操作偏小。
证据：
- `src/components/playground/TimeSlider.tsx:202-213`
- `src/components/playground/TimeSlider.tsx:215`
- `src/app/globals.css:114-132`
建议：为 input 增加 `id` + `<label htmlFor>` 或 `aria-label`。颜色改为 CSS variables/design tokens。扩大可点击区域或使用自定义 slider track 提供更大触控命中区。
### P2-11 条件模拟 toggles 缺少 pressed state
问题：签名和 hash 条件按钮只通过样式、Check/X 图标表达 on/off，没有 `aria-pressed` 或包含状态的可访问名称。
影响：读屏用户不知道 Alice/Secret 当前是“已满足”还是“未满足”，难以理解路径图和状态横幅变化。
证据：
- `src/components/playground/ConditionToggles.tsx:44`
- `src/components/playground/ConditionToggles.tsx:72`
建议：为每个 toggle 增加 `aria-pressed={isOn}`。`aria-label` 包含条件名和当前状态，例如“切换 Alice 签名，当前已满足/未满足”。图标设为 `aria-hidden`。
### P2-12 面板折叠按钮缺少状态语义且 aria 文案未 i18n
问题：左右面板折叠按钮有 hard-coded English `aria-label`，没有 `aria-expanded` / `aria-controls`；按钮位置用固定 `left-[228px]` / `right-[308px]` 与面板宽度耦合。
影响：中文界面读屏会读英文；用户无法听到当前面板展开/收起状态；后续调整面板宽度时按钮偏移容易失配。
证据：
- `src/components/playground/ThreeColumnLayout.tsx:41-43`
- `src/components/playground/ThreeColumnLayout.tsx:60-62`
建议：新增 i18n keys；补 `aria-expanded` / `aria-controls`；按钮定位绑定到同一个 width token/变量，或放入面板边界布局而不是手写像素。
### P2-13 分享链接解码缺少总量/数量限制和失败反馈
问题：单个字段有限长，但 keyVariables 数组没有数量上限，也没有总 JSON 字节上限。`?s=` 解码失败时静默 fallback 到 scenario/mode；如果只有坏分享链接，用户不知道恢复失败。
影响：极端链接或 localStorage 内容可能造成卡顿；分享链接损坏时用户体验不明确。
证据：
- `src/lib/utils/share.ts:9-11`
- `src/lib/utils/share.ts:32-49`
- `src/lib/playground/apply-playground-search-params.ts:20-28`
建议：增加 keyVariables 最大数量与总 payload 长度限制。对 invalid share 显示一次性提示。使用现代 UTF-8 base64 实现替代 `escape/unescape`。
### P2-14 首页 / Playground 的提前加载策略偏重（本轮**先不改**，待评估）
问题：首页整体是 client component；layout 预取 `/playground` document；首页 idle 后主动 import PathMap、BuilderCanvas、BuilderNodes、三栏面板和 compiler hook。
影响：只阅读首页或资源页的用户也会下载/解析较重 Playground 代码；对移动端和慢网不友好。
证据：
- `src/app/layout.tsx:72`
- `src/app/page.tsx:1`
- `src/app/page.tsx:21-35`
**处理决定（本轮）：保留现状，暂不修改。** 原因：
1. 首页大量依赖 `ScrollReveal`、`IntersectionObserver` 动画、i18n context、主题切换等 client 能力，整体拆回 server components 需要重新切分 client island 边界，风险与工作量均不小。
2. 「预加载偏重」是否真正影响 LCP / TTI 需要 **bundle analyzer + 真机指标**支撑，目前没有量化数据；在没有数据前重排预加载策略可能让 Playground 首次进入反而变慢。
3. 不属于正确性 / 安全 / 可访问性问题，性价比低于 P1 与 a11y 批次。

**后续动作（不在本轮 Code Review 落地范围内）**：单独立一个性能专项，先跑 `@next/bundle-analyzer` 与 Lighthouse / WebPageTest 拿基线，再决定是否拆 client islands、把 Playground 预加载改成 hover/focus/viewport intent 触发，或只预取 route document 而不预取重 canvas chunk。
### P2-15 非钱包跑马灯动效也缺少 reduced-motion 兜底
问题：Applications 的 inline `fadeSlideIn`、部分过渡动画没有全局 reduced-motion 策略。钱包 marquee 已在 P1 单独列出。
影响：减少动态偏好的用户仍会看到非必要动画。
证据：
- `src/components/intro/IntroApplicationsSection.tsx:20-29`
- `src/app/globals.css` 未提供全局 reduced-motion 兜底
建议：在全局 CSS 中为 `prefers-reduced-motion: reduce` 禁用非必要 animation/transition；避免组件内 inline `<style>` 定义动画，统一走 design token / CSS class。
## P3 Polish / Maintenance
### P3-01 README / DESIGN 的首页页尾 CTA 文档已过期
问题：README 和 DESIGN 说页尾 CTA 是一个橙色主按钮，文案 `home.cta.build`，指向 `/playground?mode=build`；实现是两个 CTA：`/playground` 使用 `home.cta.primary`，`/resources` 使用 `home.cta.secondary`。
影响：未来按文档改动时可能重引入错误单 CTA 行为，或误把用户送到 build mode。
证据：
- `README.md:24`
- `DESIGN.md:19`
- `src/app/page.tsx:90-102`
建议：更新 README/DESIGN 为当前双 CTA；或者如果产品意图是一键 build，就同步回滚实现和文档。
### P3-02 README 预设场景数量和列表已过期
问题：README 写“8 个预设场景”并遗漏 `holder-timelock`；实际 `SCENARIOS` 包含 `holder-timelock`，Applications 也链接它。
影响：贡献者对 scenario count/order 形成错误心智模型，增加 docs、Applications 和 Playground ordering 的维护漂移。
证据：
- `README.md:15`
- `src/lib/scenarios/data.ts:160`
- `src/lib/scenarios/data.ts:175`
- `src/components/intro/data.ts:179`
建议：更新 README 场景列表/数量，加入“穿越牛熊 / holder-timelock”，或明确以 AGENTS / scenario data 为 canonical。
### P3-03 Lint 不是完全干净：钱包 logo 使用原生 `<img>`
问题：`npm run lint` 通过但报告 `@next/next/no-img-element` warning。
影响：logo 图片可能有较差 LCP/带宽表现；如果 CI 配置 warnings-as-errors 会失败。
证据：
- `src/components/home/HomepageWallets.tsx:43-46`
建议：切换到 `next/image` 并配置 `remotePatterns` 与 sizing，或如果外部 favicon 列表必须 raw image，添加窄范围、有说明的 eslint disable。若要严格满足“无外部服务”边界，改为本地 logo 或 initials。
### P3-04 i18n 参数替换只替换第一次出现
状态：已解决。`t()` 已改为替换同一个 `{param}` 的所有出现位置，并补充重复参数回归测试。
原问题：`t()` 使用 `text.replace()`，同一个 `{param}` 多次出现时只替换第一处。
原影响：未来文案如果重复引用同一个变量，会出现残留 `{param}`。
证据：
- `src/lib/i18n/context.tsx:84`
- `src/lib/i18n/__tests__/context.test.tsx`
### P3-05 OG / metadata 仍有旧域名硬编码
问题：默认 `APP_URL` 和 OG 图底部仍写 `miniscript-lab.replit.app`。
影响：分享卡片或未配置环境变量的部署会暴露旧域名，品牌不一致。
证据：
- `src/app/layout.tsx:22`
- `src/app/opengraph-image.tsx:136`
建议：使用 `NEXT_PUBLIC_APP_URL` 统一生成，或至少把默认值更新为当前部署域名；OG 图片底部文案也应使用同一来源。
### P3-06 FAQ 使用未定义的 Tailwind text token
问题：FAQ 加号使用 `text-text-tertiary`，但 Tailwind text token 只定义了 `primary/secondary/muted/inverse`。
影响：该 class 不会生成预期颜色，也说明设计 token 命名有漂移。
证据：
- `src/components/home/FAQSection.tsx:27`
- `tailwind.config.js:24-29`
建议：改为现有 `text-text-muted` / `text-text-secondary`，或正式添加 `tertiary` token 并同步 `globals.css` 与 `DESIGN.md`。
### P3-07 测试缺少覆盖率门槛，也缺少关键边界回归集
问题：`package.json` 只运行 `vitest run`；`vitest.config.ts` 没有 coverage provider/thresholds，也没有 `test:coverage` script。现有测试没有覆盖 `after()` 从 TimeSlider 到 flow/analyzer/status 的集成，也没有覆盖 `name !== policyName`、key rename、builder threshold k > n 等边界。
影响：当前 220 个测试全绿仍无法防止 P1/P2 问题存在或回归。
证据：
- `package.json:15`
- `vitest.config.ts:14-18`
- `src/lib/engine/__tests__/path-analyzer.test.ts:4-27`
- `src/lib/engine/__tests__/time-utils.test.ts:51-55`
- `src/lib/flow/__tests__/tree-to-flow.test.ts:5-53`
建议：添加 `test:coverage` 与 `@vitest/coverage-v8`，为 core engine / builder / playground 设置覆盖率门槛。新增最小回归集：`after(tip+N)` 推进后满足、`after(tip-N)` 初始满足、`name !== policyName` payload 被拒或正确映射、key rename rewrite/稳定 ID、builder threshold k > n clamp。
## 正向发现
- 核心 test suite 当前稳定通过：28 个测试文件、220 个测试。
- `tsc --noEmit --incremental false` 通过，说明当前 strict 类型检查没有已知错误。
- Playground 的模块拆分较清晰：engine、builder、flow、playground utils、store、hooks 分层明确，便于逐项修复。
- AGENTS.md 对运行边界、路由、链尖请求例外和测试布局描述比 README 更接近真实实现，可作为后续文档同步的主参考。
## 第一批推荐落地范围（已按二次评估调整）

按照「按批落地」的新排程，第一批同时打包以下几类**风险低 / 收益高**的修复，并以一次 PR 落地，跑完 `lint / test / typecheck` 后合并：

1. **核心正确性（合并提交，共享同一组回归测试）**
   - P1-01：修复 `after(<block-height>)` 全链路语义（compile → tree-to-flow → path-analyzer → StatusBanner），统一使用 `blockTipHeight + currentTimeBlocks` 判断。
   - P1-02：统一 keyVariables 稳定身份（以 `policyName` 为条件 ID 贯穿 semantic tree / availableKeys / PathCondition；`name` 仅作显示标签；share/session payload 加校验与迁移）。
   - P1-03：把 `replaceKeyNames` 改为 token-aware 替换（只替换 `pk/multi/…` 的 key operand 位置），并补 `A` vs `Alice`、`Key1` vs `Key10`、`or` 等 reserved fragment 名的测试。
2. **顺手的小补丁**
   - P1-04：在 `useBuilderSync` 中，于 `policy === lastBuilderPolicySnapshot` 早返回前，对 `compile-error` / `text-led` 残留状态显式 `setBuilderSyncState('synced')`，并补 hook 测试。
3. **低成本动效兜底（一起做）**
   - P1-10 + P2-15：在 `globals.css` 中添加全局 `@media (prefers-reduced-motion: reduce)` 兜底；钱包跑马灯副本设置 `aria-hidden="true"` + `tabIndex={-1}` 并提供暂停按钮；删除组件内 inline `<style>` 动画。

**第二批**（独立 PR）：P1-06~09 a11y 集中整改 + P1-05（**仅 14.x 补丁升级 + audit 复测**，不跨 major）+ P2-01/02/04/05/06 + P2-03 半量修复（保留 `prebuild`，仅在端点全失败时保留现有高度并在 CI fail）。

**第三批**（独立 PR）：P2-07~13 + P3 系列文档与小清理。**P2-14 暂缓**，待性能专项与 bundle analyzer 基线出来后再决定是否动。
