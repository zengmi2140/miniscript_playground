export const zh = {
  home: {
    hero: {
      badge: 'Bitcoin Miniscript',
      title: 'Miniscript：让 Bitcoin 的花费条件可读、可分析、可组合',
      intro1:
        '一种由 Pieter Wuille、Andrew Poelstra 和 Sanket Kanjalkar 设计的结构化语言，把多签、时间锁、哈希锁等花费条件，从晦涩的操作码中解放出来。',
      intro2:
        'ScriptWise 是一个用真实场景带你读懂 Miniscript 的学习站点——从一段策略描述，到可运行的 Bitcoin Script。',
      ctaPrimary: '从一个真实场景开始 ↓',
      ctaSecondary: '打开 Playground',
      desktopHint: 'Playground 建议在桌面端打开以获得完整体验。',
      card: {
        filename: 'policy.miniscript',
        tag: 'P2WSH',
        compilesTo: '↓ compiles to',
        statusNote: '示例：编译过程示意',
        replay: '↻ 重播',
      },
      paths: {
        path1: 'Alice + Bob 共同签名',
        path2: 'Alice + 等待 30 天',
      },
    },

    hook: {
      eyebrow: '为什么这件事和你有关',
      q1: '你想给家人留一笔比特币，万一你不在了他们能拿到吗？',
      q2: '你想做 2-of-3 多签，但其中一把钥匙丢了怎么办？',
      q3: '你想让一个第三方托管你的资产，但保留紧急回收权？',
      outro: '这些都是"花费条件"问题。Bitcoin 原生支持，但写起来——你会想要 Miniscript。',
    },

    transition: {
      title: '每个地址背后，都有一段脚本',
      subtitle: '比特币地址不只是一串字符——它对应着一段脚本，定义了「谁能花费这笔资金」。',
      singleSig: {
        label: '单一签名',
        desc: '一把私钥，即可花费。',
        code: 'OP_DUP OP_HASH160\n  <PubKeyHash>\nOP_EQUALVERIFY OP_CHECKSIG',
      },
      multiSig: {
        label: '多重签名（2-of-3）',
        desc: '三把钥匙中，任意两把即可花费。',
        code: 'OP_2\n  <PubKey1>\n  <PubKey2>\n  <PubKey3>\nOP_3 OP_CHECKMULTISIG',
      },
      footer: '不止于多签——时间锁、哈希锁、门限组合……都能写进花费条件。但真要直接动手写，就会撞到另一层问题。',
    },

    scriptComplexity: {
      title: 'Bitcoin Script 的复杂性',
      subtitle:
        '上面那段脚本只是最朴素的两个例子。一旦你尝试表达更有意思的花费条件，就会撞上 Bitcoin Script 的四个限制。',
      items: {
        lowLevel: {
          label: '低级抽象',
          desc: '基于操作码和栈，读一段脚本要在脑子里逐行追踪栈状态。即使是 2-of-3 多签，裸脚本也像一串神秘符号。',
        },
        errorProne: {
          label: '容易出错',
          desc: '一个字节偏差、一个分支错位就可能锁死资金；也没有简单的办法在链下静态验证"这段脚本一定能被花费"。',
        },
        nonComposable: {
          label: '难以组合',
          desc: '脚本无法像函数那样被拆成可复用的小块再拼起来。加一个新条件，往往意味着重新设计整段脚本。',
        },
        hardToAnalyze: {
          label: '难以分析',
          desc: '脚本大小、见证开销、花费路径……都得手工推导，没有标准工具能自动回答"这段脚本到底表达了什么"。',
        },
      },
      outro: '这些问题并非无解——Miniscript 正是为此而生。',
    },

    meetMiniscript: {
      title: '认识 Miniscript',
      subtitle:
        'Bitcoin Script 的表达力已经够用，真正的瓶颈在于"怎么写"。Miniscript 不改动底层，只在上面加了一层结构化的写法。',

      definition: {
        title: 'Miniscript 是什么',
        calloutStrong: 'Miniscript，一种可编译、可验证、可组合的中间语言。',
        calloutBody:
          '如果说 Bitcoin Script 是汇编，Miniscript 就是它的高级语言——不改动底层共识，只改写"怎么写"。它不是新的共识规则，也不是新的虚拟机——链上执行的仍然是 Bitcoin Script。它只是在你写脚本、工具分析脚本时，插入了这一层。',
        arrowLabel: '编译',
        pipeline: {
          policy: {
            layer: 'Policy',
            role: '你怎么想',
            desc: '用人类可读的方式描述"谁能花"。支持任意组合逻辑，无需担心编译后的有效性。',
            code: 'or(pk(Alice), and(pk(Bob), older(144)))',
            note: '要么 Alice 一人签；要么 Bob 签且区块高度过了 144。',
          },
          miniscript: {
            layer: 'Miniscript',
            role: '工具怎么分析',
            desc: 'Policy 与 Bitcoin Script 之间的桥梁。每个表达式具有明确类型，可由工具自动验证、分析和优化。',
            code: 'or_d(pk(Alice), and_v(v:pk(Bob), older(144)))',
            note: 'Policy 编译后的标准形式，每个节点都带有类型与属性。',
          },
          script: {
            layer: 'Bitcoin Script',
            role: '链上怎么执行',
            desc: '最终提交到区块链的操作码序列。由 Miniscript 编译生成，无需手写。',
            code: 'OP_DUP <Alice> OP_CHECKSIGVERIFY OP_IFDUP OP_NOTIF <Bob> OP_CHECKSIG OP_ENDIF',
            note: '链上节点按现有共识规则逐条执行这些操作码。',
          },
        },
      },

      features: {
        title: 'Miniscript 带来了什么',

        readability: {
          label: '可读性',
          title: '结构即语义，一眼读懂',
          scriptCaption: 'Bitcoin Script',
          scriptExample: 'OP_2 <pk1> <pk2> <pk3>\nOP_3 OP_CHECKMULTISIG',
          policyCaption: 'Miniscript Policy',
          policyExample: 'thresh(2,\n  pk(Alice),\n  pk(Bob),\n  pk(Charlie)\n)',
          compareNote:
            '同一个 2-of-3 多签。右边你能一眼看出"门限 = 2"；左边需要先理解栈机才能读懂。',
          takeaway: '你只需关心"谁能花、什么时候花"，底层实现交给编译器。',
        },

        composability: {
          label: '可组合性',
          title: '像积木一样组合，像工具一样分析',
          blocksLabel: '基础条件',
          combineArrow: '自由组合',
          resultLabel: '组合结果',
          resultCode: 'or(\n  and(pk(Alice), pk(Bob)),\n  and(pk(Bob), older(1000))\n)',
          benefit1: {
            title: '独立的基础单元',
            desc: 'pk、older、sha256 每一个都是独立条件，任意嵌套组合都合法。',
          },
          benefit2: {
            title: '嵌套不会变差',
            desc: '无论组合多深，编译器都会找到最小等价的 Bitcoin Script。',
          },
          benefit3: {
            title: '结构化 = 可分析',
            desc: '工具能自动回答"这段脚本有哪些花费路径、每条路径开销多大"——这正是 Playground 做到的事。',
          },
        },

        portability: {
          label: '可迁移性',
          title: '一次编写，任意钱包还原',
          intro:
            'Descriptor（Output Descriptor）把 Miniscript 与具体的密钥、派生路径打包成一个可携式格式。钱包据此生成地址、构造交易，不同钱包之间可以无缝导入导出——你的花费规则不再被单一软件绑定。',
          walletA: '钱包 A',
          walletADesc: '设计花费策略',
          exportLabel: '导出',
          descriptorLabel: 'Output Descriptor',
          descriptorSample: 'wsh(andor(pk(Alice),pk(Bob),and_v(v:pk(Recovery),older(10000))))',
          descriptorNote: '标准格式，包含完整策略信息',
          importLabel: '导入',
          walletB: '钱包 B',
          walletBDesc: '完整还原策略',
          takeaway: '你的花费规则属于你自己，不再被单一钱包软件绑定。',
        },
      },
    },

    history: {
      title: 'Miniscript 从哪里来',
      subtitle:
        'Miniscript 不是一个全新的发明，而是一群 Bitcoin 协议研究者在 2019 年起持续打磨的产物。它从一篇论文，逐步走入主流钱包和 Bitcoin Core。',
      milestones: {
        m1: {
          year: '2019',
          title: '初次公开提出',
          desc: "Pieter Wuille 在 SBC'19 会议上首次系统性地介绍 Miniscript 的设计与编译器。",
        },
        m2: {
          year: '2020–2022',
          title: '参考实现成熟',
          desc: 'C++ 与 Rust 两套参考实现陆续完成，Miniscript 进入多家钱包的实验性支持。',
        },
        m3: {
          year: '2023+',
          title: '主流钱包采纳',
          desc: 'Bitcoin Core 24.0 起内置 Miniscript Descriptor 支持；Liana、Nunchuk、Bitcoin Keeper 等钱包将其作为产品特性。',
        },
      },
      designers: {
        d1: {
          name: 'Pieter Wuille',
          desc: 'Bitcoin Core 长期维护者，Segwit、Taproot 等关键提案的核心设计者。Miniscript 主要作者。',
        },
        d2: {
          name: 'Andrew Poelstra',
          desc: 'Blockstream 研究主管，Bitcoin 密码学与 Miniscript 类型系统的核心贡献者。',
        },
        d3: {
          name: 'Sanket Kanjalkar',
          desc: 'Miniscript 形式化与编译器实现的主要工作者，rust-miniscript 维护者之一。',
        },
      },
    },

    wallets: {
      label: '生态支持',
      title: '已支持 Miniscript 的钱包',
      subtitle: '以下钱包已原生支持 Miniscript，可用于管理复杂的花费条件。',
      software: '软件钱包',
      hardware: '硬件钱包',
      pause: '暂停滚动',
      resume: '恢复滚动',
    },

    faq: {
      title: '常见问题',
      subtitle: '关于 Miniscript 最常被问到的几个问题。',
      items: {
        q1: {
          q: '使用 Miniscript 需要 Bitcoin 软分叉吗？',
          a: 'Miniscript 编译产生的是合法的 Bitcoin Script，链上节点按现有规则执行，不引入任何共识层变更。',
        },
        q2: {
          q: 'Miniscript 现在能用吗，还是处于实验阶段？',
          a: '已经可以用。Bitcoin Core 24.0 起原生支持 Miniscript Descriptor，Liana、Nunchuk、Bitcoin Keeper 等钱包也已将其作为正式功能。',
        },
        q3: {
          q: 'Miniscript 安全吗？我可以用它管理真实资金吗？',
          a: 'Miniscript 的类型系统在编译期就能排除一类"链上无法被花费"的错误，且每个节点的可花费性、见证大小都可形式化分析。但任何复杂花费条件在投入真实资金前，都建议在 testnet/signet 上充分演练。',
        },
        q4: {
          q: '我必须懂底层 Bitcoin Script 才能用 Miniscript 吗？',
          a: '不需要。日常使用 Policy 这一层就够了——你描述"谁能花、什么时候花"，编译器负责生成对应的 Bitcoin Script。底层细节是工具与钱包的事。',
        },
        q5: {
          q: 'Miniscript 与 Output Descriptor 是什么关系？',
          a: 'Miniscript 描述的是"花费条件的结构"；Descriptor 在此基础上加上具体的密钥与派生路径，是钱包用来生成地址、构造交易的完整描述。可以理解为：Descriptor = Miniscript + 钥匙信息。',
        },
        q6: {
          q: 'ScriptWise 是 Miniscript 的官方网站吗？',
          a: '不是。ScriptWise 是一个由社区个人维护的学习站点，目标是用真实场景帮助更多人理解 Miniscript。Miniscript 的规范与参考实现请以官方仓库为准。',
        },
      },
    },

    cta: {
      title: '准备好自己设计了吗？',
      subtitle:
        '在 Playground 里用可视化画布搭建策略，实时看到 Policy、Miniscript 与花费路径。',
      primary: '去做：打开 Playground',
      secondary: '去读：浏览学习资源',
      desktopHint: 'Playground 建议在桌面端打开以获得完整体验。',
    },

    footer: {
      description: 'ScriptWise — 场景优先、以花费路径为中心的 Bitcoin Miniscript 教学实验室。',
      rights: '© 2024 ScriptWise. All rights reserved.',
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
      title: '应用场景',
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
      singleControl: '单签名',
      singleControlDesc: '单个密钥签名',
      sharedControl: '阈值条件',
      sharedControlDesc: 'k-of-n 门限条件',
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
      any: '二选一',
      addChild: '添加条件',
      delete: '删除',
      wrap: '包装为',
      undefinedRole: '未定义的角色',
    },
    op: {
      switch: { title: '切换操作符' },
      all: { label: '都需要', desc: '所有子条件都必须满足（AND）' },
      any: { label: '二选一', desc: '满足两个中的一个即可（OR）' },
      threshold: {
        label: '门限多签',
        desc: 'k-of-n，满足 k 个条件即可',
        confirm: '确认',
        k: { label: '所需满足数量' },
      },
      binaryTrimNotice: '已切换为「都需要 / 二选一」，仅保留前两个子条件。',
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
      wrapAny: '包装为「二选一」',
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
      shareUrlTooLong:
        '链接较长，部分环境可能无法打开；已复制到剪贴板，若失败可缩短策略后再试。',
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
      current: '当前: 第 {tipHeight} 区块',
      elapsedInline: '{count} · {human}',
      sliderAriaValue: '模拟已流逝 {count} 区块（{human}）',
      tipLoading: '正在获取链尖高度…',
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
      labelLine: '路径 {index}: {description}',
      labelDesc: {
        signatures: '{names} 签名',
        timelockRecovery: '超时恢复',
        timelockOnly: '时间锁路径',
        hashlock: '哈希锁路径',
        generic: '花费路径',
      },
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
    title: 'ScriptWise',
    subtitle: '把 Bitcoin 的花费条件讲清楚',
    orWrite: '或者自己写',
    openBlank: '打开空白 Playground',
  },

  flow: {
    rootLabel: '花费条件',
    andLabel: '都需要',
    orLabel: '二选一',
  },

  footer: {
    description: '一个场景优先、以花费路径为中心的 Miniscript 教学实验室',
    rights: 'ScriptWise',
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
