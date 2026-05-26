'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface CodeBlockProps {
  code: string;
  highlight?: (code: string) => React.ReactNode;
  className?: string;
  wrap?: boolean;
}

export function CodeBlock({ code, highlight, className, wrap = true }: CodeBlockProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  const preClasses = wrap
    ? 'p-4 font-mono text-code leading-relaxed text-text-primary whitespace-pre-wrap break-words'
    : 'overflow-x-auto p-4 font-mono text-code leading-relaxed text-text-primary';

  return (
    <div className={cn('group relative rounded-card border border-border-subtle bg-surface-base', className)}>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-button border border-border-subtle bg-surface-card text-text-muted opacity-0 outline-none transition-all hover:border-border-default hover:text-text-secondary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base group-hover:opacity-100 group-focus-within:opacity-100"
        aria-label={t('common.aria.copy')}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-semantic-satisfied" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
      <pre className={preClasses}>
        {highlight ? highlight(code) : <code>{code}</code>}
      </pre>
    </div>
  );
}
