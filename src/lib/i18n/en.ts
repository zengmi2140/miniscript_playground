export const en = {
  home: {
    hero: {
      title: 'Bitcoin Spending Conditions, Made Clear',
      subtitle:
        'Understand Miniscript through real spending scenarios — from multisig to timelocks, from concepts to working scripts.',
      desc: 'Behind every Bitcoin UTXO is a set of rules that determines who can spend it and when. Miniscript Lab helps you understand those rules.',
      cta: {
        primary: 'View applications',
        secondary: 'Open Playground',
      },
      card: {
        label: 'Spending Path Analysis',
        path1: 'Alice + Bob sign',
        path2: 'Alice + wait 30 days',
        path3: 'Bob + wait 30 days',
      },
    },
    explainer: {
      label: 'The Basics',
      title: 'What is Miniscript?',
      subtitle:
        'Every Bitcoin UTXO is governed by a script that defines who can spend it and when. Miniscript is a structured language that makes those rules readable, composable, and formally verifiable.',
      what: {
        title: 'What Miniscript Is',
        desc: 'Bitcoin Script is a low-level stack language that is hard to write correctly and even harder to audit. Miniscript is a structured subset of Bitcoin Script — it expresses spending conditions as composable policy trees, which tools automatically compile into on-chain scripts, eliminating hand-crafting errors.',
      },
      why: {
        title: 'Why It Matters',
        benefit1:
          'Human-readable semantics: and(), or(), thresh() map directly to business logic anyone can understand',
        benefit2:
          'Composable and auditable: conditions nest freely, tools auto-analyze all spending paths and minimal witnesses',
        benefit3:
          'On-chain safe: compiled output is formally verified against all Bitcoin Script safety constraints',
      },
      mission: {
        label: 'Our Mission',
        title: 'Why We Built This',
        desc: 'Miniscript tooling is scattered, documentation is dense, and there is a steep learning curve between wallet developers and advanced users. Miniscript Lab brings compilation, path analysis, and visual building into one interactive platform — so anyone can truly understand Bitcoin spending conditions.',
      },
      comparison: {
        old: {
          title: 'Raw Bitcoin Script (hard to read)',
          example: `OP_2\n<Alice> <Bob> <Carol>\nOP_3 OP_CHECKMULTISIG`,
          problem1:
            'Opcode stacks are non-intuitive — experts must trace every byte to understand intent',
          problem2:
            'Even slightly complex conditions are nearly impossible to hand-write correctly — one wrong byte locks funds forever',
        },
        new: {
          title: 'Miniscript Policy (readable at a glance)',
          example: `or(\n  thresh(2, pk(Alice), pk(Bob), pk(Carol)),\n  and(pk(Alice), older(52560))\n)`,
          advantage1: 'Structure is semantics: or / and / thresh map directly to intent',
          advantage2:
            'Compiles to an optimal script automatically — tools verify safety, no low-level code needed',
        },
      },
    },
    how: {
      label: 'How It Works',
      title: 'Three Steps to Any Spending Policy',
      subtitle:
        'From scenario selection to a complete on-chain script — with visual feedback every step of the way.',
      step1: {
        title: 'Choose a Scenario',
        desc: 'Start from a real use case: team multisig, multisig + timelock, recovery key, degrading vault...',
        example: '2-of-3 Multisig · Multisig + Timelock · Recovery Key',
      },
      step2: {
        title: 'Write or Build a Policy',
        desc: 'Describe the rules in Policy language, or drag and drop condition nodes in the visual builder.',
        example: 'thresh(2,pk(A),pk(B),older(4320))',
      },
      step3: {
        title: 'See All Spending Paths',
        desc: 'Every valid spending path is listed. Toggle signatures, slide the time — watch paths light up.',
        example: 'Path 1: Alice + Bob · Path 2: Timeout',
      },
      step4: {
        title: 'Get the On-Chain Script',
        desc: 'Full output: Script, Descriptor, and P2WSH address ready for testnet deployment.',
        example: 'OP_2 <Alice> <Bob> ... OP_CHECKMULTISIG',
      },
    },
    features: {
      label: 'Core Features',
      title: 'More Than a Compiler',
      subtitle: 'Designed for genuine understanding, not just script generation.',
      f1: {
        title: 'Real-Time Compilation',
        desc: 'Type a Policy and instantly see the Miniscript, Script, Descriptor, and address. Syntax errors are pinpointed precisely.',
      },
      f2: {
        title: 'Visual Path Explorer',
        desc: 'Every valid spending combination is shown as an interactive tree. Simulate signatures and timelocks to see which paths open.',
      },
      f3: {
        title: 'Visual Policy Builder',
        desc: 'No code required. Click to add condition nodes, combine them on a canvas, and the system generates the Policy for you.',
      },
      f4: {
        title: 'One-Click Sharing',
        desc: 'Bundle your current policy, key variables, and simulation state into a shareable link for easy collaboration.',
      },
    },
    scenarios: {
      label: 'Scenario Library',
      title: 'Start with a Real-World Scenario',
      subtitle:
        'Each scenario comes with an explanation, a complete Policy, and an interactive spending path diagram.',
    },
    wallets: {
      label: 'Ecosystem',
      title: 'Wallets Supporting Miniscript',
      subtitle:
        'These software and hardware wallets have native Miniscript support, ready for real-world use with complex spending conditions.',
      software: 'Software Wallets',
      hardware: 'Hardware Wallets',
    },
    cta: {
      title: 'Ready to Design Your Own?',
      subtitle:
        'Use the visual canvas in the Playground to compose a policy and see Policy, Miniscript, and spending paths in real time.',
      build: 'Build with Canvas',
    },
    playground: {
      desktopHint: 'For the full experience, open the Playground on a desktop or larger screen.',
    },
    meetMiniscript: {
      title: 'Meet Miniscript',
      subtitle: "Bitcoin Script already has enough expressive power — the real bottleneck is how you write it. Miniscript doesn't change anything underneath; it adds one structured layer on top.",

      definition: {
        title: 'What is Miniscript',
        calloutStrong: 'Miniscript — a compilable, verifiable, composable intermediate language.',
        calloutBody:
          'Not a new consensus rule, not a new virtual machine — what runs on-chain is still Bitcoin Script. It only inserts this layer between how you write scripts and how machines read them.',
        arrowLabel: 'compiles to',
        stack: {
          policy: {
            layer: 'Policy',
            role: 'How humans think',
            subtitle: 'Natural-language semantics',
            example: 'and / or / thresh …',
          },
          miniscript: {
            layer: 'Miniscript',
            role: 'How tools analyze',
            subtitle: 'Standardized IR',
            example: 'Typed, verifiable',
          },
          script: {
            layer: 'Bitcoin Script',
            role: 'How chains execute',
            subtitle: 'Opcode sequence',
            example: 'OP_CHECKSIG / OP_CSV …',
          },
        },
      },

      features: {
        title: 'What Miniscript brings',

        readability: {
          label: 'Readability',
          title: 'Structure is semantics — readable at a glance',
          scriptCaption: 'Bitcoin Script',
          policyCaption: 'Miniscript Policy',
          compareNote:
            'Same 2-of-3 multisig. On the right you instantly read "threshold = 2"; on the left you have to understand the stack machine first.',
          takeaway: 'Just focus on "who can spend, and when." Leave the low-level details to the compiler.',
        },

        composability: {
          label: 'Composability',
          title: 'Compose like building blocks — analyze like tools',
          blocksLabel: 'Basic conditions',
          combineArrow: 'Freely combine',
          resultLabel: 'Combined result',
          benefit1: {
            title: 'Standalone primitives',
            desc: 'pk, older, sha256 — every one stands alone and stays valid under any nesting.',
          },
          benefit2: {
            title: 'Nesting never hurts',
            desc: 'No matter how deeply you nest, the compiler finds the smallest equivalent Bitcoin Script.',
          },
          benefit3: {
            title: 'Structured = analyzable',
            desc: 'Tools can automatically answer "what are the spending paths, and how expensive is each?" — which is exactly what this Playground does.',
          },
        },

        portability: {
          label: 'Portability',
          title: 'Write once, restore in any wallet',
          walletA: 'Wallet A',
          walletADesc: 'Design spending policy',
          export: 'Export',
          descriptorNote: 'Standard format with full policy information',
          import: 'Import',
          walletB: 'Wallet B',
          walletBDesc: 'Fully restored policy',
          takeaway: 'Your spending rules belong to you — no vendor lock-in.',
        },
      },
    },
    transition: {
      title: 'Behind Every Address, There Is a Script',
      subtitle: 'A Bitcoin address is not just a string of characters — it corresponds to a script that defines who can spend the funds.',
      singleSig: {
        label: 'Single Signature',
        desc: 'One private key to spend.',
        code: 'OP_DUP OP_HASH160\n  <PubKeyHash>\nOP_EQUALVERIFY OP_CHECKSIG',
      },
      multiSig: {
        label: 'Multisig (2-of-3)',
        desc: 'Any two of three keys can spend.',
        code: 'OP_2\n  <PubKey1>\n  <PubKey2>\n  <PubKey3>\nOP_3 OP_CHECKMULTISIG',
      },
      footer: 'Beyond multisig — timelocks, hashlocks, threshold combinations… can all be written into spending conditions. But actually writing them runs into a whole other problem.',
    },
    scriptComplexity: {
      title: 'The Complexity of Bitcoin Script',
      subtitle: 'The scripts above are the two simplest cases. Once you try to express anything more interesting, you run into four structural walls.',
      items: {
        lowLevel: {
          label: 'Low-level abstraction',
          desc: 'Based on opcodes and a stack. To read any script you have to trace the stack state line by line in your head — even a 2-of-3 multisig looks like a chain of mystery symbols.',
        },
        errorProne: {
          label: 'Error-prone',
          desc: 'One wrong byte or misplaced branch can lock funds forever, and there is no easy way to statically verify off-chain that "this script is actually spendable."',
        },
        nonComposable: {
          label: 'Hard to compose',
          desc: 'Scripts cannot be broken into reusable pieces the way functions can. Adding one new condition usually means redesigning the whole thing from scratch.',
        },
        hardToAnalyze: {
          label: 'Hard to analyze',
          desc: 'Script size, witness cost, spending paths — all derived by hand. No standard tool can answer "what does this script actually express?"',
        },
      },
      outro: 'None of these are unsolvable — Miniscript is designed exactly for this.',
    },
    challenge: {
      subtitle: 'Bitcoin Script is powerful, but it has several fundamental design challenges.',
      scriptCol: {
        lowLevel: {
          label: 'Low-Level Abstraction',
          desc: 'A stack-based assembly-style language where code looks like a mysterious chain of opcodes. Even simple logic requires a deep understanding of the stack machine.',
        },
        errorProne: {
          label: 'Error-Prone',
          desc: 'A tiny mistake can introduce a serious security flaw, and these are hard to detect automatically. Stack overflows, branch errors, and edge cases abound.',
        },
        nonComposable: {
          label: 'Non-Composable',
          desc: 'Hard to decompose into reusable components — every script must be built from scratch. Modular design, as in modern languages, is essentially impossible.',
        },
        hardToAnalyze: {
          label: 'Hard to Analyze',
          desc: 'Verifying the correctness and security of a script requires extensive manual inspection. No automated tools exist to audit script properties systematically.',
        },
      },
      miniscriptCol: {
        highLevel: {
          label: 'High-Level Abstraction',
          desc: 'Near-natural-language syntax makes intent obvious. Developers focus on business logic, not low-level stack mechanics.',
        },
        formalVerif: {
          label: 'Formal Verification',
          desc: 'The compiler has safety checks built in and automatically validates scripts for correctness. The type system prevents the most common classes of error.',
        },
        composable: {
          label: 'Highly Composable',
          desc: 'Combine conditions like LEGO bricks to build complex contracts. Standard composition operators guarantee that the output is always valid.',
        },
        autoOpt: {
          label: 'Auto-Optimized',
          desc: 'The compiler automatically minimizes script size. Analysis finds the smallest equivalent Bitcoin Script representation.',
        },
      },
      codeCompare: {
        scriptCaption: 'An opaque sequence of opcodes',
        miniscriptCaption: 'Clear, explicit logic',
      },
    },
    concepts: {
      subtitle: 'Understand the relationship between Policy, Miniscript, and Descriptor.',
      policy: {
        desc: "A high-level, human-readable description of spending conditions. Policy expresses who can spend funds, and under what conditions, in natural language. It is the topmost abstraction layer — you can use any combinatorial logic without worrying about whether the compiled result will be valid.",
        example: "Either Alice's signature alone, or Bob's signature after a certain block height.",
      },
      miniscript: {
        desc: 'The bridge between high-level Policy and low-level Bitcoin Script. Miniscript is a standardized, verifiable, and analyzable intermediate representation. Every Miniscript expression has a well-defined type and set of properties, which lets the compiler perform safety checks and optimizations.',
        featuresLabel: 'Core Features',
        feature1: 'Type system (base types B, V, K, W plus modifiers z, o, n, d, u)',
        feature2: 'Automatic script optimization',
        feature3: 'Formal property verification',
        feature4: 'Compile-time safety checks',
        compileLabel: 'Compiled Output',
        compileDesc: 'The final Bitcoin Script opcodes, submitted to the blockchain for execution.',
        compileNote: 'Typically 20–40% smaller than hand-written Bitcoin Script',
      },
      descriptor: {
        desc: 'A portable, universal way to specify the outputs a wallet can spend. Descriptors combine Miniscript with actual key information. A descriptor contains everything needed to generate addresses and create transactions — making wallet migrations seamless.',
        multisigLabel: 'Multisig example',
        timelockLabel: 'Timelock example',
        note: 'Wallets use descriptors to derive addresses and build transactions, ensuring all participants share the same understanding of the script structure.',
      },
      stack: {
        step1: { desc: 'High-level policy language', detail: 'Expresses signing conditions in natural language' },
        step2: { desc: 'Intermediate representation', detail: 'Standardized, verifiable, and auto-optimized' },
        step3: { desc: 'Low-level opcodes', detail: 'Executed on-chain, size-optimized' },
      },
    },
    why: {
      innovation: {
        title: 'Enabling Innovation',
        desc: 'By lowering the barrier to entry, more developers can participate in the Bitcoin ecosystem and build innovative applications. Complex scripts are no longer the exclusive territory of a small circle of cryptographers.',
      },
      enterprise: {
        title: 'Enterprise Adoption',
        desc: 'Businesses and institutions can deploy complex Bitcoin contracts with confidence, without over-engineering security measures. Built-in verification and optimization deliver enterprise-grade guarantees.',
      },
      ecosystem: {
        title: 'Ecosystem Growth',
        desc: 'Miniscript lays the groundwork for advances like Taproot and helps push Bitcoin smart contracts forward. It provides a design reference for future scalability features.',
      },
      efficiency: {
        title: 'Greater Efficiency',
        desc: 'Development, testing, and deployment cycles shrink dramatically. Automatic script optimization reduces on-chain fees. Teams stay focused on business logic rather than low-level implementation details.',
      },
    },
  },

  nav: {
    scenarios: 'Home',
    playground: 'Playground',
    compare: 'Resources',
    comingSoon: 'Soon',
    toggleMenu: 'Toggle menu',
  },

  header: {
    language: { zh: '中文', en: 'EN' },
    theme: { light: 'Light', dark: 'Dark' },
  },

  intro: {
    applications: {
      tryIt: 'Try it',
      subtitle: 'From Policy to on-chain script: watch the full compilation pipeline for real-world scenarios.',
      scenarioLabel: 'Scenario',
      typeLabel: 'Application type',
      caseLabel: 'Real-world examples',
      advantageLabel: 'Advantage',
      compileArrow: 'compile ↓',
      scriptSizeLabel: 'Script size optimization',
      witnessLabel: 'Witness',
    },
  },

  builder: {
    starter: {
      title: 'Choose Strategy Type',
      subtitle: 'Pick a root node type; add more conditions on the canvas afterward.',
      singleControl: 'Single Signature',
      singleControlDesc: 'One key signs',
      sharedControl: 'Threshold Condition',
      sharedControlDesc: 'k-of-n threshold',
    },
    canvas: {
      waitingTree: 'Compiling and syncing canvas…',
      initializing: 'Syncing canvas…',
    },
    sync: {
      textLed:
        'Current policy contains unsupported constructs (e.g., after() or hashlocks). Canvas shows the last synced snapshot.',
      compileError:
        'Policy cannot be compiled or parsed. The canvas is read-only. If nothing has compiled successfully yet, you see the initial placeholder; fix the Policy to resync.',
      readOnly: 'Read-only',
    },
    node: {
      signature: 'Signature',
      timelock: 'Timelock',
      threshold: 'Threshold',
      all: 'All Required',
      any: 'Either One',
      addChild: 'Add Condition',
      delete: 'Delete',
      wrap: 'Wrap as',
      undefinedRole: 'Undefined role',
    },
    op: {
      switch: { title: 'Switch Operator' },
      all: { label: 'All Required', desc: 'All conditions must be satisfied (AND)' },
      any: { label: 'Either One', desc: 'Either of the two conditions is enough (OR)' },
      threshold: {
        label: 'Threshold',
        desc: 'k-of-n: satisfy any k conditions',
        confirm: 'Confirm',
        k: { label: 'Number required' },
      },
      binaryTrimNotice: 'Switched to AND/OR: only the first two child conditions were kept.',
    },
    popover: {
      selectRole: 'Select Role',
      addRole: 'Add New Role',
      blocks: 'Blocks',
      timePreset: 'Time Preset',
      threshold: 'Threshold',
      thresholdHint: '{k} of {n} signatures',
      timeConversion: '~{time}',
      '7days': '7 days',
      '30days': '30 days',
      '90days': '90 days',
      '180days': '180 days',
      '1year': '1 year',
      custom: 'Custom',
    },
    action: {
      wrapAll: 'Wrap as "All Required"',
      wrapAny: 'Wrap as "Either One"',
      wrapThreshold: 'Wrap as "Threshold"',
      addSignature: 'Add Signature',
      addTimelock: 'Add Timelock',
      addGroup: 'Add nested group',
    },
    confirm: {
      title: 'Confirm Deletion',
      deleteRoot: 'Delete the entire policy? This will reset the canvas to its initial state.',
      cancel: 'Cancel',
      confirm: 'Delete',
    },
    wrap: {
      title: 'Wrap in New Group',
      depthWarning: 'Deep nesting detected — consider keeping within 5 levels',
    },
  },

  playground: {
    editor: {
      title: 'Policy Editor',
      placeholder: 'Enter a policy, e.g.: pk(Alice)',
      compile: 'Compile',
      format: 'Format',
      clear: 'Clear',
      copy: 'Copy',
      share: 'Share',
      shareCopied: 'Copied!',
      shareUrlTooLong:
        'This share link is long and may fail in some environments; copied to clipboard. Shorten the policy if opening fails.',
    },
    error: {
      hints: 'Suggestions',
      expandDetails: 'Show technical details',
      collapseDetails: 'Hide technical details',
      copyRaw: 'Copy raw message',
      rawCopied: 'Copied!',
    },
    keys: {
      title: 'Key Variables',
      add: 'Add',
      random: 'Random',
      restore: 'Restore Defaults',
      empty: 'No key variables',
      hint: 'MVP uses compressed public keys (66 hex chars, for P2WSH)',
    },
    context: {
      title: 'Address Type',
      wsh: 'SegWit v0 (P2WSH)',
      tr: 'Taproot',
      comingSoon: 'Coming Soon',
      network: 'Network',
    },
    pathmap: { title: 'Spending Path Map' },
    conditions: { title: 'Condition Simulator' },
    timeslider: {
      label: 'Time Elapsed',
      blocks: 'blocks',
      current: 'Current: Block {tipHeight}',
      elapsedInline: '{count} · {human}',
      sliderAriaValue: 'Simulated elapsed {count} blocks ({human})',
      tipLoading: 'Fetching chain tip height…',
    },
    status: {
      canSpend: 'Spendable: {path}',
      waiting: 'Wait {time} more, then {path} becomes available',
      cannotSpend: 'Cannot spend under current conditions, missing {missing}',
      someConditions: 'some conditions',
    },
    results: {
      policy: 'Policy',
      miniscript: 'Miniscript',
      script: 'Script',
      descriptor: 'Descriptor',
      address: 'Address',
      paths: 'Spending Paths',
      panelNav: 'Result panels',
      explain: 'What is this?',
      stale: 'stale',
    },
    stack: {
      title: 'Script VM',
      comingSoon: 'Coming Soon',
    },
    empty: {
      title: 'Enter a Policy or select a scenario',
      subtitle: 'Start exploring Bitcoin spending paths',
    },
    left: {
      scenarios: 'Scenarios',
      diy: 'Build Your Own',
      diyDesc: 'Freely combine spending conditions to design your own policy',
      diyComingSoon: 'Coming Soon',
      diyActive: 'Building',
      keysPlaceholder: 'Key variables will auto-fill after selecting a scenario',
    },
    center: {
      compilePlaceholder: 'Path map will appear here after compilation',
      staleWarning: 'Policy has a syntax error. Showing the last successful compilation result.',
      hasError: 'Compilation failed. Please check the Policy syntax on the left.',
    },
    right: {
      waiting: 'Waiting for compilation...',
      tabPlaceholder: 'Compilation results will appear here',
    },
    paths: {
      empty: 'No spending paths available. All paths are unsatisfiable under current conditions.',
      malleable: 'Malleable',
      witness: 'Witness: ~{size} vB',
      labelLine: 'Path {index}: {description}',
      labelDesc: {
        signatures: '{names} signatures',
        timelockRecovery: 'Timeout recovery',
        timelockOnly: 'Timelock path',
        hashlock: 'Hashlock path',
        generic: 'Spending path',
      },
    },
    address: { warning: 'This address is for testnet only. Do not use on mainnet.' },
    mobile: {
      title: 'Use a Desktop or Larger Screen',
      description:
        'The full Playground — three-column layout and visual builder — needs a wider viewport. Open it on a desktop, laptop, or a tablet in landscape for the full experience.',
      goScenarios: 'Browse Scenarios',
    },
  },

  compare: {
    comingSoon: 'Compare Mode Coming Soon',
    description: "Side-by-side comparison of two Policies' compilation results and spending paths",
    featureList: { title: 'Planned Features' },
    feature: {
      '1': 'Side-by-side compilation results for two Policies',
      '2': 'Visual diff of spending paths',
      '3': 'Script size and fee comparison',
      '4': 'Export to Markdown / JSON report',
    },
  },

  scenarios: {
    title: 'Miniscript Lab',
    subtitle: 'Making Bitcoin spending conditions crystal clear',
    orWrite: 'or write your own',
    openBlank: 'Open Blank Playground',
  },

  flow: {
    rootLabel: 'Spending Conditions',
    andLabel: 'All Required',
    orLabel: 'Either One',
  },

  footer: {
    description: 'A scenario-first, spending-path-centered Miniscript educational lab',
    rights: 'Miniscript Lab',
  },

  glossary: {
    tooltip: { label: 'What is this' },
  },

  resources: {
    toolsDoc: {
      title: 'Tools & documentation',
      subtitle: 'Official sites, reference implementations, online playgrounds, and SDKs.',
    },
    reading: {
      title: 'Recommended reading',
      subtitle: 'In-depth articles—more coming soon.',
      placeholder: 'Article list is being curated. Check back later.',
      articles: {
        bdkHidden: {
          title: 'Hidden Powers of Miniscript Policy & Descriptors',
          source: 'Bitcoin Dev Kit blog',
        },
        nunchuk101: { title: 'Miniscript 101: A Technical Guide', source: 'Nunchuk' },
        bitboxP1: {
          title: 'Understanding Bitcoin Miniscript — Part 1: How Bitcoin Script works, and why it is hard',
          source: 'BitBox / Shift Crypto blog',
        },
        bitboxP2: {
          title: 'Understanding Bitcoin Miniscript — Part 2: What is Miniscript?',
          source: 'BitBox / Shift Crypto blog',
        },
        advancingBm: {
          title: 'Miniscript: Composable, Analyzable and Smarter Bitcoin Script',
          source: 'Advancing Bitcoin 2022 · BTC Transcripts',
        },
      },
    },
    links: {
      official: {
        badge: 'Reference',
        title: 'Miniscript',
        desc: 'Documentation and tooling by Pieter Wuille: language overview, online compiler, analyzer, type system, and usage notes.',
      },
      rust: {
        badge: 'Implementation',
        title: 'Rust Miniscript',
        desc: 'The widely used Rust implementation: compiler, satisfiability analysis, and extensive tests—ideal for reading source and production integrations.',
      },
      studio: {
        badge: 'Online tool',
        title: 'Miniscript Studio',
        desc: 'In-browser Policy/Miniscript workbench: examples from basics to Taproot, embedded Policy & Miniscript references, spending-path analysis, and shareable URLs (local storage; use public keys only).',
      },
      minsc: {
        badge: 'Language & playground',
        title: 'Minsc',
        desc: 'A Miniscript-Policy-based scripting language with variables, functions, and infix syntax; live WASM compiler outputs Policy, Miniscript, script, and addresses (testnet).',
      },
      bdkPlayground: {
        badge: 'Online tool',
        title: 'BDK Playground',
        desc: 'In-browser Policy compiler and descriptor wallet playground: map policy aliases to keys, pick P2SH/P2WSH-style contexts, and edit spending conditions in the visual or policy text field.',
      },
      miniscriptBuilder: {
        badge: 'Online tool',
        title: 'Miniscript Builder',
        desc: 'Visual node editor (WASM, rust-miniscript, Rete.js)—drag nodes to build policies. Supports multiple networks and address derivation, JSON import/export, and URL sharing of the full editor state.',
      },
      bdk: {
        badge: 'Developer toolkit',
        title: 'Bitcoin DevKit',
        desc: 'A popular SDK for wallet functionality in applications; docs and examples cover Descriptors, PSBT, and Miniscript-related workflows.',
      },
    },
  },
} as const;
