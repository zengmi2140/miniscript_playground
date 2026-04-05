import { StreamLanguage } from '@codemirror/language';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import { StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

export const policyLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match(/\/\/.*/)) return 'comment';
    if (stream.match(/\d+@/)) return 'meta';
    if (stream.match(/\b(pk|pkh|and|or|thresh|older|after|sha256|hash256|ripemd160|hash160)\b/))
      return 'keyword';
    if (stream.match(/[0-9a-fA-F]{40,64}/)) return 'string';
    if (stream.match(/\d+/)) return 'number';
    if (stream.match(/[A-Za-z_]\w*/)) return 'variableName';
    if (stream.match(/[(),]/)) return 'punctuation';
    if (stream.eat(/\s/)) return null;
    stream.next();
    return 'invalid';
  },
  startState() {
    return {};
  },
});

export const policyHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#FF9F35' },
  { tag: tags.variableName, color: '#EAB308' },
  { tag: tags.number, color: '#FFBA6B' },
  { tag: tags.meta, color: '#78716C', fontStyle: 'italic' },
  { tag: tags.string, color: '#A78BFA' },
  { tag: tags.punctuation, color: '#A8A29E' },
  { tag: tags.comment, color: '#78716C', fontStyle: 'italic' },
  { tag: tags.invalid, color: '#EF4444', textDecoration: 'underline wavy #EF4444' },
]);

export const policyTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: 'var(--font-mono), ui-monospace, "Cascadia Code", monospace',
  },
  '.cm-content': {
    padding: '8px 0',
    caretColor: '#F7931A',
  },
  '.cm-cursor': {
    borderLeftColor: '#F7931A',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(247, 147, 26, 0.15) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
  },
  '.cm-line': {
    padding: '0 8px',
  },
  '.cm-policy-error-highlight': {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderBottom: '2px solid rgba(245, 158, 11, 0.5)',
  },
});

const policyErrorMark = Decoration.mark({ class: 'cm-policy-error-highlight' });

/** Compartment content: empty or a StateField that paints one error range. */
export function buildErrorHighlightExtensions(
  range: { from: number; to: number } | null,
): Extension[] {
  if (!range || range.from >= range.to) return [];
  const field = StateField.define<DecorationSet>({
    create() {
      return Decoration.set([policyErrorMark.range(range.from, range.to)]);
    },
    update(deco, tr) {
      return deco.map(tr.changes);
    },
    provide: (f) => EditorView.decorations.from(f),
  });
  return [field];
}

export const policyExtensions = [
  policyLanguage,
  syntaxHighlighting(policyHighlightStyle),
  policyTheme,
];
