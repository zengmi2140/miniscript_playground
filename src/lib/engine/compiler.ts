import { compilePolicy, ready as policiesReady } from '@bitcoinerlab/miniscript-policies';
import { compileMiniscript, satisfier } from '@bitcoinerlab/miniscript';
import { DescriptorsFactory } from '@bitcoinerlab/descriptors';
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

function mapError(raw: string): FriendlyError {
  const lower = raw.toLowerCase();

  if (lower.includes('not ready') || lower.includes('await ready')) {
    return {
      raw,
      friendly: {
        zh: '编译引擎正在初始化，请稍后重试',
        en: 'Compilation engine is initializing, please retry shortly',
      },
    };
  }

  if (
    raw.includes('[compile error]') ||
    raw.includes('[exception:') ||
    lower.includes('unknown fragment') ||
    lower.includes('parse error')
  ) {
    const nameMatch = /['"](\w+)['"]/i.exec(raw);
    const name = nameMatch ? nameMatch[1] : '';
    return {
      raw,
      friendly: {
        zh: `策略语法错误：无法识别 '${name}'。可用的函数有：pk()、older()、after()、sha256()、and()、or()、thresh()`,
        en: `Policy syntax error: unrecognized '${name}'. Available functions: pk(), older(), after(), sha256(), and(), or(), thresh()`,
      },
    };
  }

  if (lower.includes('bracket') || lower.includes('parenthes') || lower.includes('unmatched')) {
    return {
      raw,
      friendly: {
        zh: '括号不匹配，请检查是否遗漏了 \')\'',
        en: 'Unmatched parentheses, please check for missing \')\'',
      },
    };
  }

  if (lower.includes('timelock') && lower.includes('mix')) {
    return {
      raw,
      friendly: {
        zh: '时间锁冲突：同一条花费路径中不能同时使用区块高度和时间戳类型的时间锁',
        en: 'Timelock conflict: cannot mix block-height and timestamp timelocks in the same spending path',
      },
    };
  }

  if (lower.includes('no signature') || lower.includes('without any signature')) {
    return {
      raw,
      friendly: {
        zh: '⚠️ 安全警告：存在不需要任何签名就能花费的路径，这意味着任何人都可能花掉这笔钱',
        en: '⚠️ Security warning: a spending path exists that requires no signatures',
      },
    };
  }

  if (lower.includes('script size') || lower.includes('size limit')) {
    return {
      raw,
      friendly: {
        zh: '脚本大小超过限制',
        en: 'Script size exceeds the limit',
      },
    };
  }

  if (/thresh.*k.*>.*n|k.*greater.*n/i.test(raw)) {
    return {
      raw,
      friendly: {
        zh: 'thresh 的阈值 k 不能大于条件数量 n',
        en: 'thresh threshold k cannot exceed the number of conditions n',
      },
    };
  }

  if (/older\(0\)|after\(0\)|value.*cannot.*0/i.test(raw)) {
    return {
      raw,
      friendly: {
        zh: '时间锁的值不能为 0',
        en: 'Timelock value cannot be 0',
      },
    };
  }

  return {
    raw,
    friendly: {
      zh: `编译错误：${raw}`,
      en: `Compilation error: ${raw}`,
    },
  };
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
      return {
        result: null,
        paths: [],
        error: mapError(policyResult.miniscript || 'Unknown compilation error'),
      };
    }

    const miniscriptWithNames = policyResult.miniscript;
    const miniscriptWithKeys = replaceKeyNames(miniscriptWithNames, keyVariables);

    const compileResult = compileMiniscript(miniscriptWithKeys);

    if (compileResult.error) {
      return {
        result: null,
        paths: [],
        error: mapError(compileResult.error),
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
        miniscript: miniscriptWithNames,
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
    return {
      result: null,
      paths: [],
      error: mapError(raw),
    };
  }
}
