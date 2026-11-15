"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import RealTrends from "./RealTrends";
const mods = [
  [
    "overview",
    "⌂",
    "总览",
    "小黑的个人工作台",
    "知识、内容与决策，都从这里开始。",
  ],
  ["graph", "⌘", "知识星图", "知识星图", "看见素材、知识、灵感与作品的连接。"],
  ["wiki", "▤", "Wiki 层", "Wiki 知识层", "经过确认、可以持续复用的正式知识。"],
  [
    "sources",
    "◇",
    "素材层",
    "素材与证据",
    "阅读、理解、批注，再把信息变成知识。",
  ],
  ["books", "▥", "书架", "我的书架", "管理长内容、章节进度和阅读沉淀。"],
  [
    "brain",
    "◉",
    "Brainstorm",
    "头脑风暴",
    "让 Codex 基于知识库，和你一起把问题想深。",
  ],
  ["trends", "◎", "每日热点", "每日热点", "过滤噪音，只留下值得关注的信号。"],
  ["social", "⌯", "社媒洞察", "社媒洞察", "从真实讨论中发现需求、争议与机会。"],
  ["ideas", "✧", "灵感库", "灵感库", "先捕捉，再判断；让好想法都有去处。"],
  [
    "content",
    "▣",
    "内容中心",
    "内容中心",
    "从灵感到发布，把生产变成清晰的流水线。",
  ],
  [
    "douyin",
    "♪",
    "抖音数据",
    "抖音数据",
    "把作品表现、留存和策略变化放在一起看。",
  ],
  ["wechat", "◌", "公众号", "公众号数据", "跟踪文章传播、互动和跨平台表现。"],
  ["xiaohongshu", "✦", "小红书", "小红书数据", "跟踪账号、笔记与互动数据。"],
  [
    "finance",
    "¥",
    "财经中心",
    "财经中心",
    "把市场信号、个人持仓和下一步行动放在一处。",
  ],
  [
    "runs",
    "≡",
    "运行档案",
    "运行档案",
    "看清 Codex 做过什么、依据什么、结果如何。",
  ],
];
const data: any = {
  wiki: [
    ["Agent Memory", "AI 系统如何获得可持续、可追溯的长期记忆。", "关联 18"],
    ["证据层", "所有正式知识都能回到原始来源。", "关联 12"],
    ["内容校准循环", "预测、发布、数据回收与复盘。", "关联 9"],
  ],
  sources: [
    [
      "Building a Personal AI Workbench",
      "网页文章 · 已划线 14 处 · 笔记 6 条",
      "72%",
    ],
    ["AI Agent Memory Survey.pdf", "PDF · 46 页 · 关联 4 个 Wiki 页面", "38%"],
    ["评论区需求样本：知识库", "社媒采集 · 126 条评论", "100%"],
  ],
  books: [
    ["How to Take Smart Notes", "读至第 7 章", "64%"],
    ["The Creative Act", "已完成 28 条高亮", "100%"],
    ["Co-Intelligence", "读至第 3 章", "31%"],
  ],
  trends: [
    ["个人 AI 工作台讨论升温", "来自 6 个平台 · 6 小时热度增长 42%", "96"],
    ["本地 Agent 与云端助手的边界", "知乎 / B站 / X · 高度相关", "91"],
    ["创作者开始建立自己的数据资产", "可转化为系列内容", "87"],
  ],
  ideas: [
    [
      "工作台不是工具集合，而是反馈系统",
      "来自 Brainstorm · 关联 6 条知识",
      "高潜",
    ],
    ["为什么收藏越多，知识反而越少？", "38 人提出类似问题", "展开"],
    ["让 AI 先给内容做盲预测", "已有验证数据", "选题"],
  ],
};
const pipe = [
  "和自己的知识库头脑风暴",
  "外部资料如何转化为自己的知识",
  "为什么你的 AI 工作流没有积累",
  "个人工作台不是另一个 Notion",
];
function Head({ code, title }: { code: string; title: string }) {
  return (
    <header className="ph">
      <div>
        <span>// {code}</span>
        <h3>{title}</h3>
      </div>
      <button>•••</button>
    </header>
  );
}
function Graph() {
  return (
    <div className="graph">
      {Array.from({ length: 44 }, (_, i) => (
        <i
          key={i}
          className={i % 3 ? "p" : ""}
          style={{
            left: `${8 + ((i * 37) % 84)}%`,
            top: `${8 + ((i * 53) % 82)}%`,
            width: 5 + (i % 5) * 2,
            height: 5 + (i % 5) * 2,
          }}
        />
      ))}
    </div>
  );
}
function Bars() {
  return (
    <div className="bars">
      {[28, 42, 36, 58, 51, 66, 60, 76, 68, 84, 77, 94].map((x, i) => (
        <i key={i} style={{ height: x + "%" }} />
      ))}
    </div>
  );
}
function Toolbar({ labels }: { labels: string[] }) {
  const [on, setOn] = useState(0);
  return (
    <div className="toolbar">
      <div>
        {labels.map((x, i) => (
          <button
            className={on == i ? "active" : ""}
            onClick={() => setOn(i)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <button className="primary">＋ 新建</button>
    </div>
  );
}
function Overview({ go, live }: { go: (s: string) => void; live: any }) {
  let stats = [
    ["RAW 素材", "987"],
    ["WIKI 页面", "90"],
    ["候选选题", "10"],
    ["已发布作品", "24"],
    ["总播放", "202,211"],
    ["运行档案", "207"],
  ];
  return (
    <>
      <div className="stats">
        {stats.map((x, i) => (
          <button
            onClick={() =>
              go(["sources", "wiki", "content", "content", "douyin", "runs"][i])
            }
            key={x[0]}
          >
            <small>{x[0]}</small>
            <strong className={i == 1 || i == 4 ? "purple" : ""}>{x[1]}</strong>
            <span>查看详情 →</span>
          </button>
        ))}
      </div>
      <div className="dash">
        <article className="panel graphcard" onClick={() => go("graph")}>
          <Head code="KNOWLEDGE GRAPH" title="正在生长的知识网络" />
          <Graph />
          <footer>
            90 个节点　326 条关系 <b>打开星图 →</b>
          </footer>
        </article>
        <div className="col">
          <article className="panel">
            <Head code="PIPELINE" title="生产动态" />
            {pipe.slice(0, 3).map((x, i) => (
              <div className="activity" key={x}>
                <i />
                <b>
                  {x}
                  <small>
                    {["待拍摄", "写稿中", "候选"][i]} · 匹配度 {92 - i * 4}
                  </small>
                </b>
              </div>
            ))}
          </article>
          <article className="panel dark">
            <Head code="TODAY'S FOCUS" title="把社媒洞察打磨成产品" />
            <p>评论区需求样本已积累 126 条</p>
            <button onClick={() => go("social")}>继续研究</button>
          </article>
        </div>
        <article className="panel">
          <Head code="SIGNALS" title="今日值得关注" />
          {[
            "个人 AI 工作台成为创作基础设施",
            "AI Agent 的长期记忆放在哪里？",
          ].map((x, i) => (
            <div className="signal" key={x}>
              <em>0{i + 1}</em>
              <b>
                {x}
                <small>与知识库和近期方向高度相关</small>
              </b>
              <strong>{96 - i * 5}</strong>
            </div>
          ))}
        </article>
        {live ? (
          <article className="panel finance" onClick={() => go("finance")}>
            <Head code="PORTFOLIO PULSE" title="持仓概况" />
            <small>根据本地交割单净额推断</small>
            <h2>{live.stats.holdings} 个正持仓</h2>
            <b>
              按最后成交价估算 ¥
              {live.holdings
                .reduce((n: number, h: any) => n + h.estimatedValue, 0)
                .toLocaleString()}
            </b>
            <p>不是实时总资产或今日盈亏，点击进入核对明细</p>
          </article>
        ) : (
          <article className="panel finance" onClick={() => go("finance")}>
            <Head code="PORTFOLIO PULSE" title="持仓概况" />
            <small>正在读取本地交割单</small>
            <h2>待核对</h2>
            <p>不展示未经确认的资产和盈亏数据</p>
          </article>
        )}
      </div>
    </>
  );
}
function Library({ id }: { id: string }) {
  return (
    <>
      <Toolbar labels={["全部", "最近更新", "待处理", "已归档"]} />
      <div className="cards">
        {data[id].map((x: any, i: number) => (
          <article key={x[0]}>
            <span>0{i + 1}</span>
            <i />
            <h3>{x[0]}</h3>
            <p>{x[1]}</p>
            <footer>
              刚刚更新 <b>{x[2]}</b>
            </footer>
          </article>
        ))}
      </div>
      <article className="panel timeline">
        <Head code="RECENT ACTIVITY" title="最近的知识流动" />
        {[
          "Codex 将 3 条阅读理解整理为 Wiki 候选",
          "你为证据层增加了一个反面案例",
          "2 条灵感已转为正式选题",
        ].map((x, i) => (
          <p key={x}>
            <time>{["10:24", "09:42", "昨天"][i]}</time>
            {x}
          </p>
        ))}
      </article>
    </>
  );
}
function Brain() {
  const [text, setText] = useState(""),
    [msgs, setMsgs] = useState<string[]>([]);
  return (
    <div className="brain">
      <section className="panel chat">
        <div className="context">
          已加载上下文　<b>8 篇 Wiki</b>　<b>12 份素材</b>
        </div>
        <div className="messages">
          <div className="me">个人工作台与普通知识库的本质区别是什么？</div>
          <div className="ai">
            <small>CODEX</small>
            <p>
              普通知识库解决“信息放在哪里”，个人工作台解决“下一步该做什么”。区别在于能否把输入、思考、行动和反馈串成闭环。
            </p>
          </div>
          {msgs.map((x) => (
            <div className="me" key={x}>
              {x}
            </div>
          ))}
        </div>
        <div className="composer">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="继续追问…"
          />
          <button
            onClick={() => {
              if (text) {
                setMsgs([...msgs, text]);
                setText("");
              }
            }}
          >
            发送
          </button>
        </div>
      </section>
      <aside>
        <article className="panel">
          <Head code="EMERGING IDEAS" title="讨论中的新观点" />
          <p>工作台的价值不在聚合，而在降低每次状态转换的摩擦。</p>
          <button className="outline">加入灵感库</button>
        </article>
        <article className="panel">
          <Head code="OPEN QUESTIONS" title="尚未解决" />
          <p>哪些环节必须保留人工判断？</p>
          <p>怎样衡量工作台带来的真实效率？</p>
        </article>
      </aside>
    </div>
  );
}
function Social() {
  return (
    <>
      <Toolbar labels={["洞察", "话题", "评论样本", "痛点"]} />
      <div className="insights">
        <article className="panel insight">
          <span>// TOP INSIGHT</span>
          <i>“</i>
          <h2>用户需要的不是另一个收藏工具，而是有人告诉他收藏之后做什么。</h2>
          <p>来自 126 条评论，其中 47% 提到“收藏后不再打开”。</p>
        </article>
        <div>
          {[
            "收藏很多，为什么仍然没有形成知识？",
            "AI 整理的内容我为什么不信？",
            "工作流太复杂，最后还是回到文件夹",
          ].map((x, i) => (
            <article className="panel pain" key={x}>
              <small>痛点 0{i + 1}</small>
              <h3>{x}</h3>
              <p>{38 - i * 9} 条原始评论支持</p>
              <button>查看证据 →</button>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
function Content() {
  const [moved, setMoved] = useState<string[]>([]);
  return (
    <>
      <Toolbar labels={["看板", "列表", "日历"]} />
      <div className="kanban">
        {["候选", "写稿中", "待拍摄", "已发布"].map((s, si) => (
          <section key={s}>
            <header>
              {s}
              <b>
                {
                  pipe.filter(
                    (x, i) =>
                      Math.min(i + (moved.includes(x) ? 1 : 0), 3) == si,
                  ).length
                }
              </b>
            </header>
            {pipe
              .filter(
                (x, i) => Math.min(i + (moved.includes(x) ? 1 : 0), 3) == si,
              )
              .map((x) => (
                <article key={x}>
                  <small>匹配度 92</small>
                  <h3>{x}</h3>
                  <p>关联 4 篇知识 · 6 条证据</p>
                  {si < 3 && (
                    <button onClick={() => setMoved([...moved, x])}>
                      推进到下一步 →
                    </button>
                  )}
                </article>
              ))}
          </section>
        ))}
      </div>
    </>
  );
}
function Analytics({ wx = false }: { wx?: boolean }) {
  return (
    <>
      <div className="metrics">
        {[
          [wx ? "总阅读" : "总播放", wx ? "68,430" : "202,211"],
          ["平均互动率", wx ? "6.8%" : "8.2%"],
          [wx ? "分享率" : "平均完播率", wx ? "4.1%" : "32.6%"],
        ].map((x) => (
          <article key={x[0]}>
            <small>{x[0]}</small>
            <strong>{x[1]}</strong>
            <span className="up">↑ 18.4%</span>
          </article>
        ))}
      </div>
      <div className="analytics">
        <article className="panel">
          <Head code="PERFORMANCE" title="内容表现趋势" />
          <Bars />
        </article>
        <article className="panel">
          <Head code="BEST CONTENT" title="表现最佳" />
          <div className="rank">
            01　<b>个人工作台不是另一个 Notion</b>
            <small>{wx ? "阅读 12,842" : "播放 46,820 · 完播 41%"}</small>
          </div>
          <div className="rank">
            02　<b>和自己的知识库头脑风暴</b>
            <small>{wx ? "阅读 9,315" : "播放 31,205 · 完播 38%"}</small>
          </div>
        </article>
      </div>
      <article className="panel review">
        <Head code="CODEX REVIEW" title="本周数据观察" />
        <p>
          开头直接展示成果的内容，前 5 秒留存平均高出
          11%。下一条建议加入更明确的使用前后对比。
        </p>
      </article>
    </>
  );
}
function Runs() {
  return (
    <>
      <div className="runstats">
        <span>● 索引服务正常</span>
        <b>
          207<small>累计运行</small>
        </b>
        <b>
          98.6%<small>成功率</small>
        </b>
        <b>
          12<small>待确认草稿</small>
        </b>
      </div>
      <article className="panel">
        {[
          "整理阅读笔记并生成 Wiki 候选",
          "分析今日社媒评论并提炼痛点",
          "更新持仓相关财经热点",
          "同步抖音作品数据",
        ].map((x, i) => (
          <div className="run" key={x}>
            <i />
            <b>
              {x}
              <small>
                {["素材 → Wiki", "社媒洞察", "财经中心", "抖音数据"][i]}
              </small>
            </b>
            <span>{i == 2 ? "待确认" : "完成"}</span>
            <time>{["10:24", "09:48", "09:31", "08:00"][i]}</time>
          </div>
        ))}
      </article>
    </>
  );
}
function LiveStrip({ d, active }: { d: any; active: string }) {
  const relevant = (
    active === "wiki"
      ? d.recent.filter((n: any) => /Thinking|ai相关|创作相关/.test(n.folder))
      : active === "sources" || active === "books"
        ? d.recent
        : d.recent
  ).slice(0, 3);
  return (
    <section className="livebox">
      <header>
        <span>
          <i />
          真实数据已连接
        </span>
        <b>
          {d.stats.notes} 篇笔记 · {d.stats.folders} 个目录 · 本机只读
        </b>
      </header>
      {active === "overview" ? (
        <div className="livestats">
          <div>
            <small>OBSIDIAN 笔记</small>
            <strong>{d.stats.notes}</strong>
          </div>
          <div>
            <small>财经分析</small>
            <strong>{d.stats.financeNotes}</strong>
          </div>
          <div>
            <small>推断持仓</small>
            <strong>{d.stats.holdings}</strong>
          </div>
          <div>
            <small>最近更新</small>
            <strong>
              {new Date(d.source.indexedAt).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </div>
        </div>
      ) : (
        <div className="livefiles">
          {relevant.map((n: any) => (
            <article key={n.relativePath}>
              <small>{n.folder}</small>
              <b>{n.title}</b>
              <p>{n.excerpt || "Markdown 笔记"}</p>
              <time>{new Date(n.updated).toLocaleString("zh-CN")}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function DeepSeekBrain() {
  const [cfg, setCfg] = useState<any>(null),
    [model, setModel] = useState("deepseek-v4-flash"),
    [input, setInput] = useState(""),
    [messages, setMessages] = useState<any[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const load = () =>
    fetch("/api/brainstorm", { cache: "no-store" })
      .then((r) => r.json())
      .then((x) => {
        setCfg(x);
        setModel(x.defaultModel || "deepseek-v4-flash");
      })
      .catch(() => setError("无法读取 DeepSeek 配置"));
  useEffect(() => {
    load();
  }, []);
  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setBusy(true);
    setError("");
    setInput("");
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((v) => [...v, { role: "user", content: q }]);
    try {
      const r = await fetch("/api/brainstorm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, model, history }),
        }),
        x = await r.json();
      if (!r.ok) throw new Error(x.error || "请求失败");
      setMessages((v) => [
        ...v,
        {
          role: "assistant",
          content: x.answer,
          sources: x.sources,
          usage: x.usage,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setBusy(false);
    }
  };
  if (!cfg)
    return (
      <article className="panel">
        <Head code="DEEPSEEK" title="正在读取配置" />
      </article>
    );
  return (
    <div className="deepBrain">
      <section className="panel deepChat">
        <div className="deepStatus">
          <span className={cfg.configured ? "ok" : "off"}>
            ● {cfg.configured ? "API Key 已配置" : "API Key 未配置"}
          </span>
          <span className={cfg.contextEnabled ? "ok" : "warn"}>
            ●{" "}
            {cfg.contextEnabled
              ? `已授权 ${cfg.allowedDirs.length} 个知识目录`
              : "知识库上下文未授权"}
          </span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {cfg.models.map((x: string) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="deepMessages">
          {messages.length === 0 && (
            <div className="welcome">
              <span>DEEPSEEK BRAINSTORM</span>
              <h2>从一个没想清楚的问题开始</h2>
              <p>
                {cfg.contextEnabled
                  ? "模型会检索白名单目录中的相关笔记，并在回答中标注来源。"
                  : "目前只进行普通对话，不会读取或发送任何 Obsidian 笔记。"}
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <article className={`deepMessage ${m.role}`} key={i}>
              <small>{m.role === "user" ? "你" : "DEEPSEEK"}</small>
              <p>{m.content}</p>
              {m.sources?.length > 0 && (
                <div className="sourceChips">
                  {m.sources.map((x: any) => (
                    <span key={x.id}>
                      来源{x.id} · {x.title}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
        {error && <div className="deepError">{error}</div>}
        <div className="composer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              cfg.configured
                ? "输入一个想和知识库讨论的问题…"
                : "请先在右侧配置 API Key"
            }
            disabled={!cfg.configured || busy}
          />
          <button onClick={send} disabled={!cfg.configured || busy}>
            {busy ? "思考中…" : "发送"}
          </button>
        </div>
      </section>
      <aside className="deepConfig">
        <article className="panel">
          <Head code="CONFIGURATION" title="DeepSeek 配置" />
          <div className="configRow">
            <small>API Key</small>
            <b>{cfg.configured ? "已检测到" : "尚未填写"}</b>
          </div>
          <div className="configRow">
            <small>配置文件</small>
            <code>{cfg.keyLocation}</code>
          </div>
          <div className="configRow">
            <small>默认模型</small>
            <b>{cfg.defaultModel}</b>
          </div>
          <button className="outline" onClick={load}>
            重新检测配置
          </button>
        </article>
        <article className="panel privacy">
          <Head code="PRIVACY" title="知识库授权" />
          <p>
            只有白名单目录的相关片段会发送到 DeepSeek。密码、Token、API Key
            类文件始终排除。
          </p>
          {cfg.allowedDirs.length ? (
            <ul>
              {cfg.allowedDirs.map((x: string) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : (
            <div className="noDirs">未授权任何目录</div>
          )}
          <small>修改 .env.local 后需要重启本地服务。</small>
        </article>
      </aside>
    </div>
  );
}
function ConnectionState({ status, detail }: { status: any; detail: string }) {
  return (
    <article className="panel empty">
      <span className="state-off">未连接真实数据</span>
      <h2>{status?.label || "数据源未配置"}</h2>
      <p>{detail}</p>
      <small>页面不会展示演示数字。连接数据源后会自动替换此状态。</small>
    </article>
  );
}
function VaultGraph({ d, compact = false }: { d: any; compact?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !d?.graph?.nodes) return;
    const nodes = d.graph.nodes,
      edges = d.graph.edges,
      index = new Map(nodes.map((n: any, i: number) => [n.id, i])),
      degree = Array(nodes.length).fill(0);
    edges.forEach((e: any) => {
      const a = index.get(e.source),
        b = index.get(e.target);
      if (a !== undefined && b !== undefined) {
        degree[a as number]++;
        degree[b as number]++;
      }
    });
    let chosen = -1,
      hover = -1;
    const layout = () => {
      const w = canvas.clientWidth,
        h = canvas.clientHeight,
        ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      const pts = nodes.map((_: any, i: number) => {
        const a = i * 2.3999632297,
          r = Math.sqrt((i + 1) / nodes.length) * Math.min(w, h) * 0.38;
        return {
          x: w / 2 + Math.cos(a) * r,
          y: h / 2 + Math.sin(a) * r,
          vx: 0,
          vy: 0,
        };
      });
      for (let step = 0; step < 110; step++) {
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            let dx = pts[j].x - pts[i].x,
              dy = pts[j].y - pts[i].y,
              q = dx * dx + dy * dy + 0.1,
              f = Math.min(1.8, 900 / q);
            pts[i].vx -= dx * f;
            pts[i].vy -= dy * f;
            pts[j].vx += dx * f;
            pts[j].vy += dy * f;
          }
        }
        for (const e of edges) {
          const ai = index.get(e.source) as number,
            bi = index.get(e.target) as number;
          if (ai === undefined || bi === undefined) continue;
          let a = pts[ai],
            b = pts[bi],
            dx = b.x - a.x,
            dy = b.y - a.y,
            dist = Math.sqrt(dx * dx + dy * dy) || 1,
            f = (dist - (compact ? 45 : 62)) * 0.0018;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        }
        for (const p of pts) {
          p.vx += (w / 2 - p.x) * 0.0015;
          p.vy += (h / 2 - p.y) * 0.0015;
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x = Math.max(18, Math.min(w - 18, p.x + p.vx));
          p.y = Math.max(18, Math.min(h - 18, p.y + p.vy));
        }
      }
      const ctx = canvas.getContext("2d")!;
      function draw(active = -1) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 0.7;
        for (const e of edges) {
          const ai = index.get(e.source) as number,
            bi = index.get(e.target) as number;
          if (ai === undefined || bi === undefined) continue;
          const hit = active === ai || active === bi;
          ctx.strokeStyle = hit
            ? "rgba(36,107,253,.78)"
            : "rgba(90,105,125,.18)";
          ctx.lineWidth = hit ? 1.5 : 0.65;
          ctx.beginPath();
          ctx.moveTo(pts[ai].x, pts[ai].y);
          ctx.lineTo(pts[bi].x, pts[bi].y);
          ctx.stroke();
        }
        pts.forEach((p: any, i: number) => {
          const r = Math.min(11, 3 + Math.sqrt(degree[i]) * 1.25);
          ctx.fillStyle =
            i === active ? "#0f54c7" : degree[i] ? "#377fe8" : "#aab2bd";
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          if (i === active && !compact) {
            ctx.font = "600 12px Arial";
            const text = nodes[i].title,
              tw = Math.min(260, ctx.measureText(text).width + 22),
              x = Math.min(w - tw - 8, Math.max(8, p.x - tw / 2)),
              y = Math.max(32, p.y - r - 13);
            ctx.fillStyle = "#172033";
            ctx.roundRect(x, y - 24, tw, 28, 7);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.fillText(text.slice(0, 32), x + 11, y - 6);
          }
        });
      }
      draw();
      const nearest = (ev: PointerEvent) => {
        const rect = canvas.getBoundingClientRect(),
          x = ev.clientX - rect.left,
          y = ev.clientY - rect.top;
        let best = -1,
          dist = 18;
        pts.forEach((p: any, i: number) => {
          const q = Math.hypot(p.x - x, p.y - y);
          if (q < dist) {
            dist = q;
            best = i;
          }
        });
        return best;
      };
      const move = (ev: PointerEvent) => {
        const n = nearest(ev);
        if (n !== hover) {
          hover = n;
          canvas.style.cursor = n >= 0 ? "pointer" : "default";
          draw(chosen >= 0 ? chosen : hover);
        }
      };
      const click = (ev: PointerEvent) => {
        chosen = nearest(ev);
        draw(chosen);
      };
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("click", click);
      return () => {
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("click", click);
      };
    };
    const cleanup = layout();
    return cleanup;
  }, [d, compact]);
  return (
    <canvas
      ref={ref}
      className={compact ? "vaultGraph compactGraph" : "vaultGraph"}
      aria-label={`Obsidian 关系图谱，${d.graph.nodes.length} 个节点，${d.graph.edges.length} 条真实连接`}
    />
  );
}
function RealOverview({ d, go }: { d: any; go: (x: string) => void }) {
  const st = [
    ["OBSIDIAN 笔记", d.stats.notes, "真实 Markdown"],
    ["知识链接", d.stats.links, "已解析关系"],
    ["内容文字稿", d.stats.scripts, "抖音目录"],
    ["已发布作品", d.stats.published, "已发布档案"],
    ["作品总播放", d.stats.totalPlays, "已核实作品合计"],
    ["财经分析", d.stats.financeNotes, "本地报告"],
  ];
  return (
    <>
      <div className="stats">
        {st.map((x: any, i) => (
          <button
            key={x[0]}
            onClick={() =>
              go(
                ["sources", "graph", "content", "content", "douyin", "finance"][
                  i
                ],
              )
            }
          >
            <small>{x[0]}</small>
            <strong className={i === 1 || i === 4 ? "purple" : ""}>
              {Number(x[1]).toLocaleString()}
            </strong>
            <span>{x[2]}</span>
          </button>
        ))}
      </div>
      <div className="dash">
        <article className="panel graphcard" onClick={() => go("graph")}>
          <Head code="REAL VAULT GRAPH" title="真实知识索引" />
          <VaultGraph d={d} compact />
          <footer>
            {d.graph.nodes.length} 个节点　{d.graph.edges.length} 条真实连接{" "}
            <b>查看星图 →</b>
          </footer>
        </article>
        <div className="col">
          <article className="panel">
            <Head code="RECENT FILES" title="最近更新" />
            {d.recent.slice(0, 4).map((n: any) => (
              <div className="activity" key={n.relativePath}>
                <i />
                <b>
                  {n.title}
                  <small>
                    {n.folder} · {new Date(n.updated).toLocaleString("zh-CN")}
                  </small>
                </b>
              </div>
            ))}
          </article>
          <article className="panel dark">
            <Head code="DATA HEALTH" title="真实数据连接状态" />
            <p>
              Obsidian、抖音复盘和财经项目已连接；公众号、社媒评论与 Codex
              对话尚未配置。
            </p>
          </article>
        </div>
        <article className="panel">
          <Head code="DOUYIN" title="最近作品表现" />
          {d.douyin.published.slice(0, 3).map((x: any, i: number) => (
            <div className="signal" key={x.title}>
              <em>0{i + 1}</em>
              <b>
                {x.title}
                <small>
                  点赞 {x.likes} · 收藏 {x.saves}
                </small>
              </b>
              <strong>{x.plays.toLocaleString()}</strong>
            </div>
          ))}
        </article>
        <article className="panel finance" onClick={() => go("finance")}>
          <Head code="PORTFOLIO" title="交割单推断持仓" />
          <small>不是券商实时资产</small>
          <h2>{d.holdings.length} 个正持仓</h2>
          <b>
            最后成交价估算 ¥
            {d.holdings
              .reduce((n: number, h: any) => n + h.estimatedValue, 0)
              .toLocaleString()}
          </b>
          <p>点击核对数量、成交价与风控提醒</p>
        </article>
      </div>
    </>
  );
}
function RealGraph({ d }: { d: any }) {
  return (
    <article className="panel fullgraph">
      <Head
        code="LIVE VAULT MAP"
        title={`${d.graph.nodes.length} 个节点 · ${d.graph.edges.length} 条真实关系`}
      />
      <VaultGraph d={d} />
      <aside>
        <b>来自 Obsidian WikiLink</b>
        <p>
          每条线都对应实际的
          [[双向链接]]；节点越大，连接越多。悬停或点击节点可查看标题。
        </p>
        <small>{d.graph.unresolved} 条链接未找到目标文件，未绘制</small>
      </aside>
    </article>
  );
}
function RealNotes({ d, mode }: { d: any; mode: string }) {
  let list = d.recent;
  if (mode === "wiki")
    list = d.recent.filter((n: any) =>
      /Thinking|ai相关|创作相关|财经/.test(n.folder),
    );
  if (mode === "sources")
    list = d.recent.filter((n: any) => !/Templates|Dashboard/.test(n.folder));
  return (
    <>
      <div className="sourceBadge">
        ● 数据来自 Obsidian Vault · {list.length} 条当前视图
      </div>
      <div className="cards">
        {list.slice(0, 12).map((n: any, i: number) => (
          <article key={n.relativePath}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <i />
            <h3>{n.title}</h3>
            <p>{n.excerpt || n.relativePath}</p>
            <footer>
              {n.folder}
              <b>{new Date(n.updated).toLocaleDateString("zh-CN")}</b>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}
function RealBooks({ d }: { d: any }) {
  return d.books.length ? (
    <div className="cards">
      {d.books.map((b: any, i: number) => (
        <article key={b.relativePath}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <h3>{b.title}</h3>
          <p>{b.relativePath}</p>
          <footer>
            本地文件<b>{new Date(b.updated).toLocaleDateString("zh-CN")}</b>
          </footer>
        </article>
      ))}
    </div>
  ) : (
    <ConnectionState
      status={{ label: "Vault 中未发现 EPUB、MOBI 或 PDF 书籍" }}
      detail="把书籍文件放入 Obsidian Vault 后，书架会自动读取真实文件；当前不展示虚构书名和进度。"
    />
  );
}
function RealIdeas({ d }: { d: any }) {
  return (
    <>
      <div className="sourceBadge">● 来自 03 Douyin/灵感/灵感收集箱.md</div>
      {d.douyin.ideas.length ? (
        <div className="cards">
          {d.douyin.ideas.map((x: string, i: number) => (
            <article key={x}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <i />
              <h3>{x}</h3>
              <p>真实 Obsidian 灵感条目</p>
              <footer>
                灵感收集箱<b>待发展</b>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <ConnectionState
          status={{ label: "灵感收集箱当前没有可解析条目" }}
          detail="新增列表项后会自动显示。"
        />
      )}
    </>
  );
}
function RealContent({ d }: { d: any }) {
  return (
    <div className="kanban">
      <section>
        <header>
          灵感<b>{d.douyin.ideas.length}</b>
        </header>
        {d.douyin.ideas.map((x: string) => (
          <article key={x}>
            <h3>{x}</h3>
            <p>来自真实灵感收集箱</p>
          </article>
        ))}
      </section>
      <section>
        <header>
          文字稿<b>{d.douyin.scripts.length}</b>
        </header>
        {d.douyin.scripts.slice(0, 6).map((x: any) => (
          <article key={x.relativePath}>
            <h3>{x.title}</h3>
            <p>{new Date(x.updated).toLocaleDateString("zh-CN")}</p>
          </article>
        ))}
      </section>
      <section>
        <header>
          待拍<b>0</b>
        </header>
        <article>
          <p>选题目录目前只有 Dataview 看板，没有独立选题笔记。</p>
        </article>
      </section>
      <section>
        <header>
          已发布<b>{d.douyin.published.length}</b>
        </header>
        {d.douyin.published.slice(0, 6).map((x: any) => (
          <article key={x.title}>
            <small>播放 {x.plays.toLocaleString()}</small>
            <h3>{x.title}</h3>
            <p>{x.duration || "时长待补充"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
function RealDouyin({ d }: { d: any }) {
  const r = d.douyin.latestReview?.meta || {};
  return (
    <>
      <div className="metrics">
        <article>
          <small>已归档作品</small>
          <strong>{d.stats.published}</strong>
          <span>真实作品档案</span>
        </article>
        <article>
          <small>作品播放合计</small>
          <strong>{d.stats.totalPlays.toLocaleString()}</strong>
          <span>8 条已核实档案</span>
        </article>
        <article>
          <small>最近周复盘播放</small>
          <strong>
            {r.plays ? Number(r.plays).toLocaleString() : "未提供"}
          </strong>
          <span>{r.period || "口径见复盘"}</span>
        </article>
        <article>
          <small>最近完播率</small>
          <strong>{r.completion_rate || "未提供"}</strong>
          <span>来自创作者中心复盘</span>
        </article>
      </div>
      <div className="analytics">
        <article className="panel">
          <Head code="VERIFIED CONTENT" title="真实作品数据" />
          {d.douyin.published.map((x: any, i: number) => (
            <div className="rank" key={x.title}>
              {String(i + 1).padStart(2, "0")}　<b>{x.title}</b>
              <small>
                播放 {x.plays.toLocaleString()} · 点赞 {x.likes} · 评论{" "}
                {x.comments} · 分享 {x.shares} · 收藏 {x.saves}
              </small>
            </div>
          ))}
        </article>
        <article className="panel">
          <Head
            code="LATEST REVIEW"
            title={d.douyin.latestReview?.title || "暂无复盘"}
          />
          <p className="reviewText">
            {d.douyin.latestReview?.excerpt || "未找到真实复盘内容"}
          </p>
          <small>{r.period || ""}</small>
        </article>
      </div>
    </>
  );
}
function RealRuns({ d }: { d: any }) {
  return (
    <>
      <div className="runstats">
        <span>● 本地索引正常</span>
        <b>
          {d.stats.notes}
          <small>已索引笔记</small>
        </b>
        <b>
          {d.stats.links}
          <small>知识链接</small>
        </b>
        <b>
          {new Date(d.source.indexedAt).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          <small>本次扫描</small>
        </b>
      </div>
      <article className="panel">
        <Head
          code="FILE ACTIVITY"
          title="真实文件活动（不是 Codex 运行日志）"
        />
        {d.recent.slice(0, 10).map((n: any) => (
          <div className="run" key={n.relativePath}>
            <i />
            <b>
              {n.title}
              <small>{n.relativePath}</small>
            </b>
            <span>已更新</span>
            <time>{new Date(n.updated).toLocaleDateString("zh-CN")}</time>
          </div>
        ))}
      </article>
      <ConnectionState
        status={d.statuses.codex}
        detail="目前没有可读取的 Codex 运行日志接口，所以不展示成功率、运行次数或待确认草稿等虚构指标。"
      />
    </>
  );
}
function RealFinance({ d }: { d: any }) {
  const [tab, setTab] = useState(0);
  return (
    <>
      <div className="toolbar">
        <div>
          {["财经热点", "个人持仓", "下一步行动"].map((x, i) => (
            <button
              className={tab === i ? "active" : ""}
              onClick={() => setTab(i)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <span className="connected">● 已连接财经项目</span>
      </div>
      {tab === 0 && (
        <div>
          {d.financeNotes.slice(0, 8).map((n: any, i: number) => (
            <article className="news" key={n.relativePath}>
              <em>0{i + 1}</em>
              <div>
                <small>本地分析</small>
                <h3>{n.title}</h3>
                <p>{n.excerpt || n.relativePath}</p>
              </div>
              <time>{new Date(n.updated).toLocaleDateString("zh-CN")}</time>
            </article>
          ))}
        </div>
      )}
      {tab === 1 && (
        <>
          <div className="portfolio">
            <small>根据交割单净额推断</small>
            <h2>{d.holdings.length} 个当前正持仓</h2>
            <p>估值使用最后一笔成交价，不等于实时市值</p>
          </div>
          <div className="holdings">
            <div>
              <span>证券</span>
              <span>数量</span>
              <span>最后成交价</span>
              <span>估算金额</span>
            </div>
            {d.holdings.map((h: any) => (
              <div key={h.code}>
                <span>
                  {h.name}
                  <small>{h.code}</small>
                </span>
                <span>{h.quantity.toLocaleString()}</span>
                <span>¥{h.lastPrice.toFixed(3)}</span>
                <span>¥{h.estimatedValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === 2 && (
        <div className="actions">
          {d.actions.map((a: any) => (
            <article key={a.title}>
              <small>{a.priority}</small>
              <h3>{a.title}</h3>
              <p>{a.reason}</p>
              <footer>
                置信度 {a.confidence}% <button>加入研究任务 →</button>
              </footer>
            </article>
          ))}
        </div>
      )}
      <p className="disclaimer">
        来自本地财经项目和交割单，只读分析，不连接交易执行。
      </p>
    </>
  );
}

const themes = [
  ["white", "白"],
  ["black", "黑"],
  ["blue", "蓝"],
  ["green", "绿"],
];

function UploadCenter({ target, onDone }: { target: string; onDone: () => void }) {
  const [open, setOpen] = useState(false), [files, setFiles] = useState<FileList | null>(null),
    [token, setToken] = useState(""), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => setToken(sessionStorage.getItem("workbench-write-token") || ""), []);
  const upload = async () => {
    if (!files?.length || !token || busy) return;
    setBusy(true); setMessage("");
    const form = new FormData();
    form.set("target", target);
    Array.from(files).forEach((file) => form.append("files", file));
    try {
      const response = await fetch("/api/upload", { method: "POST", headers: { "x-workbench-token": token }, body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "上传失败");
      sessionStorage.setItem("workbench-write-token", token);
      setMessage(`已保存 ${result.saved.length} 个文件到服务器`);
      setFiles(null); onDone();
    } catch (error) { setMessage(error instanceof Error ? error.message : "上传失败"); }
    finally { setBusy(false); }
  };
  return <>
    <button className="uploadOpen" onClick={() => setOpen(true)}>↑ 上传到当前模块</button>
    {open && createPortal(<div className="modalShade" onClick={() => setOpen(false)}>
      <section className="uploadModal" onClick={(event) => event.stopPropagation()}>
        <button className="modalClose" onClick={() => setOpen(false)}>×</button>
        <small>// SERVER UPLOAD</small><h2>上传到「{mods.find((item) => item[0] === target)?.[2]}」</h2>
        <p>文件会分类保存到服务器；单个文件不超过 25MB，每次最多 20 个。</p>
        <label className="dropzone"><input type="file" multiple onChange={(event) => setFiles(event.target.files)} />
          <b>{files?.length ? `已选择 ${files.length} 个文件` : "选择文件或拖到这里"}</b>
          <span>支持 Markdown、JSON、CSV、TSV、XLS/XLSX、PDF、电子书与图片</span>
        </label>
        <label className="tokenField">上传口令<input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="服务器 WORKBENCH_WRITE_TOKEN" /></label>
        {message && <p className="uploadMessage">{message}</p>}
        <button className="primary uploadSubmit" disabled={!files?.length || !token || busy} onClick={upload}>{busy ? "正在上传…" : "安全上传"}</button>
      </section>
    </div>, document.body)}
  </>;
}

function SocialAccount({ platform }: { platform: "douyin" | "wechat" | "xiaohongshu" }) {
  const [state, setState] = useState<any>(null), [message, setMessage] = useState("");
  const load = () => fetch("/api/social-sync", { cache: "no-store" }).then((r) => r.json()).then((x) => setState(x.platforms?.find((p: any) => p.id === platform)));
  useEffect(() => { load().catch(() => setMessage("无法读取接口状态")); }, [platform]);
  const sync = async () => {
    const token = sessionStorage.getItem("workbench-write-token") || prompt("请输入上传口令") || "";
    if (!token) return;
    setMessage("正在同步…");
    const response = await fetch("/api/social-sync", { method: "POST", headers: { "x-workbench-token": token } });
    const result = await response.json();
    setMessage(response.ok ? "同步任务已完成" : result.error || "同步失败"); load();
  };
  return <article className="panel accountSync">
    <div><small>// ACCOUNT API</small><h3>{state?.label || "账号数据"}</h3><p>{state?.configured ? `接口已配置${state.lastSync ? ` · 最近同步 ${new Date(state.lastSync).toLocaleString("zh-CN")}` : " · 等待首次同步"}` : "尚未配置官方接口或数据中转地址"}</p></div>
    <button className="outline" onClick={sync} disabled={!state?.configured}>立即同步</button>
    {message && <span>{message}</span>}
  </article>;
}

export default function Home() {
  const [active, setActive] = useState("overview"),
    [q, setQ] = useState(""),
    [live, setLive] = useState<any>(null),
    [theme, setTheme] = useState("white");
  const refresh = () => fetch("/api/workbench", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then(setLive);
  useEffect(() => {
    setActive(localStorage.getItem("wb") || "overview");
    setTheme(localStorage.getItem("workbench-theme") || "white");
    refresh().catch(() => setLive(null));
  }, []);
  const go = (x: string) => {
    setActive(x);
    localStorage.setItem("wb", x);
  };
  let m = mods.find((x) => x[0] == active) || mods[0],
    view: any;
  if (!live)
    view = (
      <article className="panel">
        <Head code="LOCAL DATA" title="正在读取真实数据" />
      </article>
    );
  else if (active === "overview") view = <RealOverview d={live} go={go} />;
  else if (active === "graph") view = <RealGraph d={live} />;
  else if (active === "wiki" || active === "sources")
    view = <RealNotes d={live} mode={active} />;
  else if (active === "books") view = <RealBooks d={live} />;
  else if (active === "brain") view = <DeepSeekBrain />;
  else if (active === "trends") view = <RealTrends />;
  else if (active === "social")
    view = (
      <ConnectionState
        status={live.statuses.social}
        detail="Vault 中未发现结构化帖子或评论数据。需要平台导出、采集文件或授权接口。"
      />
    );
  else if (active === "ideas") view = <RealIdeas d={live} />;
  else if (active === "content") view = <RealContent d={live} />;
  else if (active === "douyin") view = <><SocialAccount platform="douyin" /><RealDouyin d={live} /></>;
  else if (active === "wechat") view = <SocialAccount platform="wechat" />;
  else if (active === "xiaohongshu") view = <SocialAccount platform="xiaohongshu" />;
  else if (active === "finance") view = <RealFinance d={live} />;
  else view = <RealRuns d={live} />;
  return (
    <div className="shell" data-theme={theme}>
      <aside className="side">
        <div className="brand">
          <b>W</b>
          <div>
            <strong>小黑工作台</strong>
            <small>PERSONAL AI WORKBENCH</small>
          </div>
        </div>
        <nav>
          {mods.map((x) => (
            <button
              className={active == x[0] ? "active" : ""}
              onClick={() => go(x[0])}
              key={x[0]}
            >
              <i>{x[1]}</i>
              {x[2]}
            </button>
          ))}
        </nav>
        <footer>
          <i />
          文件已实时同步
        </footer>
      </aside>
      <main>
        <header className="top">
          <span>// PERSONAL AI WORKBENCH · 8月5日 星期三</span>
          <div className="topActions">
            <div className="themePicker" aria-label="主题颜色">
              {themes.map(([id, label]) => <button key={id} className={theme === id ? "active" : ""} data-color={id} onClick={() => { setTheme(id); localStorage.setItem("workbench-theme", id); }}>{label}</button>)}
            </div>
            <UploadCenter target={active} onDone={refresh} />
          </div>
          <label>
            ⌕
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索知识库"
            />
            {q && (
              <div>
                {mods
                  .filter((x) => x[2].includes(q))
                  .map((x) => (
                    <button
                      key={x[0]}
                      onClick={() => {
                        go(x[0]);
                        setQ("");
                      }}
                    >
                      {x[2]}
                    </button>
                  ))}
              </div>
            )}
          </label>
        </header>
        <section className="title">
          <div>
            <h1>{m[3]}</h1>
            <p>{m[4]}</p>
          </div>
          <span>
            <i />
            本地 VAULT
          </span>
          <b>索引实时</b>
        </section>
        {live && active !== "finance" && <LiveStrip d={live} active={active} />}{" "}
        {view}
      </main>
    </div>
  );
}
