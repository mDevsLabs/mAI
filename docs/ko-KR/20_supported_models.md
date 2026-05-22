# 지원되는 언어 모델 🧠

**mAI**는 특정 모델에 의존하지 않는 독립적인 인터페이스입니다. 다양한 상용 클라우드 기반 제공업체 및 로컬 오픈소스 인공지능 모델을 지원합니다.

## 주요 클라우드 제공업체

개인 API 키를 입력하여 다음 클라우드 제공업체를 구성할 수 있습니다.
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 등.
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku.
- **Google Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash.
- **Mistral AI**: Mistral Large, Mistral Medium, Codestral.
- **Groq**: Llama 3 및 Mixtral과 같은 오픈소스 모델에 대한 초고속 액세스 지원.

## 로컬 모델 통합

데이터의 완전한 개인정보 보호를 중시하는 사용자를 위해 mAI는 로컬 실행을 전적으로 지원합니다.
- **Ollama**: 간소화된 네이티브 통합 제공. 백그라운드에서 Ollama를 실행하면 mAI가 로컬에 설치된 모델(예: Llama 3, Mistral 또는 Phi-3)을 자동으로 감지합니다.
- **OpenAI 호환 API**: 맞춤형 API 베이스 URL을 지정하여 모든 로컬 또는 원격 추론 서버(예: LocalAI 또는 LM Studio)를 연결할 수 있습니다.
