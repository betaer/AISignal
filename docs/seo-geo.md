# AI Signal Guard SEO / GEO 执行手册

更新时间：2026-07-09

这份文档用于指导 AI Signal Guard 的搜索收录、内容建设和 AI 搜索引用优化。这里的 GEO 指 Generative Engine Optimization，也就是让 Google AI Overviews / AI Mode、ChatGPT search、Perplexity、Copilot 等生成式搜索更容易理解、引用和推荐项目。

## 最新官方口径

| 来源 | 关键结论 | 对本项目的影响 |
|---|---|---|
| Google Search Central SEO Starter Guide | SEO 的核心是帮助搜索引擎理解内容，并帮助用户判断是否访问 | 不做关键词堆砌，优先做清晰标题、描述、可抓取内容、站内结构 |
| Google 生成式 AI 搜索优化指南 | Google 明确说 AEO / GEO 本质上仍然依赖基础 SEO；不需要专门为 Google 创建 `llms.txt` 或其他特殊 AI 文件 | `llms.txt` 可以做，但不能当成 Google 排名手段；核心仍是可索引、高质量、非同质内容 |
| Google 结构化数据文档 | 如果站点适合使用结构化数据，Google 推荐 JSON-LD | 首页适合加 `SoftwareApplication` / `WebApplication`；FAQ 页适合加 `FAQPage` |
| Google Sitemap 文档 | `lastmod` 只应反映页面主体、结构化数据或链接等显著更新 | `sitemap.xml` 的 `lastmod` 不要每天机械更新 |
| Bing Webmaster Guidelines | Bing 的抓取、索引和展示覆盖 Bing Search、Copilot 和 grounding API | Bing 不是次要渠道；要提交 sitemap 并观察 Copilot/AI 相关表现 |
| Bing AI Performance | Bing Webmaster Tools 已提供 AI Performance 相关能力；IndexNow 有助于让搜索和 AI 体验更快感知更新 | 内容页上线或更新后，用 Bing Webmaster / IndexNow 做新鲜度闭环 |
| OpenAI crawlers | OpenAI 用 `OAI-SearchBot` 和 `GPTBot` 等 robots.txt 规则分别管理搜索展示和其他 AI 用途 | 想进入 ChatGPT search，需要至少不阻止 `OAI-SearchBot` |
| Perplexity crawlers | Perplexity 区分爬虫和用户触发访问；`Perplexity-User` 用于用户请求访问并可能引用链接 | 想被 Perplexity 答案引用，不要误封相关 user-agent |
| llms.txt proposal | `/llms.txt` 是一个给 LLM 推理时读取站点说明的提案 | 可低成本增加，但要在文档里明确：它不是 Google 官方必需项 |

参考链接：

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Generative AI Search Optimization: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Structured Data Intro: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google Sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- Bing AI Performance: https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- OpenAI publisher FAQ: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- Perplexity crawlers: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- llms.txt proposal: https://llmstxt.org/

## 定位原则

AI Signal Guard 的 SEO/GEO 不应写成“防封、绕过风控、保证账号可用”。统一使用这些表达：

- 浏览器端 AI 账号网络与身份信号体检
- 网络诊断
- 隐私自查
- DNS / WebRTC 泄漏检测
- 浏览器信号一致性检查
- AI 服务访问异常排障
- 安全研究工具

禁用表达：

- 绕过风控
- 防封
- 解封账号
- 保证 ChatGPT / Claude 可用
- 检测是否会被平台识别

## P0 技术 SEO

