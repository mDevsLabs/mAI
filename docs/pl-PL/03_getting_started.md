# Pierwsze Kroki ⚡

Ten przewodnik pomoże Ci skonfigurować i uruchomić **mAI** lokalnie na Twojej maszynie deweloperskiej.

## Wymagania wstępne

Upewnij się, że masz zainstalowane:
- **Node.js** (zalecana wersja v18 lub wyższa)
- **pnpm** lub **bun** do zarządzania pakietami i przestrzenią roboczą

## Instalacja

1. **Sklonuj repozytorium**:
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mAI
   ```

2. **Zainstaluj zależności**:
   Używając pnpm:
   ```bash
   pnpm install
   ```
   Używając bun:
   ```bash
   bun install
   ```

3. **Uruchom serwer deweloperski**:
   ```bash
   pnpm dev
   # lub
   bun run dev
   ```

Aplikacja będzie dostępna w przeglądarce pod adresem `http://localhost:3010`. Przy pierwszym uruchomieniu powita Cię **May**, Twój główny asystent, aby pomóc Ci skonfigurować wstępne preferencje!
