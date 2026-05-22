# Ontwikkelingshandleiding 🛠️

Deze handleiding bevat basisinstructies voor ontwikkelaars die willen bijdragen aan het **mAI** project of de broncode in ontwikkelingsmodus willen uitvoeren.

## Projectstructuur

mAI is gestructureerd als een moderne monorepo (met gebruik van pnpm en Turborepo):
- `apps/web`: De primaire Next.js-applicatie.
- `packages/`: Gedeelde modules en herbruikbare configuraties (UI-componenten, typen, helpers).

## Uitvoeren in ontwikkelingsmodus

1. **Vereisten**: Zorg ervoor dat u Node.js (LTS-versie aanbevolen) en pnpm of bun hebt geïnstalleerd.
2. **Afhankelijkheden installeren**:
   ```bash
   pnpm install
   ```
3. **Ontwikkelingsserver starten**:
   ```bash
   pnpm run dev
   ```
   De applicatie is lokaal toegankelijk op `http://localhost:3000`.

## Testen

We gebruiken **Vitest** voor onze testsuites:
- Voer tests eenmalig uit: `pnpm run test`
- Voer tests uit in watch-modus: `pnpm run test:watch`

Zorg ervoor dat alle tests met succes slagen voordat u wijzigingen indient.
