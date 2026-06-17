# Progress

> 当前任务 / 进度的唯一事实源。默认只读本文件了解当前状态；历史记录见
> [`docs/task/TASKS-ARCHIVE.md`](docs/task/TASKS-ARCHIVE.md)，除非明确要求追溯历史，否则不读取归档。
> 每轮开发结束后，将完成项从「当前任务」移动到「最近完成」，并记录实际验证结果。
> 「最近完成」只保留最近少量高信号记录；更早完成项迁入归档，避免启动上下文过长。
> 若会话中途停止、阻塞或需要交接，再同步更新根目录 `session-handoff.md`。

## Current State

**Last Updated:** 2026-06-17
**Current Objective:** none
**Recommended Next Step:** 暂无当前任务；下一轮从本文件的「接下来」选择任务。

## 当前任务

暂无当前任务。

## 接下来

无

暂无待处理项。

## 阻塞

暂无阻塞项。

## 最近完成

### 2026-06-17：AGENTS.md 瘦身与 Harness 复评

- [x] **根指令压缩**：`AGENTS.md` 从 147 行压缩到 91 行，保留启动流程、阅读路由、硬边界、验证入口和结束会话规则。
- [x] **低频细节下沉**：文档同步触发矩阵迁入 `docs/RUNBOOKS.md`，`AGENTS.md` 改为引用该章节，减少每轮启动上下文。
- [x] **Harness evidence 更新**：`feature_list.json` 的 Harness 证据已同步记录本次瘦身后的复评结果。
- 验证结果：harness 校验 100/100；`npm run doc:health` 通过；`./init.sh` 全流程通过，lint 0 warning / 0 error，typecheck 0 error，coverage 53 files / 358 tests 全过，engine lines 88.73% / functions 96.2%，builder lines 84.71% / functions 90.72%；`build:check` 成功，仅保留既有 edge runtime 静态生成提示。

### 2026-06-17：Harness 架构入口收敛

- [x] **当前进度入口迁移**：根级 `progress.md` 成为当前任务 / 进度唯一事实源；旧 `docs/task/TASKS.md` 入口已移除；README、Runbook、历史归档入口同步更新。
- [x] **Agent 启动与生命周期规则**：`AGENTS.md` 新增 Startup Workflow、State Artifacts、Verification Commands、End of Session，并明确普通任务只更新 `progress.md`，中断 / 阻塞 / 交接时才写 `session-handoff.md`。
- [x] **机器可读 Harness 文件**：新增 `feature_list.json`、`session-handoff.md`、`init.sh`；`feature_list.json` 仅记录 Harness 状态，不作为产品 backlog；`init.sh` 使用项目既有 npm 门禁且不触发正式 `prebuild`。
- 验证结果：harness 校验 100/100；`doc:health` 通过；lint 0 warning / 0 error；typecheck 0 error；`./init.sh` 全流程通过，coverage 53 files / 358 tests 全过，engine lines 88.73% / functions 96.2%，builder lines 84.71% / functions 90.72%；`build:check` 成功，仅保留既有 edge runtime 静态生成提示。

### 2026-06-16：Playground Policy 编辑器隐藏格式化入口

- [x] **移除格式化按钮入口**：Playground 中栏 Policy 编辑器顶部不再展示“格式化”按钮；`formatPolicy()` 实现保留，后续需要时可重新接回。
- [x] **回归测试**：新增 `PolicyEditor` 工具栏测试，确认 Format 入口隐藏且 Clear / Copy / Share 保持可用。
- 验证结果：定向测试 `PolicyEditor.test.tsx` 通过；lint 0 warning / 0 error；typecheck 0 error；doc:health 通过；coverage 53 files / 358 tests 全过，engine lines 88.73% / functions 96.2%，builder lines 84.71% / functions 90.72%；build:check 成功；Browser 实测 `/playground` 工具栏仅有「清空 / 复制 / 分享」，`hasFormat=false` 且无 `[compile error]`。

### 2026-06-16：站点标签页图标

- [x] **Bitcoin favicon**：新增 `src/app/icon.svg`，使用经典橙色 Bitcoin 风格图标作为浏览器标签页 logo。
- 验证结果：lint 0 error；typecheck 0 error；doc:health 通过；build:check 成功，路由表包含静态 `/icon.svg`；coverage 52 files / 357 tests 全过，engine lines 88.73% / functions 96.2%，builder lines 84.71% / functions 90.72%。

更早完成项见 [`docs/task/TASKS-ARCHIVE.md`](docs/task/TASKS-ARCHIVE.md)，默认不读取。

## 未验证

暂无未验证项。
