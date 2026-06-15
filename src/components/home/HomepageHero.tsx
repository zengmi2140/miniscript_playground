"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bitcoin } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// ── Policy tokens (Panel A) ───────────────────────────────────────────
type Token = { text: string; color: string };

const POLICY_TOKENS_BASE: Token[] = [
  { text: "or", color: "text-btc-500" },
  { text: "(\n  ", color: "text-text-primary" },
  { text: "and", color: "text-btc-500" },
  { text: "(", color: "text-text-primary" },
  { text: "pk(Alice)", color: "text-yellow-400" },
  { text: ", ", color: "text-text-primary" },
  { text: "pk(Bob)", color: "text-yellow-400" },
  { text: "),\n  ", color: "text-text-primary" },
  { text: "and", color: "text-btc-500" },
  { text: "(", color: "text-text-primary" },
  { text: "pk(Alice)", color: "text-yellow-400" },
  { text: ", ", color: "text-text-primary" },
  { text: "older(4320)", color: "text-emerald-400" },
  { text: ")   ", color: "text-text-primary" },
  // comment token injected at runtime via i18n
  { text: "\n)", color: "text-text-primary" },
];

// ── Script lines (Panel B) ────────────────────────────────────────────
type ScriptToken = { text: string; color: string };
type ScriptLine = ScriptToken[];

const SCRIPT_LINES: ScriptLine[] = [
  [
    { text: "OP_DUP", color: "text-btc-500" },
    { text: " ", color: "" },
    { text: "<Alice>", color: "text-yellow-400" },
    { text: " ", color: "" },
    { text: "OP_CHECKSIGVERIFY", color: "text-btc-500" },
  ],
  [{ text: "OP_IF", color: "text-btc-500" }],
  [
    { text: "  ", color: "" },
    { text: "<Bob>", color: "text-yellow-400" },
    { text: " ", color: "" },
    { text: "OP_CHECKSIG", color: "text-btc-500" },
  ],
  [{ text: "OP_ELSE", color: "text-btc-500" }],
  [
    { text: "  ", color: "" },
    { text: "4320", color: "text-emerald-400" },
    { text: " ", color: "" },
    { text: "OP_CSV", color: "text-btc-500" },
  ],
  [{ text: "OP_ENDIF", color: "text-btc-500" }],
];

// ── Helpers ───────────────────────────────────────────────────────────

