# Databasebeheer 🗄️

**mAI** beheert de gegevensopslag op een gestructureerde en uiterst efficiënte manier om snelle, offline toegang tot uw gesprekken en configuraties te garanderen.

## Opslagarchitectuur

Afhankelijk van de runtime-omgeving (Desktop of Web) maakt mAI gebruik van verschillende opslag-engines:
- **Desktopapplicatie**: Maakt gebruik van een lichtgewicht lokale database (SQLite) die is opgeslagen in de gebruikersmap van de applicatie. Het garandeert uitstekende lees-/schrijfprestaties voor grote hoeveelheden geschiedenis.
- **Webapplicatie**: Vertrouwt op de interne database van de browser (IndexedDB) of externe API-services die zijn gesynchroniseerd met een PostgreSQL-database als de cloudmodus is ingeschakeld.

## Schemamigraties

mAI bevat een automatisch database-schemamigratiesysteem. Bij elke applicatie-update worden migraties, als de databasestructuur verandert (bijv. het toevoegen van een nieuw veld aan agenten of berichten), naadloos uitgevoerd bij het opstarten zonder uw bestaande gegevens te wijzigen.

## Prestatie-optimalisatie

Om de applicatie snel te houden:
- **Automatische opruiming**: Tijdelijke berichten of verlopen sessies kunnen periodiek worden opgeschoond.
- **Indexering**: Gespreksberichten worden geïndexeerd om vrijwel onmiddellijk tekstzoeken mogelijk te maken.
