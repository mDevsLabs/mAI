# API e Webhook 🔗

**mAI** fornisce interfacce di programmazione per consentire integrazioni esterne con le tue applicazioni, servizi web o script di automazione.

## API Locale (HTTP)

L'app desktop mAI può eseguire un server web locale sicuro su una porta designata. Questo server espone diversi endpoint:
- `POST /api/chat`: Invia un messaggio a un agente specifico e restituisce una risposta strutturata.
- `GET /api/agents`: Elenca tutti gli agenti disponibili e le loro configurazioni.
- `POST /api/agents`: Consente di creare un nuovo agente a livello di codice.

## Integrazione Webhook

Puoi configurare webhook in uscita nelle impostazioni avanzate di mAI. Un webhook invia automaticamente un payload JSON a un URL esterno ogni volta che si verificano eventi specifici (ad esempio al termine della generazione di una risposta).
