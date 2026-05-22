# Aan de slag ⚡

Deze handleiding helpt u bij het lokaal instellen en uitvoeren van **mAI** op uw ontwikkelmachine.

## Vereisten

Zorg ervoor dat u het volgende hebt geïnstalleerd:
- **Node.js** (v18 of hoger aanbevolen)
- **pnpm** of **bun** voor pakket- en werkruimtebeheer

## Installatie

1. **Kloon de repository**:
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mAI
   ```

2. **Installeer afhankelijkheden**:
   Met pnpm:
   ```bash
   pnpm install
   ```
   Met bun:
   ```bash
   bun install
   ```

3. **Start de ontwikkelingsserver**:
   ```bash
   pnpm dev
   # of
   bun run dev
   ```

De applicatie is toegankelijk in uw browser op `http://localhost:3010`. Bij uw eerste start wordt u verwelkomd door **May**, uw centrale assistent, om uw eerste voorkeuren te configureren!
