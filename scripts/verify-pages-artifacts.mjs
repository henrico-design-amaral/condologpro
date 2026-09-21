import { readdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

async function equalFile(a, b) {
  const [left, right] = await Promise.all([readFile(a), readFile(b)]);
  assert.deepEqual(left, right, `${b} is not synchronized with ${a}`);
}

await equalFile("dist/index.html", "index.html");
await equalFile("dist/demo/index.html", "demo/index.html");
await equalFile("dist/visual-system/index.html", "visual-system/index.html");

const distAssets = (await readdir("dist/_assets")).sort();
const publicAssets = (await readdir("_assets")).sort();
assert.deepEqual(publicAssets, distAssets, "Published _assets inventory differs from Astro dist");

for (const name of distAssets) {
  await equalFile(`dist/_assets/${name}`, `_assets/${name}`);
}

console.log("Published Pages artifacts match Astro dist.");
