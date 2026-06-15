# ScriptWise 发布前安全审查（2026-06-15）

> 背景：ScriptWise 即将正式对外发布，部署在 Vercel，代码库完全开源。本文从安全专家视角记录当前项目的主要安全暴露面、风险分级、潜在后果与发布前建议。

## 审查结论

当前项目没有发现“立刻能打穿网站 / 盗取资金 / 远程执行代码”的高危漏洞。

项目整体安全基线较好：

- 纯前端 Next.js App Router 应用，无业务后端 API / 数据库 / 登录态。
- 不连接钱包，不查询 UTXO，不构造或广播交易。
- 不处理私钥、助记词或真实签名。
- 生产依赖 `npm audit --omit=dev` 结果为 0 漏洞。
- 未发现当前可直接利用的 XSS sink。
- 自动网络行为主要限于只读拉取主网链尖高度与加载静态展示资源。

但发布前建议优先修补以下中高风险点：

1. 分享链接使用 `?s=` query 参数，可能把用户策略 / 公钥写入 Vercel 请求日志。
2. Policy 编译缺少结构复杂度限制与执行隔离；短小但高复杂度的输入也可使 WASM 编译器中止，并污染后续编译实例。
3. 超大分享参数在解码前缺少输入上限；改用 fragment 后必须同步修复。
4. 缺少 CSP、Referrer-Policy、frame 防护等基础安全响应头。
5. dev 依赖存在 `npm audit` critical / high advisory，虽不影响线上用户，但影响开源贡献者与 CI / 本地开发安全面。
6. CI Actions 未固定到完整 commit SHA，且缺少最小权限与依赖自动更新配置。
7. 链尖高度响应只校验为正整数，单个异常或被攻破的端点可能影响时间锁教学结果。

## 风险分级总览

| 优先级 | 风险 | 影响面 | 当前判断 |
|--------|------|--------|----------|
| P1 | 分享链接 query 泄露策略与公钥 | 隐私 / 产品承诺 | 发布前建议修 |
| P1 | Policy 编译缺少结构复杂度限制与 Worker 隔离 | 客户端 DoS / 编译实例失效 | 发布前必须修 |
| P2 | 超大 `s` 参数在 `atob()` 前未限长 | 客户端 DoS | 与 fragment 迁移一起修 |
| P2 | 缺少基础安全响应头 / CSP | 防御纵深 | 发布前建议修 |
| P2 | dev 依赖 audit critical / high | 开源贡献者 / CI / 本地开发 | 尽快升级 |
| P2 | 本地 `dev` / `start` 默认绑定 `0.0.0.0` | 开发环境暴露 | 可后续收紧 |
| P2 | 链尖高度 fetch 未显式声明隐私最小化参数 | 低隐私风险 | 可顺手加固 |
| P2 | 链尖高度响应缺少严格格式与多源一致性校验 | 教学结果完整性 | 发布前建议修 |
| P2 | GitHub Actions 未固定 SHA / 未声明最小权限 | CI 供应链 | 发布前建议修 |
| P3 | Google favicon 经图片优化代理取源 | 第三方依赖 / 低隐私风险 | 可后续自托管 |
| P3 | 偏好 Cookie 缺少 `Secure` 标记 | 低传输风险 | 发布前建议修 |
| P3 | 缺少 `SECURITY.md` | 开源漏洞响应 | 发布前建议补 |

## P1：分享链接 `?s=` 可能泄露用户策略与公钥

### 现状

分享链接由 `src/lib/utils/share.ts` 的 `buildShareUrl()` 生成，当前把 Base64 JSON payload 写入 query string：

```text
/playground?s=<base64-json>
```

Payload 包含：

- `policy`
- `keyVariables`
- `publicKey`
- `network`
- `context`
- `playgroundMode`

### 风险

这些数据不是私钥，但对 Bitcoin 用户仍可能敏感。真实钱包 policy、公钥集合、多签结构、恢复路径、时间锁设置等，都可能暴露用户资金结构和协作关系。

Query string 会随 HTTP 请求发送到 Vercel，也可能进入：

- Vercel access logs / edge logs
- 错误追踪系统
- 代理或 CDN 日志
- 浏览器历史记录
- 某些外部跳转或 referrer 场景

