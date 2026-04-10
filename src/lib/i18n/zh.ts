export const zh = {
  home: {
    hero: {
      title: '把 Bitcoin 的花费条件讲清楚',
      subtitle: '用真实的花费场景理解 Miniscript，从多签到时间锁，从理论到可运行的脚本。',
      desc: '每一个 Bitcoin UTXO 背后，都有一套决定"谁能花、什么时候花"的规则。Miniscript Lab 帮你读懂这套规则。',
      cta: {
        primary: '查看应用场景',
        secondary: '打开 Playground',
      },
      card: {
        label: '花费路径分析',
        path1: 'Alice + Bob 签名',
        path2: 'Alice + 等待 30 天',
        path3: 'Bob + 等待 30 天',
      },
    },
    explainer: {
      label: '基础知识',
      title: '什么是 Miniscript？',
      subtitle: '每一个 Bitcoin UTXO 背后，都有一套规定"谁能花、何时能花"的脚本。Miniscript 是一种更结构化的语言，让这套规则变得可读、可组合、可验证。',
      what: {
        title: 'Miniscript 是什么',
        desc: 'Bitcoin Script 是图灵不完备的低级脚本语言，直接编写容易出错且难以审计。Miniscript 是 Bitcoin Script 的一个结构化子集——它把花费条件表达为可组合的策略树，由工具自动编译为链上脚本，杜绝手写错误。',
      },
      why: {
        title: '为什么需要它',
        benefit1: '策略语义清晰：and()、or()、thresh() 直接描述业务逻辑，任何人都能读懂',
        benefit2: '可组合可审计：子条件自由嵌套，工具自动分析所有花费路径和最小 Witness',
        benefit3: '链上安全：编译结果经过形式化验证，满足 Bitcoin Script 的所有安全约束',
      },
      mission: {
        label: '我们的目标',
        title: '我们为什么做这个',
        desc: 'Miniscript 的工具链分散、文档晦涩，钱包开发者和高级用户之间存在巨大的学习门槛。Miniscript Lab 把编译、路径分析、可视化搭建整合到一个交互式平台，让任何人都能真正读懂 Bitcoin 花费条件。',
      },
      comparison: {
        old: {
          title: '传统 Bitcoin Script（难以读懂）',
          example: `OP_2\n<Alice> <Bob> <Carol>\nOP_3 OP_CHECKMULTISIG`,
          problem1: '操作码堆叠，语义不直观，需要专家逐行解读',
          problem2: '稍微复杂的条件组合极难手写正确，一个字节错误就会锁死资金',
        },
        new: {
          title: 'Miniscript Policy（一眼读懂）',
          example: `or(\n  thresh(2, pk(Alice), pk(Bob), pk(Carol)),\n  and(pk(Alice), older(52560))\n)`,
          advantage1: '结构即语义：or / and / thresh 直接映射业务意图',
          advantage2: '自动编译为最优脚本，工具验证安全性，无需手写底层代码',
        },
      },
    },
    how: {
      label: '使用流程',
      title: '三步理解任意花费策略',
      subtitle: '从场景选择到完整链上脚本，每一步都有可视化反馈。',
      step1: {
        title: '选择或描述场景',
        desc: '从真实使用场景出发：团队多签、多签与时间锁、恢复密钥、退化金库……',
        example: '2-of-3 多签 · 多签+时间锁 · 恢复密钥',
      },
      step2: {
        title: '编写或搭建策略',
        desc: '用 Policy 语言描述规则，或在可视化画布上拖拽组合，实时看到 Miniscript 输出。',
        example: 'thresh(2,pk(A),pk(B),older(4320))',
      },
      step3: {
        title: '看懂所有花费路径',
        desc: '每一条能花的路径都被列出，并可交互模拟：勾选签名、拨动时间，看哪条路径点亮。',
        example: 'Path 1: Alice + Bob · Path 2: 超时',
      },
      step4: {
        title: '拿到链上可用脚本',
        desc: '完整输出 Script、Descriptor 和 P2WSH 地址，可直接用于测试网部署。',
        example: 'OP_2 <Alice> <Bob> ... OP_CHECKMULTISIG',
      },
    },
    features: {
      label: '核心能力',
      title: '不只是编译器',
      subtitle: '为真正理解而设计，而不仅仅是生成脚本。',
      f1: {
        title: '实时编译反馈',
        desc: '输入 Policy 即时看到 Miniscript、Script、Descriptor 和地址，语法错误精确定位。',
      },
      f2: {
        title: '花费路径可视化',
        desc: '所有满足条件组合都以树状路径展示，可交互模拟签名和时间锁状态。',
      },
      f3: {
        title: '可视化策略搭建',
        desc: '无需写代码，在画布上点选条件节点，拖拽组合，系统自动生成对应的 Policy 语法。',
      },
      f4: {
        title: '一键分享',
        desc: '将当前策略、密钥变量和模拟状态打包成可分享链接，方便协作讨论。',
      },
    },
    scenarios: {
      label: '场景库',
      title: '从真实场景开始探索',
      subtitle: '每个场景都配有解释说明、完整 Policy 和交互式花费路径图。',
    },
    wallets: {
      label: '生态支持',
      title: '已支持 Miniscript 的钱包',
      subtitle: '以下钱包已原生支持 Miniscript，可用于管理复杂的花费条件。',
      software: '软件钱包',
      hardware: '硬件钱包',
    },
    cta: {
      title: '准备好自己设计了吗？',
      subtitle: '在 Playground 里用可视化画布搭建策略，实时看到 Policy、Miniscript 与花费路径。',
      build: '用画布搭建策略',
    },
    playground: {
      desktopHint: 'Playground 建议在桌面端打开以获得完整体验。',
    },
    challenge: {
      subtitle: 'Bitcoin Script 虽然强大，但存在着几个根本性的设计挑战。',
      scriptCol: {
        lowLevel: {
          label: '低级抽象',
          desc: '基于堆栈的汇编风格语言，代码看似一连串神秘的操作码。即使是简单的逻辑也需要深入理解栈机制。',
        },
        errorProne: {
          label: '容易出错',
          desc: '微小的错误就可能导致严重的安全漏洞，难以自动检测。栈深度溢出、条件分支错误等问题层出不穷。',
        },
        nonComposable: {
          label: '缺乏可组合性',
          desc: '难以分解为可重用组件，每次都需要从头开始。无法像现代编程语言那样进行模块化设计。',
        },
        hardToAnalyze: {
          label: '难以分析',
          desc: '对脚本的正确性、安全性验证需要大量手工分析。没有自动化工具来检查脚本的属性。',
        },
      },
      miniscriptCol: {
        highLevel: {
          label: '高级抽象',
          desc: '使用接近自然语言的语法，表达意图更加直观。开发者可以关注业务逻辑而不是底层细节。',
        },
        formalVerif: {
          label: '形式化验证',
          desc: '编译器内置安全检查，自动验证脚本的正确性。通过类型系统和属性分析防止常见错误。',
        },
        composable: {
          label: '高度可组合',
          desc: '像乐高积木一样组合条件，构建复杂的合约。标准的组合操作符确保结果始终有效。',
        },
        autoOpt: {
          label: '自动优化',
          desc: '编译器自动优化生成的脚本大小。通过分析找到最小的等价 Bitcoin Script 表示。',
        },
      },
      codeCompare: {
        scriptCaption: '难以理解的操作码序列',
        miniscriptCaption: '清晰明确的逻辑表达',
      },
    },
    concepts: {
      subtitle: '理解 Policy、Miniscript 和 Descriptor 之间的关系。',
      policy: {
        desc: '高级、人类可读的策略描述。用自然语言的方式表达谁可以花费资金以及如何花费。Policy 是最顶层的抽象，允许使用任意的组合逻辑而不用担心编译后的有效性。',
        example: '要么需要 Alice 的签名，要么 Bob 签名且时间已过某个区块高度。',
      },
      miniscript: {
        desc: '高级 Policy 和底层 Bitcoin Script 之间的桥梁。Miniscript 提供标准化、可验证且可分析的中间表示。每个 Miniscript 表达式都有明确的类型和属性，这使得编译器可以进行安全性验证和优化。',
        featuresLabel: '核心特点',
        feature1: '类型系统（B、V、K、W 基础类型 + z、o、n、d、u 修饰符）',
        feature2: '自动脚本优化',
        feature3: '形式化属性验证',
        feature4: '编译时安全检查',
        compileLabel: '编译结果',
        compileDesc: '最终的 Bitcoin Script 操作码，提交到区块链执行。',
        compileNote: '通常比原始 Bitcoin Script 小 20-40%',
      },
      descriptor: {
        desc: '便携、通用的方式来指定钱包可以花费的输出。将 Miniscript 与实际密钥信息结合。Descriptor 包含了生成地址和创建交易所需的所有信息，支持钱包间的无缝迁移。',
        multisigLabel: '多签示例',
        timelockLabel: '带时间锁示例',
        note: '钱包可以据此生成地址、创建交易，确保所有参与者理解脚本结构并能无缝协作。',
      },
      stack: {
        step1: { desc: '高级策略语言', detail: '用自然语言表达签名条件' },
        step2: { desc: '中间表示层', detail: '标准化、可验证、自动优化' },
        step3: { desc: '底层操作码', detail: '链上执行，已优化' },
      },
    },
    why: {
      innovation: {
        title: '促进创新',
        desc: '通过降低开发门槛，更多开发者可以参与到比特币生态的建设中，创造出更多创新应用。不再只有少数密码学专家能编写复杂的脚本。',
      },
      enterprise: {
        title: '企业应用',
        desc: '企业和机构可以更放心地部署复杂的比特币合约，而不用过度担心安全风险。内置的验证和优化提供了企业级的质量保证。',
      },
      ecosystem: {
        title: '生态发展',
        desc: 'Miniscript 为 Taproot 等比特币升级的发展奠定基础，推动比特币智能合约的演进。为未来的扩展性功能提供设计参考。',
      },
      efficiency: {
        title: '提高效率',
        desc: '开发、测试和部署时间大幅减少。自动脚本优化减少链上成本。让团队可以专注于业务逻辑而不是低级实现细节。',
      },
    },
  },

  nav: {
    scenarios: '首页',
    playground: 'Playground',
    compare: '资源',
    comingSoon: '即将推出',
    toggleMenu: '菜单',
  },

  header: {
    language: { zh: '中文', en: 'EN' },
    theme: { light: '亮色', dark: '暗色' },
  },

  intro: {
    applications: {
      tryIt: '上手一试',
      subtitle: '从 Policy 到最终脚本：实时查看真实应用场景的完整编译演化过程。',
      scenarioLabel: '使用场景',
      typeLabel: '应用类型',
      caseLabel: '真实案例',
      advantageLabel: '优势',
      compileArrow: '编译 ↓',
      scriptSizeLabel: '脚本大小优化',
      witnessLabel: '证明大小',
    },
  },

  builder: {
    starter: {
      title: '选择策略类型',
      subtitle: '选择根节点类型；之后可在画布上继续添加条件。',
      singleControl: '单人控制',
      singleControlDesc: '单个密钥完全控制',
      sharedControl: '多人共管',
      sharedControlDesc: '多签 (2-of-3)',
    },
    canvas: {
      waitingTree: '正在编译并同步画布…',
      initializing: '正在同步画布…',
    },
    sync: {
      textLed: '当前 Policy 包含构建器不支持的语法（如 after() 或哈希锁），画布显示上次同步的快照',
      compileError:
        'Policy 无法编译或解析，画布为只读。若尚无成功编译记录，将显示初始占位；请修正 Policy 后重新同步。',
      readOnly: '只读模式',
    },
    node: {
      signature: '签名',
      timelock: '时间锁',
      threshold: '门限',
      all: '都需要',
      any: '任选一',
      addChild: '添加条件',
      delete: '删除',
      wrap: '包装为',
      undefinedRole: '未定义的角色',
    },
    op: {
      switch: { title: '切换操作符' },
      all: { label: '都需要', desc: '所有子条件都必须满足（AND）' },
      any: { label: '任选一', desc: '满足其中一个即可（OR）' },
      threshold: {
        label: '门限多签',
        desc: 'k-of-n，满足 k 个条件即可',
        confirm: '确认',
        k: { label: '所需满足数量' },
      },
      binaryTrimNotice: '已切换为「都需要 / 任选一」，仅保留前两个子条件。',
    },
    popover: {
      selectRole: '选择角色',
      addRole: '新建角色',
      blocks: '区块数',
      timePreset: '常用时间',
      threshold: '门限值',
      thresholdHint: '{k} / {n} 个签名',
      timeConversion: '约 {time}',
      '7days': '7 天',
      '30days': '30 天',
      '90days': '90 天',
      '180days': '180 天',
      '1year': '1 年',
      custom: '自定义',
    },
    action: {
      wrapAll: '包装为「都需要」',
      wrapAny: '包装为「任选一」',
      wrapThreshold: '包装为「门限」',
      addSignature: '添加签名',
      addTimelock: '添加时间锁',
      addGroup: '添加嵌套组',
    },
    confirm: {
      title: '确认删除',
      deleteRoot: '确定要删除整个策略吗？这将重置画布到初始状态。',
      cancel: '取消',
      confirm: '确认删除',
    },
    wrap: {
      title: '包裹进新组',
      depthWarning: '嵌套层数较多，建议不超过 5 层',
    },
  },

  playground: {
    editor: {
      title: 'Policy 编辑器',
      placeholder: '在这里输入策略，例如：pk(Alice)',
      compile: '编译',
      format: '格式化',
      clear: '清空',
      copy: '复制',
      share: '分享',
      shareCopied: '已复制',
    },
    error: {
      hints: '建议',
      expandDetails: '显示技术详情',
      collapseDetails: '隐藏技术详情',
      copyRaw: '复制原始错误',
      rawCopied: '已复制',
    },
    keys: {
      title: '角色变量',
      add: '添加',
      random: '随机',
      restore: '恢复默认',
      empty: '暂无角色变量',
      hint: 'MVP 使用压缩公钥（66 字符 hex，用于 P2WSH）',
    },
    context: {
      title: '地址类型',
      wsh: 'SegWit v0 (P2WSH)',
      tr: 'Taproot',
      comingSoon: 'Coming Soon',
      network: '网络',
    },
    pathmap: { title: '花费路径地图' },
    conditions: { title: '条件模拟' },
    timeslider: {
      label: '时间流逝',
      blocks: '区块',
      current: '当前: 第 {blocks} 区块 ≈ {human}',
    },
    status: {
      canSpend: '可花费: {path}',
      waiting: '还需等待 {time}，{path}才可用',
      cannotSpend: '当前条件下无法花费，还缺 {missing}',
      someConditions: '部分条件',
    },
    results: {
      policy: 'Policy',
      miniscript: 'Miniscript',
      script: 'Script',
      descriptor: 'Descriptor',
      address: 'Address',
      paths: '花费路径',
      panelNav: '结果面板',
      explain: '这是什么？',
      stale: '旧',
    },
    stack: {
      title: '栈机模拟器',
      comingSoon: 'Coming Soon',
    },
    empty: {
      title: '输入 Policy 或选择一个场景',
      subtitle: '开始探索 Bitcoin 花费路径',
    },
    left: {
      scenarios: '选择场景',
      diy: '自己动手',
      diyDesc: '自由组合花费条件，设计属于你的策略',
      diyComingSoon: '敬请期待',
      diyActive: '正在构建',
      keysPlaceholder: '选择场景后自动填充角色变量',
    },
    center: {
      compilePlaceholder: '编译成功后将在此显示路径图',
      staleWarning: 'Policy 有语法错误，显示的是上一次成功编译的结果',
      hasError: '编译失败，请检查左侧 Policy 语法',
    },
    right: {
      waiting: '等待编译结果...',
      tabPlaceholder: '编译结果将在此显示',
    },
    paths: {
      empty: '此 Policy 无可用花费路径。所有路径当前条件下不可满足。',
      malleable: '可延展',
      witness: 'Witness: ~{size} vB',
    },
    address: { warning: '此地址仅用于测试网络，请勿在主网使用。' },
    mobile: {
      title: '请在桌面端或更大屏幕上使用',
      description:
        '完整的三栏工作台与可视化搭建需要更宽的视口。请在电脑、平板横屏或更大屏幕上打开，以获得完整体验。',
      goScenarios: '浏览场景',
    },
  },

  compare: {
    comingSoon: '对比模式即将推出',
    description: '并排对比两个 Policy 的编译结果与花费路径',
    featureList: { title: '计划功能' },
    feature: {
      '1': '并排对比两个 Policy 的编译结果',
      '2': '花费路径差异可视化',
      '3': '脚本大小与手续费对比',
      '4': '导出 Markdown / JSON 报告',
    },
  },

  scenarios: {
    title: 'Miniscript Lab',
    subtitle: '把 Bitcoin 的花费条件讲清楚',
    orWrite: '或者自己写',
    openBlank: '打开空白 Playground',
  },

  flow: {
    rootLabel: '花费条件',
    andLabel: '都需要',
    orLabel: '任选一',
  },

  footer: {
    description: '一个场景优先、以花费路径为中心的 Miniscript 教学实验室',
    rights: 'Miniscript Lab',
  },

  glossary: {
    tooltip: { label: '是什么' },
  },

  resources: {
    toolsDoc: {
      title: '工具与文档',
      subtitle: '官方站点、参考实现、在线 Playground 与开发套件。',
    },
    reading: {
      title: '推荐阅读',
      subtitle: '精选文章与深度阅读，持续更新。',
      placeholder: '文章列表整理中，敬请期待。',
      articles: {
        bdkHidden: {
          title: 'Miniscript 和描述符：比特币的隐藏力量',
          source: 'Bitcoin Dev Kit 博客',
        },
        nunchuk101: { title: 'Miniscript 101：技术指南', source: 'Nunchuk' },
        bitboxP1: {
          title: '理解比特币 Miniscript（一）：Script 何以难用',
          source: 'BitBox / Shift Crypto 博客',
        },
        bitboxP2: {
          title: '理解比特币 Miniscript（二）：工作原理',
          source: 'BitBox / Shift Crypto 博客',
        },
        advancingBm: {
          title: 'Miniscript：可组合、可分析、更智能的比特币脚本',
          source: 'Advancing Bitcoin 2022 · BTC Transcripts',
        },
      },
    },
    links: {
      official: {
        badge: '参考文档',
        title: 'Miniscript',
        desc: 'Pieter Wuille 维护的 Miniscript 站点：语言说明、在线编译器与分析工具，含类型系统与常见用法。',
      },
      rust: {
        badge: '参考实现',
        title: 'Rust Miniscript',
        desc: '广泛使用的 Rust 实现：编译器、满足性分析与丰富测试用例，适合阅读源码与在生产环境中集成。',
      },
      studio: {
        badge: '在线工具',
        title: 'Miniscript Studio',
        desc: '浏览器端 Policy / Miniscript 工作台：内置从基础到 Taproot 的示例、Policy 与 Miniscript 参考文档、花费路径分析与可分享链接（本地保存，公钥仅作演示）。',
      },
      minsc: {
        badge: '语言与 Playground',
        title: 'Minsc',
        desc: '基于 Miniscript Policy 的合约脚本语言，提供变量、函数与中缀运算符等语法糖；在线 WASM 编译器可生成 Policy、Miniscript、脚本与地址（测试网）。',
      },
      bdkPlayground: {
        badge: '在线工具',
        title: 'BDK Playground',
        desc: '浏览器内的 Policy 编译与描述符钱包实验台：可将策略中的别名映射到公钥、选择 P2SH / P2WSH 等脚本上下文，并用可视化或 Policy 文本编辑花费条件。',
      },
      miniscriptBuilder: {
        badge: '在线工具',
        title: 'Miniscript Builder',
        desc: '基于 WASM 与 rust-miniscript 的可视化节点编辑器（Rete.js），拖拽即可搭建 Policy。支持多网络与地址派生，可 JSON 导入导出，并用链接分享整图状态。',
      },
      bdk: {
        badge: '开发者工具',
        title: 'Bitcoin DevKit',
        desc: '在应用里集成比特币钱包能力时常用的开发套件，文档与示例涵盖 Descriptor、PSBT 等与 Miniscript 相关的实践。',
      },
    },
  },
} as const;
