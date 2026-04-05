'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { lineNumbers } from '@codemirror/view';
import { AlignLeft, Trash2, Copy, Share2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { buildErrorHighlightExtensions, policyExtensions } from '@/lib/editor/policy-language';
import { clampHighlightToDoc } from '@/lib/engine/policy-error-highlight';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { buildShareUrl } from '@/lib/utils/share';
import { cn } from '@/lib/utils/cn';
import type { FriendlyError } from '@/lib/engine/types';

function formatPolicy(raw: string): string {
  let result = '';
  let depth = 0;
  const trimmed = raw.replace(/\s+/g, '');

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '(') {
      result += '(\n';
      depth++;
      result += '  '.repeat(depth);
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
      result += '\n' + '  '.repeat(depth) + ')';
    } else if (ch === ',') {
      result += ',\n' + '  '.repeat(depth);
    } else {
      result += ch;
    }
  }
  return result;
}

interface PolicyEditorProps {
  compilationError: FriendlyError | null;
}

export function PolicyEditor({ compilationError }: PolicyEditorProps) {
  const { t, locale } = useI18n();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const policy = usePlaygroundStore((s) => s.policy);
  const setPolicy = usePlaygroundStore((s) => s.setPolicy);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const context = usePlaygroundStore((s) => s.context);
  const network = usePlaygroundStore((s) => s.network);
  const playgroundMode = usePlaygroundStore((s) => s.playgroundMode);
  const suppressSync = useRef(false);
  const highlightCompartment = useMemo(() => new Compartment(), []);
  const [shareCopied, setShareCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rawCopied, setRawCopied] = useState(false);

  useEffect(() => {
    setDetailsOpen(false);
  }, [compilationError?.raw]);

  const onDocChange = useCallback(
    (newDoc: string) => {
      suppressSync.current = true;
      setPolicy(newDoc);
      requestAnimationFrame(() => {
        suppressSync.current = false;
      });
    },
    [setPolicy],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: policy,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        cmPlaceholder(t('playground.editor.placeholder')),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onDocChange(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
        highlightCompartment.of(buildErrorHighlightExtensions(null)),
        ...policyExtensions,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || suppressSync.current) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== policy) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: policy,
        },
      });
    }
  }, [policy]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const len = view.state.doc.length;
    const r = clampHighlightToDoc(compilationError?.highlight, len);
    view.dispatch({
      effects: highlightCompartment.reconfigure(buildErrorHighlightExtensions(r)),
    });
  }, [compilationError, highlightCompartment, policy]);

  const handleFormat = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const formatted = formatPolicy(view.state.doc.toString());
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
    });
    setPolicy(formatted);
  }, [setPolicy]);

  const handleClear = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: '' },
    });
    setPolicy('');
  }, [setPolicy]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(policy);
  }, [policy]);

  const handleCopyRawError = useCallback(() => {
    if (!compilationError) return;
    navigator.clipboard.writeText(compilationError.raw);
    setRawCopied(true);
    setTimeout(() => setRawCopied(false), 2000);
  }, [compilationError]);

  const handleShare = useCallback(async () => {
    try {
      const url = buildShareUrl({
        policy,
        keyVariables,
        context,
        network,
        playgroundMode,
      });
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }, [policy, keyVariables, context, network, playgroundMode]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <ToolbarButton icon={AlignLeft} label={t('playground.editor.format')} onClick={handleFormat} />
        <ToolbarButton icon={Trash2} label={t('playground.editor.clear')} onClick={handleClear} />
        <ToolbarButton icon={Copy} label={t('playground.editor.copy')} onClick={handleCopy} />
        <ToolbarButton
          icon={shareCopied ? Check : Share2}
          label={shareCopied ? t('playground.editor.shareCopied') : t('playground.editor.share')}
          onClick={handleShare}
          active={shareCopied}
        />
      </div>

      <div
        ref={editorRef}
        className="min-h-[120px] max-h-[300px] overflow-y-auto rounded-button border border-border-default bg-surface-base focus-within:border-border-active"
      />

      {compilationError && (
        <div className="rounded-button border border-semantic-warning/30 bg-semantic-warning/5 px-3 py-2">
          <p className="text-[12px] leading-relaxed text-semantic-warning">
            {locale === 'zh' ? compilationError.friendly.zh : compilationError.friendly.en}
          </p>
          {(() => {
            const hints =
              compilationError.hints &&
              (locale === 'zh' ? compilationError.hints.zh : compilationError.hints.en);
            if (!hints?.length) return null;
            return (
              <div className="mt-2">
                <p className="mb-1 text-[11px] font-medium text-text-muted">
                  {t('playground.error.hints')}
                </p>
                <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-text-secondary">
                  {hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            );
          })()}
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            aria-expanded={detailsOpen}
            className="mt-2 flex w-full items-center gap-1 rounded px-0 py-1 text-left text-[11px] text-text-muted transition-colors hover:text-text-secondary"
          >
            {detailsOpen ? (
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            {detailsOpen ? t('playground.error.collapseDetails') : t('playground.error.expandDetails')}
          </button>
          {detailsOpen && (
            <div className="mt-2 border-t border-border-subtle pt-2">
              <div className="mb-1 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={handleCopyRawError}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-text-muted hover:bg-surface-elevated hover:text-text-secondary"
                  title={t('playground.error.copyRaw')}
                >
                  {rawCopied ? (
                    <Check className="h-3 w-3 text-semantic-satisfied" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {rawCopied ? t('playground.error.rawCopied') : t('playground.error.copyRaw')}
                </button>
              </div>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-surface-elevated p-2 font-mono text-[10px] leading-relaxed text-text-secondary">
                {compilationError.raw}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, active }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'flex h-6 items-center gap-1 rounded px-1.5 text-[11px] transition-colors',
        active
          ? 'text-semantic-satisfied'
          : 'text-text-muted hover:bg-surface-elevated hover:text-text-secondary',
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