这与项目“不上传用户策略、密钥、会话数据”的安全边界容易产生偏差。

### 潜在后果

- 用户用真实钱包 policy 做实验并分享链接时，托管平台可能记录完整策略。
- 安全敏感用户可能认为产品隐私承诺不够严谨。
- 公开发布后，社区容易指出“share URL query 泄露策略”的问题。

### 建议

新分享链接改用 URL fragment：

```text
/playground#s=<base64-json>
```

URL fragment 不会发送给服务器。实现时应保留 `?s=` 作为旧链接兼容读取路径。

### 复核结论与最佳解决方案

**问题确认存在，维持 P1。** Vercel 日志格式中的请求路径可包含 query string，因此 `?s=` 与“不上传用户策略、密钥、会话数据”的公开承诺存在直接冲突。即使未主动接入 Analytics，平台、CDN、代理和浏览器历史仍可能保存完整 URL。

最佳方案是把分享迁移设计成一次完整的隐私边界修复：

1. 新链接只生成 `/playground#s=<payload>`，不再生成 query 分享链接。
2. Playground 客户端优先读取 fragment，再兼容读取旧 `?s=`。
3. 成功读取旧 query 后立即用 `history.replaceState()` 清除地址栏中的 `s`，减少后续复制、历史记录和外链跳转继续携带 payload；这不能撤回首次服务器请求，但能降低后续扩散。
4. payload 建议改用 Base64URL（`-`、`_`、无 padding），避免普通 Base64 在 URL 中需要额外转义。
5. 全站设置 `Referrer-Policy: no-referrer`，作为旧链接和未来回归的第二道防线。
6. 在分享按钮附近明确提示：不要输入真实私钥、助记词；真实钱包 policy 和公钥也可能具有隐私敏感性。

fragment 读取和旧 query 兼容应有单元测试与浏览器级回归测试，覆盖 `#s=`、旧 `?s=`、二者同时存在、非法 payload 和客户端导航。

## P1：超大 `s` 参数可能导致浏览器端 DoS

### 现状

`decodeSharePayload()` 已有 decoded payload 上限：

```ts
MAX_SHARE_DECODED_PAYLOAD_BYTES = 16 * 1024
```

但当前流程是先执行 `atob(encoded)`，再检查 decoded bytes 大小。攻击者可以构造一个极长 `s` 参数，让浏览器先分配和解码大量字符串。

### 风险

这是客户端拒绝服务风险，不影响 Vercel 服务端，也不会导致资金或数据被盗。

### 潜在后果

- 用户点击恶意分享链接后，页面卡死或浏览器 tab 崩溃。
- 公开站点可能被构造“点开就卡死”的链接传播。

### 建议

在 `atob()` 之前先限制 encoded 字符数，并校验 Base64 字符集。例如：

```ts
export const MAX_SHARE_ENCODED_PAYLOAD_CHARS =
  Math.ceil(MAX_SHARE_DECODED_PAYLOAD_BYTES / 3) * 4 + 4;

if (encoded.length > MAX_SHARE_ENCODED_PAYLOAD_CHARS) return null;
if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) return null;
```

### 复核结论与最佳解决方案

**问题存在，但当前 Vercel query 部署下建议从 P1 调整为 P2。** 线上实测约 32KB query 仍返回 `200`，约 36KB 开始返回 `414 Request-URI Too Large`，平台请求上限已显著缓解“任意超大 query 进入浏览器解码”的风险。

不过，迁移到 URL fragment 后 fragment 不会经过服务器，Vercel 的 URI 上限也不再提供保护。因此该项必须与 `#s=` 迁移作为同一个原子修复，不能先迁移 fragment、后补解码限制。

最佳方案：

1. 在任何 `atob()`、正则解析或 JSON 分配之前检查 encoded 字符数。
2. 仅接受规范 Base64URL；兼容旧链接时再单独接受规范 Base64，并严格校验 padding。
3. 根据 encoded 长度预估 decoded bytes，超过 16KB 时直接拒绝，不进入解码。
4. 解码后继续保留真实 byte 长度、UTF-8 fatal decode、JSON shape 和字段上限校验。
5. `encodeSharePayload()` 也执行同一套业务上限；不允许应用生成自己无法安全恢复的链接。
6. 为“刚好等于上限、超过 1 字符、非法字符、超长 fragment、超长旧 query”补回归测试。

