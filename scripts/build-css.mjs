// 生成 / 校验 styles.min.css（esbuild CSS transform，和 JS min 门禁保持一致）。
//   node scripts/build-css.mjs          重新生成 styles.min.css
//   node scripts/build-css.mjs --check  校验 styles.min.css 与 styles.css 字节一致
import { transform } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = resolve(root, "styles.css");
const outputPath = resolve(root, "styles.min.css");
const checkOnly = process.argv.includes("--check");

const result = await transform(readFileSync(sourcePath, "utf8"), {
  loader: "css",
  minify: true,
  charset: "utf8",
});
const built = Buffer.from(result.code);

if (checkOnly) {
  const current = readFileSync(outputPath);
  if (!built.equals(current)) {
    console.error(
      "styles.min.css 与 styles.css 的压缩产物不一致，请重新生成：\n" +
        "  node scripts/build-css.mjs\n" +
        "并同步 bump index.html 里的 CSS ?v= 版本号。",
    );
    process.exit(1);
  }
  console.log("build-css --check: styles.min.css 与源码一致");
} else {
  writeFileSync(outputPath, built);
  console.log(`build-css: styles.min.css 已生成（${built.length} bytes）`);
}
