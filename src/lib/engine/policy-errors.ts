import type { FriendlyError, FriendlyErrorCategory } from './types';

export type { FriendlyErrorCategory };

const FUNCS_ZH = 'pk()、older()、after()、sha256()、and()、or()、thresh()';
const FUNCS_EN = 'pk(), older(), after(), sha256(), and(), or(), thresh()';

/**
 * Best-effort extraction of a fragment name or token from library error strings.
 * Returns null when nothing reliable can be extracted (avoid empty display names).
 */
export function extractTokenFromRaw(raw: string): string | null {
  const patterns: RegExp[] = [
    /['"](\w+)['"]/,
    /['"]([^'"]+)['"]/,
    /unknown\s+fragment[:\s]+['"]?([\w.\-]+)/i,
    /fragment\s+['"]([^'"]+)['"]/i,
    /unrecognized\s+['"]?([^\s'"]+)/i,
  ];
  for (const p of patterns) {
    const m = p.exec(raw);
    const t = m?.[1]?.trim();
    if (t && t.length > 0) return t;
  }
  return null;
}

function withHints(
  raw: string,
  category: FriendlyErrorCategory,
  friendly: { zh: string; en: string },
  hints?: { zh: string[]; en: string[] },
): FriendlyError {
  return { raw, category, friendly, ...(hints ? { hints } : {}) };
}

export function mapError(raw: string): FriendlyError {
  const lower = raw.toLowerCase();

  if (lower.includes('not ready') || lower.includes('await ready')) {
    return withHints(
      raw,
      'engine_init',
      {
        zh: '编译引擎正在初始化，请稍后重试',
        en: 'Compilation engine is initializing, please retry shortly',
      },
    );
  }

  if (lower.includes('bracket') || lower.includes('parenthes') || lower.includes('unmatched')) {
    return withHints(
      raw,
      'syntax',
      {
        zh: '括号不匹配，请检查是否遗漏了 \')\'',
        en: 'Unmatched parentheses, please check for missing \')\'',
      },
      {
        zh: ['从最后一个左括号开始，核对每个 \'(\' 是否都有对应的 \')\''],
        en: ['Starting from the last \'(\', ensure each opening paren has a matching \')\''],
      },
    );
  }

  if (lower.includes('timelock') && lower.includes('mix')) {
    return withHints(
      raw,
      'timelock',
      {
        zh: '时间锁冲突：同一条花费路径中不能同时使用区块高度和时间戳类型的时间锁',
        en: 'Timelock conflict: cannot mix block-height and timestamp timelocks in the same spending path',
      },
    );
  }

  if (lower.includes('no signature') || lower.includes('without any signature')) {
    return withHints(
      raw,
      'security',
      {
        zh: '⚠️ 安全警告：存在不需要任何签名就能花费的路径，这意味着任何人都可能花掉这笔钱',
        en: '⚠️ Security warning: a spending path exists that requires no signatures',
      },
      {
        zh: ['为每条花费路径至少保留一个 pk(...) 或等价条件'],
        en: ['Ensure every spending path requires at least one signature (e.g. pk(...))'],
      },
    );
  }

  if (lower.includes('script size') || lower.includes('size limit')) {
    return withHints(
      raw,
      'limit',
      {
        zh: '脚本大小超过限制',
        en: 'Script size exceeds the limit',
      },
      {
        zh: ['尝试简化策略或减少分支'],
        en: ['Try simplifying the policy or reducing branches'],
      },
    );
  }

  if (/thresh.*k.*>.*n|k.*greater.*n/i.test(raw)) {
    return withHints(
      raw,
      'semantic',
      {
        zh: 'thresh 的阈值 k 不能大于条件数量 n',
        en: 'thresh threshold k cannot exceed the number of conditions n',
      },
      {
        zh: ['thresh 的第一个参数是 k，其余为子条件'],
        en: ['First argument to thresh is k; remaining arguments are child conditions'],
      },
    );
  }

  if (/older\(0\)|after\(0\)|value.*cannot.*0/i.test(raw)) {
    return withHints(
      raw,
      'semantic',
      {
        zh: '时间锁的值不能为 0',
        en: 'Timelock value cannot be 0',
      },
    );
  }

  /** Library-reported duplicate / repeated key (wording varies by version). */
  if (
    (/\bduplicate\b/i.test(raw) && /\b(key|pubkey|pk)\b/i.test(raw)) ||
    /\brepeated\b.*\b(key|pubkey|pk)\b/i.test(raw)
  ) {
    return withHints(
      raw,
      'duplicate_key',
      {
        zh: '编译器检测到密钥或公钥重复使用。请展开「技术详情」查看原始信息，并检查策略中是否重复使用了同一 pk(...) 占位名或公钥。',
        en: 'The compiler reported duplicate key or pubkey usage. Expand technical details for the raw message, and check for repeated pk(...) placeholders or keys.',
      },
      {
        zh: ['确保每个角色名 / 公钥在策略中只对应一处 pk(...)'],
        en: ['Ensure each role name or pubkey appears only once per pk(...) in the policy'],
      },
    );
  }

  const isPolicyCompileShape =
    raw.includes('[compile error]') ||
    raw.includes('[exception:') ||
    lower.includes('unknown fragment') ||
    lower.includes('parse error');

  if (isPolicyCompileShape) {
    const token = extractTokenFromRaw(raw);
    if (token) {
      return withHints(
        raw,
        'unknown_fragment',
        {
          zh: `策略语法错误：无法识别「${token}」。可用的函数有：${FUNCS_ZH}`,
          en: `Policy syntax error: unrecognized '${token}'. Available functions: ${FUNCS_EN}`,
        },
        {
          zh: ['检查名称是否拼写错误', '仅支持上述函数及其组合'],
          en: ['Check spelling of names', 'Only the listed functions and their compositions are supported'],
        },
      );
    }
    return withHints(
      raw,
      'syntax',
      {
        zh: `策略无法通过编译校验。请展开下方「技术详情」查看原始错误信息。支持的函数包括：${FUNCS_ZH}。`,
        en: `The policy could not be compiled. Expand "Technical details" below for the raw message. Supported functions include: ${FUNCS_EN}.`,
      },
      {
        zh: ['确认括号与逗号是否配对', '若从别处粘贴，请删除多余或不可见字符'],
        en: ['Check parentheses and commas', 'If pasted from elsewhere, remove stray or invisible characters'],
      },
    );
  }

  const looksMiniscript =
    lower.includes('miniscript') ||
    lower.includes('type error') ||
    lower.includes('invalid miniscript');

  if (looksMiniscript) {
    return withHints(
      raw,
      'miniscript',
      {
        zh: `Miniscript 校验未通过。请展开下方「技术详情」查看完整信息。`,
        en: `Miniscript validation failed. Expand "Technical details" below for the full message.`,
      },
      {
        zh: ['确认占位密钥变量已替换为有效公钥', '检查 Policy 编译后的 Miniscript 是否仍合法'],
        en: ['Ensure key placeholders are replaced with valid public keys', 'Check that compiled miniscript is still valid'],
      },
    );
  }

  return withHints(
    raw,
    'unknown',
    {
      zh: `编译失败。请展开下方「技术详情」查看完整错误信息。`,
      en: `Compilation failed. Expand "Technical details" below for the full message.`,
    },
    {
      zh: ['核对 Policy 语法与支持的函数', '若错误持续，可将技术详情复制给支持渠道'],
      en: ['Check policy syntax and supported functions', 'If it persists, copy technical details when asking for help'],
    },
  );
}