## P1：Policy 编译前缺少明确长度 / 复杂度上限

### 现状

`useCompiler()` 使用 500ms debounce 后直接调用编译管线：

```text
compilePolicy → compileMiniscript → satisfier → analyzeSpendingPaths → parseMiniscript
```

这些计算在浏览器主线程执行。Debounce 能减少重复编译，但不能阻止单次超大 / 超复杂输入卡住页面。

### 风险

攻击者或误操作用户可以粘贴超长 Policy，触发主线程长时间计算。

### 潜在后果

- Playground 页面卡顿、无响应或崩溃。
- 分享链接若引入复杂策略，接收者打开后体验受损。
- 不会影响服务端可用性或资金安全。

### 建议

发布前增加硬上限，并在超限时返回 `limit` 类友好错误：

- Policy：建议 8KB～12KB。
- Key variables：保持 32 个以内。
- Key 名：建议 64 字符以内。
- Public key：建议 130 字符以内。

同时统一 share payload 上限。目前 `MAX_SHARE_POLICY_LENGTH = 200_000`，但 decoded payload 又限制为 16KB，两者语义不一致。

### 复核结论与最佳解决方案

**问题确认存在，而且实际风险高于原描述。仅增加 8KB～12KB 文本长度上限不够。**

使用当前锁定依赖进行隔离复现：

- `thresh(1, ...)` 约 20 个分支、总长约 159 字符即可触发 WASM `Aborted(OOM)`。
- 约 150 层嵌套可触发 WASM assertion abort。
- 一次中止后，同一 WASM 实例连简单的 `pk(A)` 也会继续返回异常，直到页面刷新或重新创建执行实例。

这说明风险不只取决于文本字节数，还取决于节点数量、嵌套深度、门限分支数和编译器算法复杂度；当前 `try/catch` 只能接住异常，无法恢复已污染的 WASM 实例。

最佳方案分两层：

**第一层：编译前的确定性预算检查**

- Policy 文本先采用保守上限，例如 4KB；后续依据真实场景再调整。
- 增加轻量 tokenizer / parser 预算，不调用 WASM 即统计：
  - 最大语法节点数，例如 64；
  - 最大嵌套深度，例如 32；
  - 单个 `thresh` / `multi` 的最大分支数，初版建议不高于 8；
  - Key variables 最大 32；
  - key identifier 最大 64 字符；
  - compressed / x-only public key 按实际支持格式做严格长度与 hex 校验，不使用 50,000 字符的通用字段上限。
- 超限统一返回 `limit` 类 i18n 友好错误，并在普通编辑、分享恢复、legacy session 恢复和 builder 导入入口复用同一验证函数。

这些数值应先覆盖所有内置预设和合理教学案例，再用恶意结构测试校准；不能只依赖字符串长度。

**第二层：可终止、可重建的编译隔离**

- 把完整编译管线移入 Web Worker，主线程只负责 debounce、发送带 generation id 的请求和渲染结果。
- 为每次编译设置较短超时预算；超时、WASM abort、OOM 或 assertion 时直接 `terminate()` Worker，并创建新 Worker。
- Worker 返回结构化错误，不向 UI 泄露大段内部异常。
- 旧 generation 的结果必须丢弃，避免快速编辑时过期结果覆盖新状态。
- 增加回归测试：恶意输入失败后，新 Worker 仍能成功编译 `pk(A)`。

Web Worker 不是“后续增强”，而是当前第三方 WASM 编译器出现不可恢复中止时最可靠的故障边界。发布前至少应完成复杂度预算；正式公开发布建议同时完成 Worker 隔离。

## P1：缺少基础安全响应头 / CSP

### 现状

