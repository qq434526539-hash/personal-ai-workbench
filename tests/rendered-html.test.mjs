import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("keeps local credentials and generated files out of git", async () => {
  const [ignore, example] = await Promise.all([
    read(".gitignore"),
    read(".env.example"),
  ]);
  assert.match(ignore, /^\.env\*$/m);
  assert.match(ignore, /^!\.env\.example$/m);
  assert.match(ignore, /^\/\.logs\/$/m);
  assert.match(ignore, /^\*\.log$/m);
  assert.doesNotMatch(ignore, /^\/build\/$/m);
  const sitesPlugin = await read("build/sites-vite-plugin.ts");
  assert.match(sitesPlugin, /export function sites/);
  assert.doesNotMatch(example, /DEEPSEEK_API_KEY=\S+/);
  assert.doesNotMatch(example, /[A-Z]:[\\/](?:Users|AI)[\\/]/i);
});

test("uses environment variables instead of personal absolute paths", async () => {
  const [workbench, brainstorm, page] = await Promise.all([
    read("app/api/workbench/route.ts"),
    read("app/api/brainstorm/route.ts"),
    read("app/page.tsx"),
  ]);
  for (const source of [workbench, brainstorm, page]) {
    assert.doesNotMatch(source, /[A-Z]:[\\/](?:Users|AI)[\\/]/i);
  }
  assert.match(workbench, /process\.env\.OBSIDIAN_VAULT/);
  assert.match(workbench, /process\.env\.FINANCE_PROJECT/);
  assert.match(brainstorm, /BRAINSTORM_ALLOW_DIRS/);
});

test("documents the real local workbench setup", async () => {
  const [readme, packageJson] = await Promise.all([
    read("README.md"),
    read("package.json"),
  ]);
  assert.match(readme, /Personal AI Workbench/);
  assert.match(readme, /DailyHotApi/);
  assert.match(readme, /数据与隐私/);
  assert.match(packageJson, /"name": "personal-ai-workbench"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("protects server uploads and keeps scheduled sync isolated", async () => {
  const [upload, social, compose, page] = await Promise.all([
    read("app/api/upload/route.ts"),
    read("app/api/social-sync/route.ts"),
    read("deploy/docker-compose.yml"),
    read("app/page.tsx"),
  ]);
  assert.match(upload, /WORKBENCH_WRITE_TOKEN/);
  assert.match(upload, /MAX_BYTES = 25 \* 1024 \* 1024/);
  assert.match(upload, /timingSafeEqual/);
  assert.match(social, /SOCIAL_SYNC_TOKEN/);
  assert.match(compose, /social-sync:/);
  assert.match(compose, /\/data\/vault:rw/);
  for (const theme of ["white", "black", "blue", "green"])
    assert.match(page, new RegExp(`\\["${theme}",`));
});
