import { cp, mkdir, rm } from "node:fs/promises";

await rm("_assets", { recursive: true, force: true });
await rm("visual-system", { recursive: true, force: true });

await mkdir("demo", { recursive: true });
await mkdir("visual-system", { recursive: true });

await cp("dist/index.html", "index.html");
await cp("dist/demo/index.html", "demo/index.html");
await cp("dist/visual-system/index.html", "visual-system/index.html");
await cp("dist/_assets", "_assets", { recursive: true });

console.log("Published Pages artifacts synchronized from dist.");
