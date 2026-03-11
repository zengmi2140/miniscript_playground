'use client';

import { useCallback, useEffect, useRef } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { lineNumbers } from '@codemirror/view';
import { AlignLeft, Trash2, Copy, Share2 } from 'lucide-react';
import { policyExtensions } from '@/lib/editor/policy-language';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
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
  const suppressSync = useRef(false);

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

  const handleShare = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('s', btoa(policy));
    navigator.clipboard.writeText(url.toString());
  }, [policy]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <ToolbarButton icon={AlignLeft} label={t('playground.editor.format')} onClick={handleFormat} />
        <ToolbarButton icon={Trash2} label={t('playground.editor.clear')} onClick={handleClear} />
        <ToolbarButton icon={Copy} label={t('playground.editor.copy')} onClick={handleCopy} />
        <ToolbarButton icon={Share2} label={t('playground.editor.share')} onClick={handleShare} />
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
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'flex h-6 items-center gap-1 rounded px-1.5 text-[11px] text-text-muted',
        'transition-colors hover:bg-surface-elevated hover:text-text-secondary',
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
