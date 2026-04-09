export function IntroChallengeSection() {
  return (
    <section
      id="why"
      className="border-t border-border-subtle bg-surface-card py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          The Challenge
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          Bitcoin Script 虽然强大，但存在着几个根本性的设计挑战。
        </p>

        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h3 className="mb-8 text-2xl font-semibold text-text-primary">
              Bitcoin Script
            </h3>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  低级抽象
                </p>
                <p className="leading-relaxed text-text-secondary">
                  基于堆栈的汇编风格语言，代码看似一连串神秘的操作码。即使是简单的逻辑也需要深入理解栈机制。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  容易出错
                </p>
                <p className="leading-relaxed text-text-secondary">
                  微小的错误就可能导致严重的安全漏洞，难以自动检测。栈深度溢出、条件分支错误等问题层出不穷。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  缺乏可组合性
                </p>
                <p className="leading-relaxed text-text-secondary">
                  难以分解为可重用组件，每次都需要从头开始。无法像现代编程语言那样进行模块化设计。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  难以分析
                </p>
                <p className="leading-relaxed text-text-secondary">
                  对脚本的正确性、安全性验证需要大量手工分析。没有自动化工具来检查脚本的属性。
                </p>
              </div>
            </div>
          </div>

          <div className="pt-0 md:pt-8">
            <h3 className="mb-8 text-2xl font-semibold text-text-primary">
              Miniscript
            </h3>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  高级抽象
                </p>
                <p className="leading-relaxed text-text-secondary">
                  使用接近自然语言的语法，表达意图更加直观。开发者可以关注业务逻辑而不是底层细节。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  形式化验证
                </p>
                <p className="leading-relaxed text-text-secondary">
                  编译器内置安全检查，自动验证脚本的正确性。通过类型系统和属性分析防止常见错误。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  高度可组合
                </p>
                <p className="leading-relaxed text-text-secondary">
                  像乐高积木一样组合条件，构建复杂的合约。标准的组合操作符确保结果始终有效。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-btc-500">
                  自动优化
                </p>
                <p className="leading-relaxed text-text-secondary">
                  编译器自动优化生成的脚本大小。通过分析找到最小的等价 Bitcoin Script 表示。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-border-default bg-surface-elevated p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-muted">
              Bitcoin Script
            </p>
            <code className="font-mono text-sm leading-relaxed text-text-secondary">
              {`OP_2 [pk1] [pk2] [pk3]\nOP_3 OP_CHECKMULTISIG`}
            </code>
            <p className="mt-3 text-xs text-text-muted">难以理解的操作码序列</p>
          </div>
          <div className="rounded-xl border border-border-default bg-surface-elevated p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-btc-500">
              Miniscript
            </p>
            <code className="font-mono text-sm leading-relaxed text-btc-500">
              {`thresh(2,\n  pk(key1), pk(key2),\n  pk(key3)\n)`}
            </code>
            <p className="mt-3 text-xs text-btc-500/80">清晰明确的逻辑表达</p>
          </div>
        </div>
      </div>
    </section>
  );
}
