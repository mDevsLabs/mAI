# 支持的语言模型 🧠

**mAI** 是一个与模型无关的接口。它支持各种商业云端和本地开源人工智能提供商。

## 主要云端提供商

您可以通过输入您的个人 API 密钥来配置以下云端提供商：
- **OpenAI**：GPT-4o、GPT-4 Turbo、GPT-3.5 等。
- **Anthropic**：Claude 3.5 Sonnet、Claude 3 Opus、Claude 3 Haiku。
- **Google Gemini**：Gemini 1.5 Pro、Gemini 1.5 Flash。
- **Mistral AI**：Mistral Large、Mistral Medium、Codestral。
- **Groq**：极速访问 Llama 3 和 Mixtral 等开源模型。

## 本地模型集成

对于关心数据完全隐私的用户，mAI 完全支持本地执行：
- **Ollama**：简化的原生集成。在后台运行 Ollama，mAI 将自动检测您在本地安装的模型（如 Llama 3、Mistral 或 Phi-3）。
- **兼容 OpenAI 的 API**：通过指定自定义 API 基础 URL 来连接任何本地或远程推理服务器（例如 LocalAI 或 LM Studio）。
