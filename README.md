# Personal AI Workbench

[![CI](https://github.com/qq434526539-hash/personal-ai-workbench/actions/workflows/ci.yml/badge.svg)](https://github.com/qq434526539-hash/personal-ai-workbench/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

你可以直接克隆这个仓库，也可以点击 GitHub 的 **Use this template** 创建一份完全属于自己的工作台。

一个以本地文件为数据底座的个人 AI 工作台，把知识、内容创作、热点、作品复盘和财经研究放进同一套可追溯流程。

> 这个仓库只包含应用代码，不包含你的 Obsidian Vault、交割单、作品数据、API Key 或其他本机资料。

## 能做什么

- 扫描本地 Obsidian Markdown 笔记，展示目录、最近更新与双向链接图谱
- 管理抖音灵感、文字稿、已发布作品和复盘记录
- 读取本地财经研究资料，并从交割单推断持仓供人工核对
- 使用 DeepSeek 与明确授权的知识库目录进行头脑风暴
- 聚合微博、知乎、抖音、B站和 36氪的每日热点
- 对未连接的数据源明确显示空状态，不用演示数字冒充真实数据

## 设计原则

1. **本机优先**：本地数据接口只接受 `localhost` 请求。
2. **最小授权**：DeepSeek 只能读取 `BRAINSTORM_ALLOW_DIRS` 白名单中的 Markdown 文件。
3. **敏感文件排除**：文件名包含密码、Token、Secret、API Key 等关键词时自动跳过。
4. **只读分析**：财经模块不连接交易执行；展示的持仓和估值需要人工核对。
5. **真实数据优先**：没有数据源就展示未连接状态。

## 技术栈

- Next.js 16 / React 19 / TypeScript
- Vinext / Vite / Cloudflare Worker 构建
- Drizzle ORM（数据库目前为可选能力）
- DailyHotApi（独立的本地热点服务）

## 环境要求

- Node.js `>=22.13.0`
- npm
- 可选：DeepSeek API Key
- 可选：[DailyHotApi](https://github.com/imsyy/DailyHotApi)

## 本地启动

```bash
npm install
copy .env.example .env.local
npm run dev
```

打开 <http://localhost:3010>。

macOS 或 Linux 可用：

```bash
cp .env.example .env.local
```

## 配置

编辑 `.env.local`：

```dotenv
OBSIDIAN_VAULT=D:/path/to/your/obsidian-vault
FINANCE_PROJECT=D:/path/to/your/finance-project

DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
BRAINSTORM_ALLOW_DIRS=

DAILYHOT_API_URL=http://127.0.0.1:6688
```

### Obsidian

`OBSIDIAN_VAULT` 指向 Vault 根目录。工作台只读取文件，不修改 Vault。

如果 Vault 中存在 `03 Douyin`，应用会识别以下可选目录：

- `灵感`
- `文字稿`
- `已发布`
- `数据复盘`

### DeepSeek

`BRAINSTORM_ALLOW_DIRS` 使用英文逗号分隔 Vault 内的相对目录。留空时，DeepSeek 不会收到任何本地笔记。例如：

```dotenv
BRAINSTORM_ALLOW_DIRS=01 Wiki,03 Douyin/文字稿
```

不要把 `.env.local` 提交到 Git；它已被 `.gitignore` 排除。

### 每日热点

DailyHotApi 独立运行在本机。没有 Docker 时可以使用 Node.js：

```bash
git clone https://github.com/imsyy/DailyHotApi.git
cd DailyHotApi
npm install
npm run build
npm run start
```

默认服务地址为 <http://127.0.0.1:6688>。工作台会从服务端读取微博、知乎、抖音、B站和 36氪数据。

## 验证

```bash
npm run build
npm test
```

Windows 本地开发默认使用 Next.js；生产构建使用 Vinext。

## 数据与隐私

以下内容不会被仓库包含：

- `.env.local` 和其他环境配置
- Obsidian Vault
- 财经项目和交割单
- `node_modules`、构建目录、缓存和日志
- DeepSeek API Key 或其他凭据

把项目部署到公网前需要重新设计身份验证和数据访问策略。当前本地文件接口有意限制为 `localhost`，这个项目优先面向个人电脑上的本地使用场景。

## 项目结构

```text
app/
  api/brainstorm/   DeepSeek 与知识库检索
  api/hot/          DailyHotApi 聚合
  api/workbench/    本地知识、内容和财经数据
  page.tsx          工作台界面
  RealTrends.tsx    每日热点界面
worker/             Cloudflare Worker 入口
db/                 可选 Drizzle 数据层
```

## License

本项目使用 [MIT License](LICENSE)。使用本项目时请自行遵守所接入数据源、平台和第三方 API 的服务条款。
