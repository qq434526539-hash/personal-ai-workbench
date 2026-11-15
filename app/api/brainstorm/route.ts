import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAllowedRequest } from "../request-access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const VAULT = process.env.OBSIDIAN_VAULT || "",
  MODELS = ["deepseek-v4-flash", "deepseek-v4-pro"] as const;
const LOCAL_ENV = path.join(process.cwd(), ".env.local");
function setting(name: string) {
  if (process.env[name]) return process.env[name]!;
  if (!fs.existsSync(LOCAL_ENV)) return "";
  const raw = fs.readFileSync(LOCAL_ENV, "utf8").replace(/^\uFEFF/, "");
  const line = raw.split(/\r?\n/).find((x) => x.trim().startsWith(name + "="));
  return line ? line.slice(line.indexOf("=") + 1).trim() : "";
}
function allowed() {
  return setting("BRAINSTORM_ALLOW_DIRS")
    .split(",")
    .map((x) =>
      x
        .trim()
        .replaceAll("\\", "/")
        .replace(/^\/+|\/+$/g, ""),
    )
    .filter(Boolean);
}
function forbidden(p: string) {
  return /密码|credential|password|secret|token|api.?key/i.test(p);
}
function files() {
  if (!VAULT) return [];
  const dirs = allowed(),
    out: string[] = [];
  for (const rel of dirs) {
    const root = path.resolve(/* turbopackIgnore: true */ VAULT, rel),
      base = path.resolve(/* turbopackIgnore: true */ VAULT);
    if (!root.startsWith(base) || !fs.existsSync(root) || forbidden(rel))
      continue;
    function walk(d: string) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name),
          r = path.relative(VAULT, p).replaceAll("\\", "/");
        if (e.name.startsWith(".") || forbidden(r)) continue;
        e.isDirectory()
          ? walk(p)
          : e.name.toLowerCase().endsWith(".md") && out.push(p);
      }
    }
    walk(root);
  }
  return [...new Set(out)];
}
function terms(q: string) {
  const c = q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " "),
    set = new Set(c.split(/\s+/).filter((x) => x.length > 1)),
    zh = [...c.replace(/[^\p{Script=Han}]/gu, "")];
  for (let i = 0; i < zh.length - 1; i++) set.add(zh[i] + zh[i + 1]);
  return [...set].slice(0, 60);
}
function retrieve(q: string) {
  const ts = terms(q);
  return files()
    .map((file) => {
      const raw = fs.readFileSync(file, "utf8").slice(0, 80000),
        rel = path.relative(VAULT, file).replaceAll("\\", "/"),
        title = path.basename(file, ".md"),
        hay = (title + "\n" + raw).toLowerCase();
      let score = 0;
      for (const t of ts)
        score +=
          Math.min(hay.split(t).length - 1, 8) *
          (title.toLowerCase().includes(t) ? 5 : 1);
      return { rel, title, raw, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x, i) => ({
      id: i + 1,
      title: x.title,
      path: x.rel,
      content: x.raw.replace(/^---[\s\S]*?---\s*/, "").slice(0, 5000),
    }));
}
export async function GET(req: NextRequest) {
  if (!isAllowedRequest(req, true))
    return NextResponse.json({ error: "仅允许本机访问" }, { status: 403 });
  return NextResponse.json(
    {
      configured: Boolean(setting("DEEPSEEK_API_KEY")),
      contextEnabled: allowed().length > 0,
      allowedDirs: allowed(),
      defaultModel: setting("DEEPSEEK_MODEL") || "deepseek-v4-flash",
      models: MODELS,
      keyLocation: ".env.local",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  if (!isAllowedRequest(req, true))
    return NextResponse.json({ error: "仅允许本机访问" }, { status: 403 });
  const key = setting("DEEPSEEK_API_KEY");
  if (!key)
    return NextResponse.json(
      { error: "尚未配置 DEEPSEEK_API_KEY", code: "NOT_CONFIGURED" },
      { status: 503 },
    );
  try {
    const input = await req.json(),
      question = String(input.question || "").trim();
    if (!question || question.length > 3000)
      return NextResponse.json(
        { error: "问题不能为空且不能超过 3000 字" },
        { status: 400 },
      );
    const model = MODELS.includes(input.model)
        ? input.model
        : setting("DEEPSEEK_MODEL") || "deepseek-v4-flash",
      sources = retrieve(question),
      context = sources
        .map((s) => `[来源${s.id}: ${s.path}]\n${s.content}`)
        .join("\n\n---\n\n"),
      history = Array.isArray(input.history)
        ? input.history
            .slice(-8)
            .filter(
              (m: any) =>
                ["user", "assistant"].includes(m.role) &&
                typeof m.content === "string",
            )
            .map((m: any) => ({
              role: m.role,
              content: m.content.slice(0, 4000),
            }))
        : [];
    const system = `你是“小黑的个人工作台”中的头脑风暴助手。区分事实、用户观点和推断；引用资料时标注 [来源N]；证据不足就明确说明；给出下一步研究问题。\n\n允许发送的本地资料：\n${context || "未启用知识库目录，当前只能进行普通对话。"}`;
    const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            ...history,
            { role: "user", content: question },
          ],
          thinking: {
            type: model === "deepseek-v4-pro" ? "enabled" : "disabled",
          },
          max_tokens: 2200,
          temperature: 0.6,
          stream: false,
        }),
        signal: AbortSignal.timeout(120000),
      }),
      raw = await response.text();
    if (!response.ok) {
      let msg = `DeepSeek 请求失败（${response.status}）`;
      try {
        msg = JSON.parse(raw)?.error?.message || msg;
      } catch {}
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    const result = JSON.parse(raw),
      answer = result.choices?.[0]?.message?.content;
    if (!answer)
      return NextResponse.json(
        { error: "DeepSeek 没有返回回答" },
        { status: 502 },
      );
    return NextResponse.json(
      {
        answer,
        model,
        sources: sources.map(({ id, title, path }) => ({ id, title, path })),
        usage: result.usage || null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "请求失败" },
      { status: 500 },
    );
  }
}
