# @mdevs/mai-server

该模块包含 mAI 服务器应用程序的后端服务、tRPC 路由器、系统配置和工作流。

## 📁 项目结构

- **`src/featureFlags`**: 功能标志 (feature flags) 的管理与评估。
- **`src/globalConfig`**: 服务器的全局系统配置。
- **`src/routers`**: 定义向客户端暴露安全且类型安全的 tRPC 路由器。
- **`src/services`**: 内部基础设施服务（例如，邮件服务、数据库）。
- **`src/workflows`**: 使用 Upstash/QStash 的异步工作流和队列任务管理。

## 🚀 开发与验证

对服务器项目进行 TypeScript 类型检查：

```bash
pnpm type-check
```
