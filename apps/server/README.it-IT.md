# @mdevs/mai-server

Questo modulo contiene i servizi backend, i router tRPC, le configurazioni di sistema e i flussi di lavoro per l'applicazione server mAI.

## 📁 Struttura del Progetto

- **`src/featureFlags`**: Gestione e valutazione dei feature flags.
- **`src/globalConfig`**: Configurazioni di sistema globali per il server.
- **`src/routers`**: Definizione di router tRPC che espongono API sicure e tipizzate al client.
- **`src/services`**: Servizi di infrastruttura interna (es. servizio email, database).
- **`src/workflows`**: Flussi di lavoro asincroni e gestione delle code con Upstash/QStash.

## 🚀 Sviluppo e Validazione

Per eseguire il controllo dei tipi TypeScript sul progetto server:

```bash
pnpm type-check
```
