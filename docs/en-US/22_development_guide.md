# Development Guide 🛠️

This guide provides basic instructions for developers who want to contribute to the **mAI** project or run the source code in development mode.

## Project Structure

mAI is structured as a modern monorepo (utilizing pnpm and Turborepo):
- `apps/web`: The main Next.js application.
- `packages/`: Shared modules and reusable configurations (UI components, types, helpers).

## Running in Development Mode

1. **Prerequisites**: Make sure you have Node.js (LTS version recommended) and pnpm or bun installed.
2. **Install Dependencies**:
   ```bash
   pnpm install
   ```
3. **Start Dev Server**:
   ```bash
   pnpm run dev
   ```
   The application will be accessible locally at `http://localhost:3000`.

## Testing

We use **Vitest** for our test suites:
- Run tests once: `pnpm run test`
- Run tests in watch mode: `pnpm run test:watch`

Please make sure all tests pass successfully before submitting any modifications.
