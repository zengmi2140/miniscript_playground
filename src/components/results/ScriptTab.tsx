'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { useI18n } from '@/lib/i18n/context';

const OPCODES = new Set([
  'OP_DUP', 'OP_HASH160', 'OP_EQUAL', 'OP_EQUALVERIFY', 'OP_CHECKSIG',
  'OP_CHECKSIGVERIFY', 'OP_CHECKMULTISIG', 'OP_CHECKMULTISIGVERIFY',
  'OP_IF', 'OP_ELSE', 'OP_ENDIF', 'OP_NOTIF', 'OP_VERIFY', 'OP_RETURN',
  'OP_CHECKLOCKTIMEVERIFY', 'OP_CHECKSEQUENCEVERIFY', 'OP_DROP',
  'OP_2DROP', 'OP_NIP', 'OP_OVER', 'OP_PICK', 'OP_ROLL', 'OP_ROT',
  'OP_SWAP', 'OP_TUCK', 'OP_SIZE', 'OP_BOOLAND', 'OP_BOOLOR',
  'OP_ADD', 'OP_SUB', 'OP_NOT', 'OP_0NOTEQUAL', 'OP_NUMEQUAL',
  'OP_NUMEQUALVERIFY', 'OP_LESSTHAN', 'OP_GREATERTHAN', 'OP_WITHIN',
  'OP_RIPEMD160', 'OP_SHA256', 'OP_HASH256', 'OP_TOALTSTACK',
  'OP_FROMALTSTACK', 'OP_IFDUP', 'OP_DEPTH',
  'OP_0', 'OP_1', 'OP_2', 'OP_3', 'OP_4', 'OP_5', 'OP_6', 'OP_7',
  'OP_8', 'OP_9', 'OP_10', 'OP_11', 'OP_12', 'OP_13', 'OP_14', 'OP_15', 'OP_16',
]);

function highlightAsm(code: string) {
  const tokens = code.split(/(\s+)/);
  return tokens.map((token, i) => {
    if (OPCODES.has(token)) {
      return (
        <span key={i} className="text-btc-400">
          {token}
        </span>
      );
    }
    if (/^[0-9a-fA-F]{8,}$/.test(token)) {
      return (
        <span key={i} className="text-semantic-hashlock">
          {token}
        </span>
      );
    }
    return <span key={i}>{token}</span>;
  });
}

export function ScriptTab() {
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const { t } = useI18n();

  if (!compilationResult) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">{t('playground.right.waiting')}</p>
      </div>
    );
  }

  return <CodeBlock code={compilationResult.asm} highlight={highlightAsm} />;
}
