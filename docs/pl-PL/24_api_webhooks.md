# API i Webhooki 🔗

**mAI** udostępnia interfejsy programistyczne umożliwiające zewnętrzną integrację z Twoimi własnymi aplikacjami, usługami sieciowymi lub skryptami automatyzacji.

## Lokalne API (HTTP)

Aplikacja desktopowa mAI może uruchomić bezpieczny lokalny serwer WWW na wyznaczonym porcie. Serwer ten udostępnia kilka punktów końcowych (endpoints):
- `POST /api/chat`: Wysyła wiadomość do konkretnego agenta i zwraca ustrukturyzowaną odpowiedź (obsługuje format standardowy lub strumieniowy).
- `GET /api/agents`: Listuje wszystkich dostępnych agentów oraz ich konfiguracje.
- `POST /api/agents`: Umożliwia programowe utworzenie nowego agenta.

## Integracja Webhooków

Możesz skonfigurować webhooki wychodzące w zaawansowanych ustawieniach mAI. Webhook automatycznie wysyła ładunek JSON (payload) na zewnętrzny adres URL w przypadku wystąpienia określonych zdarzeń:
- **Zakończenie wiadomości czatu**: Wyzwalane, gdy tylko agent skończy generować odpowiedź.
- **Utworzenie agenta**: Wyzwalane po dodaniu nowego profilu agenta.
- **Błąd systemu**: Wyzwalane podczas problemów z walidacją klucza API lub przerw w działaniu dostawcy LLM.
