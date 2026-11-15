import { timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedRequest } from "../request-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VAULT = process.env.OBSIDIAN_VAULT || "";
const FINANCE = process.env.FINANCE_PROJECT || "";
const MAX_BYTES = 25 * 1024 * 1024;
const TARGETS: Record<string, string> = {
  overview: "00 Uploads/总览",
  graph: "00 Uploads/知识星图",
  wiki: "01 Wiki",
  sources: "02 Sources",
  books: "05 Books",
  brain: "00 Uploads/Brainstorm",
  trends: "00 Uploads/每日热点",
  social: "04 Social/综合",
  ideas: "03 Douyin/灵感",
  content: "03 Douyin/内容中心",
  douyin: "04 Social/抖音",
  wechat: "04 Social/公众号",
  xiaohongshu: "04 Social/小红书",
  runs: "00 Uploads/运行档案",
};
const EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".csv", ".tsv", ".xls", ".xlsx", ".pdf",
  ".epub", ".mobi", ".azw3", ".png", ".jpg", ".jpeg", ".webp",
]);

function validToken(req: NextRequest) {
  const expected = process.env.WORKBENCH_WRITE_TOKEN || "";
  const supplied = req.headers.get("x-workbench-token") || "";
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected), b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

function safeName(value: string) {
  const base = path.basename(value).normalize("NFKC");
  return base
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 160);
}

export async function GET(req: NextRequest) {
  if (!isAllowedRequest(req, true))
    return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({
    ok: true,
    enabled: Boolean(process.env.WORKBENCH_WRITE_TOKEN && VAULT && FINANCE),
    maxBytes: MAX_BYTES,
    extensions: [...EXTENSIONS],
  });
}

export async function POST(req: NextRequest) {
  if (!isAllowedRequest(req, true))
    return NextResponse.json({ ok: false, error: "来源不受信任" }, { status: 403 });
  if (!validToken(req))
    return NextResponse.json({ ok: false, error: "上传口令无效" }, { status: 401 });
  try {
    const form = await req.formData();
    const target = String(form.get("target") || "overview");
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    if (!files.length || files.length > 20)
      return NextResponse.json({ ok: false, error: "每次请选择 1–20 个文件" }, { status: 400 });
    const root = target === "finance"
      ? path.join(FINANCE, "uploads")
      : path.join(/* turbopackIgnore: true */ VAULT, TARGETS[target] || TARGETS.overview);
    fs.mkdirSync(root, { recursive: true });
    const saved: Array<{ name: string; size: number }> = [];
    for (const file of files) {
      const name = safeName(file.name), ext = path.extname(name).toLowerCase();
      if (!name || !EXTENSIONS.has(ext))
        return NextResponse.json({ ok: false, error: `不支持的文件：${file.name}` }, { status: 400 });
      if (file.size > MAX_BYTES)
        return NextResponse.json({ ok: false, error: `${file.name} 超过 25MB` }, { status: 413 });
      let output = path.join(root, name);
      if (fs.existsSync(/* turbopackIgnore: true */ output)) {
        const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
        output = path.join(root, `${path.basename(name, ext)}-${stamp}${ext}`);
      }
      fs.writeFileSync(/* turbopackIgnore: true */ output, Buffer.from(await file.arrayBuffer()), { flag: "wx", mode: 0o640 });
      saved.push({ name: path.basename(output), size: file.size });
    }
    return NextResponse.json({ ok: true, target, saved });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "上传失败" },
      { status: 500 },
    );
  }
}
