# GitHub 仓库推广检查清单

## 必做

- [ ] Settings -> General -> Social preview：上传 `assets/social-preview.png`。
- [ ] About -> Website：填写 `https://betaer.github.io/AISignalGuard/`。
- [ ] About -> Description：填写 `Client-side browser and network signal analyzer for AI services.`。
- [ ] About -> Topics：填入 README 中列出的 topics。
- [ ] Releases：创建 `v1.0.0`，正文使用 `docs/release-v1.0.0.md`。
- [ ] Issues：确认 issue 已开启。
- [ ] Pages：确认 GitHub Pages 指向 `main` 分支根目录。

## SEO / GEO 必做

- [ ] 根目录添加 `robots.txt`，放行搜索引擎和 AI 搜索抓取，并声明 sitemap。
- [ ] 根目录添加 `sitemap.xml`，列出首页、FAQ、隐私页和指南页。
- [ ] 首页添加 canonical，指向 `https://betaer.github.io/AISignalGuard/`。
- [ ] 首页添加 `SoftwareApplication` JSON-LD，内容必须与页面可见信息一致。
- [ ] 新增 `faq.html`，并使用 `FAQPage` JSON-LD。
- [ ] 新增 `privacy.html`，明确本地检测、联网检测和第三方服务边界。
- [ ] 新增 `docs/seo-geo.md` 中列出的 6 篇指南页。
- [ ] 提交 Google Search Console 和 Bing Webmaster Tools。
- [ ] Bing 侧配置 IndexNow 或至少在内容更新后提交 URL。
- [ ] 可选添加 `llms.txt`。注意：Google 官方说明不需要它进入 Google Search 或生成式搜索能力。

## 建议确认

- [ ] 选择项目 license。当前没有替维护者擅自添加 license，建议在 MIT / Apache-2.0 / GPL-3.0 中明确选择一个。
- [ ] 准备一张真实检测结果截图，开启隐私模式后放到 README 或首条发布帖。
- [ ] 录制 20 秒 demo GIF，按 `docs/launch-kit.md` 的脚本执行。
- [ ] 发 Show HN 前先用 V2EX / X 收一轮误判反馈。
