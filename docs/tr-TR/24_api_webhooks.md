# API ve Web kancaları (Webhooks) 🔗

**mAI**, kendi uygulamalarınızla, web hizmetlerinizle veya otomasyon betiklerinizle harici entegrasyonlar sağlamak için programatik arayüzler sunar.

## Yerel API (HTTP)

mAI masaüstü uygulaması, belirlenmiş bir port üzerinden güvenli bir yerel web sunucusu çalıştırabilir. Bu sunucu çeşitli uç noktaları (endpoints) barındırır:
- `POST /api/chat`: Belirli bir temsilciye mesaj gönderir ve yapılandırılmış bir yanıt döndürür (standart veya akış/streaming biçimini destekler).
- `GET /api/agents`: Mevcut tüm temsilcileri ve yapılandırmalarını listeler.
- `POST /api/agents`: Programatik olarak yeni bir temsilci oluşturulmasını sağlar.

## Web Kancaları Entegrasyonu

mAI'nin gelişmiş ayarlarında giden web kancalarını (webhooks) yapılandırabilirsiniz. Bir web kancası, belirli olaylar gerçekleştiğinde otomatik olarak harici bir URL'ye bir JSON veri yükü (payload) gönderir:
- **Sohbet mesajı tamamlandı** (Chat message completed): Bir temsilci yanıt üretmeyi bitirir bitirmez tetiklenir.
- **Temsilci oluşturuldu** (Agent created): Yeni bir temsilci profili eklendiğinde tetiklenir.
- **Sistem hatası** (System error): API anahtarı doğrulama sorunları veya LLM sağlayıcı kesintileri sırasında tetiklenir.
