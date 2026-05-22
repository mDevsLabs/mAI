# 支援的語言模型 🧠

**mAI** 是一個獨立於模型的介面。它支援各種商業雲端以及本地開源的人工智慧提供商。

## 主要雲端提供商

您可以透過輸入個人 API 金鑰來配置以下雲端提供商：
- **OpenAI**：GPT-4o、GPT-4 Turbo、GPT-3.5 等。
- **Anthropic**：Claude 3.5 Sonnet、Claude 3 Opus、Claude 3 Haiku。
- **Google Gemini**：Gemini 1.5 Pro、Gemini 1.5 Flash。
- **Mistral AI**：Mistral Large、Mistral Medium、Codestral。
- **Groq**：極速存取開源模型，例如 Llama 3 和 Mixtral。

## 本地模型整合

對於關心資料完全隱私的使用者，mAI 完整支援本地執行：
- **Ollama**：簡化的原生整合。在背景運行 Ollama，mAI 將自動偵測您在本地安裝的模型（例如 Llama 3、Mistral 或 Phi-3）。
- **相容 OpenAI 的 API**：透過指定自訂 API 基礎 URL，連接任何本地或遠端推論伺服器（例如本地 AI/LocalAI 或 LM Studio）。
