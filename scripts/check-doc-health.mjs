#!/usr/bin/env node

/**
 * 文档与 Harness 契约健康检查。
 *
 * 校验范围：
 * 1. Markdown 链接路径、锚点、反引号代码文件引用。
 * 2. PRODUCT 路由表与 App Router 页面一致。
 * 3. zh.ts / en.ts 的嵌套 key、对象层级与字符串叶子一致。
 * 4. 自动数据传输 API 只出现在允许的只读链尖模块。
 * 5. Node、CI、coverage 与 build 脚本契约一致。
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  basename,
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".claude",
  ".cursor",
  ".kilo",
  ".reasonix",
  ".codegraph",
  "coverage",
]);
const CODE_EXTS = ["ts", "tsx", "js", "mjs", "cjs", "css", "json"];
const SOURCE_EXT_RE = /\.(?:ts|tsx|js|mjs|cjs)$/;
const LINK_RE = /\]\(([^)]+)\)/g;
const CODE_TOKEN_RE = new RegExp(
  "`([A-Za-z0-9_./-]+\\.(?:" + CODE_EXTS.join("|") + "))`",
  "g",
);
const ALLOWED_FETCH_FILES = new Set([
  "src/lib/engine/block-height.ts",
  "scripts/generate-block-height-fallback.mjs",
]);

/** @typedef {{ kind: string; file: string; detail: string }} DocProblem */

function toPosix(value) {
  return value.split(sep).join("/");
}

