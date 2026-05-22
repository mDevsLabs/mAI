# API 与 Webhooks 🔗

**mAI** 提供了编程接口，以允许与您自己的应用程序、Web 服务或自动化脚本进行外部集成。

## 本地 API (HTTP)

mAI 桌面端应用可以在指定端口上运行一个安全的本地 Web 服务器。该服务器公开了几个接口 (endpoints)：
- `POST /api/chat`：向特定智能体发送消息并返回结构化响应（支持标准或流式/streaming格式）。
- `GET /api/agents`：列出所有可用的智能体及其配置。
- `POST /api/agents`：允许以编程方式创建新的智能体。

## Webhooks 集成

您可以在 mAI 的高级设置中配置传出 Webhooks。一旦发生特定事件，Webhook 就会自动向外部 URL 发送 JSON 载荷 (payload)：
- **聊天消息完成**：一旦智能体完成生成响应，立即触发。
- **智能体已创建**：在添加新的智能体配置文件时触发。
- **系统错误**：在 API 密钥验证问题或 LLM 提供商故障期间触发。
