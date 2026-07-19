import assert from "node:assert/strict";
import { createServer } from "node:http";
import { chromium } from "playwright";

const targets = [
  { name: "Claude.ai", url: "https://claude.ai/cdn-cgi/trace" },
  { name: "Perplexity.ai", url: "https://www.perplexity.ai/cdn-cgi/trace" },
];

const server = createServer((_request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end("<!doctype html><html lang=zh-CN><title>连通探针契约测试</title></html>");
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const results = await page.evaluate(async (probeTargets) => {
    return Promise.all(
      probeTargets.map(async (target) => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 12000);
        const startedAt = performance.now();
        try {
          const response = await fetch(target.url, {
            cache: "no-store",
            mode: "cors",
            referrerPolicy: "no-referrer",
            signal: controller.signal,
          });
          const result = {
            name: target.name,
            url: target.url,
            reachable: response.ok,
            status: response.status,
            responseType: response.type,
            elapsedMs: Math.max(1, Math.round(performance.now() - startedAt)),
            error: "",
          };
          controller.abort();
          return result;
        } catch (error) {
          return {
            name: target.name,
            url: target.url,
            reachable: false,
            status: 0,
            responseType: "error",
            elapsedMs: Math.max(1, Math.round(performance.now() - startedAt)),
            error: error instanceof Error ? error.message : String(error),
          };
        } finally {
          window.clearTimeout(timer);
        }
      }),
    );
  }, targets);

  console.table(
    results.map((result) => ({
      服务: result.name,
      结果: result.reachable ? "可达" : "本次未连通",
      "HTTP 状态": result.status || "—",
      "响应类型": result.responseType,
      "耗时（ms）": result.elapsedMs,
    })),
  );

  results.forEach((result) => {
    assert.equal(result.reachable, true, `${result.name} 真实浏览器跨域探针失败：${result.error || result.status}`);
    assert.ok(result.status >= 200 && result.status < 300, `${result.name} 返回非 2xx：${result.status}`);
    assert.equal(result.responseType, "cors", `${result.name} 未返回可跨域读取的响应：${result.responseType}`);
  });
  console.log("Claude.ai 与 Perplexity.ai 真实跨域探针契约通过。未读取或输出诊断正文。");
} finally {
  await browser?.close().catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}
