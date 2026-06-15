import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IntroLimitationsSection } from "../IntroLimitationsSection";
import { I18nProvider } from "@/lib/i18n/context";

afterEach(cleanup);

describe("IntroLimitationsSection", () => {
  it("renders the section in Chinese", () => {
    render(
      <I18nProvider initialLocale="zh">
        <IntroLimitationsSection />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "限制与权衡" }),
    ).toBeInTheDocument();
    expect(screen.getByText("脚本大小上限")).toBeInTheDocument();
    expect(screen.getByText("安全 vs 灵活")).toBeInTheDocument();
  });

  it("renders the section in English without Chinese fallback copy", () => {
    render(
      <I18nProvider initialLocale="en">
        <IntroLimitationsSection />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Limitations & Tradeoffs" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Script Size Limits")).toBeInTheDocument();
    expect(screen.getByText("Security vs. Flexibility")).toBeInTheDocument();
    expect(screen.queryByText("当前限制")).not.toBeInTheDocument();
  });
});
