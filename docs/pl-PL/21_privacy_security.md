# Prywatność i Bezpieczeństwo 🔒

Bezpieczeństwo danych i szacunek dla Twojej prywatności to fundamentalne zasady leżące u podstaw projektowania **mAI**.

## Szyfrowana Pamięć Lokalna

Wszystkie Twoje wrażliwe dane są przechowywane lokalnie na Twoim urządzeniu:
- **Klucze API**: Są szyfrowane przy użyciu standardowych algorytmów branżowych przed zapisaniem w pamięci lokalnej. Twoje klucze API nigdy nie są wysyłane na nasze serwery; są one przesyłane bezpośrednio z Twojego urządzenia na serwery odpowiednich dostawców LLM.
- **Historia Czatu**: Twoje rozmowy pozostają na Twoim urządzeniu (chyba że jawnie włączysz bezpieczną synchronizację z chmurą).

## Bezpieczne Połączenia

Wszystkie żądania wychodzące do API modeli językowych korzystają z bezpiecznych protokołów komunikacyjnych (HTTPS / SSL), co gwarantuje, że wymieniane dane nie mogą zostać przechwycone w sieci.

## Zalecane Praktyki dla Przedsiębiorstw

Aby zapewnić najwyższy poziom bezpieczeństwa w środowiskach korporacyjnych:
- Korzystaj z modeli hostowanych lokalnie przez **Ollama** lub prywatny serwer inferencyjny (co oznacza, że żadne dane nie opuszczają sieci firmowej).
- Zrezygnuj z anonimowej telemetrii w karcie ustawień ogólnych.
