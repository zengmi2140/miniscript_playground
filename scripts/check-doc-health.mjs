#!/usr/bin/env node

/**
 * check-doc-health.mjs
 *
 * 文档健康度自检。扫描根目录与 docs/ 下的 Markdown，执行三类校验：
 *   1. 链接路径   —— Markdown 链接 [text](path) 指向的文件存在。
 *   2. 链接锚点   —— [text](file.md#anchor) / [text](#anchor) 的锚点在目标文档中存在
 *                    （锚点按 GitHub slug 规则从标题生成）。
 *   3. 代码引用   —— 文档正文中反引号包裹的代码文件名（*.ts/tsx/js/mjs/css/json）
 *                    在仓库中真实存在。保护 ARCHITECTURE.md「改动入口」表等纯文本引用。
 *
 * 用法：node scripts/check-doc-health.mjs
 * 退出码：0 = 全部通过，1 = 存在问题
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

// 扫描根目录的这些 Markdown + docs/ 下递归全部 .md
const SCAN_TARGETS = ["AGENTS.md", "README.md"];

// 构建仓库文件索引时跳过的目录
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "v0",
  ".claude",
  ".cursor",
  ".kilo",
  ".reasonix",
  ".codegraph",
  "coverage",
]);

// 被视为「代码文件名引用」的扩展名
const CODE_EXTS = ["ts", "tsx", "js", "mjs", "cjs", "css", "json"];

// ── 工具：递归收集文件 ───────────────────────────────────
function collectFiles(dir, filterFn, prefix = "") {
  const results = [];
  for (const entry of readdirSync(join(ROOT, dir))) {
    if (IGNORE_DIRS.has(entry)) continue;
    const rel = prefix ? `${prefix}/${entry}` : entry;
    const abs = join(ROOT, rel);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      results.push(...collectFiles(rel, filterFn, rel));
    } else if (filterFn(rel)) {
      results.push(rel);
    }
  }
  return results;
}

// docs/ 下所有 .md 加入扫描目标
SCAN_TARGETS.push(...collectFiles("docs", (rel) => rel.endsWith(".md")));

// 仓库全量文件索引（相对路径集合 + basename 集合），用于代码引用校验
const allFiles = collectFiles(".", () => true);
const relPathSet = new Set(allFiles.map((p) => p.replace(/\\/g, "/")));
const basenameSet = new Set(allFiles.map((p) => basename(p)));

// ── 工具：GitHub 风格标题 → slug ─────────────────────────
// 规则：小写 → 去除非「字母/数字/空格/连字符/下划线」字符（标点、`.`、`/`、emoji 等被删，
// 不是替换为连字符）→ 空格替换为连字符（不折叠连续连字符，与 GitHub 一致）。
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

// 提取一个 Markdown 文件中所有标题对应的 slug 集合
const headingSlugCache = new Map();
function getHeadingSlugs(absPath) {
  if (headingSlugCache.has(absPath)) return headingSlugCache.get(absPath);
  const slugs = new Set();
  if (existsSync(absPath) && statSync(absPath).isFile()) {
    const content = readFileSync(absPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = /^#{1,6}\s+(.*)$/.exec(line);
      if (m) slugs.add(slugify(m[1]));
    }
  }
  headingSlugCache.set(absPath, slugs);
  return slugs;
}

// 代码文件名引用是否能在仓库中找到
function codeRefExists(token) {
  const norm = token.replace(/\\/g, "/");
  if (norm.includes("/")) {
    // 含路径：从根解析存在，或任意文件以 `/token` 结尾（部分路径），或完全相等
    if (relPathSet.has(norm)) return true;
    const suffix = `/${norm}`;
    for (const p of relPathSet) {
      if (p === norm || p.endsWith(suffix)) return true;
    }
    return false;
  }
  // 纯文件名：basename 命中即可
  return basenameSet.has(norm);
}

// 匹配 Markdown 链接：[text](path) / [text](path#anchor)
const LINK_RE = /\]\(([^)]+)\)/g;
// 匹配反引号中的代码文件名 token
const CODE_TOKEN_RE = new RegExp(
  "`([A-Za-z0-9_./-]+\\.(?:" + CODE_EXTS.join("|") + "))`",
  "g"
);

/** @type {{ kind: string; file: string; detail: string }[]} */
const problems = [];

for (const rel of SCAN_TARGETS) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs) || !statSync(abs).isFile()) continue;

  const content = readFileSync(abs, "utf-8");
  const dir = dirname(abs);

  // 1 + 2：链接路径 & 锚点
  for (const match of content.matchAll(LINK_RE)) {
    const rawFull = match[1].trim();
    if (/^(https?:|mailto:|tel:)/.test(rawFull)) continue;

    const [pathPart, anchorPart] = splitAnchor(rawFull);

    // 纯锚点（同文件内）：pathPart 为空
    if (!pathPart) {
      if (anchorPart && !getHeadingSlugs(abs).has(anchorPart)) {
        problems.push({
          kind: "anchor",
          file: rel,
          detail: `#${anchorPart}（本文件内无匹配标题）`,
        });
      }
      continue;
    }

    const target = resolve(dir, pathPart);
    if (!existsSync(target)) {
      problems.push({ kind: "path", file: rel, detail: match[1] });
      continue;
    }

    // 目标存在且带锚点、且目标是 .md → 校验锚点
    if (anchorPart && pathPart.endsWith(".md")) {
      if (!getHeadingSlugs(target).has(anchorPart)) {
        problems.push({
          kind: "anchor",
          file: rel,
          detail: `${pathPart}#${anchorPart}（目标文档无匹配标题）`,
        });
      }
    }
  }

  // 3：反引号代码文件名引用
  for (const match of content.matchAll(CODE_TOKEN_RE)) {
    const token = match[1];
    if (!codeRefExists(token)) {
      problems.push({ kind: "coderef", file: rel, detail: `\`${token}\`` });
    }
  }
}

function splitAnchor(raw) {
  const idx = raw.indexOf("#");
  if (idx === -1) return [raw, ""];
  return [raw.slice(0, idx), raw.slice(idx + 1)];
}

// ── 输出报告 ──────────────────────────────────────────
if (problems.length === 0) {
  console.log(
    "✅ Doc health check passed — links, anchors, and code references are all valid."
  );
  process.exit(0);
}

const byKind = {
  path: "断裂的链接路径",
  anchor: "断裂的锚点",
  coderef: "失效的代码文件名引用",
};
console.error(`❌ Doc health check found ${problems.length} problem(s):\n`);
for (const kind of Object.keys(byKind)) {
  const items = problems.filter((p) => p.kind === kind);
  if (items.length === 0) continue;
  console.error(`  [${byKind[kind]}]`);
  for (const p of items) console.error(`    ${p.file}  →  ${p.detail}`);
  console.error("");
}
console.error("Please update or remove the problems above.");
process.exit(1);
