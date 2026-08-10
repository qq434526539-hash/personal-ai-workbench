import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "小黑的个人工作台",
  description: "以 Obsidian 为知识底座，由 Codex 驱动的个人工作台。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
