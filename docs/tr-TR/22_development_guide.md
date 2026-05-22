# Geliştirme Kılavuzu 🛠️

Bu kılavuz, **mAI** projesine katkıda bulunmak veya kaynak kodunu geliştirme modunda çalıştırmak isteyen geliştiriciler için temel talimatları sağlar.

## Proje Yapısı

mAI, modern bir monorepo (pnpm ve Turborepo kullanan) olarak yapılandırılmıştır:
- `apps/web`: Ana Next.js uygulaması.
- `packages/`: Paylaşılan modüller ve yeniden kullanılabilir yapılandırmalar (UI bileşenleri, tipler, yardımcılar).

## Geliştirme Modunda Çalıştırma

1. **Ön Koşullar**: Node.js (LTS sürümü önerilir) ve pnpm veya bun'ın kurulu olduğundan emin olun.
2. **Bağımlılıkları Yükleme**:
   ```bash
   pnpm install
   ```
3. **Geliştirme Sunucusunu Başlatma**:
   ```bash
   pnpm run dev
   ```
   Uygulamaya yerel olarak `http://localhost:3000` adresinden erişilebilecektir.

## Test Etme

Test paketlerimiz için **Vitest** kullanıyoruz:
- Testleri bir kez çalıştırma: `pnpm run test`
- Testleri izleme (watch) modunda çalıştırma: `pnpm run test:watch`

Lütfen herhangi bir değişiklik göndermeden önce tüm testlerin başarıyla geçtiğinden emin olun.