| 项目 | 推荐动作 | 验收标准 |
|---|---|---|
| 可抓取 HTML | 首页、FAQ、隐私说明、指南页都写成静态 HTML，不只靠 JS 生成正文 | 禁用 JS 后仍能看到核心说明、标题、FAQ 和 CTA |
| title / description | 每页写唯一 title 和 description | 搜索结果片段能明确表达页面主题 |
| canonical | 每页加 `<link rel="canonical" href="...">` | 避免 GitHub Pages 路径、带参数路径分散权重 |
| Open Graph / Twitter card | 首页和内容页都提供分享标题、描述、图 | 发到 X、Telegram、Discord、Slack 时能正常预览 |
| sitemap.xml | 列出首页、FAQ、隐私页、每篇指南页 | `lastmod` 只在主体内容明显更新时变更 |
| robots.txt | 放行搜索引擎和 AI 搜索抓取，声明 sitemap | 不阻止 `Googlebot`、`Bingbot`、`OAI-SearchBot`、`PerplexityBot` 等 |
| JSON-LD | 首页加软件/网页应用结构化数据；FAQ 页加 FAQPage | 通过 Google Rich Results Test / Schema validator 基础校验 |
| Search Console | 添加站点、提交 sitemap | 能看到索引状态、查询词和页面表现 |
| Bing Webmaster Tools | 添加站点、提交 sitemap | 能看到 Bing / Copilot 相关表现数据 |

## P0 推荐根目录文件

### `robots.txt`

```txt
User-agent: *
Allow: /

Sitemap: https://betaer.github.io/AISignalGuard/sitemap.xml
```

如果后续发现某些 AI crawler 频率过高，再单独限速或局部限制。不要一开始就误封搜索和 AI 引用入口。

### `sitemap.xml`

`lastmod` 只写真正有内容更新的日期。不要每天自动刷新，否则会降低可信度。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://betaer.github.io/AISignalGuard/</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://betaer.github.io/AISignalGuard/faq.html</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://betaer.github.io/AISignalGuard/privacy.html</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
</urlset>
```

### `llms.txt`

Google 明确不需要 `llms.txt` 来进入 Google Search 或生成式搜索能力；但它可以作为给 LLM 工具、开发者和聚合器的低成本说明文件。

```txt
# AI Signal Guard

AI Signal Guard is a client-side browser and network signal analyzer for AI services.

## Primary URLs

- App: https://betaer.github.io/AISignalGuard/
- GitHub: https://github.com/betaer/AISignalGuard
- README: https://github.com/betaer/AISignalGuard#readme

## What it checks

- Exit IP quality
- DNS leak
- WebRTC leak
- Browser language and timezone consistency
- Cloudflare path to AI services
- OpenAI / Claude status
- Browser fingerprint fields visible to web pages

## Privacy boundary

The app has no project-owned backend. Local signals are computed in the browser. Network checks call third-party IP, DNS, STUN and status APIs.
```

## 首页 JSON-LD 建议

首页适合用 `SoftwareApplication`。保持描述和页面真实一致，不要写评分、下载量、review 等不存在的数据。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Signal Guard",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Any",
  "url": "https://betaer.github.io/AISignalGuard/",
  "codeRepository": "https://github.com/betaer/AISignalGuard",
  "description": "Client-side browser and network signal analyzer for AI services, covering IP quality, DNS/WebRTC leaks, locale consistency, AI paths, service status, and browser fingerprints.",
  "inLanguage": ["zh-CN", "en"],
  "isAccessibleForFree": true
}
</script>
```

## 内容页矩阵

先做少量高质量页面，不要一次生成大量薄页面。

| URL | 页面标题 | 目标问题 | 页面重点 |
|---|---|---|---|
| `/faq.html` | AI Signal Guard FAQ | “AI Signal Guard 是什么”“会不会上传隐私数据” | 直接回答安装、隐私、误判、评分、第三方请求 |
| `/privacy.html` | AI Signal Guard 隐私说明 | “检测会不会泄漏我的 IP / DNS / 指纹” | 分本地项、联网项、复制摘要、第三方服务 |
| `/guides/dns-leak-test.html` | DNS 泄漏检测：如何判断 DNS 是否跟随代理 | “DNS 泄漏是什么”“DNS leak test” | 原理、检测方式、结果解释、误判 |
| `/guides/webrtc-leak-test.html` | WebRTC 泄漏检测：公网候选、内网候选和 mDNS | “WebRTC 泄漏检测”“WebRTC leak test” | STUN、mDNS、出口外公网候选、如何关闭 |
| `/guides/browser-fingerprint-check.html` | 浏览器指纹检测：网页能看到哪些本机信号 | “浏览器指纹检测”“canvas fingerprint” | UserAgent、Canvas、Audio、字体、屏幕 |
| `/guides/ai-network-diagnostics.html` | ChatGPT / Claude 访问异常的网络诊断清单 | “ChatGPT 打不开”“Claude 访问异常” | 区分平台故障、网络不可达、DNS、WebRTC、AI 路径 |
| `/guides/ai-signal-consistency.html` | AI Signal Guard 一致性：IP、时区、语言为什么要一起看 | “AI Signal Guard 检测”“身份信号一致性” | 核心概念、风险项、评分解释 |
| `/guides/cloudflare-ai-path.html` | AI 路径检测：访问 AI 站点时的 Cloudflare 出口 | “Cloudflare path”“AI path check” | Ray/边缘出口、适用范围、局限 |