`next.config.mjs` 当前未配置 `headers()`，应用层没有设置：

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`

生产站点由 Vercel 返回 `Strict-Transport-Security: max-age=63072000`，因此 HSTS 不属于当前实际缺失项。

### 风险

当前未发现可利用 XSS sink，因此这不是一个立即可利用漏洞。但缺少安全响应头会降低防御纵深：未来一旦引入 XSS 或外链回归，影响会被放大。

### 潜在后果

- 未来 XSS 回归时，更容易加载外部脚本或外传数据。
- 页面可能被第三方 iframe 嵌入，增加点击劫持或仿冒交互风险。
- 分享链接 query、外链跳转等 referrer 泄露更难控制。

### 建议

在 `next.config.mjs` 增加 baseline headers。初版 CSP 可保守允许 Next 所需的 inline script / style，但限制 connect / image / frame 等外连面：

```js
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://www.google.com",
  "font-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://mempool.space https://blockstream.info https://blockchain.info",
].join('; ');
```

后续可以再演进到 nonce-based CSP。

### 复核结论与最佳解决方案

**基础安全头缺失确认存在，但原文关于 HSTS 的事实需要修正。** 2026-06-15 对生产站点实测已返回：

```text
strict-transport-security: max-age=63072000
```

Vercel 同时会把 HTTP 请求重定向到 HTTPS。因此不应再把 HSTS 列为当前缺失项；其余 CSP、Referrer-Policy、frame 防护、`nosniff`、Permissions-Policy 和 COOP 确实未在生产响应中出现。

最佳方案：

1. 先加入不影响运行时的 baseline：
   - `Referrer-Policy: no-referrer`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
   - `Cross-Origin-Opener-Policy: same-origin`
2. CSP 同时设置 `frame-ancestors 'none'`；它是现代浏览器的主要点击劫持防护，`X-Frame-Options` 用于兼容兜底。
3. CSP 先以 `Content-Security-Policy-Report-Only` 上线并观察生产资源加载，再切换为 enforced。
4. 最终采用 Next.js 官方 nonce-based CSP，通过 Middleware 为每次请求生成 nonce，并传给当前主题首帧 inline script；不要把 `script-src 'unsafe-inline'` 作为长期方案。
5. `connect-src` 仅允许 `'self'` 与三个链尖域名；`img-src` 若保留 Next Image 代理，浏览器侧主要需要 `'self' data: blob:`，不必直接允许 Google。
6. 增加响应头契约测试，并在部署后用 `curl -I` 或浏览器 Network 面板验证生产响应。

nonce CSP 会使页面动态渲染；当前根布局已经读取 Cookie，发布前仍需通过 `build:check` 和线上 smoke test 确认缓存与首帧行为。

## P2：dev 依赖存在 audit advisory

### 现状

`npm audit --omit=dev --json`：生产依赖 0 漏洞。

`npm audit --json`：dev dependency 出现 critical / high advisory，主要来自：

- `vitest`
- `@vitest/coverage-v8`
- `vite`
- `@vitest/mocker`
- `esbuild`

### 风险

线上用户风险低，因为这些 dev 依赖不应进入 Vercel 运行时 bundle。

开源贡献者、本地开发和 CI 供应链风险中等，尤其是运行 dev/test server 或安装依赖时。

### 潜在后果

- 贡献者本地开发环境暴露面扩大。
- CI/build 工具链安全风险增加。
- 开源仓库被安全扫描工具标红，影响发布可信度。

### 建议

- 升级 `vitest` / `@vitest/coverage-v8` / 相关 `vite` 与 `esbuild` 版本。
- CI 增加生产依赖安全门禁：

```bash
npm audit --omit=dev --audit-level=high
```

- dev 全量 audit 可作为维护项持续跟进。

### 复核结论与最佳解决方案

**问题确认存在。** 复核时完整依赖树为 2 个 critical、3 个 high；生产依赖仍为 0。当前告警主要落在 Vitest UI / Vite / esbuild 开发工具链，线上用户直接风险低，但开源贡献者和 CI 会实际安装这些包。

最佳方案：

1. `vitest` 与 `@vitest/coverage-v8` 同步升级到首个不受影响的稳定版本，重新生成 `package-lock.json`。
2. 用 `npm ls vitest @vitest/coverage-v8 vite esbuild @vitest/mocker --all` 确认不再残留旧传递版本。
3. 完整运行 lint、typecheck、coverage 和 build gate，避免测试框架升级造成配置回归。
4. CI 增加阻塞式生产门禁：

```bash
npm audit --omit=dev --audit-level=high
```

5. 完整 `npm audit` 可先作为非阻塞可见性检查；既然当前已有明确修复版本，本次应直接升级，不宜长期接受 critical。
6. 配置 Dependabot 或 Renovate，每周更新 npm 与 GitHub Actions，缩短未来 advisory 暴露窗口。

## P2：本地 dev / start 默认绑定 `0.0.0.0`

### 现状

`package.json` 中：

```json
"dev": "next dev -H 0.0.0.0",
"start": "next start -p 3000 -H 0.0.0.0"
```

### 风险

对 Vercel 线上无直接影响，但开源贡献者本地运行时会默认暴露给局域网。

### 潜在后果

- 同一 Wi-Fi / 局域网用户可访问本地开发服务。
- 如果未来 Next dev server 或本地配置存在漏洞，风险面扩大。

### 建议

默认脚本改为 localhost，另提供 `dev:lan` 用于明确需要局域网调试的场景。

### 复核结论与最佳解决方案

**问题确认存在，但不影响 Vercel 生产部署。**

最佳方案是让默认行为遵循最小暴露原则：

```json
"dev": "next dev",
"dev:lan": "next dev -H 0.0.0.0",
"start": "next start -p 3000",
"start:lan": "next start -p 3000 -H 0.0.0.0"
```

README 只介绍默认 localhost；需要手机或局域网联调时由贡献者显式选择 `dev:lan`。不要依赖防火墙替代安全默认值。

## P2：链尖高度请求可进一步隐私最小化

### 现状

浏览器会只读请求以下公共 API 获取主网链尖高度：

- `https://mempool.space/api/blocks/tip/height`
- `https://blockstream.info/api/blocks/tip/height`
- `https://blockchain.info/q/getblockcount`

