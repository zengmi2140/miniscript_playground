# RUNBOOKS.md

> 高频、多文件改动的执行清单。运行时行为以代码为准；若本文件与代码不一致，应先按代码核对真实联动点，再修正本文件。

## 新增预设场景

### 1. 定义场景数据（必做）

在 `src/lib/scenarios/data.ts` 中：

1. 为场景选择唯一、稳定、适合 URL 的 `id`；该值会用于 `/playground?scenario=<id>`。
2. 在 `DEFAULT_TEST_KEYS` 中补齐 Policy 使用的教学公钥；只使用公开测试数据，不引入私钥或真实签名。
3. 在 `SCENARIOS` 中新增 `Scenario`：
   - `title`、`description`、`explanation` 必须同时提供 `zh` / `en`。
   - `policy` 中的每个 `pk(<name>)` 都必须有对应 `keyVariables`。
   - `KeyVariable.policyName` 必须与 Policy token 一致且保持唯一；`name` 仅用于显示。
   - `context` 当前使用 `wsh`；不要把未支持的 `tr` 场景包装成可用功能。
4. 优先复用 `kv()` 与已有教学公钥；新增名称时确认 `DEFAULT_TEST_KEYS[name]` 存在。

### 2. 决定是否进入首页 Applications（条件必做）

- **仅 Playground 预设**：无需修改 `src/components/intro/data.ts`。它会由 `sortScenariosForPlayground()` 排在 Applications 对齐区之后。
- **同时作为首页教程案例**：在 `INTRO_APPLICATION_EXAMPLES` 中新增完整示例，并将 `playgroundScenarioId` 设为新场景 ID。
- `APPLICATION_PLAYGROUND_SCENARIO_IDS` 由首页数据自动派生；`src/lib/scenarios/playground-order.ts` 通常无需手改。
- 首页案例属于产品预设范围变更，需同步更新 `docs/PRODUCT.md` 的「预设场景」段。

### 3. 检查条件联动点

- **图标**：若 `scenario.icon` 未出现在 `src/components/scenarios/ScenarioCard.tsx` 的 `ICON_MAP`，补充对应 Lucide 图标；复用已有名称则无需修改。
- **标签和顶栏颜色**：`src/lib/scenarios/tags.ts` 会从 Policy 自动识别签名、多签、时间锁和哈希锁。仅当新增了无法被现有规则识别的条件类型时才扩展规则。
- **额外 UI 文案**：场景自身文案直接使用 `Scenario` 的双语字段。只有新增了场景字段之外的用户可见文案时，才同步修改 `src/lib/i18n/zh.ts` 与 `src/lib/i18n/en.ts`。
- **特殊展示**：若场景引入类似 HTLC 摘要遮罩的展示规则，先确认现有通用组件不能表达，再增加独立 helper 与测试。

### 4. 更新测试

1. 在 `src/lib/scenarios/__tests__/playground-order.test.ts` 中更新 Playground-only 预设的预期列表；若场景进入首页，确认 Applications 顺序断言覆盖新 ID。
2. `src/lib/engine/__tests__/compiler.test.ts` 会遍历全部 `SCENARIOS`，用于确认新 Policy 可编译；通常无需增加重复用例。
3. 若修改图标、标签推导、特殊展示或排序逻辑，在对应模块旁的 `__tests__/` 增加针对性测试。

### 5. 人工验收

1. 打开 `/playground?scenario=<id>`，确认 URL 可加载场景，Policy、Key、路径图和结果 Tabs 正常。
2. 在左栏选择新预设，确认选中态、排序与滚动区域正常。
3. 分别切换中文和英文，确认标题、描述、解释及新增 UI 文案完整。
4. 若加入首页 Applications，从卡片进入 Playground，确认场景 ID 与展示内容一致。

### 6. 完成检查

```bash
npm run doc:health
npm run lint
npm run typecheck
npm run test:coverage
```

涉及路由、SSR 或编译管线时运行 `npm run build:check`。正式部署仍使用
`npm run build`，由 `prebuild` 刷新链尖回退高度后再执行生产构建。完成后按
`AGENTS.md` 要求更新根目录 `progress.md`。

## 修改编译或时间锁语义

### 1. 先定义语义边界

1. 明确改动属于 Policy 预检、Miniscript 编译、语义树解析、花费路径分析还是 UI 模拟。
2. 写下同一路径在以下状态下的预期：条件满足、条件缺失、链尖未就绪、编译失败。
3. 区分 `older()` 相对时间锁、区块高度型 `after()` 和时间戳型 `after()`；不要用同一个自然语言描述掩盖不同链上语义。

### 2. 保持共享计算单一

