# mAI 架构 🏗️

**mAI** 应用基于专为高性能、可扩展性和可维护性设计的现代架构构建。它采用单体大仓 (Monorepo) 结构进行组织。

## 关键技术栈

- **核心框架**：Next.js（采用 App Router）用于渲染和路由。
- **状态管理**：Zustand 用于轻量且响应式的客户端状态控制。
- **设计与 UI**：Ant Design 组件，并使用 `antd-style` 和 `@lobehub/ui` 进行样式设计。
- **数据库**：本地使用 SQLite（或在生产环境中使用 PostgreSQL），由 Drizzle ORM 管理。

## 单体大仓 (Monorepo) 结构

代码库在 `packages/` 目录下被划分为可重用的包：
- `packages/const`：全局常量和配置。
- `packages/builtin-agents`：默认系统智能体（包括 May）。
- `packages/database`：数据模型、Drizzle 模式（schemas）和迁移文件。
- `packages/types`：共享 savings TypeScript 类型定义。

这种分离将核心业务逻辑（例如运行模型 API 请求或管理插件）与位于 `src/` 的主 Web 用户界面分离开来。
