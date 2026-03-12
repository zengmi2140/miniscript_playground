## Miniscript Lab 实施顺序与验收记录（MVP）

本文件从 `SPEC.md` 中拆分而来，记录 Miniscript Lab MVP 阶段的**实施顺序（Phases）与对应验收标准**。  
它主要用于：

- 作为历史实施计划的归档，方便回溯当初的技术决策和目录结构。
- 在大重构或升级后，作为回归检查清单进行自测。
- 帮新同学快速了解项目是如何一步步搭建起来的。

> ⚠️ 注意：本文件描述的是 **MVP 阶段的实施计划**，并不一定反映当前代码库的最新实现细节。  
> 若与 `SPEC.md` 的产品行为描述冲突，以 `SPEC.md` 为准。

---

## Phase 1: 基础设施（Day 1 上午）

**任务：**

1. `npx create-next-app@latest miniscript-lab --typescript --tailwind --eslint --app --src-dir`
2. 安装所有依赖（见 §9.1）
3. 配置 Tailwind（§2.2 色彩变量写入 globals.css + tailwind.config.ts）
4. 加载字体（Plus Jakarta Sans + IBM Plex Mono）
5. 初始化 shadcn/ui（`npx shadcn@latest init`，选 New York 风格，配色用自定义）
6. 创建 Header 组件（Logo + 导航 + 语言切换 + 主题切换）
7. 创建根布局（`layout.tsx`）
8. 设置 i18n Context + Provider

**验收标准：**

- `npm run dev` 启动成功，无报错
- 页面显示 Header，深色主题，比特币橙点缀色
- 字体正确加载（Plus Jakarta Sans 正文，IBM Plex Mono 代码）
- 导航可点击（场景 / Playground 路由切换正常）
- 语言切换按钮可切换中/英
- 亮/暗模式切换正常

---

## Phase 2: 引擎核心（Day 1 下午）

**任务：**

1. 创建 `src/lib/engine/types.ts`（§5 全部类型定义）
2. 创建 `src/lib/engine/compiler.ts`：
  - 封装 `compilePolicy()` + `compileMiniscript()` + `satisfier()`
  - 实现 key 变量替换逻辑
  - 实现友好错误信息映射（§6.6）
3. 创建 `src/lib/engine/path-analyzer.ts`（§6.2）
4. 创建 `src/lib/engine/miniscript-parser.ts`（§6.3）
5. 创建 `src/lib/engine/time-utils.ts`（§6.4）
6. 创建 `src/lib/scenarios/data.ts`（§7 全部场景数据）
7. 创建 `src/lib/glossary/data.ts`（§8.1 术语表数据）

**验收标准：**

- `compiler.compile('pk(Alice)', [{name:'Alice', publicKey:'02...'}], 'wsh')` 返回正确的 CompilationResult
- `compiler.compile('and(pk(User),or(99@pk(Service),older(4320)))', ...)` 返回至少 2 条花费路径
- `parseMiniscript('and_v(v:pk(A),or_d(pk(B),older(4320)))')` 返回正确的语义树
- `blocksToHuman(4320)` 返回 "≈30 天" 或等价表述
- 不合法的 Policy 输入返回友好中文错误信息
- 所有 6 个场景的 Policy 都能成功编译

---

## Phase 3: 场景画廊页（Day 2 上午）

**任务：**

1. 创建 ScenarioCard 组件
2. 创建 ScenarioGallery 组件
3. 实现首页（`src/app/page.tsx`）

**验收标准：**

- 首页显示 6 张场景卡片，3 列网格布局
- 每张卡片有：顶部色条、图标、中文标题、一句话描述、条件类型 tag
- hover 效果：上移 + 阴影
- 点击卡片导航到 `/playground?scenario=<id>`
- "打开空白 Playground" 按钮导航到 `/playground`
- 响应式：平板 2 列，手机 1 列

---

## Phase 4: Playground 基础框架（Day 2 下午）

**任务：**

1. 创建 ThreeColumnLayout 组件（左/中/右三栏 + 折叠功能）
2. 创建 Zustand store（`playground-store.ts`）
3. 实现 Playground 页框架（`src/app/playground/page.tsx`）
4. 实现从 URL 参数加载场景逻辑

**验收标准：**

- `/playground` 显示三栏布局，比例约 25%/50%/25%
- 左右栏可折叠，折叠后中栏扩展
- `/playground?scenario=2fa-recovery` 自动加载对应场景
- 最小宽度 1024px 时三栏正常显示

---

## Phase 5: Policy 编辑器（Day 3 上午）

**任务：**

1. 创建 policy-language.ts（CodeMirror 6 语法高亮）
2. 创建 PolicyEditor 组件
3. 创建 KeyVariableManager 组件
4. 创建 ContextSelector 组件
5. 实现编辑 → 编译 → 更新 store 的数据流

**验收标准：**

