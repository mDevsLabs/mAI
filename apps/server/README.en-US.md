# @mdevs/mai-server

This module contains the backend services, tRPC routers, system configurations, and workflows for the mAI server application.

## 📁 Project Structure

- **`src/featureFlags`**: Management and evaluation of feature flags.
- **`src/globalConfig`**: Global system configurations for the server.
- **`src/routers`**: Definition of tRPC routers exposing secure, type-safe APIs to the client.
- **`src/services`**: Internal infrastructure services (e.g., email service, databases).
- **`src/workflows`**: Asynchronous workflows and queue management using Upstash/QStash.

## 🚀 Development & Validation

To perform TypeScript type-checking for the server project:

```bash
pnpm type-check
```
