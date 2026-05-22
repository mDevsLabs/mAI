# Veritabanı Yönetimi 🗄️

**mAI**, konuşmalarınıza ve yapılandırmalarınıza hızlı, çevrimdışı erişim sağlamak için veri depolamasını yapılandırılmış ve yüksek performanslı bir şekilde yönetir.

## Depolama Mimarisi

Çalışma zamanı ortamına (Masaüstü veya Web) bağlı olarak mAI, farklı depolama motorları kullanır:
- **Masaüstü Uygulaması**: Uygulamanın kullanıcı dizininde saklanan hafif yerel bir veritabanı (SQLite) kullanır. Büyük geçmiş hacimleri için mükemmel okuma/yazma performansını garanti eder.
- **Web Uygulaması**: Tarayıcının dahili veritabanına (IndexedDB) veya bulut modu etkinleştirilmişse PostgreSQL veritabanıyla senkronize edilmiş harici API hizmetlerine dayanır.

## Şema Geçişleri (Migrations)

mAI, otomatik bir veritabanı şeması geçiş sistemi içerir. Her uygulama güncellemesinde, veritabanı yapısı değişirse (örn. temsilcilere veya mesajlara yeni bir alan eklenirse), geçişler mevcut verilerinizi değiştirmeden başlangıçta sorunsuz bir şekilde çalışır.

## Performans Optimizasyonu

Uygulamayı hızlı tutmak için:
- **Otomatik Temizlik**: Geçici mesajlar veya süresi dolmuş oturumlar periyodik olarak temizlenebilir.
- **Dizin Oluşturma (Indexing)**: Neredeyse anında metin araması sağlamak için konuşma mesajları dizine eklenir.
