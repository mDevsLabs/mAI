# mAI Mimarisi 🏗️

**mAI** uygulaması, performans, genişletilebilirlik ve sürdürülebilirlik için tasarlanmış modern bir mimari üzerine kurulmuştur. Bir monorepo olarak yapılandırılmıştır.

## Ana Teknolojiler

- **Temel Çerçeve**: İşleme (rendering) ve yönlendirme için Next.js (App Router ile).
- **Durum Yönetimi (State Management)**: Hafif ve reaktif istemci tarafı durum kontrolü için Zustand.
- **Tasarım ve UI**: `antd-style` ve `@lobehub/ui` ile stillendirilmiş Ant Design bileşenleri.
- **Veritabanı**: Drizzle ORM tarafından yönetilen yerel olarak SQLite (veya üretim ortamında PostgreSQL).

## Monorepo Yapısı

Kod tabanı, `packages/` dizini altındaki yeniden kullanılabilir paketlere bölünmüştür:
- `packages/const`: Global sabitler ve yapılandırmalar.
- `packages/builtin-agents`: Varsayılan sistem temsilcileri (May dahil).
- `packages/database`: Veri modelleri, Drizzle şemaları ve geçişleri (migrations).
- `packages/types`: Paylaşılan TypeScript tip tanımlamaları.

Bu ayrım, temel iş mantığını (model API isteklerini çalıştırmak veya eklentileri yönetmek gibi), `src/` dizininde bulunan ana web kullanıcı arayüzünden izole eder.
