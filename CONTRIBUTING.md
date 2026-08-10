# Contributing

感谢你改进 Personal AI Workbench。

## 开始之前

- 不要提交真实的 Vault、交割单、平台导出、日志或 API Key。
- 新数据源必须默认关闭，并在没有配置时安全降级。
- 本地文件能力必须保留 `localhost` 限制和最小权限原则。
- 财经功能只能提供只读分析，不得自动执行交易。

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows CMD 使用：

```cmd
copy .env.example .env.local
npm run dev
```

## 提交变更

1. Fork 仓库并创建功能分支。
2. 只提交与改动相关的文件。
3. 运行 `npm test` 和 `npm audit --omit=dev --audit-level=high`。
4. 在 Pull Request 中说明改了什么、为什么改、如何验证。

安全问题不要创建公开 Issue，请按 [SECURITY.md](SECURITY.md) 报告。
