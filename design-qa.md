# A 方案评分节点 · 视觉 QA

- source visual truth path: `/var/folders/wj/k5k4njyd16zcxv078rqwhbfc0000gn/T/codex-clipboard-41f41fd6-73ff-4513-929d-2b7729c32c6f.png`
- implementation URL: `http://127.0.0.1:4173/`
- implementation screenshot path: 未生成（Codex 内置浏览器当前没有可用的 in-app browser backend）
- viewport: 目标桌面 `808×740`；目标移动端 `390×844`；极窄屏自动化边界 `300×700`
- state: 完成态、六节点混合状态、单气泡展开态、键盘焦点态

## Full-view comparison evidence

源视觉已打开并确认：中心为单一综合信任分圆环，外围是六个无连接线的独立图标节点，标签依次为出口 IP、身份、泄漏、网络连通、AI 出口、多源互证。

实现页面曾在改动早期由内置浏览器成功打开并读取 DOM，但最终版本截图阶段内置浏览器页面被回收；随后新建页面持续无法附着。由于没有最终版本的同视口浏览器截图，未进行源图与实现图的同画布比较，不能据此给出视觉通过结论。

## Focused region comparison evidence

未完成。缺少最终实现截图，无法对图标描边、节点尺寸、标签字重、中心圆环比例、间距与气泡视觉进行有效的局部同画布比较。

## Findings

- [P1] 最终浏览器视觉证据缺失
  - Location: 正式首页评分区 `#sec-score`
  - Evidence: 源图可用，但最终实现的桌面与移动端截图无法由用户选定的 Codex 内置浏览器生成。
  - Impact: 自动化能够证明结构、状态、交互和边界正确，但不能替代真实渲染的视觉忠实度检查。
  - Fix: Codex 内置浏览器恢复后，在 `808×740` 与 `390×844` 下截取最终评分区；将源图与实现截图合并比较，修复所有 P0/P1/P2 偏差后改为通过。

## Automated evidence（非视觉替代）

- `npm run check:full` 通过。
- 11 个确定性浏览器场景、35 项断言通过。
- 已覆盖六个 SVG 节点、有效 symbol 引用、单气泡、Escape 全关闭、异步重渲染焦点保持、WebRTC 红色状态、390px 与 300px 无横向溢出。
- Worker 测试 4/4 通过；JS/CSS 压缩产物字节一致性门禁通过。

## Comparison history

1. 首次代码与自动化审查发现：评分节点在异步重渲染后丢失键盘焦点、气泡可见性断言不足、300px 激活态可能溢出、焦点环对比度不足、SVG/气泡关联不完整。
2. 已修复：恢复原评分节点焦点；用实色高对比焦点环；只缩放图标而不缩放气泡；补全动态总分可访问名称、`aria-controls` 与 live status；加固图标、气泡可见性和 300px 六节点逐个展开回归。
3. 修复后自动化证据：35/35 通过；最终同画布视觉复核仍因内置浏览器不可用而阻塞。

## Implementation checklist

- [x] 单一中心总分圆环
- [x] 六个独立 Tabler SVG 状态节点，无连接线
- [x] 绿色、橙色、红色、中性、检测中状态
- [x] 点击、悬停、焦点与 Escape 气泡交互
- [x] 键盘焦点跨异步渲染保持
- [x] 390px 与 300px 无横向溢出自动化验证
- [ ] 内置浏览器桌面/移动端截图
- [ ] 与源视觉同画布最终比较

final result: blocked
