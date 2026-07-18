# AiSignalGuard 身份分析 Demo 实施计划

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `/demo/index-new.html` 上线一个完整可用、与根首页完全隔离的身份分析新版布局。

**Architecture:** 复制根页面、样式和浏览器脚本到 `demo/`，仅共享 `identityProfiles.js` 与 `identityAnalysis.js` 的评分数据和算法。Demo 单独重构 DOM、导航、倒计时和折叠交互；构建系统只新增 `demo/` 静态目录，不改根页面入口。

**Tech Stack:** 原生 HTML/CSS/JavaScript、ES modules、Tabler SVG symbols、Node.js 内置测试、Playwright、Vite、GitHub Pages。

---

## Task 1：建立 demo 回归门禁

**Files:**
- Modify: `tests/e2e-smoke.mjs`
- Test: `tests/e2e-smoke.mjs`

**Step 1: 写失败测试**

增加 `Demo 首页隔离与交互` 场景，访问 `/demo/index-new.html`，断言：

- demo 页面存在且资源加载成功。
- 根 `index.html` 的 8 个快捷工具仍保持原样。
- demo 恰好 5 个快捷工具且无 Claude、GitHub 浮动入口。
- demo 一级导航配置恰好 5 项。
- 三张可见画像卡使用 SVG，不含系统 Emoji。
- 无选择时按钮为“使用通用画像开始分析 (6s)”。
- 页面发生触摸/滚动/键盘交互后倒计时暂停，按钮仍可手动启动通用分析。

增加 `Demo 结果结构与移动端` 场景，断言：

- 结果区顺序为摘要、匹配原因、建议、信号、完整依据、高级诊断。
- 通用画像显示“环境一致性分”，选定画像显示“目标匹配度”。
- 完整依据和高级诊断默认折叠且可展开。
- 390px 与 300px 视口无横向溢出，浮动工具不遮住页尾内容。

**Step 2: 运行测试确认红灯**

Run: `E2E_FILTER='Demo' npm run test:e2e`
Expected: FAIL，因为 `/demo/index-new.html` 尚不存在。

**Step 3: 提交测试门禁**

```bash
git add tests/e2e-smoke.mjs
git commit -m "test: define identity demo experience"
```

## Task 2：创建完全隔离的 demo 文件

**Files:**
- Create: `demo/index-new.html`
- Create: `demo/styles-new.css`
- Create: `demo/app-new.js`
- Modify: `build/sites-vite-plugin.js`

**Step 1: 复制现有实现**

从 `index.html`、`styles.css`、`app.js` 创建 demo 对应文件。

**Step 2: 修正相对路径**

- `favicon.svg` -> `../favicon.svg`
- 共享模块 import -> `../identityProfiles.js`、`../identityAnalysis.js`
- demo CSS/JS 指向同目录文件。
- canonical、OG URL 指向 `/demo/index-new.html`。

**Step 3: 将 demo 纳入静态构建**

在 `build/sites-vite-plugin.js` 的静态文件清单增加 `demo`，确保 Sites 构建和 GitHub Pages 都能访问。

**Step 4: 运行基础检查**

Run: `node --check demo/app-new.js && npm run build`
Expected: PASS，`dist/client/demo/index-new.html` 存在。

## Task 3：首页身份卡和倒计时交互

**Files:**
- Modify: `demo/index-new.html`
- Modify: `demo/styles-new.css`
- Modify: `demo/app-new.js`

**Step 1: 替换画像图标**

在 demo 的 Tabler symbol library 增加 AI、创作者、商家与通用画像 symbol。画像卡和分析进度使用 `<svg><use></use></svg>`，移除可见 Emoji。

**Step 2: 改进画像卡内容**

为自媒体创作者与跨境商家显示“目标市场：美国”。保持三张卡的内容密度一致，但通过首张卡稍宽或不同背景层级避免机械三等分观感。

**Step 3: 改造倒计时状态机**

- 无选择时按钮可点击并显示“使用通用画像开始分析 (Ns)”。
- 选择画像后取消倒计时并显示具体画像。
- 监听 `pointerdown`、`touchstart`、`keydown`、`focusin` 与显著滚动，通过一次性暂停函数停止自动进入。
- 暂停后按钮保持可点击并显示“使用通用画像开始分析”。
- 提交无选择表单时启动 generic。

**Step 4: 运行 demo 首页测试**

Run: `E2E_FILTER='Demo 首页' npm run test:e2e`
Expected: PASS。

## Task 4：重构身份结果信息架构

