export const en = {
  home: {
    hero: {
      badge: 'Bitcoin Miniscript',
      title: 'Miniscript: make Bitcoin spending conditions readable, analyzable, composable',
      intro1:
        'A structured language designed by Pieter Wuille, Andrew Poelstra, and Sanket Kanjalkar — it lifts multisig, timelocks, and hashlocks out of opaque opcodes.',
      intro2:
        'ScriptWise is a learning site that walks you through Miniscript with real-world scenarios — from a policy description to a runnable Bitcoin Script.',
      ctaPrimary: 'Start from a Real Scenario ↓',
      ctaSecondary: 'Open Playground',
      desktopHint: 'For the full experience, open the Playground on a desktop or larger screen.',
      card: {
        filename: 'policy.miniscript',
        tag: 'P2WSH',
        compilesTo: '↓ compiles to',
        statusNote: 'Example: compilation walkthrough',
        replay: '↻ Replay',
      },
      paths: {
        path1: 'Alice + Bob co-sign',
        path2: 'Alice + wait 30 days',
      },
    },

    hook: {
      eyebrow: 'Why this matters to you',
      q1: 'You want to leave some Bitcoin for your family — will they be able to claim it if you are gone?',
      q2: 'You want a 2-of-3 multisig — what happens if one of the keys is lost?',
      q3: 'You want a third party to custody your assets while you keep an emergency recovery path?',
      outro:
        'These are all "spending condition" problems. Bitcoin natively supports them — but writing them is where you will want Miniscript.',
    },

    transition: {
      title: 'Behind Every Address, There Is a Script',
      subtitle:
        'A Bitcoin address is not just a string of characters — it corresponds to a script that defines who can spend the funds.',
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
      footer:
        'Beyond multisig — timelocks, hashlocks, threshold combinations… can all be written into spending conditions. But actually writing them runs into a whole other problem.',
    },

    scriptComplexity: {
      title: 'The Complexity of Bitcoin Script',
      subtitle:
        'The scripts above are the two simplest cases. Once you try to express anything more interesting, you run into four hard limits of Bitcoin Script.',
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

    meetMiniscript: {
      title: 'Meet Miniscript',
      subtitle:
        "Bitcoin Script already has enough expressive power — the real bottleneck is how you write it. Miniscript doesn't change anything underneath; it adds one structured layer on top.",

      definition: {
        title: 'What is Miniscript',
        calloutStrong: 'Miniscript — a compilable, verifiable, composable intermediate language.',
        calloutBody:
          "If Bitcoin Script is assembly, Miniscript is its high-level language — it doesn't alter the underlying consensus, only how you write things. It is not a new consensus rule, nor a new virtual machine — what runs on-chain is still Bitcoin Script. It simply inserts this layer between how you write scripts and how tools analyze them.",
        arrowLabel: 'compiles to',
        pipeline: {
          policy: {
            layer: 'Policy',
            role: 'How you think',
            desc: 'Describe "who can spend" in human-readable form. Any combinatorial logic is valid — no need to worry about whether the compiled script ends up valid.',
            code: 'or(pk(Alice), and(pk(Bob), older(144)))',
            note: 'Either Alice alone, or Bob once the block height passes 144.',
          },
          miniscript: {
            layer: 'Miniscript',
            role: 'How tools analyze',
            desc: 'The bridge between Policy and Bitcoin Script. Every expression is typed, enabling automatic verification, analysis, and optimization.',
            code: 'or_d(pk(Alice), and_v(v:pk(Bob), older(144)))',
            note: "The standardized form after compiling a Policy — every node carries types and properties.",
          },
          script: {
            layer: 'Bitcoin Script',
            role: 'How chains execute',
            desc: 'The opcode sequence that ultimately hits the chain, generated by Miniscript — no need to hand-write it.',
            code: 'OP_DUP <Alice> OP_CHECKSIGVERIFY OP_IFDUP OP_NOTIF <Bob> OP_CHECKSIG OP_ENDIF',
            note: 'On-chain nodes execute these opcodes one by one under the existing consensus rules.',
          },
        },
      },

      features: {
        title: 'What Miniscript brings',

        readability: {
          label: 'Readability',
          title: 'Structure is semantics — readable at a glance',
          scriptCaption: 'Bitcoin Script',
          scriptExample: 'OP_2 <pk1> <pk2> <pk3>\nOP_3 OP_CHECKMULTISIG',
          policyCaption: 'Miniscript Policy',
          policyExample: 'thresh(2,\n  pk(Alice),\n  pk(Bob),\n  pk(Charlie)\n)',
          compareNote:
            'Same 2-of-3 multisig. On the right you instantly read "threshold = 2"; on the left you have to understand the stack machine first.',
          takeaway:
            'Just focus on "who can spend, and when." Leave the low-level details to the compiler.',
        },

        composability: {
          label: 'Composability',
          title: 'Compose like building blocks — analyze like tools',
          blocksLabel: 'Basic conditions',
          combineArrow: 'Freely combine',
          resultLabel: 'Combined result',
          resultCode: 'or(\n  and(pk(Alice), pk(Bob)),\n  and(pk(Bob), older(1000))\n)',
          benefit1: {
            title: 'Standalone primitives',
            desc: 'pk, older, sha256 — each is an independent condition, and any nested combination remains valid.',
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
          intro:
            'A Descriptor (Output Descriptor) packages Miniscript together with specific keys and derivation paths into a portable format. Wallets use it to generate addresses and build transactions — and different wallets can import and export it seamlessly. Your spending rules are no longer locked to a single piece of software.',
          walletA: 'Wallet A',
          walletADesc: 'Design spending policy',
          exportLabel: 'Export',
          descriptorLabel: 'Output Descriptor',
          descriptorSample: 'wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(Recovery),older(10000))))',
          descriptorNote: 'Standard format with full policy information',
          importLabel: 'Import',
          walletB: 'Wallet B',
          walletBDesc: 'Fully restored policy',
          takeaway: 'Your spending rules belong to you — no vendor lock-in.',
        },
      },
    },

    history: {
      title: 'Where Miniscript Comes From',
      subtitle:
        'Miniscript is not a brand-new invention — it is the product of Bitcoin protocol researchers iterating since 2019. It went from a paper to mainstream wallets and Bitcoin Core itself.',
      milestones: {
        m1: {
          year: '2019',
          title: 'First public proposal',
          desc: "Pieter Wuille presents the design and compiler of Miniscript for the first time at SBC'19.",
        },
        m2: {
          year: '2020–2022',
          title: 'Reference implementations mature',
          desc: 'Reference implementations in C++ and Rust land, and Miniscript gets experimental support in several wallets.',
        },
        m3: {
          year: '2023+',
          title: 'Adopted by mainstream wallets',
          desc: 'Bitcoin Core 24.0 ships native Miniscript Descriptor support; Liana, Nunchuk, Bitcoin Keeper and others make it a product feature.',
        },
      },
      designers: {
        d1: {
          name: 'Pieter Wuille',
          desc: 'Long-time Bitcoin Core maintainer and one of the principal designers behind SegWit and Taproot. Primary author of Miniscript.',
        },
        d2: {
          name: 'Andrew Poelstra',
          desc: "Blockstream's Director of Research and a core contributor to Bitcoin cryptography and Miniscript's type system.",
        },
        d3: {
          name: 'Sanket Kanjalkar',
          desc: 'A key contributor to the formalization and compiler implementation of Miniscript, and one of the maintainers of rust-miniscript.',
        },
      },
    },

    wallets: {
      label: 'Ecosystem',
      title: 'Wallets Supporting Miniscript',
      subtitle:
        'These software and hardware wallets have native Miniscript support, ready for real-world use with complex spending conditions.',
      software: 'Software Wallets',
      hardware: 'Hardware Wallets',
    },

    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'The most common questions people ask about Miniscript.',
      items: {
        q1: {
          q: 'Does using Miniscript require a Bitcoin soft fork?',
          a: 'Miniscript compiles to ordinary valid Bitcoin Script; on-chain nodes execute it under the existing rules, with zero changes at the consensus layer.',
        },
        q2: {
          q: 'Is Miniscript usable today, or still experimental?',
          a: 'It is ready to use. Bitcoin Core 24.0 has native Miniscript Descriptor support, and wallets such as Liana, Nunchuk, and Bitcoin Keeper already ship it as a first-class feature.',
        },
        q3: {
          q: 'Is Miniscript safe? Can I manage real funds with it?',
          a: "Miniscript's type system rules out an entire class of \"unspendable on-chain\" errors at compile time, and each node's spendability and witness cost can be formally analyzed. That said, any complex spending condition should be rehearsed thoroughly on testnet/signet before it sees real funds.",
        },
        q4: {
          q: 'Do I need to understand Bitcoin Script to use Miniscript?',
          a: "No. For everyday use, Policy is enough — you describe who can spend and when, and the compiler generates the Bitcoin Script. The low-level details are the tools' and wallets' problem.",
        },
        q5: {
          q: 'How does Miniscript relate to Output Descriptors?',
          a: 'Miniscript describes the structure of spending conditions; a Descriptor takes that and adds concrete keys and derivation paths, giving wallets everything they need to derive addresses and build transactions. Think of it as: Descriptor = Miniscript + key information.',
        },
        q6: {
          q: 'Is ScriptWise the official Miniscript website?',
          a: 'No. ScriptWise is a community-maintained learning site whose goal is to help more people understand Miniscript through real scenarios. For the specification and reference implementations, consult the official repositories.',
        },
      },
    },

    cta: {
      title: 'Ready to Design Your Own?',
      subtitle:
        'Use the visual canvas in the Playground to compose a policy and see Policy, Miniscript, and spending paths in real time.',
      primary: 'Build: open the Playground',
      secondary: 'Read: browse learning resources',
      desktopHint: 'For the full experience, open the Playground on a desktop or larger screen.',
    },

    footer: {
      description:
        'ScriptWise — a scenario-first, spending-path-centered Bitcoin Miniscript educational playground.',
      rights: '© 2024 ScriptWise. All rights reserved.',
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
      title: 'Applications',
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
    title: 'ScriptWise',
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
    description: 'A scenario-first, spending-path-centered Miniscript educational playground',
    rights: 'ScriptWise',
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
