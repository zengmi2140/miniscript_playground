"use client";

import { useI18n } from "@/lib/i18n/context";

const limitationItems = [
  "scriptSize",
  "stackDepth",
  "opcodeCount",
  "derivationPaths",
] as const;

const tradeoffItems = [
  "securityFlexibility",
  "optimizationReadability",
  "expressivenessSimplicity",
  "learningCurve",
] as const;

export function IntroLimitationsSection() {
  const { t } = useI18n();

  return (
    <section className="border-t border-border-subtle bg-surface-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t("intro.limitations.title")}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t("intro.limitations.subtitle")}
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              {t("intro.limitations.limits.title")}
            </h3>
            <div className="space-y-4">
              {limitationItems.map((item, index) => (
                <div
                  key={item}
                  className={
                    index < limitationItems.length - 1
                      ? "border-b border-border-subtle pb-4"
                      : undefined
                  }
                >
                  <p className="mb-2 font-medium text-text-primary">
                    {t(`intro.limitations.limits.${item}.title`)}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t(`intro.limitations.limits.${item}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              {t("intro.limitations.tradeoffs.title")}
            </h3>
            <div className="space-y-4">
              {tradeoffItems.map((item, index) => (
                <div
                  key={item}
                  className={
                    index < tradeoffItems.length - 1
                      ? "border-b border-border-subtle pb-4"
                      : undefined
                  }
                >
                  <p className="mb-2 font-medium text-text-primary">
                    {t(`intro.limitations.tradeoffs.${item}.title`)}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t(`intro.limitations.tradeoffs.${item}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
