import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from '../content-security-policy';

describe('buildContentSecurityPolicy', () => {
  it('builds a nonce-based production policy without unsafe-inline scripts', () => {
    const csp = buildContentSecurityPolicy('abc123', false);

    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic' 'wasm-unsafe-eval'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain(
      "connect-src 'self' https://mempool.space https://blockstream.info https://blockchain.info",
    );
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('allows unsafe-eval only for the development runtime', () => {
    expect(buildContentSecurityPolicy('devnonce', true)).toContain("'unsafe-eval'");
  });
});
