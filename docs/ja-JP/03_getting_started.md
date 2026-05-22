# はじめに ⚡

このガイドは、開発用マシンで **mAI** をローカルにセットアップして実行するのに役立ちます。

## 前提条件

以下がインストールされていることを確認してください。
- **Node.js**（v18以降を推奨）
- **pnpm** または **bun**（パッケージおよびワークスペース管理用）

## インストール

1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mAI
   ```

2. **依存関係のインストール**:
   pnpmの場合:
   ```bash
   pnpm install
   ```
   bunの場合:
   ```bash
   bun install
   ```

3. **開発サーバーの起動**:
   ```bash
   pnpm dev
   # または
   bun run dev
   ```

アプリケーションはブラウザの `http://localhost:3010` からアクセスできます。最初の起動時に、コアアシスタントである **May** があなたを歓迎し、初期設定をガイドします！
