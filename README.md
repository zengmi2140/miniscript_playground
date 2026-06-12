# ScriptWise

[English](README.md) · [中文](README.zh.md)

ScriptWise is an interactive learning lab that helps you understand under what conditions bitcoin can be spent.

Instead of jumping straight into Policy, Miniscript, or Bitcoin Script, ScriptWise starts with three more intuitive questions:

- Who can spend?
- When can it be spent?
- What conditions must be met?

It then connects those spending paths back to Policy, Miniscript, Script, Descriptor, and Address.

Try it live: [miniscript.1satpod.org](https://miniscript.1satpod.org/)

## Explore ScriptWise

Start with common patterns — multisig, timelocks, recovery keys, hashlocks — and see how each spending path takes shape, and how changing conditions affects the available paths.

Inside the Playground you can also:

- Edit and compose spending policies;
- Trace the full conversion from Policy → Miniscript → Script → Descriptor → testnet addresses;
- Simulate keys, hash preimages, and time-based conditions;
- Visualize complex policies through an interactive spending-path graph;
- Share a reproducible teaching scenario.

## Safety & Scope

ScriptWise is a teaching tool — not a wallet, and not for managing real funds.

- No wallet connections, no UTXO queries, no transaction construction or broadcast;
- No private keys, seed phrases, or real signatures;
- No upload of user policies, keys, or session data;
- Addresses are shown for testnet / signet demonstration only;
- All core compilation and analysis runs locally in your browser.

For the full list of boundaries, see [AGENTS.md](AGENTS.md).

## Tech Stack

ScriptWise is a pure frontend application built with **Next.js App Router + React + TypeScript + Zustand + React Flow**. All computation happens locally in the browser.

For detailed architecture and module layout, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Running Locally

Requires Node 22 and npm:

```bash
nvm use
npm ci
npm run dev
```

Open the local address shown in your terminal — typically [http://localhost:3000](http://localhost:3000).

For the full list of npm scripts and verification commands, see [AGENTS.md](AGENTS.md).

## Contributing

ScriptWise is under active development. Issues, suggestions, and pull requests are welcome.

Before contributing, please read:

- [Product scope & roadmap](docs/PRODUCT.md)
- [Architecture & conventions](docs/ARCHITECTURE.md)
- [Development boundaries & completion criteria](AGENTS.md)
- [Current task board](docs/task/TASKS.md)

## License

[MIT](LICENSE)

## Acknowledgments

ScriptWise builds on the work of many:

- [@bitcoinerlab](https://github.com/bitcoinerlab) for [miniscript-policies](https://github.com/bitcoinerlab/miniscript-policies), [miniscript](https://github.com/bitcoinerlab/miniscript), and [descriptors](https://github.com/bitcoinerlab/descriptors) — the core libraries that power policy compilation and descriptor generation;
- Pieter Wuille, Andrew Poelstra, and Sanket Kanjalkar for the [Miniscript specification](https://bitcoin.sipa.be/miniscript/);
- Bitcoin Core developers and the broader Bitcoin open-source community.
