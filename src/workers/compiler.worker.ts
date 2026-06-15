/// <reference lib="webworker" />

import { compile } from '@/lib/engine/compiler';
import type {
  CompilerWorkerInput,
  CompilerWorkerResult,
} from '@/lib/engine/compiler-worker';
import { parseMiniscript } from '@/lib/engine/miniscript-parser';
import { isFatalCompilerFailure } from '@/lib/engine/policy-limits';

interface WorkerRequest {
  id: number;
  input: CompilerWorkerInput;
}

interface WorkerResponse {
  id: number;
  result: CompilerWorkerResult;
  fatal?: boolean;
}

function fatalResult(): CompilerWorkerResult {
  return {
    output: {
      result: null,
      paths: [],
      error: {
        raw: 'Compilation worker restarted after engine failure',
        category: 'engine_init',
        friendly: {
          zh: '编译引擎发生异常并已自动重启，请简化策略后重试。',
          en: 'The compilation engine failed and was restarted. Simplify the policy and retry.',
        },
      },
    },
    semanticTree: null,
  };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, input } = event.data;
  try {
    const output = await compile(
      input.policy,
      input.keyVariables,
      input.context,
      input.network,
      new Set(input.availableKeys),
      new Set(input.availableHashes),
      input.currentTimeBlocks,
      input.blockTipHeight,
    );
    const fatal = Boolean(output.error && isFatalCompilerFailure(output.error.raw));
    const semanticTree =
      !fatal && output.result ? parseMiniscript(output.result.miniscript) : null;
    const response: WorkerResponse = {
      id,
      result: fatal ? fatalResult() : { output, semanticTree },
      ...(fatal ? { fatal: true } : {}),
    };
    self.postMessage(response);
  } catch {
    const response: WorkerResponse = {
      id,
      result: fatalResult(),
      fatal: true,
    };
    self.postMessage(response);
  }
};

export {};