function readText(root, rel) {
  const abs = join(root, rel);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

function collectFiles(root, relDir, filterFn = () => true) {
  const absDir = join(root, relDir);
  if (!existsSync(absDir) || !statSync(absDir).isDirectory()) return [];

  const results = [];
  for (const entry of readdirSync(absDir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const rel = relDir === "." ? entry : join(relDir, entry);
    const abs = join(root, rel);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      results.push(...collectFiles(root, rel, filterFn));
    } else {
      const normalized = toPosix(rel);
      if (filterFn(normalized)) results.push(normalized);
    }
  }
  return results;
}

function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function splitAnchor(raw) {
  const idx = raw.indexOf("#");
  if (idx === -1) return [raw, ""];
  return [raw.slice(0, idx), raw.slice(idx + 1)];
}

function checkMarkdownReferences(root, allFiles) {
  /** @type {DocProblem[]} */
  const problems = [];
  const scanTargets = ["AGENTS.md", "README.md"].filter((rel) =>
    existsSync(join(root, rel)),
  );
  scanTargets.push(
    ...collectFiles(root, "docs", (rel) => rel.endsWith(".md")),
  );

  const relPathSet = new Set(allFiles);
  const basenameSet = new Set(allFiles.map((p) => basename(p)));
  const headingCache = new Map();

  function getHeadingSlugs(absPath) {
    if (headingCache.has(absPath)) return headingCache.get(absPath);
    const slugs = new Set();
    if (existsSync(absPath) && statSync(absPath).isFile()) {
      for (const line of readFileSync(absPath, "utf8").split("\n")) {
        const match = /^#{1,6}\s+(.*)$/.exec(line);
        if (match) slugs.add(slugify(match[1]));
      }
    }
    headingCache.set(absPath, slugs);
    return slugs;
  }

  function codeRefExists(token) {
    const norm = token.replace(/\\/g, "/");
    if (!norm.includes("/")) return basenameSet.has(norm);
    if (relPathSet.has(norm)) return true;
    const suffix = `/${norm}`;
    return allFiles.some((p) => p.endsWith(suffix));
  }

  for (const rel of scanTargets) {
    const abs = join(root, rel);
    const content = readFileSync(abs, "utf8");
    const dir = dirname(abs);

    for (const match of content.matchAll(LINK_RE)) {
      const rawFull = match[1].trim();
      if (/^(https?:|mailto:|tel:)/.test(rawFull)) continue;
      const [pathPart, anchorPart] = splitAnchor(rawFull);

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
      if (
        anchorPart &&
        pathPart.endsWith(".md") &&
        !getHeadingSlugs(target).has(anchorPart)
      ) {
        problems.push({
          kind: "anchor",
          file: rel,
          detail: `${pathPart}#${anchorPart}（目标文档无匹配标题）`,
        });
      }
    }

    for (const match of content.matchAll(CODE_TOKEN_RE)) {
      if (!codeRefExists(match[1])) {
        problems.push({
          kind: "coderef",
          file: rel,
          detail: `\`${match[1]}\``,
        });
      }
    }
  }
  return problems;
}

function appFileToRoute(rel) {
  const fromApp = rel.replace(/^src\/app\/?/, "");
  if (fromApp === "page.tsx") return "/";

  if (fromApp.endsWith("/page.tsx")) {
    const route = fromApp
      .slice(0, -"/page.tsx".length)
      .split("/")
      .filter((segment) => !/^\(.*\)$/.test(segment))
      .join("/");
    return `/${route}`;
  }

  if (fromApp.endsWith("opengraph-image.tsx")) {
    return `/${fromApp.slice(0, -".tsx".length)}`;
  }
  return null;
}

function extractProductRoutes(content) {
  const section = content
    .split("## 路由与信息架构")[1]
    ?.split(/\n##\s/)[0];
  if (!section) return new Set();

  const routes = new Set();
  for (const match of section.matchAll(/^\|\s*`(\/[^`]*)`\s*\|/gm)) {
    routes.add(match[1].split(/[?#]/u)[0]);
  }
  return routes;
}

function checkRoutes(root) {
  /** @type {DocProblem[]} */
  const problems = [];
  const product = readText(root, "docs/PRODUCT.md");
  if (product === null) {
    return [{
      kind: "route",
      file: "docs/PRODUCT.md",
      detail: "文件不存在，无法校验路由表",
    }];
  }

  const actualRoutes = new Set(
    collectFiles(
      root,
      "src/app",
      (rel) => rel.endsWith("/page.tsx") ||
        rel === "src/app/page.tsx" ||
        rel.endsWith("/opengraph-image.tsx") ||
        rel === "src/app/opengraph-image.tsx",
    )
      .filter((rel) => !rel.includes("/__tests__/"))
      .map(appFileToRoute)
      .filter(Boolean),
  );
  const documentedRoutes = extractProductRoutes(product);

  for (const route of [...actualRoutes].sort()) {
    if (!documentedRoutes.has(route)) {
      problems.push({
        kind: "route",
        file: "docs/PRODUCT.md",
        detail: `缺少实际 App Router 路由 \`${route}\``,
      });
    }
  }
  for (const route of [...documentedRoutes].sort()) {
    if (!actualRoutes.has(route)) {
      problems.push({
        kind: "route",
        file: "docs/PRODUCT.md",
        detail: `记录了不存在的 App Router 路由 \`${route}\``,
      });
    }
  }
  return problems;
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function extractTranslationShape(root, rel, variableName) {
  const content = readText(root, rel);
  if (content === null) {
    return { shape: null, error: "文件不存在" };
  }
  const source = ts.createSourceFile(
    rel,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let initializer = null;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === variableName
      ) {
        initializer = declaration.initializer;
      }
    }
  }
  while (
    initializer &&
    (ts.isAsExpression(initializer) ||
      ts.isSatisfiesExpression(initializer) ||
      ts.isParenthesizedExpression(initializer))
  ) {
    initializer = initializer.expression;
  }
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    return { shape: null, error: `未找到对象导出 ${variableName}` };
  }

  const shape = new Map();
  let error = null;
  function visitObject(node, prefix = "") {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        error ??= `${prefix || variableName} 含非 property assignment`;
        continue;
      }
      const name = propertyNameText(property.name);
      if (name === null) {
        error ??= `${prefix || variableName} 含动态属性名`;
        continue;
      }
      const path = prefix ? `${prefix}.${name}` : name;
      if (ts.isObjectLiteralExpression(property.initializer)) {
        shape.set(path, "object");
        visitObject(property.initializer, path);
      } else if (
        ts.isStringLiteral(property.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(property.initializer)
      ) {
        shape.set(path, "string");
      } else {
        shape.set(path, "unsupported");
      }
    }
  }
  visitObject(initializer);
  return { shape, error };
}

