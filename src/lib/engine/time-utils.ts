export function blocksToHuman(blocks: number): string {
  if (blocks < 144) return `${blocks} 区块 (≈${Math.round(blocks * 10)} 分钟)`;
  if (blocks < 1008) return `≈${Math.round(blocks / 144)} 天`;
  if (blocks < 4320) return `≈${Math.round(blocks / 1008)} 周`;
  if (blocks < 52560) return `≈${Math.round(blocks / 4320 * 30)} 天`;
  return `≈${(blocks / 52560).toFixed(1)} 年`;
}

export function blocksToHumanEn(blocks: number): string {
  if (blocks < 144) return `${blocks} blocks (≈${Math.round(blocks * 10)} min)`;
  if (blocks < 1008) return `≈${Math.round(blocks / 144)} day(s)`;
  if (blocks < 4320) return `≈${Math.round(blocks / 1008)} week(s)`;
  if (blocks < 52560) return `≈${Math.round(blocks / 4320 * 30)} days`;
  return `≈${(blocks / 52560).toFixed(1)} year(s)`;
}

export function blocksToHumanLocale(blocks: number, locale: 'zh' | 'en'): string {
  return locale === 'en' ? blocksToHumanEn(blocks) : blocksToHuman(blocks);
}

export function afterToHuman(value: number): string {
  if (value < 500000000) {
    return `区块高度 #${value.toLocaleString()}`;
  }
  return new Date(value * 1000).toLocaleDateString('zh-CN');
}

export function afterToHumanLocale(value: number, locale: 'zh' | 'en'): string {
  if (value < 500000000) {
    return locale === 'en'
      ? `Block #${value.toLocaleString()}`
      : `区块高度 #${value.toLocaleString()}`;
  }
  return new Date(value * 1000).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN');
}

export function isOlderSatisfied(olderValue: number, currentBlocks: number): boolean {
  return currentBlocks >= olderValue;
}

export function isAfterSatisfied(
  afterValue: number,
  currentBlocks: number,
  referenceBlockHeight: number,
): boolean {
  if (afterValue < 500000000) {
    return (referenceBlockHeight + currentBlocks) >= afterValue;
  }
  const referenceTime = Math.floor(Date.now() / 1000);
  const elapsedSeconds = currentBlocks * 600;
  return (referenceTime + elapsedSeconds) >= afterValue;
}

/**
 * Block count remaining until an absolute `after()` becomes satisfiable, given
 * the current simulated elapsed blocks and the chain tip height.
 * Returns 0 when already satisfied or when the chain tip is unknown for
 * block-height locks (caller decides how to render).
 */
export function getAfterRemainingBlocks(
  afterValue: number,
  currentBlocks: number,
  referenceBlockHeight: number,
): number {
  if (afterValue < 500000000) {
    return Math.max(0, afterValue - referenceBlockHeight - currentBlocks);
  }
  const referenceTime = Math.floor(Date.now() / 1000);
  const elapsedSeconds = currentBlocks * 600;
  const remainingSeconds = afterValue - referenceTime - elapsedSeconds;
  if (remainingSeconds <= 0) return 0;
  return Math.ceil(remainingSeconds / 600);
}

/**
 * Shared predicate used by tree-to-flow / path-analyzer / StatusBanner.
 * `referenceBlockHeight` is required for absolute `after(<height>)`; pass
 * undefined to keep the previous "tip not ready" behavior (block-height
 * locks are treated as not satisfiable).
 */
export function isPathTimelockSatisfied(
  cond:
    | { type: 'timelock_relative'; blocks: number }
    | { type: 'timelock_absolute'; value: number },
  currentBlocks: number,
  referenceBlockHeight: number | undefined,
): boolean {
  if (cond.type === 'timelock_relative') {
    return isOlderSatisfied(cond.blocks, currentBlocks);
  }
  // timelock_absolute
  if (cond.value < 500000000) {
    if (referenceBlockHeight === undefined) return false;
    return isAfterSatisfied(cond.value, currentBlocks, referenceBlockHeight);
  }
  // Unix timestamp form: chain tip not required.
  return isAfterSatisfied(cond.value, currentBlocks, 0);
}

/**
 * Remaining blocks until a path timelock condition becomes satisfiable.
 * Pairs with `isPathTimelockSatisfied`. Returns 0 when already satisfied.
 */
export function getPathTimelockRemainingBlocks(
  cond:
    | { type: 'timelock_relative'; blocks: number }
    | { type: 'timelock_absolute'; value: number },
  currentBlocks: number,
  referenceBlockHeight: number | undefined,
): number {
  if (cond.type === 'timelock_relative') {
    return Math.max(0, cond.blocks - currentBlocks);
  }
  if (cond.value < 500000000) {
    if (referenceBlockHeight === undefined) return Math.max(0, cond.value);
    return getAfterRemainingBlocks(cond.value, currentBlocks, referenceBlockHeight);
  }
  return getAfterRemainingBlocks(cond.value, currentBlocks, 0);
}
