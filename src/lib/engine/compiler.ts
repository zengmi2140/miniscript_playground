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
import { attachErrorHighlight } from './policy-error-highlight';
import { analyzeSpendingPaths } from './path-analyzer';

const { Output } = DescriptorsFactory(ecc);

const NETWORK_MAP: Record<Network, bitcoin.Network> = {
  testnet: bitcoin.networks.testnet,
  signet: bitcoin.networks.testnet,
};

function replaceKeyNames(
  expression: string,
  keyVariables: KeyVariable[],
): string {
  let result = expression;
  const sorted = [...keyVariables].sort(
    (a, b) => b.policyName.length - a.policyName.length,
  );
  for (const kv of sorted) {
    result = result.replaceAll(kv.policyName, kv.publicKey);
  }
  return result;
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

    const policyResult = compilePolicy(policy);

    if (
      !policyResult.miniscript ||
      policyResult.miniscript === '[compile error]' ||
      policyResult.miniscript.startsWith('[exception:')
    ) {
      const err = mapError(policyResult.miniscript || 'Unknown compilation error');
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
      const err = mapError(compileResult.error);
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
    const mapped = mapError(raw);
    return {
      result: null,
      paths: [],
      error: attachErrorHighlight(policy, mapped),
    };
  }
}
