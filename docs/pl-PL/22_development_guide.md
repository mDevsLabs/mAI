# Przewodnik Dewelopera 🛠️

Ten przewodnik zawiera podstawowe instrukcje dla programistów, którzy chcą wnieść swój wkład w projekt **mAI** lub uruchomić kod źródłowy w trybie deweloperskim.

## Struktura Projektu

mAI ma strukturę nowoczesnego monorepo (wykorzystującego pnpm i Turborepo):
- `apps/web`: Główna aplikacja Next.js.
- `packages/`: Współdzielone moduły i konfiguracje wielokrotnego użytku (komponenty UI, typy, funkcje pomocnicze).

## Uruchamianie w Trybie Deweloperskim

1. **Wymagania wstępne**: Upewnij się, że masz zainstalowane Node.js (zalecana wersja LTS) oraz pnpm lub bun.
2. **Instalacja zależności**:
   ```bash
   pnpm install
   ```
3. **Uruchomienie serwera deweloperskiego**:
   ```bash
   pnpm run dev
   ```
   Aplikacja będzie dostępna lokalnie pod adresem `http://localhost:3000`.

## Testowanie

Do naszych zestawów testów używamy **Vitest**:
- Uruchomienie testów raz: `pnpm run test`
- Uruchomienie testów w trybie nasłuchiwania (watch): `pnpm run test:watch`

Przed przesłaniem jakichkolwiek modyfikacji upewnij się, że wszystkie testy zakończyły się pomyślnie.
