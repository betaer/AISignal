// 生成 / 校验 app.min.js（esbuild JS API，跨平台，不依赖 .bin 可执行文件）。
//   node scripts/build-min.mjs          重新生成 app.min.js
//   node scripts/build-min.mjs --check  校验 app.min.js 与 app.js 压缩产物字节一致（check 门禁）
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");

const result = await build({
  entryPoints: [resolve(root, "app.js")],
  minify: true,
  charset: "utf8",
  write: false,
  outfile: resolve(root, "app.min.js"),
});
const built = Buffer.from(result.outputFiles[0].contents);

if (checkOnly) {
  const current = readFileSync(resolve(root, "app.min.js"));
  if (!built.equals(current)) {
    console.error(
      "app.min.js 与 app.js 的压缩产物不一致，请重新生成：\n" +
        "  node scripts/build-min.mjs\n" +
        "并同步 bump index.html 里的 ?v= 版本号。",
    );
    process.exit(1);
  }
  console.log("build-min --check: app.min.js 与源码一致");
} else {
  writeFileSync(resolve(root, "app.min.js"), built);
  console.log(`build-min: app.min.js 已生成（${built.length} bytes）`);
}
