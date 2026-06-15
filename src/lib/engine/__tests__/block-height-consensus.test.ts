import { describe, expect, it } from 'vitest';
import {
  BLOCK_TIP_FETCH_OPTIONS,
  MAX_REFERENCE_DRIFT_BLOCKS,
  parseBlockHeightResponse,
  selectConsensusHeight,
} from '../block-height-consensus.mjs';

describe('block height validation and consensus', () => {
  it('accepts only canonical decimal safe integers in range', () => {
    expect(parseBlockHeightResponse('953000\n', 953001)).toBe(953000);
    expect(parseBlockHeightResponse('953000junk', 953001)).toBeNull();
    expect(parseBlockHeightResponse('-953000', 953001)).toBeNull();
    expect(parseBlockHeightResponse('9007199254740992', 953001)).toBeNull();
    expect(parseBlockHeightResponse('1', 953001)).toBeNull();
  });

  it('rejects heights with unreasonable drift from the trusted reference', () => {
    expect(
      parseBlockHeightResponse(
        String(953000 + MAX_REFERENCE_DRIFT_BLOCKS + 1),
        953000,
      ),
    ).toBeNull();
  });

  it('chooses a conservative two-source consensus and ignores an outlier', () => {
    expect(selectConsensusHeight([953001, 953000, 1_200_000])).toBe(953000);
    expect(selectConsensusHeight([953000, 953001, 953002])).toBe(953001);
    expect(selectConsensusHeight([953000, 954000, 955000])).toBeNull();
    expect(selectConsensusHeight([953000])).toBeNull();
  });

  it('defines privacy-minimizing read-only fetch options', () => {
    expect(BLOCK_TIP_FETCH_OPTIONS).toEqual({
      method: 'GET',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    });
  });
});