function checkI18n(root) {
  /** @type {DocProblem[]} */
  const problems = [];
  const zh = extractTranslationShape(root, "src/lib/i18n/zh.ts", "zh");
  const en = extractTranslationShape(root, "src/lib/i18n/en.ts", "en");

  for (const [file, result] of [
    ["src/lib/i18n/zh.ts", zh],
    ["src/lib/i18n/en.ts", en],
  ]) {
    if (result.error) {
      problems.push({ kind: "i18n", file, detail: result.error });
    }
  }
  if (!zh.shape || !en.shape) return problems;

  const keys = new Set([...zh.shape.keys(), ...en.shape.keys()]);
  for (const key of [...keys].sort()) {
    const zhKind = zh.shape.get(key);
    const enKind = en.shape.get(key);
    if (zhKind === undefined) {
      problems.push({
        kind: "i18n",
        file: "src/lib/i18n/zh.ts",
        detail: `缺少 key \`${key}\``,
      });
    } else if (enKind === undefined) {
      problems.push({
        kind: "i18n",
        file: "src/lib/i18n/en.ts",
        detail: `缺少 key \`${key}\``,
      });
    } else if (zhKind !== enKind) {
      problems.push({
        kind: "i18n",
        file: "src/lib/i18n/en.ts",
        detail: `key \`${key}\` 层级类型不一致（zh=${zhKind}, en=${enKind}）`,
      });
    } else if (zhKind === "unsupported") {
      problems.push({
        kind: "i18n",
        file: "src/lib/i18n/zh.ts",
        detail: `key \`${key}\` 不是对象或静态字符串`,
      });
    }
  }
  return problems;
}

function getFetchMethod(call) {
  const options = call.arguments[1];
  if (!options) return "GET";
  if (!ts.isObjectLiteralExpression(options)) return "dynamic";

  for (const property of options.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyNameText(property.name);
    if (name !== "method") continue;
    if (
      ts.isStringLiteral(property.initializer) ||
      ts.isNoSubstitutionTemplateLiteral(property.initializer)
    ) {
      return property.initializer.text.toUpperCase();
    }
    return "dynamic";
  }
  return "GET";
}

function checkNetworkDataFlow(root) {
  /** @type {DocProblem[]} */
  const problems = [];
  const files = [
    ...collectFiles(root, "src", (rel) => SOURCE_EXT_RE.test(rel)),
    ...collectFiles(root, "scripts", (rel) => SOURCE_EXT_RE.test(rel)),
  ].filter(
    (rel) =>
      !rel.includes("/__tests__/") &&
      !rel.endsWith(".test.ts") &&
      !rel.endsWith(".test.tsx") &&
      !rel.endsWith(".test.js") &&
      !rel.endsWith(".test.mjs"),
  );

  for (const rel of files) {
    const content = readFileSync(join(root, rel), "utf8");
    const scriptKind = rel.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : rel.endsWith(".ts")
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS;
    const source = ts.createSourceFile(
      rel,
      content,
      ts.ScriptTarget.Latest,
      true,
      scriptKind,
    );

    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "fetch"
      ) {
        const method = getFetchMethod(node);
        if (!ALLOWED_FETCH_FILES.has(rel)) {
          problems.push({
            kind: "network",
            file: rel,
            detail: "fetch 仅允许出现在链尖读取模块",
          });
        } else if (method !== "GET") {
          problems.push({
            kind: "network",
            file: rel,
            detail: `链尖 fetch 必须为只读 GET，检测到 ${method}`,
          });
        }
      }

      if (
        ts.isNewExpression(node) &&
        ts.isIdentifier(node.expression) &&
        ["XMLHttpRequest", "WebSocket", "EventSource"].includes(
          node.expression.text,
        )
      ) {
        problems.push({
          kind: "network",
          file: rel,
          detail: `禁止自动数据传输 API：${node.expression.text}`,
        });
      }

      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "sendBeacon"
      ) {
        problems.push({
          kind: "network",
          file: rel,
          detail: "禁止自动数据传输 API：sendBeacon",
        });
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return problems;
}

