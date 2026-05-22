# Guida allo sviluppo 🛠️

Questa guida fornisce istruzioni di base per gli sviluppatori che desiderano contribuire al progetto **mAI** o eseguire il codice sorgente in modalità di sviluppo.

## Struttura del progetto

mAI è strutturato come un moderno monorepo (utilizzando pnpm e Turborepo):
- `apps/web`: L'applicazione Next.js principale.
- `packages/`: Moduli condivisi e configurazioni riutilizzabili (componenti dell'interfaccia utente, tipi, helper).

## Esecuzione in modalità Sviluppo

1. **Prerequisiti**: Assicurati di avere Node.js (versione LTS consigliata) e pnpm installati.
2. **Installa le dipendenze**:
   ```bash
   pnpm install
   ```
3. **Avvia il server di sviluppo**:
   ```bash
   pnpm run dev
   ```
   L'applicazione sarà accessibile localmente all'indirizzo `http://localhost:3000`.

## Test

Utilizziamo **Vitest** per le nostre suite di test:
- Esegui i test una volta: `pnpm run test`
- Esegui i test in modalità watch: `pnpm run test:watch`
