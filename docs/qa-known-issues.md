# QA 已知项与待讨论清单

本文档收录验收或开发中发现的、**暂未在本次迭代修复**的问题，供产品与研发跟踪。条目仅描述现象与方向，不含实现承诺。

---

## 已处理

### 平台与模式

- **原现象**：视口宽度 &lt; 768px 时仅显示 `MobileFallback`，无法使用三栏 Playground 与 Build 画布。
- **结论**：维持**桌面优先**（`matchMedia('(min-width: 768px)')` 行为不变）。
- **处理**：在 [`MobileFallback`](/src/app/playground/PlaygroundClient.tsx) 与首页窄屏提示中说明需在**桌面端或更大屏幕**使用以获得完整体验；用户可见文案**不写像素数字**。

### Policy 与编译器 UX（已处理）

- **原现象**：部分解析失败时提示类似「无法识别 `''`」，难以定位；仅展示一行友好文案，缺少原始错误与可操作提示。
- **处理**：
  - [`policy-errors.ts`](/src/lib/engine/policy-errors.ts)：`mapError` 多模式提取 token、兜底摘要、`FriendlyError.category` / `hints`（中英）。
  - [`policy-error-highlight.ts`](/src/lib/engine/policy-error-highlight.ts)：`attachErrorHighlight` 对当前 Policy 文本给出启发式 `highlight`（半开区间，UTF-16），供编辑器标红（未知片段首次出现、括号类错误的括号栈）。
  - [`PolicyEditor`](/src/components/playground/PolicyEditor.tsx)：摘要、可折叠技术详情（`raw` + 复制）、`hints` 列表；CodeMirror `Compartment` + `buildErrorHighlightExtensions`（见 [`policy-language.ts`](/src/lib/editor/policy-language.ts)）显示错误区间背景标记。
- **仍待产品规划（非缺陷跟踪）**：SPEC/帮助页「常见 Policy 错误与改法」长文；更深预检（当前按产品决策不展开）。

---

## 其他

后续若新增暂缓项，请按「现象 / 影响 / 建议方向」三列补充，并标注发现日期或 issue 链接（如有）。
