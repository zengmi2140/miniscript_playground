export function blocksToHuman(blocks: number): string {
  if (blocks < 144) return `${blocks} 区块 (≈${Math.round(blocks * 10)} 分钟)`;
  if (blocks < 1008) return `≈${Math.round(blocks / 144)} 天`;
  if (blocks < 4320) return `≈${Math.round(blocks / 1008)} 周`;
  if (blocks < 52560) return `≈${Math.round(blocks / 4320 * 30)} 天`;
  return `≈${(blocks / 52560).toFixed(1)} 年`;
}

export function afterToHuman(value: number): string {
  if (value < 500000000) {
    return `区块高度 #${value.toLocaleString()}`;
  }
  return new Date(value * 1000).toLocaleDateString('zh-CN');
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
