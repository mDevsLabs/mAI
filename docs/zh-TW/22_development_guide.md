# 開發指南 🛠️

本指南為希望對 **mAI** 專案做出貢獻或在開發模式下運行原始碼的開發人員提供基本指令。

## 專案結構

mAI 的結構為一個現代的 monorepo（使用 pnpm 和 Turborepo）：
- `apps/web`：主要的 Next.js 應用程式。
- `packages/`：共享模組與可重複使用的配置（UI 組件、型別、輔助工具）。

## 在開發模式下運行

1. **先決條件**：請確保您已安裝 Node.js（建議安裝 LTS 版本）以及 pnpm 或 bun。
2. **安裝依賴項**：
   ```bash
   pnpm install
   ```
3. **啟動開發伺服器**：
   ```bash
   pnpm run dev
   ```
   應用程式將可以在本地透過 `http://localhost:3000` 進行存取。

## 測試

我們使用 **Vitest** 作為我們的測試套件：
- 執行一次測試：`pnpm run test`
- 在監聽模式（watch mode）下執行測試：`pnpm run test:watch`

在提交任何修改之前，請確保所有測試皆成功通過。
