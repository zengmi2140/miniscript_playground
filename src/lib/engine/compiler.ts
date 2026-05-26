import { compilePolicy, ready as policiesReady } from '@bitcoinerlab/miniscript-policies';
import { compileMiniscript, satisfier } from '@bitcoinerlab/miniscript';
// 从 dist/descriptors 入口导入，避免 @bitcoinerlab/descriptors 主入口拉入 signers（Ledger PSBT 等）
import { DescriptorsFactory } from '@bitcoinerlab/descriptors/dist/descriptors';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import type {
  CompilationResult,
  KeyVariable,
  ScriptContext,
  Network,
  FriendlyError,
  SpendingPath,
} from './types';
import { mapError } from './policy-errors';
import { upgradeErrorWithPreflight } from './policy-preflight';
import { attachErrorHighlight } from './policy-error-highlight';
import { analyzeSpendingPaths } from './path-analyzer';
import { replaceManyIdentifierTokens } from '@/lib/utils/policy-identifiers';

const { Output } = DescriptorsFactory(ecc);

const NETWORK_MAP: Record<Network, bitcoin.Network> = {
  testnet: bitcoin.networks.testnet,
  signet: bitcoin.networks.testnet,
};

/**
 * Replace each `policyName` placeholder with its public key. Word-boundary
 * matching keeps prefix collisions (`A` vs `Alice`, `Key1` vs `Key10`) and
 * reserved miniscript fragments (`or_b`, `and_v`) intact (P1-03).
 */
export function replaceKeyNames(
  expression: string,
  keyVariables: KeyVariable[],
): string {
  return replaceManyIdentifierTokens(
    expression,
    keyVariables.map((kv) => ({ from: kv.policyName, to: kv.publicKey })),
  );
}

export interface CompileOutput {
  result: CompilationResult | null;
  paths: SpendingPath[];
  error: FriendlyError | null;
}

export async function compile(
  policy: string,
  keyVariables: KeyVariable[],
  context: ScriptContext,
  network: Network = 'testnet',
  availableKeys: Set<string> = new Set(),
  availableHashes: Set<string> = new Set(),
  currentTimeBlocks: number = 0,
): Promise<CompileOutput> {
  try {
    await policiesReady;

    if (context === 'tr') {
      const err: FriendlyError = {
        raw: 'P2TR context not supported (MVP uses P2WSH only)',
        category: 'limit',
        friendly: {
          zh: '当前版本仅支持 P2WSH（wsh）上下文。P2TR（Taproot）尚未实现。',
          en: 'Only P2WSH (wsh) is supported in this version. P2TR (Taproot) is not implemented yet.',
        },
      };
      return {
        result: null,
        paths: [],
        error: attachErrorHighlight(policy, err),
      };
    }

    const policyResult = compilePolicy(policy);

    if (
      !policyResult.miniscript ||
      policyResult.miniscript === '[compile error]' ||
      policyResult.miniscript.startsWith('[exception:')
    ) {
      let err = mapError(policyResult.miniscript || 'Unknown compilation error');
      err = upgradeErrorWithPreflight(policy, err);
      return {
        result: null,
        paths: [],
        error: attachErrorHighlight(policy, err),
      };
    }

    const miniscriptWithNames = policyResult.miniscript;
    const miniscriptWithKeys = replaceKeyNames(miniscriptWithNames, keyVariables);

    const compileResult = compileMiniscript(miniscriptWithKeys);

    if (compileResult.error) {
      let err = mapError(compileResult.error);
      err = upgradeErrorWithPreflight(policy, err);
      return {
        result: null,
        paths: [],
        error: attachErrorHighlight(policy, err),
      };
    }

    const descriptorStr = `wsh(${miniscriptWithKeys})`;
    const net = NETWORK_MAP[network];
    const output = new Output({ descriptor: descriptorStr, network: net });

    const address = output.getAddress();
    const scriptPubKey = output.getScriptPubKey();
    const scriptHex = Buffer.from(scriptPubKey).toString('hex');

    let sats: {
      nonMalleableSats: Array<{ asm: string; nSequence?: number; nLockTime?: number }>;
      malleableSats: Array<{ asm: string; nSequence?: number; nLockTime?: number }>;
    };
    try {
      sats = satisfier(miniscriptWithKeys);
    } catch {
      sats = { nonMalleableSats: [], malleableSats: [] };
    }

    const paths = analyzeSpendingPaths(
      sats.nonMalleableSats,
      sats.malleableSats,
      keyVariables,
      availableKeys,
      availableHashes,
      currentTimeBlocks,
    );

    return {
      result: {
        policy,
        policyWithKeys: replaceKeyNames(policy, keyVariables),
        miniscript: miniscriptWithNames,
        miniscriptWithKeys,
        asm: compileResult.asm,
        descriptor: descriptorStr,
        address,
        scriptHex,
      },
      paths,
      error: null,
    };
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);
    let mapped = mapError(raw);
    mapped = upgradeErrorWithPreflight(policy, mapped);
    return {
      result: null,
      paths: [],
      error: attachErrorHighlight(policy, mapped),
    };
  }
}
