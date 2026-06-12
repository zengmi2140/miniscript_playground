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
npm run test
```

涉及路由、SSR 或编译管线时再运行 `npm run build`。完成后按 `AGENTS.md` 要求更新 `docs/task/TASKS.md`。