该请求不上传 policy、key 或 session 数据。

### 风险

第三方 API 能看到用户 IP 访问了 ScriptWise。风险较低，且已在产品文档中披露。

### 建议

显式加上隐私最小化参数：

```ts
fetch(url, {
  signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  credentials: 'omit',
  referrerPolicy: 'no-referrer',
  cache: 'no-store',
});
```

并用 CSP `connect-src` 限定只允许这些域名。

### 复核结论与最佳解决方案

**隐私最小化建议成立。** 三个 fetch 不包含 policy、key 或 session 数据，但默认 referrer 行为和浏览器网络元数据仍没有做到最小化。

最佳方案是把 fetch options 提取成共享常量或 helper，并明确写出：

```ts
{
  method: 'GET',
  signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  credentials: 'omit',
  referrerPolicy: 'no-referrer',
  cache: 'no-store',
}
```

同时通过 CSP `connect-src` 固定允许域名，并为每个端点保留超时和顺序回退测试。

### 补充发现：链尖响应完整性校验不足

当前实现使用 `parseInt(text.trim(), 10)`，会接受类似 `953000junk` 的响应；只要求结果为正数，也未限制安全整数、合理高度区间或相对现有高度的异常漂移。三个端点按顺序回退，首个返回正整数的端点即被信任。

这不会导致资金损失，但单个异常、缓存污染或被攻破的公共端点可能让 `after(height)` 的教学状态提前或延后，损害结果可信度。

最佳方案：

1. 只接受完全匹配 `/^\d+$/` 的响应。
2. 使用 `Number()` 并校验 `Number.isSafeInteger(height)`。
3. 设置保守合理区间，并限制相对构建时 fallback / 最近缓存的最大漂移。
4. 并行请求多个端点，采用至少 2 个来源在小容差范围内一致的结果；无共识时使用可信缓存或构建时 fallback。
5. 运行时和构建时生成脚本复用同一校验与共识 helper，避免两套规则漂移。
6. 测试纯数字、尾随垃圾、负数、超大整数、单源离群值、两源一致、全部失败等场景。

## P3：Google favicon 静态资源外连

### 现状

首页钱包展示使用 Google favicon 服务加载静态图标，`next.config.mjs` 仅允许 `www.google.com/s2/favicons`。

### 风险

低。该行为属于文档允许的公共静态展示资源加载，但会带来第三方静态资源访问记录。

### 建议

如果希望更贴近 Bitcoin 用户的隐私预期，可以后续改为：

- 自托管图标；或
- 只显示钱包 initials，不请求第三方 favicon。

### 复核结论与最佳解决方案

