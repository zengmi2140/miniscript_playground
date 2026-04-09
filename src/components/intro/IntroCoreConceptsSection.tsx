const stackSteps = [
  {
    num: '1',
    title: 'Policy',
    desc: '高级策略语言',
    detail: '用自然语言表达签名条件',
  },
  {
    num: '2',
    title: 'Miniscript',
    desc: '中间表示层',
    detail: '标准化、可验证、自动优化',
  },
  {
    num: '3',
    title: 'Bitcoin Script',
    desc: '底层操作码',
    detail: '链上执行，已优化',
  },
] as const;

export function IntroCoreConceptsSection() {
  return (
    <section
      id="concepts"
      className="border-t border-border-subtle bg-surface-base py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Core Concepts
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          理解 Policy、Miniscript 和 Descriptor 之间的关系。
        </p>

        <div className="space-y-12">
          <div className="border-b border-border-subtle pb-12">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">Policy</h3>
            <p className="mb-6 max-w-3xl leading-relaxed text-text-secondary">
              高级、人类可读的策略描述。用自然语言的方式表达谁可以花费资金以及如何花费。Policy
              是最顶层的抽象，允许使用任意的组合逻辑而不用担心编译后的有效性。
            </p>
            <div className="mb-4 rounded-xl border border-border-default bg-surface-card p-6">
              <code className="font-mono text-sm text-btc-500">
                or(pk(Alice), and(pk(Bob), after(block_height)))
              </code>
            </div>
            <p className="text-sm text-text-muted">
              要么需要 Alice 的签名，要么 Bob 签名且时间已过某个区块高度。
            </p>
          </div>

          <div className="border-b border-border-subtle pb-12">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">Miniscript</h3>
            <p className="mb-6 max-w-3xl leading-relaxed text-text-secondary">
              高级 Policy 和底层 Bitcoin Script 之间的桥梁。Miniscript
              提供标准化、可验证且可分析的中间表示。每个 Miniscript
              表达式都有明确的类型和属性，这使得编译器可以进行安全性验证和优化。
            </p>
            <div className="mb-4 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  核心特点
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>类型系统（V、F、d、u）</li>
                  <li>自动脚本优化</li>
                  <li>形式化属性验证</li>
                  <li>编译时安全检查</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  编译结果
                </p>
                <p className="mb-3 text-sm text-text-secondary">
                  最终的 Bitcoin Script 操作码，提交到区块链执行。
                </p>
                <p className="rounded-lg bg-surface-base p-2 font-mono text-xs text-text-muted">
                  通常比原始 Bitcoin Script 小 20-40%
                </p>
              </div>
            </div>
          </div>

          <div className="pb-12">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              Output Descriptor
            </h3>
            <p className="mb-6 max-w-3xl leading-relaxed text-text-secondary">
              便携、通用的方式来指定钱包可以花费的输出。将 Miniscript 与实际密钥信息结合。Descriptor
              包含了生成地址和创建交易所需的所有信息，支持钱包间的无缝迁移。
            </p>
            <div className="space-y-4">
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  多签示例
                </p>
                <code className="break-all font-mono text-sm text-btc-500">
                  wsh(multi(2,xpub[abcd1234/44h/0h/0h]xpub...,xpub[dcba4321/44h/0h/0h]xpub...))
                </code>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-card p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
                  带时间锁示例
                </p>
                <code className="break-all font-mono text-sm text-btc-500">
                  {`wsh(or_d(pk([fingerprint1]xpub.../0/*), and_v(v:pk([fingerprint2]xpub.../1/*), older(144))))`}
                </code>
              </div>
            </div>
            <p className="mt-4 text-sm text-text-muted">
              钱包可以据此生成地址、创建交易，确保所有参与者理解脚本结构并能无缝协作。
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            The Technical Stack
          </h2>

          <div className="mb-12 hidden items-center justify-between gap-4 md:flex">
            <div className="flex-1 text-center">
              <div className="rounded-xl border border-border-default bg-surface-card p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 text-lg font-semibold text-btc-500">
                  1
                </div>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">Policy</h4>
                <p className="mb-2 text-sm text-text-secondary">高级策略语言</p>
                <p className="text-xs text-text-muted">用自然语言表达签名条件和约束</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-2xl font-light text-btc-500/40">→</div>
            <div className="flex-1 text-center">
              <div className="rounded-xl border border-border-default bg-surface-card p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 text-lg font-semibold text-btc-500">
                  2
                </div>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">Miniscript</h4>
                <p className="mb-2 text-sm text-text-secondary">中间表示层</p>
                <p className="text-xs text-text-muted">标准化、可验证、自动优化</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-2xl font-light text-btc-500/40">→</div>
            <div className="flex-1 text-center">
              <div className="rounded-xl border border-border-default bg-surface-card p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 text-lg font-semibold text-btc-500">
                  3
                </div>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">Bitcoin Script</h4>
                <p className="mb-2 text-sm text-text-secondary">底层操作码</p>
                <p className="text-xs text-text-muted">链上执行，已优化大小</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {stackSteps.map((item, idx) => (
              <div key={item.num}>
                <div className="flex items-center gap-4 rounded-xl border border-border-default bg-surface-card p-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-btc-500/10 text-sm font-semibold text-btc-500">
                    {item.num}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                    <p className="mt-1 text-xs text-text-muted">{item.detail}</p>
                  </div>
                </div>
                {idx < 2 && (
                  <div className="py-2 text-center text-sm text-btc-500/30">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
