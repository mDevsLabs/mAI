# 🤯 mAI 桌面应用程序

mAI Desktop 是 [mAI](https://github.com/mDevsLabs/mAI) 的跨平台桌面应用程序，使用 Electron 构建，提供了更加原生的桌面体验和功能。

## ✨ 功能特点

- **🌍 跨平台支持**：支持 macOS (Intel/Apple Silicon)、Windows 和 Linux 系统
- **🔄 自动更新**：内置更新机制，确保您始终使用最新版本
- **🌐 多语言支持**：完整的 i18n 支持，包含 18+ 种语言的懒加载
- **🎨 原生集成**：与操作系统深度集成，提供原生菜单、快捷键和通知
- **🔒 安全可靠**：macOS 公证认证，加密令牌存储，安全的 OAuth 流程
- **📦 多渠道发布**：提供稳定版、测试版和每日构建版本
- **⚡ 高级窗口管理**：多窗口架构，支持主题同步
- **🔗 远程服务器同步**：与远程 mAI 实例的安全数据同步
- **🎯 开发者工具**：内置开发面板和全面的调试工具

## 🚀 开发环境设置

### 前提条件

- **Node.js** 22+
- **pnpm** 10+
- **Electron** 兼容的开发环境

### 快速开始

```bash
# 安装依赖
pnpm install-isolated

# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 运行测试
pnpm test
```

### 环境变量配置

复制 `.env.desktop` 到 `.env` 并根据需要配置：

```bash
cp .env.desktop .env
```

> [!WARNING]
> 在进行更改之前请备份您的 `.env` 文件，避免丢失配置。

### 构建命令

| 命令                       | 描述                               |
| -------------------------- | ---------------------------------- |
| `pnpm build:main`          | 构建 main/preload（仅产出 dist）   |
| `pnpm package:mac`         | 打包 macOS (Intel + Apple Silicon) |
| `pnpm package:win`         | 打包 Windows                       |
| `pnpm package:linux`       | 打包 Linux                         |
| `pnpm package:local`       | 本地打包（不打 ASAR）              |
| `pnpm package:local:reuse` | 本地打包，复用现有 dist            |

### 开发工作流

```bash
# 1. 开发
pnpm dev # 开启热重载运行

# 2. 代码质量
pnpm lint       # ESLint 检查
pnpm format     # Prettier 格式化
pnpm type-check # TypeScript 验证

# 3. 测试
pnpm test # 运行 Vitest 测试
```

## 🎯 发布渠道

| 渠道        | 描述                                 | 稳定性   | 自动更新 |
| ----------- | ------------------------------------ | -------- | -------- |
| **Stable**  | 经过完整测试的稳定版本               | 🟢 高    | ✅ 是    |
| **Beta**    | 包含新功能的预发布版本               | 🟡 中等  | ✅ 是    |
| **Nightly** | 包含最新变更的每日构建版本           | 🟠 较低  | ✅ 是    |

## 🛠 技术栈

- **Electron** `37.1.0` - 跨平台桌面框架
- **Node.js** `22+` - 后端运行环境
- **TypeScript** `5.7+` - 类型安全开发
- **Vite** `6.2+` - 构建工具

## 🏗 架构设计

桌面应用采用了复杂的依赖注入和事件驱动架构：

### 📁 核心结构

```
src/main/core/
├── App.ts                    # 🎯 应用主进程编排器
├── IoCContainer.ts           # 🔌 依赖注入容器
├── window/                   # 🪟 窗口管理模块
│   ├── WindowThemeManager.ts     # 🎨 主题同步
│   ├── WindowPositionManager.ts  # 📐 窗口位置持久化
│   ├── WindowErrorHandler.ts     # ⚠️  错误边界处理
│   └── WindowConfigBuilder.ts    # ⚙️  配置构建器
└── infrastructure/           # 🔧 基础设施服务
    ├── StoreManager.ts          # 💾 配置存储
    ├── I18nManager.ts           # 🌍 国际化管理
    └── StaticFileServerManager.ts # 🗂️ 本地静态文件服务器
```

## 🔒 安全特性

- **OAuth 2.0 + PKCE** 安全令牌交换流程。
- **加密令牌存储**：使用操作系统原生的安全凭据管理器加密保存敏感信息。
- **应用代码签名**：完成 macOS 公证，确保应用安全可信。
