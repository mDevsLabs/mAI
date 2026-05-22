# Architektura mAI 🏗️

Aplikacja **mAI** jest zbudowana na nowoczesnej architekturze zaprojektowanej z myślą o wydajności, rozszerzalności i łatwości utrzymania. Jest ona zorganizowana jako monorepo.

## Kluczowe technologie

- **Główny framework**: Next.js (z App Router) do renderowania i routingu.
- **Zarządzanie stanem**: Zustand do lekkiej i reaktywnej kontroli stanu po stronie klienta.
- **Design i interfejs użytkownika**: Komponenty Ant Design stylizowane za pomocą `antd-style` i `@lobehub/ui`.
- **Baza danych**: SQLite lokalnie (lub PostgreSQL na produkcji) zarządzana przez Drizzle ORM.

## Struktura Monorepo

Kod źródłowy jest podzielony na pakiety wielokrotnego użytku w katalogu `packages/`:
- `packages/const`: Globalne stałe i konfiguracje.
- `packages/builtin-agents`: Domyślni agenci systemowi (w tym May).
- `packages/database`: Modele danych, schematy Drizzle i migracje.
- `packages/types`: Współdzielone definicje typów TypeScript.

Ten podział izoluje główną logikę biznesową (taką jak wykonywanie żądań API do modeli czy zarządzanie wtyczkami) od głównego interfejsu użytkownika sieci Web znajdującego się w `src/`.
