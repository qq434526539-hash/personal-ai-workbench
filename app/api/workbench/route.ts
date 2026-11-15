import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import { isAllowedRequest } from "../request-access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const VAULT = process.env.OBSIDIAN_VAULT || "",
  FINANCE = process.env.FINANCE_PROJECT || "",
  DY = VAULT ? path.join(VAULT, "03 Douyin") : "";
function sensitive(name: string) {
  return /密码|账号密码|credential|password|secret|token|api.?key/i.test(name);
}
function walk(
  root: string,
  accept: (n: string) => boolean,
  skip: string[] = [],
) {
  const out: string[] = [];
  function go(d: string) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".") || skip.includes(e.name) || sensitive(e.name))
        continue;
      const p = path.join(d, e.name);
      e.isDirectory() ? go(p) : accept(e.name) && out.push(p);
    }
  }
  if (fs.existsSync(root)) go(root);
  return out;
}
function body(raw: string) {
  return raw
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/!\[\[[^\]]+\]\]/g, "")
    .trim();
}
function front(raw: string) {
  const out: any = {},
    m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const x = line.match(/^([\w_-]+):\s*["']?(.*?)["']?\s*$/);
    if (x && !x[2].startsWith("[")) out[x[1]] = x[2];
  }
  return out;
}
function note(file: string, root = VAULT) {
  const raw = fs.readFileSync(file, "utf8"),
    rel = path.relative(root, file).replaceAll("\\", "/"),
    text = body(raw),
    fm = front(raw);
  return {
    title: fm.title || path.basename(file, ".md"),
    relativePath: rel,
    folder: rel.split("/")[0],
    updated: fs.statSync(file).mtime.toISOString(),
    excerpt: (
      text
        .split(/\r?\n/)
        .find((x) => x.trim() && !x.startsWith("#") && !x.startsWith("```")) ||
      ""
    )
      .replace(/[*_`>#\[\]]/g, "")
      .slice(0, 120),
    meta: fm,
  };
}
function num(v: any) {
  const n = Number(String(v ?? "").replace(/[% ,]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
async function positions() {
  if (!FINANCE) return [];
  const candidates: string[] = [];
  const uploadDir = path.join(FINANCE, "uploads");
  if (fs.existsSync(uploadDir))
    candidates.push(
      ...fs.readdirSync(uploadDir)
        .filter((name) => /\.(xlsx|xls|csv|tsv)$/i.test(name))
        .map((name) => path.join(uploadDir, name))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs),
    );
  candidates.push(path.join(FINANCE, "交割单.xls"));
  const f = candidates.find((file) => fs.existsSync(file));
  if (!f) return [];
  let table: any[][];
  if (f.toLowerCase().endsWith(".xlsx")) {
    table = (await readSheet(f)).map((row) => row.map((cell) => cell ?? ""));
  } else {
    const bytes = fs.readFileSync(f);
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      text = new TextDecoder("gbk").decode(bytes);
    }
    text = text.replace(/^\uFEFF/, "").trim();
    const delimiter = text.includes("\t") ? "\t" : ",";
    table = text.split(/\r?\n/).map((row) => row.split(delimiter));
  }
  const head = table.shift()?.map(String) || [],
    ix = (s: string) => head.indexOf(s),
    map = new Map<string, any>();
  for (const c of table) {
    const code = String(c[ix("证券代码")] ?? c[ix("代码")] ?? "").trim(),
      name = String(c[ix("证券名称")] ?? c[ix("名称")] ?? "").trim();
    if (!code) continue;
    let qty = num(c[ix("成交数量")] ?? c[ix("数量")]),
      price = num(c[ix("成交均价")] ?? c[ix("成交价格")] ?? c[ix("价格")]),
      date = String(c[ix("成交日期")] ?? c[ix("日期")] ?? ""),
      side = String(c[ix("买卖标志")] ?? c[ix("操作")] ?? ""),
      x = map.get(code) || {
        code,
        name,
        quantity: 0,
        lastPrice: 0,
        lastDate: "",
        buys: 0,
        sells: 0,
      };
    if (/卖/.test(side) && qty > 0) qty = -qty;
    x.quantity += qty;
    if (date >= x.lastDate) {
      x.lastDate = date;
      x.lastPrice = price;
    }
    qty > 0 ? x.buys++ : x.sells++;
    map.set(code, x);
  }
  return [...map.values()]
    .filter((x) => x.quantity > 0)
    .sort((a, b) => b.quantity * b.lastPrice - a.quantity * a.lastPrice)
    .map((x) => ({
      ...x,
      estimatedValue: Math.round(x.quantity * x.lastPrice * 100) / 100,
    }));
}
export async function GET(req: NextRequest) {
  if (!isAllowedRequest(req))
    return NextResponse.json(
      { ok: false, error: "仅允许本机访问" },
      { status: 403 },
    );
  try {
    const files = walk(VAULT, (n) => n.toLowerCase().endsWith(".md"), [
        "06 Attachments",
      ]),
      notes = files
        .map((f) => note(f))
        .sort((a, b) => b.updated.localeCompare(a.updated)),
      folders: Record<string, number> = {};
    notes.forEach((n) => (folders[n.folder] = (folders[n.folder] || 0) + 1));
    const graphNodes = notes.map((n) => ({
        id: n.relativePath.replace(/\.md$/i, ""),
        title: n.title,
        folder: n.folder,
      })),
      exact = new Map(graphNodes.map((n) => [n.id.toLowerCase(), n.id])),
      byName = new Map<string, string>();
    for (const n of graphNodes) {
      const key = n.id.split("/").pop()!.toLowerCase();
      if (!byName.has(key)) byName.set(key, n.id);
    }
    const graphEdges: any[] = [],
      seen = new Set<string>();
    let unresolved = 0;
    for (const f of files) {
      const source = path
          .relative(VAULT, f)
          .replaceAll("\\", "/")
          .replace(/\.md$/i, ""),
        raw = fs.readFileSync(f, "utf8"),
        matches = [...raw.matchAll(/\[\[([^\]]+)\]\]/g)];
      for (const m of matches) {
        let ref = m[1]
          .split("|")[0]
          .split("#")[0]
          .trim()
          .replace(/\.md$/i, "")
          .replaceAll("\\", "/");
        if (!ref) continue;
        let target =
          exact.get(ref.toLowerCase()) ||
          byName.get(ref.split("/").pop()!.toLowerCase());
        if (!target) {
          unresolved++;
          continue;
        }
        const key = source + "→" + target;
        if (source !== target && !seen.has(key)) {
          seen.add(key);
          graphEdges.push({ source, target });
        }
      }
    }
    const links = graphEdges.length;
    const published = walk(
      path.join(DY, "已发布"),
      (n) => n.endsWith(".md") && !n.includes("索引"),
    )
      .map((f) => note(f))
      .map((n) => ({
        title: n.title,
        ...n.meta,
        plays: num(n.meta.plays),
        likes: num(n.meta.likes),
        comments: num(n.meta.comments),
        shares: num(n.meta.shares),
        saves: num(n.meta.saves),
      }))
      .sort((a, b) => b.plays - a.plays);
    const reviews = walk(
        path.join(DY, "数据复盘"),
        (n) => n.endsWith(".md") && !n.includes("索引") && !n.includes("面板"),
      )
        .map((f) => note(f))
        .sort((a, b) => b.updated.localeCompare(a.updated)),
      latestReview = reviews[0] || null;
    const scripts = walk(path.join(DY, "文字稿"), (n) => n.endsWith(".md"))
      .map((f) => note(f))
      .sort((a, b) => b.updated.localeCompare(a.updated));
    const ideaFile = path.join(DY, "灵感", "灵感收集箱.md"),
      ideas = fs.existsSync(ideaFile)
        ? body(fs.readFileSync(ideaFile, "utf8"))
            .split(/\r?\n/)
            .filter((x) => /^[-*]\s+/.test(x) || /^\[\[.+\]\]$/.test(x))
            .map((x) =>
              x
                .replace(/^[-*]\s+(\[[ xX]\]\s*)?/, "")
                .replace(/^\[\[|\]\]$/g, ""),
            )
            .filter((x) => x && !/^✅/.test(x))
        : [];
    const books = walk(VAULT, (n) => /\.(epub|mobi|azw3|pdf)$/i.test(n), [
      ".obsidian",
    ]).map((f) => ({
      title: path.basename(f),
      relativePath: path.relative(VAULT, f).replaceAll("\\", "/"),
      updated: fs.statSync(f).mtime.toISOString(),
    }));
    const ff = [
        ...walk(path.join(VAULT, "财经"), (n) => n.endsWith(".md")),
        ...walk(path.join(FINANCE, "文档-md"), (n) => n.endsWith(".md")),
      ],
      financeNotes = ff
        .map((f) => note(f, f.startsWith(VAULT) ? VAULT : FINANCE))
        .sort((a, b) => b.updated.localeCompare(a.updated))
        .slice(0, 12),
      holdings = await positions(),
      actions: any[] = [];
    holdings
      .filter((x) => x.buys >= 5)
      .slice(0, 3)
      .forEach((h) =>
        actions.push({
          priority: "风险检查",
          title: `复核 ${h.name} 的连续加仓`,
          reason: `交割单记录 ${h.buys} 次买入；个人规则默认禁止 6 次以上补仓。`,
          confidence: 92,
        }),
      );
    if (holdings.some((x) => /纳指|QDII/i.test(x.name)))
      actions.push({
        priority: "交易前检查",
        title: "核对 QDII 场内溢价",
        reason: "溢价超过 3% 不新增、超过 5% 不追买。",
        confidence: 98,
      });
    actions.push({
      priority: "每日复盘",
      title: "区分核心仓、做 T 仓与现金仓",
      reason: "交割单只能推断净持仓，需补充仓位角色。",
      confidence: 88,
    });
    const statuses = {
      obsidian: { connected: true, label: "已连接 Obsidian Vault" },
      finance: { connected: true, label: "已连接财经项目" },
      douyin: { connected: true, label: "已连接本地抖音复盘" },
      hot: { connected: false, label: "公开热点接口当前不可访问" },
      social: { connected: false, label: "未发现评论数据源" },
      wechat: { connected: false, label: "未发现公众号数据源" },
      codex: { connected: false, label: "未配置 Codex 对话接口" },
    };
    return NextResponse.json(
      {
        ok: true,
        source: { indexedAt: new Date().toISOString() },
        stats: {
          notes: notes.length,
          folders: Object.keys(folders).length,
          links,
          financeNotes: ff.length,
          holdings: holdings.length,
          published: published.length,
          scripts: scripts.length,
          ideas: ideas.length,
          books: books.length,
          totalPlays: published.reduce((s, x) => s + x.plays, 0),
        },
        folders,
        recent: notes.slice(0, 18),
        books: books.slice(0, 20),
        graph: { nodes: graphNodes, edges: graphEdges, links, unresolved },
        douyin: { published, reviews, latestReview, scripts, ideas },
        financeNotes,
        holdings,
        actions,
        statuses,
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
      { ok: false, error: e instanceof Error ? e.message : "读取失败" },
      { status: 500 },
    );
  }
}
