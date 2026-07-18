// 生成 / 校验 styles.min.css（esbuild CSS transform，和 JS min 门禁保持一致）。
//   node scripts/build-css.mjs          重新生成 styles.min.css
//   node scripts/build-css.mjs --check  校验 styles.min.css 与 styles.css 字节一致
import { transform } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");
const targets = [
  { source: "styles.css", output: "styles.min.css" },
  { source: "demo/styles-new.css", output: "demo/styles-new.min.css" },
];

let mismatch = false;
for (const target of targets) {
  const sourcePath = resolve(root, target.source);
  const outputPath = resolve(root, target.output);
  const result = await transform(readFileSync(sourcePath, "utf8"), {
    loader: "css",
    minify: true,
    charset: "utf8",
  });
  const built = Buffer.from(result.code);

  if (checkOnly) {
    const current = readFileSync(outputPath);
    if (!built.equals(current)) {
      mismatch = true;
      console.error(`${target.output} 与 ${target.source} 的压缩产物不一致`);
    } else {
      console.log(`build-css --check: ${target.output} 与源码一致`);
    }
  } else {
    writeFileSync(outputPath, built);
    console.log(`build-css: ${target.output} 已生成（${built.length} bytes）`);
  }
}

if (mismatch) {
  console.error(
    "请重新生成浏览器样式：\n" +
      "  node scripts/build-css.mjs\n" +
      "并同步 bump 对应 HTML 里的 CSS ?v= 版本号。",
  );
  process.exit(1);
}
