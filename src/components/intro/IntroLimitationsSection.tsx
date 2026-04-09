export function IntroLimitationsSection() {
  return (
    <section className="border-t border-border-subtle bg-surface-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Limitations & Tradeoffs
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          Miniscript 虽然强大，但也有其局限性。了解权衡能帮助更好地决策。
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">当前限制</h3>
            <div className="space-y-4">
              <div className="border-b border-border-subtle pb-4">
                <p className="mb-2 font-medium text-text-primary">脚本大小上限</p>
                <p className="text-sm text-text-muted">
                  Bitcoin 对脚本大小有限制（P2WSH 为 10,000 字节，P2SH 为 520 字节），复杂的策略可能会超出。
                </p>
              </div>
              <div className="border-b border-border-subtle pb-4">
                <p className="mb-2 font-medium text-text-primary">栈深度限制</p>
                <p className="text-sm text-text-muted">
                  脚本执行栈对元素个数与深度有限制，过度复杂的条件组合可能受限。
                </p>
              </div>
              <div className="border-b border-border-subtle pb-4">
                <p className="mb-2 font-medium text-text-primary">操作码数量</p>
                <p className="text-sm text-text-muted">
                  执行时非推送操作码数量加上多签密钥数量之和不能超过 201。
                </p>
              </div>
              <div>
                <p className="mb-2 font-medium text-text-primary">密钥导出路径</p>
                <p className="text-sm text-text-muted">
                  Descriptor 中密钥数量过多时，导出路径管理变得复杂。
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">权衡考虑</h3>
            <div className="space-y-4">
              <div className="border-b border-border-subtle pb-4">
                <p className="mb-2 font-medium text-text-primary">安全 vs 灵活</p>
                <p className="text-sm text-text-muted">
                  Miniscript 的类型系统增加了安全性，但限制了某些高级用法。
                </p>
              </div>
              <div className="border-b border-border-subtle pb-4">
                <p className="mb-2 font-medium text-text-primary">优化 vs 可读</p>
                <p className="text-sm text-text-muted">
                  优化后的脚本更小，但中间步骤可能降低人类可读性。
                </p>
              </div>
              <div className="border-b border-border-subtle pb-4">
                <p className="mb-2 font-medium text-text-primary">表达力 vs 简洁</p>
                <p className="text-sm text-text-muted">
                  某些 Bitcoin Script 的低级技巧无法直接在 Miniscript 中表达。
                </p>
              </div>
              <div>
                <p className="mb-2 font-medium text-text-primary">学习曲线</p>
                <p className="text-sm text-text-muted">
                  虽然比 Bitcoin Script 简单，但仍需理解类型系统和约束。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
