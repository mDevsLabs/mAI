# Gestione del database 🗄️

**mAI** gestisce l'archiviazione dei propri dati in modo strutturato e performante per garantire un accesso rapido e offline a conversazioni e configurazioni.

## Architettura di archiviazione

A seconda dell'ambiente di esecuzione (Desktop o Web), mAI utilizza motori di archiviazione diversi:
- **Applicazione Desktop**: Utilizza un database locale leggero (SQLite) memorizzato nella directory dell'utente. Garantisce eccellenti prestazioni di lettura e scrittura per grandi quantità di messaggi.
- **Applicazione Web**: Si affida al database interno del browser (IndexedDB) o a servizi API esterni sincronizzati con un database PostgreSQL se la modalità cloud è attiva.

## Migrazioni dello schema

mAI include un sistema di migrazione automatica dello schema del database. A ogni aggiornamento dell'applicazione, le modifiche allo schema vengono eseguite in modo trasparente all'avvio, senza alterare i dati esistenti.