- 编辑器显示 Policy 源码，有语法高亮（关键字橙色、变量金色、数字浅橙）
- 输入 500ms 后自动编译，结果写入 store
- 编译错误在编辑器下方显示中文友好消息
- Key 变量管理：可添加/删除/编辑，支持随机生成测试密钥
- 地址类型选择：P2WSH 为默认值，Taproot 选项显示 "Coming Soon" 且不可选择
- [格式化] [清空] [复制] 按钮功能正常

---

## Phase 6: 花费路径图（Day 3 下午 - Day 4）

> 这是整个项目中最核心也最复杂的步骤。

**任务：**

1. 创建 tree-to-flow.ts（MiniscriptNode → React Flow nodes/edges 转换）
2. 创建 ConditionNode、OperatorNode、RootNode 自定义节点组件
3. 创建 PathEdge 自定义边组件
4. 创建 PathMap 容器组件（React Flow + Dagre 布局）
5. 创建 ConditionToggles 组件
6. 创建 TimeSlider 组件
7. 创建 StatusBanner 组件
8. 连接 store：toggle/slider 变化 → 重新计算路径可满足性 → 更新图节点状态

**验收标准：**

- 编译成功后中栏显示路径图，节点使用 Dagre 自动布局
- 节点样式：签名=暖金，时间锁=橙色，哈希=紫色
- AND 节点显示 "都需要"，OR 节点显示 "任选一"，thresh 显示 "k-of-n"
- 条件开关根据 Policy 中的 key/hash 自动生成
- 切换签名开关 → 对应 key 节点状态变化（绿/灰）→ 路径可满足性更新
- 时间滑块拖动 → 时间锁节点状态变化 → 路径可满足性更新
- 状态横幅显示当前结论（✅/⏳/❌）
- 时间滑块在每个 timelock 值处有刻度标记
- 时间显示双格式：区块数 + 人类时间
- 6 个场景全部能正确渲染路径图

---

## Phase 7: 结果面板（Day 4 下午）

**任务：**

1. 创建 ResultPanel + 各 Tab 组件
2. 创建 PathsTab（花费路径卡片列表）
3. 创建 ExplainPopover（微教学弹窗）
4. 创建 CodeBlock 共享组件（等宽代码 + 复制按钮）

**验收标准：**

- 右栏 Tab 面板：7 个 Tab 可切换
- 默认显示 "花费路径" Tab
- 每条路径显示为卡片：路径名、条件 chips、成本估算、满足状态
- Policy / Miniscript / Script Tab 显示等宽代码 + 复制按钮
- Descriptor Tab 显示完整描述符
- Address Tab 显示 testnet 地址 + 网络标注
- 每个 Tab 标签旁 `?` 按钮点击显示中文解释
- Warnings Tab 显示安全/有效性警告

---

## Phase 8: 分享与持久化（Day 5 上午）

**任务：**

1. 实现 URL 分享编码/解码（`src/lib/utils/share.ts`）
2. 实现 localStorage 持久化（`src/lib/utils/storage.ts`）
3. 编辑器工具栏 [分享🔗] 按钮功能

**分享 URL 格式：**

```
/playground?s=<base64(JSON.stringify({ policy, keyVariables, context, network }))>
```

**验收标准：**

- 点击 [分享] 按钮 → 生成 URL 到剪贴板
- 打开分享 URL → Playground 恢复完整状态（Policy + keys + context）
- 关闭再打开浏览器 → 最后编辑的 Policy 自动恢复
- localStorage 只保存公钥数据，不保存任何私钥

---

## Phase 9: i18n 与术语（Day 5 上午）

**任务：**

1. 实现 i18n Context + useTranslation hook
2. 将所有硬编码中文替换为 i18n key
3. 实现 GlossaryTooltip 组件
4. 在编辑器和路径图中集成术语提示

**验收标准：**

- 切换到 EN → 所有 UI 文字变为英文
- 切换回中文 → 所有 UI 文字变为中文
- 悬停在 Miniscript Tab 旁 `?` → 显示 Miniscript 的中/英文解释
- 悬停在路径图中的 `older(4320)` 节点 → tooltip 显示 "相对时间锁: UTXO 创建后等约 30 天"

---

## Phase 10: 最终打磨（Day 5 下午）

**任务：**

1. 路径图动画：节点状态变化时用 framer-motion 做颜色过渡
2. 移动端基础适配：Header 响应式、场景页适配、Playground 提示"请使用桌面端"
3. 底部抽屉占位（"Coming Soon" 文字）
4. 对比模式占位页（`/compare`，显示 "Coming Soon"）
5. OG 图片 + meta tags（分享预览）
6. README.md

**验收标准：**

- 路径图节点状态变化有平滑过渡动画（300ms）
- 手机端访问场景页正常显示
- 手机端访问 Playground 显示提示
- `/compare` 显示 Coming Soon 页面
- 分享到社交媒体有正确的预览图和描述

