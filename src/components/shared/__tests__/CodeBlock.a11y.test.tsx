import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CodeBlock } from '../CodeBlock';
import { I18nProvider } from '@/lib/i18n/context';

afterEach(() => cleanup());

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe('CodeBlock copy button a11y (P1-09)', () => {
  it('exposes a labelled copy button so keyboard / screen reader users can find it', () => {
    render(
      <Wrapper>
        <CodeBlock code="pk(Alice)" />
      </Wrapper>,
    );
    const btn = screen.getByRole('button', { name: /copy/i });
    expect(btn).toBeInTheDocument();
  });

  it('button becomes visible (not opacity-0) on focus-visible / focus-within', () => {
    render(
      <Wrapper>
        <CodeBlock code="pk(Alice)" />
      </Wrapper>,
    );
    const btn = screen.getByRole('button', { name: /copy/i });
    const cls = btn.className;
    expect(cls).toMatch(/group-focus-within:opacity-100/);
    expect(cls).toMatch(/focus-visible:opacity-100/);
    expect(cls).toMatch(/group-hover:opacity-100/);
  });

  it('keeps the button reachable via Tab order (default tabIndex)', () => {
    render(
      <Wrapper>
        <CodeBlock code="pk(Alice)" />
      </Wrapper>,
    );
    const btn = screen.getByRole('button', { name: /copy/i });
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });
});
