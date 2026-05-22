# サポートされている言語モデル 🧠

**mAI** はモデルに依存しないインターフェースです。商業用のクラウドベースおよびローカルのオープンソース人工知能プロバイダーの多様なモデルをサポートしています。

## 主要なクラウドプロバイダー

個人用のAPIキーを入力することで、以下のクラウドプロバイダーを構成できます：
- **OpenAI**：GPT-4o、GPT-4 Turbo、GPT-3.5など。
- **Anthropic**：Claude 3.5 Sonnet、Claude 3 Opus、Claude 3 Haiku。
- **Google Gemini**：Gemini 1.5 Pro、Gemini 1.5 Flash。
- **Mistral AI**：Mistral Large、Mistral Medium、Codestral。
- **Groq**：Llama 3やMixtralなどのオープンソースモデルへの超高速アクセス。

## ローカルモデルの統合

データの完全なプライバシーを重視するユーザーのために、mAIはローカルでの実行を完全にサポートしています：
- **Ollama**：簡素化されたネイティブ統合。バックグラウンドでOllamaを実行すると、mAIはローカルにインストールされたモデル（Llama 3、Mistral、Phi-3など）を自動的に検出します。
- **OpenAI互換API**：カスタムのAPIベースURLを指定することで、任意のローカルまたはリモートの推論サーバー（LocalAIやLM Studioなど）に接続します。
