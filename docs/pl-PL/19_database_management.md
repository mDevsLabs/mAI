# Zarządzanie Bazą Danych 🗄️

**mAI** zarządza przechowywaniem swoich danych w uporządkowany i wysoce wydajny sposób, aby zagwarantować szybki dostęp offline do Twoich rozmów i konfiguracji.

## Architektura Przechowywania Danych

W zależności od środowiska wykonawczego (Desktop lub Web), mAI wykorzystuje różne silniki przechowywania danych:
- **Aplikacja Desktopowa**: Korzysta z lekkiej lokalnej bazy danych (SQLite) przechowywanej w katalogu użytkownika aplikacji. Gwarantuje to doskonałą wydajność odczytu/zapisu przy dużych wolumenach historii.
- **Aplikacja Internetowa (Web)**: Opiera się na wewnętrznej bazie danych przeglądarki (IndexedDB) lub zewnętrznych usługach API zsynchronizowanych z bazą danych PostgreSQL, jeśli włączony jest tryb chmury.

## Migracje Schematu

mAI zawiera automatyczny system migracji schematu bazy danych. Przy każdej aktualizacji aplikacji, jeśli struktura bazy danych ulegnie zmianie (np. dodanie nowego pola do agentów lub wiadomości), migracje są uruchamiane płynnie przy starcie, bez modyfikowania istniejących danych.

## Optymalizacja Wydajności

Aby utrzymać szybkie działanie aplikacji:
- **Automatyczne Oczyszczanie**: Wiadomości tymczasowe lub wygasłe sesje mogą być okresowo usuwane.
- **Indeksowanie**: Wiadomości konwersacji są indeksowane, co umożliwia niemal natychmiastowe wyszukiwanie tekstowe.
