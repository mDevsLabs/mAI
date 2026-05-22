# Temsilci Özelleştirme ⚙️

**mAI**'deki temsilcileri hassas bir şekilde ayarlamak, davranışlarını, yanıt stillerini ve erişebilecekleri araçları derinlemesine değiştirmenize olanak tanır.

## Temel Ayarlar

Her temsilci için şunları yapılandırabilirsiniz:
- **Sistem İstemi** (System Prompt): Temsilcinin kişiliğini, kurallarını ve rolünü tanımlayan temel talimatlar. Bu, temsilcinin yanıtları üzerinde en etkili ayardır.
- **Dil Modeli** (Language Model): Kullanılacak varsayılan LLM'yi seçin (örn. GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Gelişmiş Ayarlar

Üretim hiperparametrelerini de değiştirebilirsiniz:
- **Sıcaklık** (Temperature): Yanıtların yaratıcılığını kontrol eder. Daha düşük bir sıcaklık (örn. 0.2) daha gerçekçi ve deterministik yanıtlar üretir. Daha yüksek bir sıcaklık (örn. 0.9) yaratıcılığı teşvik eder.
- **Top P**: Yanıt çeşitliliğini kontrol etmek için başka bir yöntem.
- **Varlık / Sıklık Cezası** (Presence / Frequency Penalty): Temsilcinin aynı kelimeleri tekrarlamasını veya tartışılan konulardan sapmasını teşvik eder veya engeller.
- **Maksimum Belirteç** (Max Tokens): Üretilen yanıtın maksimum uzunluğunu sınırlar.
