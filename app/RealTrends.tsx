"use client";
import { useEffect, useState } from "react";
import styles from "./trends.module.css";

export default function RealTrends() {
  const [data, setData] = useState<any>(null),
    [active, setActive] = useState(""),
    [error, setError] = useState("");
  const load = () => {
    setError("");
    fetch("/api/hot", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok && !result.sources)
          throw new Error(result.error || "热点服务不可用");
        setData(result);
        setActive(
          (current: string) =>
            current ||
            result.sources?.find(
              (source: any) => source.ok && source.items.length,
            )?.id ||
            "",
        );
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "热点服务不可用"),
      );
  };
  useEffect(() => load(), []);
  if (error)
    return (
      <article className="panel empty">
        <span className="state-off">连接失败</span>
        <h2>本地热点服务暂时不可用</h2>
        <p>{error}</p>
        <button className="outline" onClick={load}>
          重新连接
        </button>
      </article>
    );
  if (!data)
    return (
      <article className="panel empty">
        <span className="connected">● 正在连接</span>
        <h2>正在汇总今日热点</h2>
        <p>读取微博、知乎、抖音、B站与 36氪。</p>
      </article>
    );
  const source =
    data.sources.find((item: any) => item.id === active) || data.sources[0];
  return (
    <>
      <div className={`toolbar ${styles.toolbar}`}>
        <div>
          {data.sources.map((item: any) => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => setActive(item.id)}
            >
              {item.label}
              <i
                className={
                  item.ok && item.items.length ? styles.on : styles.off
                }
              />
            </button>
          ))}
        </div>
        <button className="primary" onClick={load}>
          ↻ 刷新热点
        </button>
      </div>
      <div className={styles.meta}>
        <span className="connected">● DailyHotApi 本地服务已连接</span>
        <span>
          {source?.updateTime
            ? `更新于 ${new Date(source.updateTime).toLocaleString("zh-CN")}`
            : "等待数据"}
          {source?.fromCache ? " · 缓存" : ""}
        </span>
      </div>
      {source?.ok && source.items.length ? (
        <div className={styles.list}>
          {source.items.map((item: any) => (
            <a
              className={styles.item}
              key={`${source.id}-${item.rank}-${item.title}`}
              href={item.url || source.link}
              target="_blank"
              rel="noreferrer"
            >
              <em>{String(item.rank).padStart(2, "0")}</em>
              <div>
                <h3>{item.title}</h3>
                {item.desc && <p>{item.desc}</p>}
              </div>
              {item.hot !== null && item.hot !== undefined && (
                <strong>
                  {typeof item.hot === "number"
                    ? item.hot.toLocaleString()
                    : item.hot}
                </strong>
              )}
              <span>↗</span>
            </a>
          ))}
        </div>
      ) : (
        <article className="panel empty">
          <span className="state-off">当前来源不可用</span>
          <h2>{source?.label} 暂未返回热点</h2>
          <p>{source?.error || "可以稍后重试，其他已连接平台仍可正常查看。"}</p>
        </article>
      )}
    </>
  );
}
