import { describe, expect, it } from 'vitest';
import { zh } from '../zh';

describe('home page Chinese copy', () => {
  it('uses concise section copy without article-style transition notes', () => {
    const homeCopy = JSON.stringify(zh.home);

    expect(zh.home.hook.outro).toBe('每一种场景，背后都对应着一类花费条件');
    expect(zh.home.transition.footer).toBe('');
    expect(zh.home.scriptComplexity.outro).toBe('');

    expect(homeCopy).not.toContain('这些都是"花费条件"问题');
    expect(homeCopy).not.toContain('不止于多签');
    expect(homeCopy).not.toContain('这些问题并非无解');
  });
});