## 单篇指南模板

```md
# 页面主标题

## 结论

用 2-3 句话直接回答用户问题。AI 搜索更容易引用清晰、短、事实密度高的结论。

## 这个信号是什么

定义概念，不用营销词。

## 为什么它会影响 AI 服务访问排障

解释和 IP、DNS、WebRTC、时区语言、Cloudflare 路径之间的关系。

## AI Signal Guard 如何检测

写清哪些在本地完成，哪些会请求第三方服务。

## 结果怎么看

用表格解释绿色、黄色、红色或“检测失败”。

## 常见误判

列出浏览器限制、代理模式、第三方服务不可达、公司网络等。

## 隐私边界

明确不上传什么、会访问什么第三方。

## 立即检测

链接回首页。
```

## GEO 写法要求

AI 搜索更容易抽取结构化、可验证、非同质内容。每篇内容页都应满足：

- 开头有明确结论，不绕弯。
- 使用表格解释状态、原因、解决方向。
- 写出 AI Signal Guard 的真实检测边界，不承诺平台风控结果。
- 写出第三方请求和隐私边界。
- 每页回答 4-6 个自然问题，例如“DNS 泄漏一定危险吗？”。
- 标明更新时间。
- 给出“在线检测”和“源码”链接。

不做：

- 不写隐藏 prompt。
- 不写给 AI看的伪指令。
- 不批量生成低质量长尾页面。
- 不到处买软文制造虚假提及。

## 监控指标

| 工具 | 看什么 | 判断 |
|---|---|---|
| Google Search Console | 索引、查询词、点击、展示、页面体验 | 确认指南页是否被收录，哪些关键词有展示 |
| Bing Webmaster Tools | Bing 搜索表现、AI Performance、IndexNow 状态 | 判断 Copilot / AI 搜索引用是否开始出现 |
| GitHub Insights | Star、referrer、热门内容 | 判断 SEO 内容是否转化成 star |
| GA / Plausible / Cloudflare Web Analytics | 页面访问、来源、停留 | 判断内容页是否把用户带回工具页 |

## 30 天执行计划

| 时间 | 任务 |
|---|---|
| 第 1-2 天 | 补 `robots.txt`、`sitemap.xml`、首页 canonical、JSON-LD |
| 第 3-5 天 | 写 `faq.html`、`privacy.html` |
| 第 6-12 天 | 写 DNS / WebRTC / 浏览器指纹三篇指南 |
| 第 13-18 天 | 写 AI 网络诊断 / AI Signal Guard 一致性 / Cloudflare AI 路径三篇指南 |
| 第 19 天 | 提交 Google Search Console 和 Bing Webmaster Tools |
| 第 20-30 天 | 根据 query 和 referrer 数据改标题、FAQ、内链和 CTA |

## 提交前检查

- [ ] 页面没有“防封、绕过风控、保证可用”等风险表达。
- [ ] 每页有唯一 title、description、canonical。
- [ ] 每页有明确 H1，且只有一个主 H1。
- [ ] 页面主体内容不依赖 JS 才能阅读。
- [ ] 每页都有“在线检测”和“源码”入口。
- [ ] `sitemap.xml` 的 `lastmod` 是真实显著更新时间。
- [ ] `robots.txt` 没有误封目标 crawler。
- [ ] JSON-LD 与页面可见内容一致。
