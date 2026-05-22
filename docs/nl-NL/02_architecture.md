# mAI Architectuur 🏗️

De **mAI** applicatie is gebouwd op een moderne architectuur die is ontworpen voor prestaties, uitbreidbaarheid en onderhoudbaarheid. Het is gestructureerd als een monorepo.

## Belangrijkste technologieën

- **Core Framework**: Next.js (met App Router) voor rendering en routing.
- **State Management**: Zustand voor lichtgewicht en reactieve controle over de client-side state.
- **Design & UI**: Ant Design componenten gestyled met `antd-style` en `@lobehub/ui`.
- **Database**: SQLite lokaal (of PostgreSQL in productie) beheerd door Drizzle ORM.

## Monorepo structuur

De codebase is opgedeeld in herbruikbare pakketten onder de directory `packages/`:
- `packages/const`: Globale constanten en configuraties.
- `packages/builtin-agents`: Standaard systeemagenten (inclusief May).
- `packages/database`: Datamodellen, Drizzle-schema's en migraties.
- `packages/types`: Gedeelde TypeScript type-definities.

Deze scheiding isoleert de kern-bedrijfslogica (zoals het uitvoeren van model-API-verzoeken of het beheren van plug-ins) van de primaire web-gebruikersinterface in `src/`.
