'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CodeBlockProps {
  code: string;
  highlight?: (code: string) => React.ReactNode;
  className?: string;
}

export function CodeBlock({ code, highlight, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <div className={cn('group relative rounded-card border border-border-subtle bg-surface-base', className)}>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-button border border-border-subtle bg-surface-card text-text-muted opacity-0 transition-all hover:border-border-default hover:text-text-secondary group-hover:opacity-100"
        aria-label="Copy"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-semantic-satisfied" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-code leading-relaxed text-text-primary">
        {highlight ? highlight(code) : <code>{code}</code>}
      </pre>
    </div>
  );
}
