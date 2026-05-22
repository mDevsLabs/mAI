# API en webhooks 🔗

**mAI** biedt programmeerbare interfaces om externe integraties met uw eigen applicaties, webservices of automatiseringsscripts mogelijk te maken.

## Lokale API (HTTP)

De mAI-desktopapp kan een beveiligde lokale webserver op een aangewezen poort uitvoeren. Deze server stelt verschillende eindpunten beschikbaar:
- `POST /api/chat`: Stuurt een bericht naar een specifieke agent en retourneert een gestructureerd antwoord (ondersteunt standaard- of streamingformaat).
- `GET /api/agents`: Geeft een lijst van alle beschikbare agenten en hun configuraties.
- `POST /api/agents`: Maakt het mogelijk om programmatisch een nieuwe agent te maken.

## Integratie van webhooks

U kunt uitgaande webhooks configureren in de geavanceerde instellingen van mAI. Een webhook plaatst automatisch een JSON-payload naar een externe URL wanneer specifieke gebeurtenissen plaatsvinden:
- **Chatbericht voltooid**: Geactiveerd zodra een agent klaar is met het genereren van een antwoord.
- **Agent gemaakt**: Geactiveerd wanneer een nieuw agentprofiel wordt toegevoegd.
- **Systeemfout**: Geactiveerd tijdens problemen met API-sleutelvalidatie of uitval van de LLM-provider.
