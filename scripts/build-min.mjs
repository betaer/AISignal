// 生成 / 校验 app.min.js（esbuild JS API，跨平台，不依赖 .bin 可执行文件）。
//   node scripts/build-min.mjs          重新生成 app.min.js
//   node scripts/build-min.mjs --check  校验 app.min.js 与 app.js 压缩产物字节一致（check 门禁）
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");

const targets = [
  { source: "app.js", output: "app.min.js" },
  { source: "demo/app-new.js", output: "demo/app-new.min.js" },
];

let mismatch = false;
for (const target of targets) {
  const result = await build({
    entryPoints: [resolve(root, target.source)],
    bundle: true,
    platform: "browser",
    format: "iife",
    minify: true,
    charset: "utf8",
    write: false,
    outfile: resolve(root, target.output),
  });
  const built = Buffer.from(result.outputFiles[0].contents);

  if (checkOnly) {
    const current = readFileSync(resolve(root, target.output));
    if (!built.equals(current)) {
      mismatch = true;
      console.error(`${target.output} 与 ${target.source} 的压缩产物不一致`);
    } else {
      console.log(`build-min --check: ${target.output} 与源码一致`);
    }
  } else {
    writeFileSync(resolve(root, target.output), built);
    console.log(`build-min: ${target.output} 已生成（${built.length} bytes）`);
  }
}

if (mismatch) {
  console.error(
    "请重新生成浏览器脚本：\n" +
      "  node scripts/build-min.mjs\n" +
      "并同步 bump 对应 HTML 里的 ?v= 版本号。",
  );
  process.exit(1);
}
