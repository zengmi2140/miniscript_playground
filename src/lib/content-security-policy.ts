export function buildContentSecurityPolicy(
  nonce: string,
  isDevelopment: boolean,
): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${
      isDevelopment ? " 'unsafe-eval'" : ''
    }`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://mempool.space https://blockstream.info https://blockchain.info",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "media-src 'self'",
  ];
  return `${directives.join('; ')};`;
}

