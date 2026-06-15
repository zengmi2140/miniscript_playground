import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config.mjs';

describe('security response headers', () => {
  it('applies the baseline headers to every application route', async () => {
    const rules = await nextConfig.headers();
    const catchAll = rules.find((rule) => rule.source === '/(.*)');
    const headers = new Map(catchAll.headers.map(({ key, value }) => [key, value]));

    expect(headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(headers.get('Permissions-Policy')).toContain('camera=()');
  });
});