function checkConfigContracts(root) {
  /** @type {DocProblem[]} */
  const problems = [];
  const nvmrc = readText(root, ".nvmrc")?.trim();
  if (nvmrc !== "22") {
    problems.push({
      kind: "config",
      file: ".nvmrc",
      detail: "必须精确指定 Node 22",
    });
  }

  let pkg = null;
  let lock = null;
  try {
    pkg = JSON.parse(readText(root, "package.json") ?? "");
  } catch {
    problems.push({
      kind: "config",
      file: "package.json",
      detail: "JSON 无法解析",
    });
  }
  try {
    lock = JSON.parse(readText(root, "package-lock.json") ?? "");
  } catch {
    problems.push({
      kind: "config",
      file: "package-lock.json",
      detail: "JSON 无法解析",
    });
  }

  const expectedEngine = ">=22 <23";
  if (pkg?.engines?.node !== expectedEngine) {
    problems.push({
      kind: "config",
      file: "package.json",
      detail: `engines.node 必须为 \`${expectedEngine}\``,
    });
  }
  if (lock?.packages?.[""]?.engines?.node !== expectedEngine) {
    problems.push({
      kind: "config",
      file: "package-lock.json",
      detail: `根 package engines.node 必须为 \`${expectedEngine}\``,
    });
  }

  const expectedScripts = {
    prebuild: "npm run generate:block-height-fallback",
    build: "next build",
    "build:check": "next build",
    "test:coverage": "vitest run --coverage",
  };
  for (const [name, value] of Object.entries(expectedScripts)) {
    if (pkg?.scripts?.[name] !== value) {
      problems.push({
        kind: "config",
        file: "package.json",
        detail: `scripts.${name} 必须为 \`${value}\``,
      });
    }
  }

  const ci = readText(root, ".github/workflows/ci.yml") ?? "";
  if (!/node-version-file:\s*\.nvmrc/.test(ci)) {
    problems.push({
      kind: "config",
      file: ".github/workflows/ci.yml",
      detail: "setup-node 必须通过 node-version-file 读取 .nvmrc",
    });
  }
  if (/uses:\s*actions\/(?:checkout|setup-node)@(?![0-9a-f]{40}\b)/.test(ci)) {
    problems.push({
      kind: "config",
      file: ".github/workflows/ci.yml",
      detail: "GitHub Actions 必须固定到完整 40 字符 commit SHA",
    });
  }
  if (!/permissions:\s*\n\s+contents:\s*read/.test(ci)) {
    problems.push({
      kind: "config",
      file: ".github/workflows/ci.yml",
      detail: "CI 必须声明只读 contents 权限",
    });
  }
  if (!/persist-credentials:\s*false/.test(ci)) {
    problems.push({
      kind: "config",
      file: ".github/workflows/ci.yml",
      detail: "checkout 必须关闭凭据持久化",
    });
  }
  for (const command of [
    "npm audit --omit=dev --audit-level=high",
    "npm run doc:health",
    "npm run lint",
    "npm run typecheck",
    "npm run test:coverage",
    "npm run build:check",
  ]) {
    if (!ci.includes(command)) {
      problems.push({
        kind: "config",
        file: ".github/workflows/ci.yml",
        detail: `缺少 CI 命令 \`${command}\``,
      });
    }
  }

  const dependabot = readText(root, ".github/dependabot.yml") ?? "";
  for (const ecosystem of ["npm", "github-actions"]) {
    if (
      !dependabot.includes(`package-ecosystem: ${ecosystem}`) ||
      !dependabot.includes("interval: weekly")
    ) {
      problems.push({
        kind: "config",
        file: ".github/dependabot.yml",
        detail: `Dependabot 必须每周更新 ${ecosystem}`,
      });
    }
  }

  const vitest = readText(root, "vitest.config.ts") ?? "";
  for (const target of [
    "src/lib/engine/**",
    "src/lib/builder/**",
    "src/lib/playground/**",
  ]) {
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = new RegExp(
      `['"]${escaped}['"]\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`,
    ).exec(vitest);
    if (
      !match ||
      !/\blines:\s*70\b/.test(match[1]) ||
      !/\bfunctions:\s*70\b/.test(match[1])
    ) {
      problems.push({
        kind: "config",
        file: "vitest.config.ts",
        detail: `${target} 必须设置 lines/functions 70%`,
      });
    }
  }

  const agents = readText(root, "AGENTS.md") ?? "";
  const architecture = readText(root, "docs/ARCHITECTURE.md") ?? "";
  const readme = readText(root, "README.md") ?? "";
  for (const [file, content] of [
    ["AGENTS.md", agents],
    ["docs/ARCHITECTURE.md", architecture],
  ]) {
    for (const required of [
      "src/lib/engine/**",
      "src/lib/builder/**",
      "src/lib/playground/**",
      "70%",
      "build:check",
      "prebuild",
    ]) {
      if (!content.includes(required)) {
        problems.push({
          kind: "config",
          file,
          detail: `缺少契约描述 \`${required}\``,
        });
      }
    }
  }
  for (const [file, content] of [
    ["README.md", readme],
    ["docs/ARCHITECTURE.md", architecture],
  ]) {
    for (const required of ["Node 22", "nvm use"]) {
      if (!content.includes(required)) {
        problems.push({
          kind: "config",
          file,
          detail: `缺少环境说明 \`${required}\``,
        });
      }
    }
  }
  return problems;
}

