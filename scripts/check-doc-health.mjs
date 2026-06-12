#!/usr/bin/env node

/**
 * check-doc-health.mjs
 *
 * 文档健康度自检：扫描项目中的 Markdown 文件，检查内部引用的文件路径是否存在。
 *
 * 用法：node scripts/check-doc-health.mjs
 * 退出码：0 = 全部通过，1 = 存在断裂引用
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

// 需要扫描的 Markdown 文件（根目录 + docs/ 递归）
const SCAN_TARGETS = [
  "AGENTS.md",
  "README.md",
];

// 递归收集 docs/ 下所有 .md 文件
function collectDocs(dir, prefix) {
  const results = [];
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${prefix}${entry}`;
    const abs = join(ROOT, rel);
    if (statSync(abs).isDirectory()) {
      results.push(...collectDocs(`${dir}/${entry}`, `${rel}/`));
    } else if (entry.endsWith(".md")) {
      results.push(rel);
    }
  }
  return results;
}

SCAN_TARGETS.push(...collectDocs("docs", "docs/"));

// 匹配 Markdown 链接中的文件路径：[text](path) 或 [text](path#anchor)
// 排除 http(s) 链接、mailto、纯锚点 (#xxx)
const LINK_RE = /\]\(([^)]+)\)/g;

/** @type {{ file: string; ref: string; resolved: string }[]} */
const broken = [];

for (const rel of SCAN_TARGETS) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs) || !statSync(abs).isFile()) continue;

  const content = readFileSync(abs, "utf-8");
  const dir = dirname(abs);

  for (const match of content.matchAll(LINK_RE)) {
    let raw = match[1];

    // 去掉锚点部分
    raw = raw.split("#")[0];
    if (!raw) continue;

    // 跳过外部链接
    if (/^(https?:|mailto:)/.test(raw)) continue;

    const target = resolve(dir, raw);
    if (!existsSync(target)) {
      broken.push({ file: rel, ref: match[1], resolved: target });
    }
  }
}

// ── 输出报告 ──────────────────────────────────────────
if (broken.length === 0) {
  console.log("✅ Doc health check passed — all referenced file paths exist.");
  process.exit(0);
} else {
  console.error(
    `❌ Doc health check found ${broken.length} broken reference(s):\n`
  );
  for (const b of broken) {
    console.error(`  ${b.file}  →  ${b.ref}`);
  }
  console.error(
    "\nPlease update or remove the broken references above."
  );
  process.exit(1);
}
