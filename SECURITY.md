# Security Policy

## 支持范围

当前项目处于早期版本阶段，只维护默认分支的最新代码。

## 报告安全问题

请通过 GitHub 仓库的 **Security → Report a vulnerability** 私下报告。不要在公开 Issue 中粘贴：

- API Key、Token、Cookie 或密码
- 本机用户名、绝对路径或网络配置
- Obsidian 笔记、交割单或平台导出数据
- 能读取他人本地文件的完整利用细节

报告中请包含受影响版本、复现步骤、影响范围和建议修复方式。维护者确认问题前，请不要公开披露。

## 部署边界

本项目默认面向个人电脑上的本地使用。`/api/workbench`、`/api/brainstorm` 和 `/api/hot` 有意限制为 `localhost`。如果要部署到公网，必须重新设计身份验证、授权、密钥管理和本地数据访问方式。