export function runDocHealth(root = DEFAULT_ROOT) {
  const resolvedRoot = resolve(root);
  const allFiles = collectFiles(resolvedRoot, ".");
  return [
    ...checkMarkdownReferences(resolvedRoot, allFiles),
    ...checkRoutes(resolvedRoot),
    ...checkI18n(resolvedRoot),
    ...checkNetworkDataFlow(resolvedRoot),
    ...checkConfigContracts(resolvedRoot),
  ];
}

export function formatDocHealthReport(problems) {
  if (problems.length === 0) {
    return "Doc health check passed — references and Harness contracts are valid.";
  }
  const labels = {
    path: "断裂的链接路径",
    anchor: "断裂的锚点",
    coderef: "失效的代码文件名引用",
    route: "路由事实不一致",
    i18n: "i18n 结构不一致",
    network: "网络数据外发违规",
    config: "Harness 配置不一致",
  };
  const lines = [`Doc health check found ${problems.length} problem(s):`, ""];
  for (const kind of Object.keys(labels)) {
    const items = problems.filter((problem) => problem.kind === kind);
    if (items.length === 0) continue;
    lines.push(`[${labels[kind]}]`);
    for (const problem of items) {
      lines.push(`  ${problem.file} -> ${problem.detail}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  const problems = runDocHealth(DEFAULT_ROOT);
  const report = formatDocHealthReport(problems);
  if (problems.length === 0) {
    console.log(`✅ ${report}`);
  } else {
    console.error(`❌ ${report}\n\nPlease update or remove the problems above.`);
    process.exitCode = 1;
  }
}
