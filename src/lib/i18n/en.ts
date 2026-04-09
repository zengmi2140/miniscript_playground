export const en: Record<string, string> = {
  // Homepage
  'home.hero.title': 'Bitcoin Spending Conditions, Made Clear',
  'home.hero.subtitle': 'Understand Miniscript through real spending scenarios — from multisig to timelocks, from concepts to working scripts.',
  'home.hero.desc': 'Behind every Bitcoin UTXO is a set of rules that determines who can spend it and when. Miniscript Lab helps you understand those rules.',
  'home.hero.cta.primary': 'View applications',
  'home.hero.cta.secondary': 'Open Playground',
  'home.hero.card.label': 'Spending Path Analysis',
  'home.hero.card.path1': 'Alice + Bob sign',
  'home.hero.card.path2': 'Alice + wait 30 days',
  'home.hero.card.path3': 'Bob + wait 30 days',

  // Miniscript Explainer section
  'home.explainer.label': 'The Basics',
  'home.explainer.title': 'What is Miniscript?',
  'home.explainer.subtitle': 'Every Bitcoin UTXO is governed by a script that defines who can spend it and when. Miniscript is a structured language that makes those rules readable, composable, and formally verifiable.',

  'home.explainer.what.title': 'What Miniscript Is',
  'home.explainer.what.desc': 'Bitcoin Script is a low-level stack language that is hard to write correctly and even harder to audit. Miniscript is a structured subset of Bitcoin Script — it expresses spending conditions as composable policy trees, which tools automatically compile into on-chain scripts, eliminating hand-crafting errors.',

  'home.explainer.why.title': 'Why It Matters',
  'home.explainer.why.benefit1': 'Human-readable semantics: and(), or(), thresh() map directly to business logic anyone can understand',
  'home.explainer.why.benefit2': 'Composable and auditable: conditions nest freely, tools auto-analyze all spending paths and minimal witnesses',
  'home.explainer.why.benefit3': 'On-chain safe: compiled output is formally verified against all Bitcoin Script safety constraints',

  'home.explainer.mission.label': 'Our Mission',
  'home.explainer.mission.title': 'Why We Built This',
  'home.explainer.mission.desc': 'Miniscript tooling is scattered, documentation is dense, and there is a steep learning curve between wallet developers and advanced users. Miniscript Lab brings compilation, path analysis, and visual building into one interactive platform — so anyone can truly understand Bitcoin spending conditions.',

  'home.explainer.comparison.old.title': 'Raw Bitcoin Script (hard to read)',
  'home.explainer.comparison.old.example': `OP_2\n<Alice> <Bob> <Carol>\nOP_3 OP_CHECKMULTISIG`,
  'home.explainer.comparison.old.problem1': 'Opcode stacks are non-intuitive — experts must trace every byte to understand intent',
  'home.explainer.comparison.old.problem2': 'Even slightly complex conditions are nearly impossible to hand-write correctly — one wrong byte locks funds forever',

  'home.explainer.comparison.new.title': 'Miniscript Policy (readable at a glance)',
  'home.explainer.comparison.new.example': `or(\n  thresh(2, pk(Alice), pk(Bob), pk(Carol)),\n  and(pk(Alice), older(52560))\n)`,
  'home.explainer.comparison.new.advantage1': 'Structure is semantics: or / and / thresh map directly to intent',
  'home.explainer.comparison.new.advantage2': 'Compiles to an optimal script automatically — tools verify safety, no low-level code needed',

  'home.how.label': 'How It Works',
  'home.how.title': 'Three Steps to Any Spending Policy',
  'home.how.subtitle': 'From scenario selection to a complete on-chain script — with visual feedback every step of the way.',
  'home.how.step1.title': 'Choose a Scenario',
  'home.how.step1.desc': 'Start from a real use case: team multisig, multisig + timelock, recovery key, degrading vault...',
  'home.how.step1.example': '2-of-3 Multisig · Multisig + Timelock · Recovery Key',
  'home.how.step2.title': 'Write or Build a Policy',
  'home.how.step2.desc': 'Describe the rules in Policy language, or drag and drop condition nodes in the visual builder.',
  'home.how.step2.example': 'thresh(2,pk(A),pk(B),older(4320))',
  'home.how.step3.title': 'See All Spending Paths',
  'home.how.step3.desc': 'Every valid spending path is listed. Toggle signatures, slide the time — watch paths light up.',
  'home.how.step3.example': 'Path 1: Alice + Bob · Path 2: Timeout',
  'home.how.step4.title': 'Get the On-Chain Script',
  'home.how.step4.desc': 'Full output: Script, Descriptor, and P2WSH address ready for testnet deployment.',
  'home.how.step4.example': 'OP_2 <Alice> <Bob> ... OP_CHECKMULTISIG',

  'home.features.label': 'Core Features',
  'home.features.title': 'More Than a Compiler',
  'home.features.subtitle': 'Designed for genuine understanding, not just script generation.',
  'home.features.f1.title': 'Real-Time Compilation',
  'home.features.f1.desc': 'Type a Policy and instantly see the Miniscript, Script, Descriptor, and address. Syntax errors are pinpointed precisely.',
  'home.features.f2.title': 'Visual Path Explorer',
  'home.features.f2.desc': 'Every valid spending combination is shown as an interactive tree. Simulate signatures and timelocks to see which paths open.',
  'home.features.f3.title': 'Visual Policy Builder',
  'home.features.f3.desc': 'No code required. Click to add condition nodes, combine them on a canvas, and the system generates the Policy for you.',
  'home.features.f4.title': 'One-Click Sharing',
  'home.features.f4.desc': 'Bundle your current policy, key variables, and simulation state into a shareable link for easy collaboration.',

  'home.scenarios.label': 'Scenario Library',
  'home.scenarios.title': 'Start with a Real-World Scenario',
  'home.scenarios.subtitle': 'Each scenario comes with an explanation, a complete Policy, and an interactive spending path diagram.',

  'home.wallets.label': 'Ecosystem',
  'home.wallets.title': 'Wallets Supporting Miniscript',
  'home.wallets.subtitle': 'These software and hardware wallets have native Miniscript support, ready for real-world use with complex spending conditions.',
  'home.wallets.software': 'Software Wallets',
  'home.wallets.hardware': 'Hardware Wallets',

  'home.cta.title': 'Ready to Design Your Own?',
  'home.cta.subtitle': 'Open the Playground to write any Policy freely, or use the visual builder to compose from scratch.',
  'home.cta.playground': 'Open Blank Playground',
  'home.cta.build': 'Build with Canvas',
  'intro.applications.tryIt': 'Try it',
  'home.playground.desktopHint': 'For the full experience, open the Playground on a desktop or larger screen.',

  // Builder
  'builder.starter.title': 'Choose Strategy Type',
  'builder.starter.subtitle': 'Pick a root node type; add more conditions on the canvas afterward.',
  'builder.starter.singleControl': 'Single Control',
  'builder.starter.singleControlDesc': 'One key controls everything',
  'builder.starter.sharedControl': 'Shared Control',
  'builder.starter.sharedControlDesc': 'Multisig (2-of-3)',
  'builder.canvas.waitingTree': 'Compiling and syncing canvas…',
  'builder.canvas.initializing': 'Syncing canvas…',
  'builder.sync.textLed': 'Current policy contains unsupported constructs (e.g., after() or hashlocks). Canvas shows the last synced snapshot.',
  'builder.sync.compileError':
    'Policy cannot be compiled or parsed. The canvas is read-only. If nothing has compiled successfully yet, you see the initial placeholder; fix the Policy to resync.',
  'builder.sync.readOnly': 'Read-only',
  'builder.node.signature': 'Signature',
  'builder.node.timelock': 'Timelock',
  'builder.node.threshold': 'Threshold',
  'builder.node.all': 'All Required',
  'builder.node.any': 'Any One',
  'builder.node.addChild': 'Add Condition',
  'builder.node.delete': 'Delete',

  // Operator switch
  'builder.op.switch.title': 'Switch Operator',
  'builder.op.all': 'All Required',
  'builder.op.all.desc': 'All conditions must be satisfied (AND)',
  'builder.op.any': 'Any One',
  'builder.op.any.desc': 'Any one condition is enough (OR)',
  'builder.op.threshold': 'Threshold',
  'builder.op.threshold.desc': 'k-of-n: satisfy any k conditions',
  'builder.op.threshold.k.label': 'Number required',
  'builder.op.threshold.confirm': 'Confirm',
  'builder.op.binaryTrimNotice':
    'Switched to AND/OR: only the first two child conditions were kept.',

  // Wrap
  'builder.wrap.title': 'Wrap in New Group',
  'builder.wrap.depthWarning': 'Deep nesting detected — consider keeping within 5 levels',
  'builder.node.wrap': 'Wrap as',
  'builder.node.undefinedRole': 'Undefined role',
  'builder.popover.selectRole': 'Select Role',
  'builder.popover.addRole': 'Add New Role',
  'builder.popover.blocks': 'Blocks',
  'builder.popover.timePreset': 'Time Preset',
  'builder.popover.threshold': 'Threshold',
  'builder.popover.thresholdHint': '{k} of {n} signatures',
  'builder.popover.timeConversion': '~{time}',
  'builder.popover.7days': '7 days',
  'builder.popover.30days': '30 days',
  'builder.popover.90days': '90 days',
  'builder.popover.180days': '180 days',
  'builder.popover.1year': '1 year',
  'builder.popover.custom': 'Custom',
  'builder.action.wrapAll': 'Wrap as "All Required"',
  'builder.action.wrapAny': 'Wrap as "Any One"',
  'builder.action.wrapThreshold': 'Wrap as "Threshold"',
  'builder.action.addSignature': 'Add Signature',
  'builder.action.addTimelock': 'Add Timelock',
  'builder.action.addGroup': 'Add nested group',
  'playground.left.diyActive': 'Building',
  'nav.scenarios': 'Home',
  'nav.playground': 'Playground',
  'nav.compare': 'Resources',
  'nav.comingSoon': 'Soon',
  'nav.toggleMenu': 'Toggle menu',
  'header.language.zh': '中文',
  'header.language.en': 'EN',
  'header.theme.light': 'Light',
  'header.theme.dark': 'Dark',
  'scenarios.title': 'Miniscript Lab',
  'scenarios.subtitle': 'Making Bitcoin spending conditions crystal clear',
  'scenarios.orWrite': 'or write your own',
  'scenarios.openBlank': 'Open Blank Playground',
  'playground.editor.title': 'Policy Editor',
  'playground.editor.placeholder': 'Enter a policy, e.g.: pk(Alice)',
  'playground.editor.compile': 'Compile',
  'playground.editor.format': 'Format',
  'playground.editor.clear': 'Clear',
  'playground.editor.copy': 'Copy',
  'playground.editor.share': 'Share',
  'playground.editor.shareCopied': 'Copied!',
  'playground.error.hints': 'Suggestions',
  'playground.error.expandDetails': 'Show technical details',
  'playground.error.collapseDetails': 'Hide technical details',
  'playground.error.copyRaw': 'Copy raw message',
  'playground.error.rawCopied': 'Copied!',
  'playground.keys.title': 'Key Variables',
  'playground.keys.add': 'Add',
  'playground.keys.random': 'Random',
  'playground.keys.restore': 'Restore Defaults',
  'playground.context.title': 'Address Type',
  'playground.context.wsh': 'SegWit v0 (P2WSH)',
  'playground.context.tr': 'Taproot',
  'playground.context.comingSoon': 'Coming Soon',
  'playground.pathmap.title': 'Spending Path Map',
  'playground.conditions.title': 'Condition Simulator',
  'playground.timeslider.label': 'Time Elapsed',
  'playground.timeslider.blocks': 'blocks',
  'playground.timeslider.current': 'Current: Block {blocks} ≈ {human}',
  'playground.status.canSpend': 'Spendable: {path}',
  'playground.status.waiting': 'Wait {time} more, then {path} becomes available',
  'playground.status.cannotSpend': 'Cannot spend under current conditions, missing {missing}',
  'playground.status.someConditions': 'some conditions',
  'playground.results.policy': 'Policy',
  'playground.results.miniscript': 'Miniscript',
  'playground.results.script': 'Script',
  'playground.results.descriptor': 'Descriptor',
  'playground.results.address': 'Address',
  'playground.results.paths': 'Spending Paths',
  'playground.results.panelNav': 'Result panels',
  'playground.results.explain': 'What is this?',
  'playground.stack.title': 'Script VM',
  'playground.stack.comingSoon': 'Coming Soon',
  'playground.empty.title': 'Enter a Policy or select a scenario',
  'playground.empty.subtitle': 'Start exploring Bitcoin spending paths',
  'compare.comingSoon': 'Compare Mode Coming Soon',
  'compare.description': "Side-by-side comparison of two Policies' compilation results and spending paths",
  'playground.left.scenarios': 'Scenarios',
  'playground.left.diy': 'Build Your Own',
  'playground.left.diyDesc': 'Freely combine spending conditions to design your own policy',
  'playground.left.diyComingSoon': 'Coming Soon',
  'playground.left.keysPlaceholder': 'Key variables will auto-fill after selecting a scenario',
  'playground.keys.empty': 'No key variables',
  'playground.keys.hint': 'MVP uses compressed public keys (66 hex chars, for P2WSH)',
  'playground.context.network': 'Network',
  'playground.center.compilePlaceholder': 'Path map will appear here after compilation',
  'playground.center.staleWarning': 'Policy has a syntax error. Showing the last successful compilation result.',
  'playground.center.hasError': 'Compilation failed. Please check the Policy syntax on the left.',
  'playground.right.waiting': 'Waiting for compilation...',
  'playground.right.tabPlaceholder': 'Compilation results will appear here',
  'playground.results.stale': 'stale',
  'playground.paths.empty': 'No spending paths available. All paths are unsatisfiable under current conditions.',
  'playground.paths.malleable': 'Malleable',
  'playground.address.warning': 'This address is for testnet only. Do not use on mainnet.',
  'footer.description': 'A scenario-first, spending-path-centered Miniscript educational lab',
  'footer.rights': 'Miniscript Lab',
  'flow.rootLabel': 'Spending Conditions',
  'flow.andLabel': 'All Required',
  'flow.orLabel': 'Any One',
  'glossary.tooltip.label': 'What is this',
  'playground.mobile.title': 'Use a Desktop or Larger Screen',
  'playground.mobile.description':
    'The full Playground — three-column layout and visual builder — needs a wider viewport. Open it on a desktop, laptop, or a tablet in landscape for the full experience.',
  'playground.mobile.goScenarios': 'Browse Scenarios',
  'compare.featureList.title': 'Planned Features',
  'compare.feature.1': 'Side-by-side compilation results for two Policies',
  'compare.feature.2': 'Visual diff of spending paths',
  'compare.feature.3': 'Script size and fee comparison',
  'compare.feature.4': 'Export to Markdown / JSON report',

  // Resources page
  'resources.title': 'Resource 资源',
  'resources.subtitle': 'Learning materials, tool links, and FAQs about Miniscript to help you understand Bitcoin spending conditions faster.',
  'resources.faq.label': 'FAQ',
  'resources.faq.title': 'Questions You Might Have',
  'resources.faq.subtitle': 'From foundational concepts to advanced usage, here are the most common questions about Miniscript.',
  'resources.links.label': 'External Resources',
  'resources.links.title': 'Recommended Reading & Tools',
  'resources.links.subtitle': 'The following resources are curated by the community. Click to visit the corresponding website or documentation.',
  'resources.links.placeholder': 'Resource links coming soon. Stay tuned.',

  // FAQ section headers
  'resources.faq.section.foundation': 'Foundation Concepts',
  'resources.faq.section.language': 'Miniscript Language Basics',
  'resources.faq.section.technical': 'Miniscript Technical Details',
  'resources.faq.section.tooling': 'Tool & Safety',

  // FAQ items
  'resources.faq.q1': 'What is Miniscript, and how does it differ from Bitcoin Script?',
  'resources.faq.a1': `**Miniscript is a structured subset of Bitcoin Script**, using composable policy functions like \`pk()\`, \`and()\`, \`or()\`, and \`thresh()\` to describe spending conditions.

Bitcoin Script is the low-level scripting language of the Bitcoin network, hard to write and audit. Miniscript is compiled into on-chain scripts by tools automatically.

Core advantages:
- Clear semantics: high-level policy functions replace low-level opcodes
- Composable: policies can nest and combine flexibly
- Formally verifiable: compiler verifies script safety
- Safety-checked compilation: results undergo thorough review`,

  'resources.faq.q5': 'What is a Descriptor (output descriptor)? Why do we need it?',
  'resources.faq.a5': `**A Descriptor is a complete description of "how to generate a Bitcoin address"**, e.g., \`wsh(thresh(2,pk(A),pk(B),pk(C)))\` means use SegWit v0 P2WSH wrapping a 2-of-3 multisig script.

It encodes the address type (P2PKH / P2WPKH / P2WSH / P2TR, etc.) and script content, allowing wallets to reconstruct addresses precisely.

Why we need it:
- Precise recovery: wallets can regenerate addresses and spending logic from Descriptor
- Standardization: unified format adopted by the community for easy exchange and storage
- No memorization: users don't need to remember low-level opcodes and script details
- Cross-tool compatibility: follows SLIP-0380 standard, supported by many wallets`,

  'resources.faq.q2': 'What is a Policy, and how does it relate to Miniscript?',
  'resources.faq.a2': `**Policy is a higher-level strategy description language**, closer to business logic, e.g., \`or(pk(Alice), and(pk(Bob), older(144)))\`.

Three-layer abstraction:

1. **Policy**: highest layer, human-readable logic describing spending conditions
2. **Miniscript**: middle layer, compiled from Policy, closer to Bitcoin Script structure with witness types and wrapper info
3. **Bitcoin Script**: lowest layer, actual opcodes executed on-chain

Workflow:
- Users only write Policy
- Tools automatically compile to optimal Miniscript
- Further compiled to on-chain Script`,

  'resources.faq.q9': 'What is a Spending Path?',
  'resources.faq.a9': `**A spending path is one specific combination of conditions that satisfies a policy**.

Example: policy \`or(pk(Alice), and(pk(Bob), older(144)))\` has two paths:

- Path 1: Alice signs (condition satisfied)
- Path 2: Bob signs + wait 144 blocks

The condition simulator:
- Toggle signatures: simulate specific party signing
- Drag time slider: adjust block height, test timelocks
- Real-time feedback: shows which path is available and what's missing`,

  'resources.faq.q3': 'What is the difference between `older()` and `after()`?',
  'resources.faq.a3': `**Two timelocks differ in how they're calculated**.

\`older(n)\` - Relative timelock:
- Based on \`nSequence\` field
- Means "at least n blocks must pass since this UTXO was locked"
- Common for inheritance recovery and backup scenarios

\`after(n)\` - Absolute timelock:
- Based on \`nLockTime\` field
- Means "can only spend after Bitcoin block height n is reached"
- Common for contracts that unlock at specific times

Choose based on:
- Relative timelocks are more flexible as they count from confirmation
- Absolute timelocks are clearer, specifying exact block height`,

  'resources.faq.q4': 'What is thresh(), and how is it different from and() / or()?',
  'resources.faq.a4': `**\`thresh()\` is a universal threshold operator** meaning "at least k of N conditions must be satisfied to spend".

Basic relationships:

- \`and(a, b)\` ≈ \`thresh(2, a, b)\` (both must be satisfied)
- \`or(a, b)\` ≈ \`thresh(1, a, b)\` (either one suffices)
- \`thresh(2, pk(Alice), pk(Bob), pk(Carol))\` = any two of three can sign

Why we need \`thresh()\`:
- Flexibility: supports any k-of-N combination without separate operators
- Expressiveness: describes more complex threshold conditions
- Efficiency: compiler optimizes specially for different k values`,

  'resources.faq.q6': 'What is P2WSH? How is it different from P2PKH and P2WPKH?',
  'resources.faq.a6': `**The three address formats differ in script size and Witness handling**.

P2PKH (Legacy format):
- Full script stored in scriptSig
- Higher fees, unsuitable for complex scripts

P2WPKH (SegWit v0 single-sig format):
- Only for standard single-key payments
- Segregated witness data, lower fees

P2WSH (SegWit v0 script-hash format):
- Ideal for complex multisig or timelock scripts
- Witness data separate from transaction body
- Script stored as hash, saves space
- Miniscript's default supported format

Notes:
- Miniscript Lab's MVP currently only supports P2WSH
- Taproot (P2TR) will be supported in a future version`,

  'resources.faq.q7': 'Can the addresses generated by this tool be used on mainnet?',
  'resources.faq.a7': `**Absolutely not**. Miniscript Lab is a purely educational tool, all addresses are testnet-only.

Key restrictions:
- Only Bitcoin Testnet / Signet networks
- No connection to any blockchain
- Cannot handle private keys or real signatures
- No real transaction signing possible

Correct use cases:
- Learn and understand Miniscript syntax
- Design and prototype spending conditions
- Test multisig and timelock logic

Warnings:
- Never use generated addresses for mainnet funds
- Never import real private keys into this tool
- This tool is for education only`,

  'resources.faq.q8': 'What is the difference between the visual builder (canvas mode) and writing Policy directly?',
  'resources.faq.a8': `**Both approaches are fundamentally equivalent** — canvas operations generate Policy text in real time and vice versa.

When to use each:

Canvas mode (Visual builder):
- Intuitively understand policy structure and hierarchy
- Avoid syntax errors
- Perfect for beginners and quick prototyping
- Limitation: doesn't yet support \`after()\` and hashlocks

Text editing mode (Policy editor):
- Faster and more flexible
- Better for syntax-familiar users
- Supports all Miniscript features
- Can write arbitrarily complex policies

Special case:
- When Policy contains unsupported syntax, canvas enters "read-only snapshot mode"
- You can continue editing Policy text
- Sync button retries parsing`,

  'resources.faq.q10': 'Why are some paths labeled "Malleable"?',
  'resources.faq.a10': `**Malleability means transaction Witness data can be modified by a third party without changing transaction semantics**.

What is malleability:
- A third party can modify Witness stack data
- This changes the transaction ID (txid)
- But transaction semantics (which UTXO was spent) stay the same

SegWit's improvement:
- SegWit segregates Witness data
- Solves main transaction ID malleability
- But some complex Miniscript structures may have Witness-level malleability

In this tool:
- Malleability is marked as a warning (not a critical error)
- Doesn't affect basic functionality verification
- Educational for understanding the issue

Production recommendations:
- Should avoid malleable paths
- Use formal verification tools to check scripts
- Full audit before deployment`,

  // New FAQ items (11-18)
  'resources.faq.q11': 'What are the basic operators supported by Policy?',
  'resources.faq.a11': `**Policy supports core operators** for combining spending conditions.

Signatures and timelocks:
- \`pk(key)\` - single key signature
- \`older(n)\` - relative timelock (n blocks)
- \`after(n)\` - absolute timelock (block height)

Hashlocks:
- \`sha256(h)\`, \`hash256(h)\` - SHA-256 hashlock
- \`ripemd160(h)\`, \`hash160(h)\` - RIPEMD-160 hashlock

Combination operators:
- \`and(cond1, cond2)\` - both conditions required
- \`or(cond1, cond2)\` - either condition
- \`thresh(k, cond1, ...)\` - k-of-N threshold
- \`andor(cond1, cond2, cond3)\` - conditional branching

Optimizations:
- \`multi(k, key1, ...)\` - direct multisig
- \`just_key(key)\` - single-key optimization`,

  'resources.faq.q12': 'What are `andor()` and `or_c()`? When should I use them?',
  'resources.faq.a12': `**\`andor()\` is a conditional branching form** with semantics "if cond1 is satisfied, then cond2 must also be satisfied; otherwise cond3 must be satisfied".

Real example:

\`andor(pk(Alice), pk(Bob), older(52560))\` means:
- Normal case: both Alice and Bob must sign
- After timeout (52560 blocks): Alice can sign alone

When to use:
- Fund recovery paths
- Backup timeout in multi-party management
- Prevent lockup when one party is unresponsive

\`or_c()\` difference:
- \`or_c()\` is an alternative conditional encoding
- Different compilation affects Witness size and fees
- Choose the one that compiles high-frequency paths smaller`,

  'resources.faq.q13': 'How do I describe common multisig and recovery scenarios in Policy?',
  'resources.faq.a13': `**Common scenario examples**.

Basic multisig:
- 2-of-2: \`and(pk(A), pk(B))\`
- 2-of-3: \`thresh(2, pk(A), pk(B), pk(C))\`
- 3-of-5: \`thresh(3, pk(A), pk(B), pk(C), pk(D), pk(E))\`

Multisig with recovery:
- \`or(thresh(2, pk(A), pk(B)), older(52560))\` means "normally need A and B to sign, but after 1 year either can solo-recover"

Inheritance pattern:
- \`andor(pk(Alice), pk(Bob), or(pk(Carol), older(52560)))\` means "Alice and Bob jointly manage, Bob must consent, but if Bob is silent for 1 year Carol takes over"`,

  'resources.faq.q14': 'What is the Miniscript type system? Why do we need B, V, K, W types?',
  'resources.faq.a14': `**Each Miniscript fragment has a type signature** ensuring correct composition.

Four types:
- \`B\` (Boolean): script can execute as a top-level script
- \`V\` (Verify): after execution, leaves a true value on stack
- \`K\` (Key): script accepts key or signature parameter
- \`W\` (Wrapped): satisfaction mode is non-standard

Why the type system:
- Ensure correct composition: not all fragments can nest
- Prevent errors: types must be compatible
- Example: \`and(B, B)\` is valid, but \`and(V, V)\` is invalid

Formal verification:
- Eliminates hand-written script errors
- Compiler auto-validates all type constraints
- Guarantees scripts execute safely`,

  'resources.faq.q15': 'What are Miniscript modifiers?',
  'resources.faq.a15': `**Modifiers are single-letter annotations** adjusting fragment properties.

Common modifiers:
- \`z:\` - zero nullability: ensures no empty values on stack
- \`o:\` - one extension: can push arbitrary values
- \`n:\` - nonumber: doesn't rely on numeric interpretation
- \`d:\` - disassembly: includes full witness stack deserialization info
- \`u:\` - unsatisfiable: script might be impossible to satisfy

Purpose:
- Compiler verifies script safety
- Checks for stack pollution and type errors
- Guides compilation optimization
- Part of fragment type signature`,

  'resources.faq.q16': 'What are common Miniscript fragments and Wrappers?',
  'resources.faq.a16': `**Fragments are basic building blocks**, Wrappers adjust their properties.

Common fragments:
- \`pk_k(key)\` - minimal single-key checking
- \`pk_h(key)\` - hashed key, reduces witness size
- \`multi(k, keys...)\` - k-of-N multisig
- \`thresh(k, conds...)\` - generic threshold

Common Wrappers:
- \`c:\` - convert verify-type to boolean
- \`v:\` - append \`OP_VERIFY\` suffix
- \`d:\` - add deserialization support
- \`s:\` - swap top stack items
- \`a:\` - add \`OP_ADD\`
- \`j:\` - add \`OP_IF\` branching
- \`n:\` - remove top stack item

Optimization tip:
- Correct fragment and wrapper use significantly reduces script size
- Lower fees
- Better witness efficiency`,

  'resources.faq.q17': 'What are the script size and opcode limits? How do I optimize?',
  'resources.faq.a17': `**P2WSH script resource limits**.

Key limits:
- Max script size 10000 bytes
- Max 201 opcodes (some like \`OP_CHECKSIG\` count as 1, others differ)
- Max 1000 witness stack items
- Max 520 bytes per stack item

Compiler optimization strategies:

1. Structural optimization:
- Common branches compile to compact structures
- Choose optimal encoding

2. Weight hints:
- Use \`9@\` syntax in \`thresh()\`
- Example: \`thresh(2, 9@pk(A), pk(B), pk(C))\`
- Compiler prioritizes high-weight (frequent) paths for smaller encoding

Practical tips:
- Assign higher weights to common paths
- Avoid deep nesting
- Use wrappers to optimize fragment size`,

  'resources.faq.q18': 'Can I use this tool in production?',
  'resources.faq.a18': `**Absolutely not**. Miniscript Lab is an educational tool only.

Severe limitations:
- Only Bitcoin Testnet / Signet
- No connection to actual blockchain
- Cannot handle private keys or real signatures
- Cannot perform real transactions

For mainnet deployment:

1. Use production-grade tooling:
- Professional wallet software
- libminiscript C++ library
- Thoroughly audited tools

2. Security checks:
- Full security audit
- Formal verification of scripts
- Multiple code reviews

3. Gradual deployment:
- Small test amounts first on testnet
- Scale up gradually
- Backup all keys carefully

4. Documentation:
- Keep all Descriptors
- Back up recovery keys
- Document script design rationale`,
};

