# ScriptWise

[中文](README.md) · [English](README.en.md)

[![CI](https://github.com/zengmi2140/miniscript_playground/actions/workflows/ci.yml/badge.svg)](https://github.com/zengmi2140/miniscript_playground/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/zengmi2140/miniscript_playground?label=release)](https://github.com/zengmi2140/miniscript_playground/releases/latest)
[![Node](https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white)](.nvmrc)

ScriptWise 是一个交互式教学实验室，帮助你理解一笔比特币在什么条件下可以被花费。

与直接阅读 Policy、Miniscript 或 Bitcoin Script 不同，ScriptWise 先回答三个更直观的问题：

- 谁可以花？
- 什么时候可以花？
- 需要满足哪些条件？

然后再把这些花费路径与 Policy、Miniscript、Script、Descriptor 和 Address 联系起来。

## 探索 ScriptWise

你可以从多签、时间锁、恢复密钥、哈希锁等常见场景开始，观察每条花费路径如何形成，以及条件变化如何影响可用路径。

在 Playground 中，你还可以：

- 编辑或组合花费策略；
- 查看 Policy 到 Miniscript、Script、Descriptor 与测试网地址的转换；
- 模拟密钥、哈希原像和时间条件；
- 通过可视化路径图理解复杂策略；
- 分享一个可复现的教学场景。

在线体验：[miniscript.1satpod.org](https://miniscript.1satpod.org/)

## 安全边界

ScriptWise 是教学工具，不是钱包，也不用于管理真实资金。

- 不连接钱包，不读取 UTXO，不构造或广播交易；
- 不处理私钥、助记词或真实签名；
- 不上传用户策略、密钥或会话数据；
- 地址仅用于 testnet / signet 教学展示；
- 所有核心编译与分析均在浏览器本地完成。

完整边界见 [AGENTS.md](AGENTS.md)。

## 技术栈

ScriptWise 是一个纯前端应用，基于 **Next.js App Router + React + TypeScript + Zustand + React Flow** 构建，所有计算均在浏览器本地完成。

详细技术架构与模块划分见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 本地运行

需要 Node 22 和 npm：

```bash
nvm use
npm ci
npm run dev
```

启动后打开终端显示的本地地址，通常为 [http://localhost:3000](http://localhost:3000)。

完整的 npm scripts 及验证命令见 [AGENTS.md](AGENTS.md)。

## 参与项目

ScriptWise 仍处于持续完善中。欢迎提交 Issue、改进建议、Bug 报告、文档改进和小的 Pull Request。

在开始贡献前，请先阅读：

- [产品定位与范围](docs/PRODUCT.md)
- [架构与开发约定](docs/ARCHITECTURE.md)
- [开发边界与完成标准](AGENTS.md)
- [当前待办任务](docs/task/TASKS.md)

较大的改动请先开 Issue 沟通方向，再提交 Pull Request。

## License

[MIT](LICENSE)

## 致谢

ScriptWise 构建在以下工作的基础之上：

- [@bitcoinerlab](https://github.com/bitcoinerlab) 的 [miniscript-policies](https://github.com/bitcoinerlab/miniscript-policies)、[miniscript](https://github.com/bitcoinerlab/miniscript) 与 [descriptors](https://github.com/bitcoinerlab/descriptors) 库，为策略编译与描述符生成提供了核心能力；
- [Miniscript 规范](https://bitcoin.sipa.be/miniscript/) 的提出者 Pieter Wuille、Andrew Poelstra 与 Sanket Kanjalkar；
- Bitcoin Core 开发者与更广泛的比特币开源社区。
