export function IntroWhyMattersSection() {
  return (
    <section className="border-t border-border-subtle bg-surface-base py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Why Miniscript Matters
        </h2>

        <div className="space-y-12">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">促进创新</h3>
            <p className="leading-relaxed text-text-secondary">
              通过降低开发门槛，更多开发者可以参与到比特币生态的建设中，创造出更多创新应用。不再只有少数密码学专家能编写复杂的脚本。
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">企业应用</h3>
            <p className="leading-relaxed text-text-secondary">
              企业和机构可以更放心地部署复杂的比特币合约，而不用过度担心安全风险。内置的验证和优化提供了企业级的质量保证。
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">生态发展</h3>
            <p className="leading-relaxed text-text-secondary">
              Miniscript 为 Taproot 等比特币升级的发展奠定基础，推动比特币智能合约的演进。为未来的扩展性功能提供设计参考。
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-text-primary">提高效率</h3>
            <p className="leading-relaxed text-text-secondary">
              开发、测试和部署时间大幅减少。自动脚本优化减少链上成本。让团队可以专注于业务逻辑而不是低级实现细节。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
