import { cp, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "packages", "web", "dist");
const target = path.join(root, "dist");

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
