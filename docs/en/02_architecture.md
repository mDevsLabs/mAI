# mAI Architecture 🏗️

The **mAI** application is built on a modern architecture designed for performance, extensibility, and maintainability. It is structured as a monorepo.

## Key Technologies

- **Core Framework**: Next.js (with App Router) for rendering and routing.
- **State Management**: Zustand for lightweight and reactive client-side state control.
- **Design & UI**: Ant Design components styled with `antd-style` and `@lobehub/ui`.
- **Database**: SQLite locally (or PostgreSQL in production) managed by Drizzle ORM.

## Monorepo Structure

The codebase is divided into reusable packages under the `packages/` directory:
- `packages/const`: Global constants and configurations.
- `packages/builtin-agents`: Default system agents (including May).
- `packages/database`: Data models, Drizzle schemas, and migrations.
- `packages/types`: Shared TypeScript type definitions.

This separation isolates core business logic (such as running model API requests or managing plugins) from the main web user interface located in `src/`.
