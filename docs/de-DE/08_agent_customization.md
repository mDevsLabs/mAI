# Agenten-Konfiguration ⚙️

Die Feinabstimmung von Agenten in **mAI** ermöglicht es Ihnen, ihr Verhalten, ihren Antwortstil und die Werkzeuge, auf die sie zugreifen können, tiefgreifend zu verändern.

## Grundeinstellungen

Für jeden Agenten können Sie konfigurieren:
- **System-Prompt**: Die grundlegenden Anweisungen, die die Persönlichkeit, Regeln und Rolle des Agenten definieren. Dies ist die einflussreichste Einstellung für die Antworten des Agenten.
- **Sprachmodell**: Wählen Sie das standardmäßig zu verwendende LLM aus (z. B. GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Erweiterte Einstellungen

Sie können auch Hyperparameter für die Generierung ändern:
- **Temperatur**: Steuert die Kreativität der Antworten. Eine niedrigere Temperatur (z. B. 0.2) führt zu sachlicheren Antworten. Eine höhere Temperatur (z. B. 0.9) fördert die Kreativität.
- **Top P**: Eine weitere Methode zur Steuerung der Antwortvielfalt.
- **Präsenz- / Frequenzstrafe**: Ermutigt oder entmutigt den Agenten, dieselben Wörter zu wiederholen oder vom Thema abzuweichen.
- **Max Tokens**: Begrenzt die maximale Länge der generierten Antwort.