**问题存在，但隐私影响低于原文描述。** 生产 HTML 中图标 URL 为同源 `/_next/image?...`，浏览器不是直接请求 Google；Google 通常看到的是 Vercel 图片优化基础设施的取源请求，而不是终端用户直接访问 favicon 服务。

仍然存在第三方可用性、内容变化和取源依赖。最佳方案仍是把经过许可的固定图标纳入 `public/` 自托管，并记录来源与许可证；无法确认授权的图标使用 initials。这样可同时收紧 `images.remotePatterns` 与 CSP。

## P3：偏好 Cookie 缺少 `Secure` 标记

### 现状

`src/lib/preferences.ts` 中的 `toPreferenceCookie()` 生成的 Cookie 字符串：

```ts
return `${name}=${value}; Path=/; Max-Age=...; SameSite=Lax`;
```

包含 `SameSite=Lax`（防止 CSRF），但缺少 `Secure` 属性。该函数被主题切换（`theme/context.tsx`）和语言切换（`i18n/context.tsx`）两处调用。

### 风险

没有 `Secure` 标记时，浏览器会在 HTTP（非加密）连接中也发送该 Cookie。虽然 Vercel 全站强制 HTTPS，但以下场景仍可能暴露：

- 用户首次通过 `http://` 访问（尚未被重定向到 HTTPS 时）
- 中间人降级攻击（公共 Wi-Fi 等不可信网络）
- HSTS 缓存未命中时的短暂窗口期

Cookie 内容本身仅为 `dark`/`light` 或 `zh`/`en`，不含敏感数据，因此实际危害有限。

### 潜在后果

- 理论上偏好设置可在非加密通道被嗅探或篡改。
- 安全审计工具或浏览器 DevTools 会对缺少 `Secure` 的 Cookie 发出警告，影响专业用户观感。
- 与项目整体"防御纵深"的安全态度不一致。

### 建议

在 `toPreferenceCookie()` 末尾追加 `; Secure`：

