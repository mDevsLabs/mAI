# Gizlilik ve Güvenlik 🔒

Veri güvenliği ve gizliliğinize saygı, **mAI** tasarımının temel ilkeleridir.

## Şifrelenmiş Yerel Depolama

Tüm hassas verileriniz cihazınızda yerel olarak saklanır:
- **API Anahtarları**: Yerel depolama alanınıza kaydedilmeden önce endüstri standardı algoritmalar kullanılarak şifrelenirler. API anahtarlarınız asla sunucularımıza gönderilmez; doğrudan cihazınızdan ilgili LLM sağlayıcı sunucularına iletilir.
- **Sohbet Geçmişi**: Konuşmalarınız makinenizde kalır (güvenli bulut senkronizasyonunu açıkça etkinleştirmediğiniz sürece).

## Güvenli Bağlantılar

Dil modeli API'lerine giden tüm istekler, güvenli iletişim protokolleri (HTTPS / SSL) kullanarak iletilen verilerin ağ üzerinden dinlenmesini engeller.

## Önerilen Kurumsal Uygulamalar

Kurumsal ortamlarda en yüksek güvenlik seviyesi için:
- **Ollama** veya özel bir çıkarım (inference) sunucusu aracılığıyla yerel olarak barındırılan modelleri kullanın (yani şirket ağından hiçbir veri çıkmaz).
- Genel ayarlar sekmesinden anonim telemetriyi devre dışı bırakın.