**Files:**
- Modify: `demo/app-new.js`
- Modify: `demo/styles-new.css`
- Test: `tests/e2e-smoke.mjs`

**Step 1: 重写 `renderIdentityResult()`**

输出稳定 ID：

- `identity-summary`
- `identity-reasons`
- `identity-advice`
- `identity-signals`
- `identity-details`

顺序严格符合设计规格。通用画像使用“环境一致性分”，具体画像使用“目标匹配度”。

**Step 2: 去重匹配证据**

支持匹配与拉低匹配度各优先显示最多三项，完整证据留在详细折叠区。未确认信号只在存在时显示为二级 `details`。

**Step 3: 默认折叠完整依据**

以原生 `<details>` 包裹权重表。桌面优化列宽，手机端使用 CSS `data-label` 转为堆叠条目。

**Step 4: 优化内容密度**

压缩摘要卡高度，提高证据字号，去掉重复英文 eyebrow 文案，确保各区标题为中文功能词。

**Step 5: 运行结果测试**

Run: `E2E_FILTER='Demo 结果' npm run test:e2e`
Expected: PASS。

## Task 5：折叠高级诊断并精简导航

**Files:**
- Modify: `demo/index-new.html`
- Modify: `demo/app-new.js`
- Modify: `demo/styles-new.css`

**Step 1: 创建高级诊断 disclosure**

使用 `details#advanced-diagnostics` 包裹 `#sec-score` 与 `#section-root`。默认关闭，summary 文案明确“独立参考，不计入身份匹配分”。

**Step 2: 精简 NAV**

Demo `NAV` 只包含五个一级目标：摘要、原因、建议、信号、高级诊断。调整 active section 计算，使折叠的高级区不会抢占当前导航。

**Step 3: 保持高级功能完整**

展开后验证网络风险分、各检测行、重测、评分规则和隐私说明仍可交互。

## Task 6：重构五项浮动工具栏

**Files:**
- Modify: `demo/index-new.html`
- Modify: `demo/styles-new.css`
- Modify: `demo/app-new.js`

**Step 1: 精简 DOM**

删除 ChatGPT 独立跳转、Claude 和 GitHub 浮动入口，只保留重测、分享给 AI、分享、隐藏、回顶。

**Step 2: 统一状态**

- 分享给 AI 使用用户提供的 `merged_ai_logo.svg` 复制结构化报告。
- 复制状态成功保持 2 秒后恢复。
- 隐私按钮空闲文案为“隐藏”，激活文案为“取消隐藏”。
- hover、active、focus-visible 和 loading 状态均可辨识。

**Step 3: 移动端布局**

采用底部五项紧凑工具条，44px 触控目标，不覆盖正文和页脚；窄至 300px 仍无横向溢出。

## Task 7：可访问性、文案和视觉预检

**Files:**
- Modify: `demo/index-new.html`
- Modify: `demo/styles-new.css`
- Modify: `demo/app-new.js`

**Step 1: 修正程序化焦点**

仅对 `h1[tabindex='-1']` 和结果标题设置无原生轮廓的程序化聚焦样式；交互元素保留高对比 focus ring。

**Step 2: 文案自审**

逐项检查标题、说明、按钮、状态、空状态、alt 和 aria-label，确保：

- 不使用“伪装、冒充、假身份、欺骗”。
- 不声称判断真实个人身份。
- 不含可见系统 Emoji。
- 不含 em dash/en dash。
- 隐私文案准确描述第三方联网检测。

**Step 3: 视觉检查**

在 1440×1000、390×844、300×700 三种视口检查选择页、加载页、结果页、展开高级诊断和隐私状态。

## Task 8：完整验证、审查与发布

**Files:**
- Modify if needed: all demo files and tests

**Step 1: 完整自动验证**

Run: `npm run check:full`
Expected: PASS。

**Step 2: 独立代码审查**

使用 requesting-code-review 流程审查设计规格、行为、可访问性和根页面隔离，修复所有阻断及重要问题。

**Step 3: 提交实现**

```bash
git add demo build/sites-vite-plugin.js tests/e2e-smoke.mjs
git commit -m "feat: add redesigned identity analysis demo"
```

**Step 4: 合并和推送**

将分支 fast-forward 合并到 `main`，推送 `origin/main`。

**Step 5: 线上验证**

检查：

- `https://betaer.github.io/AiSignalGuard/` 仍为原首页。
- `https://betaer.github.io/AiSignalGuard/demo/index-new.html` 返回 200。
- demo 的 CSS、JS、favicon 与共享模块均返回 200。
- 线上 demo 能进入分析并生成结果。