- 时间锁满足态和剩余区块优先复用 `src/lib/engine/time-utils.ts`，不要在组件、builder 或 flow 中各写一套判断。
- 引擎层保持纯计算，不引用 React，也不写死用户可见文案。
- 改动 `compiler.ts` 的输入输出或错误分类时，同步检查 `useCompiler`、Policy 错误高亮和派生结果清理行为。
- 语义变化必须贯穿 path analyzer、scenario 路径图、StatusBanner、TimeSlider 和 builder 状态；不涉及的消费端应在任务记录中明确说明原因。

### 3. 测试与文档

1. 在 `src/lib/engine/__tests__/` 增加语义真值表，至少覆盖边界值、未就绪状态和失败分支。
2. 若影响 builder、flow 或 UI 状态，在对应目录旁补针对性测试，避免只测 helper。
3. 改变核心运行链路时同步更新 `docs/ARCHITECTURE.md`；改变支持范围或用户理解时同步更新 `docs/PRODUCT.md`。
4. 运行完整门禁和 `npm run build:check`。

## 修改分享 Payload

### 1. 明确兼容策略

- `SharePayload` 是公开在 URL 中的持久格式。新增字段默认应为可选，并为旧链接提供确定性默认值。
- 删除、重命名或改变字段含义属于破坏性变更；实施前必须定义旧 payload 的迁移或拒绝策略。
- 保持 `s` > `scenario` > `mode=build` 的 URL 参数优先级；无明确产品需求不要改变。

### 2. 同步验证与恢复链路

1. 在 `parseValidPlaygroundPayload` 中校验类型、枚举、长度、数量、稳定 ID 唯一性和新增字段。
2. 复核 `MAX_SHARE_*` 与 `SHARE_URL_WARNING_LENGTH`，避免新增字段绕过解码字节限制。
3. 同步检查 `encodeSharePayload` / `decodeSharePayload`、legacy storage、store 的 `restoreSession` 和 `applyPlaygroundUrlState`。
4. 无效 payload 必须安全返回 `null`，不得部分恢复未经验证的数据。

### 3. 测试与验收

- 覆盖新旧 payload round-trip、缺省字段、超限、非法枚举、重复 `policyName`、畸形 UTF-8 / Base64 和 URL 参数回退。
- 人工生成分享链接并在新页面恢复，确认 Policy、Key、Context、Network 和模式一致。
- 若 URL 格式或优先级变化，同步更新 PRODUCT / ARCHITECTURE，并运行 `npm run build:check`。

## 新增路由或修改 SSR 首帧

### 1. 路由与产品事实

1. 新增、删除或重定向 `src/app/**/page.tsx` 时，同步修改 `docs/PRODUCT.md` 的路由表；`doc:health` 会校验两者一致。
2. 明确页面是 server component、client component、动态渲染还是静态生成；不要为使用浏览器 API 而把整个路由无条件改成 client component。
3. 新增页面需确认 Header 导航、metadata、OG 表现和移动端行为是否需要联动。

### 2. SSR 偏好与 hydration

- locale / theme 的首值必须来自 server cookie，并将同一值传给 Providers。
- 修改 cookie key、默认值、`<html lang>`、主题 class 或 no-flash script 时，同步检查 `preferences.ts`、`layout.tsx`、i18n/theme context。
- 客户端读取 `window`、`localStorage`、视口或 search params 时，确认不会造成 hydration mismatch 或移动端提前执行桌面 bootstrap。

### 3. 验收

- 补充路由渲染、重定向或偏好解析测试。
- 分别验证直接访问与客户端导航、中文与英文、深色与亮色、桌面与窄视口。
- 必跑 `npm run doc:health` 与 `npm run build:check`，并检查构建路由清单符合 PRODUCT。

## 新增或修改设计 Token

### 1. 保持双层映射

1. 语义颜色、主题表面等先在 `src/app/globals.css` 定义 CSS 变量，再在 `tailwind.config.js` 映射稳定的工具类。
2. 字号、圆角、间距等直接在 Tailwind `theme.extend` 中定义命名 token。
3. JSX 优先使用既有或新增的命名工具类，禁止用任意值绕过已有 token；仅动态计算场景可直接使用 `var(--xxx)`。

### 2. 主题与组件联动

- 新增主题变量时同时提供 light / dark 值，并检查文字对比度、边框层级、hover/focus/disabled 状态。
- 改语义色时检查 condition chip、路径节点、边和状态横幅，避免相同语义出现不同颜色。
- 修改节点尺寸时同步检查 `tree-to-flow` 的布局尺寸与 `FlowNodes` 的实际渲染尺寸。
- 所有 token 事实同步更新 `docs/DESIGN.md`。

### 3. 验收

- 运行 lint、typecheck、coverage；涉及布局、路由或首屏时再运行 `build:check`。
- 用浏览器检查受影响页面的 light / dark、hover / focus、窄宽视口和 `prefers-reduced-motion`。
- 确认未新增可由现有 token 表达的硬编码颜色、字号或圆角。
