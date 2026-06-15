"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Monitor, ArrowLeft, AlertTriangle } from "lucide-react";
import { ThreeColumnLayout } from "@/components/playground/ThreeColumnLayout";
import { LeftPanel } from "@/components/playground/LeftPanel";
import { CenterPanel } from "@/components/playground/CenterPanel";
import { RightPanel } from "@/components/playground/RightPanel";
import { usePlaygroundStore } from "@/lib/stores/playground-store";
import { useCompiler } from "@/lib/hooks/useCompiler";
import { useBuilderSync } from "@/lib/hooks/useBuilderSync";
import {
  useDesktopBootstrap,
  type ViewportMode,
} from "@/lib/hooks/useDesktopBootstrap";
import { applyPlaygroundUrlState } from "@/lib/playground/apply-playground-search-params";
import { useI18n } from "@/lib/i18n/context";

function useViewportMode() {
  const [mode, setMode] = useState<ViewportMode>("loading");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setMode(mq.matches ? "desktop" : "mobile");
    const handler = (e: MediaQueryListEvent) =>
      setMode(e.matches ? "desktop" : "mobile");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return mode;
}

function PlaygroundLoadingPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-8">
      <div className="w-full max-w-5xl space-y-4" aria-hidden="true">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="grid gap-4 md:grid-cols-[240px_1fr_320px]">
          <div className="h-[520px] animate-pulse rounded-xl bg-surface-elevated/80" />
          <div className="h-[520px] animate-pulse rounded-xl bg-surface-elevated/80" />
          <div className="hidden h-[520px] animate-pulse rounded-xl bg-surface-elevated/80 md:block" />
        </div>
      </div>
    </div>
  );
}

function MobileFallback() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated">
          <Monitor className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="mb-3 text-[20px] font-semibold text-text-primary">
          {t("playground.mobile.title")}
        </h2>
        <p className="mb-8 text-body text-text-secondary">
          {t("playground.mobile.description")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-button border border-border-default bg-surface-elevated px-5 py-2.5 text-body font-medium text-text-primary transition-all hover:border-border-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("playground.mobile.goScenarios")}
        </Link>
      </div>
    </div>
  );
}

function DesktopPlayground() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const loadScenario = usePlaygroundStore((s) => s.loadScenario);
  const restoreSession = usePlaygroundStore((s) => s.restoreSession);
  const enterBuildMode = usePlaygroundStore((s) => s.enterBuildMode);
  const [showInvalidShareNotice, setShowInvalidShareNotice] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash);
  const lastInvalidShareParamRef = useRef<string | null>(null);
  useCompiler();
  useBuilderSync();

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const fragmentParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const shareParam = fragmentParams.get("s");
    applyPlaygroundUrlState(searchParams, hash, {
      restoreSession,
      loadScenario,
      enterBuildMode,
      notifyInvalidSharePayload: () => {
        if (!shareParam) return;
        if (lastInvalidShareParamRef.current === shareParam) return;
        lastInvalidShareParamRef.current = shareParam;
        setShowInvalidShareNotice(true);
      },
    });
  }, [searchParams, hash, restoreSession, loadScenario, enterBuildMode]);

  useEffect(() => {
    if (!showInvalidShareNotice) return;
    const timer = window.setTimeout(
      () => setShowInvalidShareNotice(false),
      5000,
    );
    return () => window.clearTimeout(timer);
  }, [showInvalidShareNotice]);

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      {showInvalidShareNotice && (
        <div
          className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-4 py-2 text-[13px] font-medium text-semantic-warning shadow-lg">
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
            <span>{t("playground.share.invalidPayload")}</span>
          </div>
        </div>
      )}
      <ThreeColumnLayout
        left={<LeftPanel />}
        center={<CenterPanel />}
        right={<RightPanel />}
      />
    </div>
  );
}

function PlaygroundContent() {
  const mode = useViewportMode();
  useDesktopBootstrap(mode);

  if (mode === "loading") return <PlaygroundLoadingPlaceholder />;
  if (mode === "mobile") return <MobileFallback />;
  return <DesktopPlayground />;
}

export function PlaygroundClient() {
  return (
    <Suspense>
      <PlaygroundContent />
    </Suspense>
  );
}
