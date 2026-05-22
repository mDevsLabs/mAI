# mAI 架構 🏗️

**mAI** 應用程式構建於現代架構之上，旨在實現高效能、擴展性與可維護性。它以單一程式庫（monorepo）的形式進行組織。

## 關鍵技術

- **核心框架**：Next.js（使用 App Router）用於渲染與路由。
- **狀態管理**：Zustand 用於輕量且響應式的用戶端狀態控制。
- **設計與 UI**：使用 `antd-style` 和 `@lobehub/ui` 樣式的 Ant Design 組件。
- **資料庫**：本地 SQLite（或生產環境中的 PostgreSQL），由 Drizzle ORM 管理。

## Monorepo 結構

程式碼庫被劃分為 `packages/` 目錄下的可重複使用套件：
- `packages/const`：全域常量與配置。
- `packages/builtin-agents`：預設系統智慧體（包括 May）。
- `packages/database`：資料模型、Drizzle 綱要（schemas）與遷移（migrations）。
- `packages/types`：共享的 TypeScript 型別定義。

這種分離將核心業務邏輯（例如運行模型 API 請求或管理外掛程式）與位於 `src/` 中的主要網頁使用者介面隔離開來。
