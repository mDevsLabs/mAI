# 开发指南 🛠️

本指南为希望为 **mAI** 项目做出贡献或在开发模式下运行源代码的开发人员提供基本说明。

## 项目结构

mAI 结构为一个现代的单体大仓 (Monorepo)（利用 pnpm 和 Turborepo）：
- `apps/web`：主要的 Next.js 应用。
- `packages/`：共享模块和可重用的配置（UI 组件、类型、辅助函数）。

## 在开发模式下运行

1. **前提条件**：确保您已安装 Node.js（推荐 LTS 版本）以及 pnpm 或 bun。
2. **安装依赖**：
   ```bash
   pnpm install
   ```
3. **启动开发服务器**：
   ```bash
   pnpm run dev
   ```
   应用将在本地通过 `http://localhost:3000` 进行访问。

## 测试

我们使用 **Vitest** 运行我们的测试套件：
- 运行一次测试：`pnpm run test`
- 在观察模式下运行测试：`pnpm run test:watch`

在提交任何修改之前，请确保所有测试均成功通过。
