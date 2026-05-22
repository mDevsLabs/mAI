# Başlarken ⚡

Bu kılavuz, **mAI** uygulamasını geliştirme makinenizde yerel olarak kurup çalıştırmanıza yardımcı olur.

## Ön Koşullar

Aşağıdakilerin kurulu olduğundan emin olun:
- **Node.js** (v18 veya daha yüksek bir sürüm önerilir)
- **pnpm** veya **bun** (paket ve çalışma alanı yönetimi için)

## Kurulum

1. **Depoyu klonlayın**:
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mAI
   ```

2. **Bağımlılıkları yükleyin**:
   pnpm ile:
   ```bash
   pnpm install
   ```
   bun ile:
   ```bash
   bun install
   ```

3. **Geliştirme sunucusunu çalıştırın**:
   ```bash
   pnpm dev
   # veya
   bun run dev
   ```

Uygulamaya tarayıcınızda `http://localhost:3010` adresinden erişilebilecektir. İlk çalıştırmanızda, ilk tercihlerinizi yapılandırmanız için temel asistanınız **May** sizi karşılayacaktır!
