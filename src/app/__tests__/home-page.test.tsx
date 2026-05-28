import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import HomePage from '../page';
import { I18nProvider } from '@/lib/i18n/context';

describe('HomePage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      disconnect = vi.fn();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  it('does not render the Miniscript history section', () => {
    render(
      <I18nProvider initialLocale="zh">
        <HomePage />
      </I18nProvider>,
    );

    expect(screen.queryByText('Miniscript 从哪里来')).not.toBeInTheDocument();
  });

  it('does not render a filename label in the hero code card chrome', () => {
    render(
      <I18nProvider initialLocale="zh">
        <HomePage />
      </I18nProvider>,
    );

    expect(screen.queryByText('policy.miniscript')).not.toBeInTheDocument();
  });
});
