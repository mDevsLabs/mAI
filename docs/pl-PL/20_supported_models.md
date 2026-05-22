# Obsługiwane Modele Językowe 🧠

**mAI** jest interfejsem niezależnym od modeli. Obsługuje szeroką gamę komercyjnych dostawców chmurowych oraz lokalnych, otwartych dostawców sztucznej inteligencji (open-source).

## Główni Dostawcy Chmurowi

Możesz skonfigurować następujących dostawców chmurowych, wprowadzając swój osobisty klucz API:
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 itp.
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku.
- **Google Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash.
- **Mistral AI**: Mistral Large, Mistral Medium, Codestral.
- **Groq**: Błyskawiczny dostęp do modeli open-source, takich jak Llama 3 i Mixtral.

## Integracja z Modelami Lokalnymi

Dla użytkowników dbających o całkowitą prywatność swoich danych, mAI w pełni obsługuje uruchamianie lokalne:
- **Ollama**: Uproszczona natywna integracja. Uruchom Ollama w tle, a mAI automatycznie wykryje Twoje lokalnie zainstalowane modele (takie jak Llama 3, Mistral lub Phi-3).
- **Interfejsy API zgodne z OpenAI**: Połącz dowolny lokalny lub zdalny serwer inferencyjny (taki jak LocalAI lub LM Studio), określając niestandardowy bazowy adres URL API.
