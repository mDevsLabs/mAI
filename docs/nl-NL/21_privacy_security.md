# Privacy en beveiliging 🔒

Gegevensbeveiliging en respect voor uw privacy zijn fundamentele principes bij het ontwerp van **mAI**.

## Gecodeerde lokale opslag

Al uw gevoelige gegevens worden lokaal op uw apparaat opgeslagen:
- **API-sleutels**: Ze worden gecodeerd met behulp van industriestandaard algoritmen voordat ze in uw lokale opslag worden opgeslagen. Uw API-sleutels worden nooit naar onze servers verzonden; ze worden rechtstreeks vanaf uw apparaat naar de respectieve LLM-provider-servers verzonden.
- **Chatgeschiedenis**: Uw gesprekken blijven op uw machine (tenzij u expliciet beveiligde cloud-synchronisatie inschakelt).

## Beveiligde verbindingen

Alle uitgaande verzoeken naar taalmodel-API's maken gebruik van beveiligde communicatieprotocollen (HTTPS / SSL), wat garandeert dat de uitgewisselde gegevens niet via het netwerk kunnen worden onderschept.

## Aanbevolen bedrijfspraktijken

Voor het hoogste beveiligingsniveau in bedrijfsomgevingen:
- Gebruik modellen die lokaal worden gehost via **Ollama** of een particuliere inference-server (wat betekent dat er geen gegevens het bedrijfsnetwerk verlaten).
- Meld u af voor anonieme telemetrie in het tabblad met algemene instellingen.