/** Render all policy characters, with characters after charCount set to opacity-0 to reserve space */
function renderPolicySpans(
  tokens: Token[],
  charCount: number,
  showCursor: boolean,
) {
  const typedSpans: React.ReactNode[] = [];
  const untypedSpans: React.ReactNode[] = [];
  let remaining = charCount;

  tokens.forEach((token, idx) => {
    if (remaining <= 0) {
      // Entirely untyped
      untypedSpans.push(
        <span
          key={`untyped-${idx}`}
          className={`${token.color} opacity-0`}
          aria-hidden="true"
        >
          {token.text}
        </span>,
      );
    } else if (remaining >= token.text.length) {
      // Entirely typed
      typedSpans.push(
        <span key={`typed-${idx}`} className={token.color}>
          {token.text}
        </span>,
      );
      remaining -= token.text.length;
    } else {
      // Partially typed
      const typedSlice = token.text.slice(0, remaining);
      const untypedSlice = token.text.slice(remaining);
      typedSpans.push(
        <span key={`typed-${idx}`} className={token.color}>
          {typedSlice}
        </span>,
      );
      untypedSpans.push(
        <span
          key={`untyped-${idx}`}
          className={`${token.color} opacity-0`}
          aria-hidden="true"
        >
          {untypedSlice}
        </span>,
      );
      remaining = 0;
    }
  });

  return (
    <>
      {typedSpans}
      {showCursor && (
        <span className="inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-btc-500" />
      )}
      {untypedSpans}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────

export function HomepageHero() {
  const { t } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Build localized policy tokens (comment injected via i18n)
  const policyTokens = useMemo<Token[]>(() => {
    const comment = t("home.hero.policyComment");
    const base = POLICY_TOKENS_BASE.slice(0, -1); // all but last "\n)"
    return [
      ...base,
      { text: comment, color: "text-text-muted" },
      ...POLICY_TOKENS_BASE.slice(-1), // "\n)"
    ];
  }, [t]);
  const fullPolicyLength = useMemo(
    () => policyTokens.reduce((s, tok) => s + tok.text.length, 0),
    [policyTokens],
  );

  // Animation state
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLines, setVisibleLines] = useState<boolean[]>(
    new Array(6).fill(false),
  );
  const [phase, setPhase] = useState<"idle" | "typing" | "revealing" | "done">(
    "idle",
  );
  const [hovered, setHovered] = useState(false);

  // Detect reduced-motion & mobile
  const skipAnimation = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    skipAnimation.current = mq.matches || window.innerWidth < 768;
    if (skipAnimation.current) {
      setTypedChars(fullPolicyLength);
      setVisibleLines(new Array(6).fill(true));
      setPhase("done");
      setFinished(true);
    }
  }, [fullPolicyLength]);
  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  // Run the animation sequence
  const play = useCallback(() => {
    clearTimers();
    setTypedChars(0);
    setVisibleLines(new Array(6).fill(false));
    setPhase("typing");
    setFinished(false);

    // Phase 1: typewriter over 1500ms
    const charInterval = 1500 / fullPolicyLength;
    for (let i = 1; i <= fullPolicyLength; i++) {
      const t = setTimeout(() => setTypedChars(i), charInterval * i);
      timerRef.current.push(t);
    }

    // Phase 2: reveal script lines
    const revealStart = 1500;
    for (let i = 0; i < 6; i++) {
      const t = setTimeout(
        () => {
          setVisibleLines((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          if (i === 0) setPhase("revealing");
        },
        revealStart + i * 250,
      );
      timerRef.current.push(t);
    }

    // Done
    const tDone = setTimeout(() => {
      setPhase("done");
      setFinished(true);
    }, 3000);
    timerRef.current.push(tDone);
  }, [clearTimers, fullPolicyLength]);

  // IntersectionObserver trigger (once)
  useEffect(() => {
    if (skipAnimation.current || started) return;
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          play();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started, play]);

  // Cleanup on unmount
  useEffect(() => clearTimers, [clearTimers]);

  const handleReplay = () => {
    if (phase !== "done") return;
    play();
  };

  const showCursor = phase === "typing";
  const showReplay =
    !skipAnimation.current && finished && hovered && phase === "done";

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface-base">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* ── Left: Text ─────────────────────────────────── */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-btc-500/20 bg-btc-500/10 px-3 py-1.5">
              <Bitcoin className="h-3.5 w-3.5 text-btc-500" />
              <span className="text-xs font-medium text-btc-500">
                {t("home.hero.badge")}
              </span>
            </div>

            <h1 className="mb-4 text-[28px] font-bold leading-tight tracking-tight text-text-primary md:text-[36px] lg:text-[42px]">
              {t("home.hero.title")}
            </h1>

            <p className="mb-3 text-sm leading-relaxed text-text-secondary md:text-base">
              {t("home.hero.intro1")}
            </p>
            <p className="mb-8 text-sm leading-relaxed text-text-secondary md:text-base">
              {t("home.hero.intro2")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#applications"
                className="group inline-flex items-center justify-center gap-2 rounded-button bg-btc-500 px-5 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:bg-btc-400"
              >
                {t("home.hero.ctaPrimary")}
              </Link>
              <Link
                href="/playground"
                className="group inline-flex items-center justify-center gap-2 rounded-button border border-border-default bg-surface-elevated px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-border-hover hover:bg-surface-overlay"
              >
                {t("home.hero.ctaSecondary")}
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-muted md:hidden">
              {t("home.hero.desktopHint")}
            </p>
          </div>

          {/* ── Right: Code card ───────────────────────────── */}
          <div className="relative">
            <div
              ref={cardRef}
              className="overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-xl shadow-black/30"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-auto rounded border border-btc-500/30 px-1.5 py-0.5 text-[10px] font-medium text-btc-500">
                  {t("home.hero.card.tag")}
                </span>
              </div>

              {/* Panel A — Policy */}
              <div className="px-5 pt-5 pb-3">
                <pre className="font-mono text-sm leading-7 whitespace-pre-wrap">
                  {renderPolicySpans(policyTokens, typedChars, showCursor)}
                </pre>
              </div>

              {/* Separator */}
              <div className="flex items-center justify-center py-1.5">
                <span className="font-mono text-xs text-text-muted">
                  {t("home.hero.card.compilesTo")}
                </span>
              </div>

              {/* Panel B — Script */}
              <div className="px-5 pt-1 pb-3">
                <pre className="font-mono text-sm leading-7">
                  {SCRIPT_LINES.map((line, i) => (
                    <div
                      key={i}
                      className="transition-all duration-300 ease-out"
                      style={{
                        opacity: visibleLines[i] ? 1 : 0,
                        transform: visibleLines[i]
                          ? "translateY(0)"
                          : "translateY(8px)",
                      }}
                    >
                      {line.map((tok, j) => (
                        <span key={j} className={tok.color}>
                          {tok.text}
                        </span>
                      ))}
                    </div>
                  ))}
                </pre>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2">
                <span className="text-xs text-text-muted">
                  {t("home.hero.card.statusNote")}
                </span>
                {showReplay && (
                  <button
                    onClick={handleReplay}
                    className="text-xs text-text-muted transition-colors hover:text-text-secondary"
                  >
                    {t("home.hero.card.replay")}
                  </button>
                )}
              </div>
            </div>

            {/* Spending paths */}
            <div className="mt-5 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 rounded-md bg-surface-elevated px-3 py-2">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
                <span className="truncate font-mono text-xs text-text-secondary">
                  {t("home.hero.paths.path1")}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-surface-elevated px-3 py-2">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-btc-500" />
                <span className="truncate font-mono text-xs text-text-secondary">
                  {t("home.hero.paths.path2")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
