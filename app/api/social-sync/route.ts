import { timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedRequest } from "../request-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VAULT = process.env.OBSIDIAN_VAULT || "";
const PLATFORMS = [
  { id: "douyin", label: "抖音", env: "DOUYIN_ACCOUNT_API" },
  { id: "wechat", label: "公众号", env: "WECHAT_ACCOUNT_API" },
  { id: "xiaohongshu", label: "小红书", env: "XIAOHONGSHU_ACCOUNT_API" },
] as const;

function secretEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return Boolean(a && b && x.length === y.length && timingSafeEqual(x, y));
}

function configured() {
  return PLATFORMS.map((p) => ({
    id: p.id,
    label: p.label,
    configured: Boolean(process.env[`${p.env}_URL`]),
    lastSync: latest(p.id),
  }));
}

function latest(id: string) {
  const dir = path.join(VAULT, "04 Social", id, "api");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort().reverse();
  if (!files[0]) return null;
  return fs.statSync(path.join(dir, files[0])).mtime.toISOString();
}

async function syncPlatform(platform: (typeof PLATFORMS)[number]) {
  const url = process.env[`${platform.env}_URL`] || "";
  const token = process.env[`${platform.env}_TOKEN`] || "";
  if (!url) return { id: platform.id, ok: false, skipped: true, error: "未配置接口" };
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(60000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${platform.label}接口返回 ${response.status}`);
  const payload = await response.json();
  const dir = path.join(VAULT, "04 Social", platform.id, "api");
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const name = `${now.toISOString().slice(0, 10)}.json`;
  fs.writeFileSync(path.join(dir, name), JSON.stringify({ platform: platform.id, syncedAt: now, payload }, null, 2), { mode: 0o640 });
  return { id: platform.id, ok: true, file: name };
}

export async function GET(req: NextRequest) {
  if (!isAllowedRequest(req, true)) return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ok: true, platforms: configured() });
}

export async function POST(req: NextRequest) {
  if (!isAllowedRequest(req, true)) return NextResponse.json({ ok: false }, { status: 403 });
  const internal = req.headers.get("x-sync-token") || "";
  const write = req.headers.get("x-workbench-token") || "";
  if (!secretEqual(internal, process.env.SOCIAL_SYNC_TOKEN || "") &&
      !secretEqual(write, process.env.WORKBENCH_WRITE_TOKEN || ""))
    return NextResponse.json({ ok: false, error: "同步口令无效" }, { status: 401 });
  const results = [];
  for (const platform of PLATFORMS) {
    try { results.push(await syncPlatform(platform)); }
    catch (error) { results.push({ id: platform.id, ok: false, error: error instanceof Error ? error.message : "同步失败" }); }
  }
  return NextResponse.json({ ok: true, syncedAt: new Date().toISOString(), results });
}