```ts
return `${name}=${value}; Path=/; Max-Age=${SCRIPTWISE_PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
```

Vercel 全站 HTTPS，`Secure` 不会导致功能问题。修复耗时不到 1 分钟，建议在发布前顺手完成。

### 复核结论与最佳解决方案

**问题确认存在，但维持 P3。** Cookie 仅保存白名单偏好值，不承担认证或授权功能；`SameSite=Lax` 在这里不是关键安全边界，实际危害很低。生产站点已启用 HTTPS 重定向和 HSTS，进一步缩小了明文传输窗口。

最佳方案是在生产环境添加 `Secure`，同时保留本地 HTTP 开发体验：

```ts
const secure = window.location.protocol === 'https:' ? '; Secure' : '';
return `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
```

由于客户端需要读写主题和语言偏好，不能添加 `HttpOnly`。Cookie name 和 value 继续使用固定常量与白名单，不接受任意用户输入。

## P2：GitHub Actions 供应链与权限未收紧

### 现状

`.github/workflows/ci.yml` 使用：

```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

工作流没有显式顶层 `permissions`，checkout 也没有关闭凭据持久化；仓库没有 Dependabot 配置。

### 风险

可变 tag 的上游引用理论上可能被供应链事件影响。默认 token 权限和持久化 Git 凭据也高于纯只读测试工作流的实际需要。

### 最佳解决方案

1. 把第三方 Actions 固定到完整 40 字符 commit SHA，并在注释保留对应版本号。
2. 顶层声明：

```yaml
permissions:
  contents: read
```

3. checkout 配置 `persist-credentials: false`。
4. 为 npm 与 GitHub Actions 配置每周 Dependabot / Renovate 更新。
5. main 分支启用 branch protection，要求 CI 通过且禁止直接绕过必要检查。
6. 可增加 CodeQL JavaScript/TypeScript 扫描；它是开源项目的有益补充，但不替代输入边界测试和人工审查。

## P3：缺少开源漏洞报告渠道

### 现状

仓库当前没有 `SECURITY.md`。

### 风险

公开发布后，研究者可能只能通过公开 issue 披露漏洞，导致敏感细节过早公开，也不利于维护者建立确认、修复和发布节奏。

### 最佳解决方案

发布前增加 `SECURITY.md`，至少说明：

- 当前受支持版本；
- 私下报告渠道；
- 请勿在公开 issue 中提交未修复漏洞细节；
- 维护者预计的首次响应时间；
- 协调披露与修复发布流程；
- 项目不处理真实私钥、助记词或资金操作的边界。

若 GitHub Security Advisories 可用，优先将其作为私密报告入口。

## 已确认的正面安全项

### 未发现当前可利用 XSS sink

审查了以下危险模式：

- `dangerouslySetInnerHTML`
- `innerHTML` / `outerHTML`
- `eval` / `new Function`
- `postMessage`
- `sendBeacon`
- `WebSocket`
- `XMLHttpRequest`
- `fetch`
- `localStorage`
- `document.cookie`
- 外链 `target="_blank"`

当前唯一 `dangerouslySetInnerHTML` 是主题首帧脚本，输入来自白名单解析后的 theme；用户输入的 policy、descriptor、错误信息等通过 React text node 或 CodeMirror 文本渲染，没有直接注入 HTML。

### 外链具备 `noopener noreferrer`

资源页与首页钱包外链使用 `target="_blank"` 时均带 `rel="noopener noreferrer"`，降低 opener 劫持与 referrer 泄露。

### 网络行为边界较清晰

`doc:health` 网络契约检查通过。代码中未发现业务 POST、analytics、beacon、WebSocket、钱包连接、UTXO 查询或交易广播。

### 未发现明显 secret 文件提交

检查 `.env*`、`*secret*`、`*token*`、`*.pem` 等常见路径，未发现提交的密钥材料；`.gitignore` 已忽略 `.env`。

## 发布前推荐执行顺序

1. 增加 Policy 结构预算，并把编译管线移入可终止、可重建的 Web Worker。
2. 原子完成 `#s=` 分享迁移、旧 `?s=` 兼容、encoded 解码前限长与 Base64URL 校验。
3. 增加 baseline 安全头；CSP 先 Report-Only 验证，再启用 nonce-based enforced CSP。
4. 升级 Vitest / Vite / esbuild 相关 dev 依赖，并在 CI 增加生产依赖 audit 门禁。
5. 固定 GitHub Actions SHA、收紧 token 权限、关闭 checkout 凭据持久化并配置依赖自动更新。
6. 加固链尖 fetch 隐私参数、严格响应格式和多源一致性校验。
7. 生产偏好 Cookie 添加 `Secure`，默认 dev / start 改为 localhost。
8. 发布 `SECURITY.md`。
9. 后续自托管 favicon，并持续演进 CSP 与 Worker 资源预算。

## 本次审查执行过的验证

```bash
npm audit --omit=dev --json
# 生产依赖 0 vulnerabilities

npm audit --json
# dev dependency 存在 vitest / vite / esbuild 相关 critical / high advisory

npm run doc:health
# ✅ Doc health check passed — references and Harness contracts are valid.

npm run lint
# 0 warnings / 0 errors

npm run typecheck
# 0 errors

npm run test:coverage
# 45 files / 320 tests passed；engine / builder / playground 覆盖率门禁通过

npm run build:check
# 构建成功；block-height-fallback.generated.ts 哈希未变化

curl -I https://miniscript.1satpod.org/
curl -I 'https://miniscript.1satpod.org/playground?s=dGVzdA=='
# 生产响应已有 HSTS；未发现 CSP / Referrer-Policy / frame / nosniff 等应用安全头

# 线上 query 长度探测
# 约 32KB 返回 200；约 36KB 开始返回 414

# 当前 WASM 编译器隔离复现
# 约 20 分支 thresh 可触发 Aborted(OOM)
# 约 150 层嵌套可触发 assertion abort
# 中止后同一实例无法正常编译简单 policy
```

## 最终判断

当前项目没有发现资金盗取、服务端 RCE 或现成 XSS，但正式公开发布前仍有两个应视为硬门槛的问题：

1. 不要让用户的 policy / public keys 出现在服务器可见的 query string 中。
2. 不要让未做结构预算的 Policy 进入主线程或不可重建的 WASM 编译实例。

原报告把编译风险主要归因于“超长输入”，复核后应修正为“短小但结构复杂的输入同样可以中止并污染编译器”。因此最佳发布策略不是只加字符串长度限制，而是：**结构预算 + Web Worker 隔离 + 超时终止 + Worker 重建**。
