# @mdevs/mai-cli

mAI 命令行界面 (CLI)。

## 本地开发

| 任务 | 命令 |
| --- | --- |
| 在开发模式下运行 | `bun run dev -- <command>` |
| 构建 CLI | `bun run build` |
| 将 `mai` 链接到你的 shell 中 | `bun run cli:link` |
| 移除全局链接 | `bun run cli:unlink` |

- `bun run build` 仅生成 `dist/index.js`。
- 要在 shell 中使用 `mai`，请运行 `bun run cli:link`。
- 链接后，如果您的 shell 仍然找不到 `mai`，请在 `zsh` 中运行 `rehash`。

## 自定义服务器 URL

默认情况下，CLI 连接到 `https://mai-officiel.vercel.app`。要将其指向不同的服务器（例如本地实例）：

| 方法 | 命令 | 持久化 |
| --- | --- | --- |
| 环境变量 | `MAI_SERVER=http://localhost:4000 bun run dev -- <command>` | 仅当前命令 |
| 登录标志 | `mai login --server http://localhost:4000` | 保存至 `~/.mai/settings.json` |

优先级：`MAI_SERVER` 环境变量 > `settings.json` > 默认官方 URL。
