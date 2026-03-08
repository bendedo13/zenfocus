# 🔒 ZenFocus - Veri Güvenliği (Data Safety) Formu Yanıtları

> Bu belge, Google Play Console'daki "Veri Güvenliği" (Data Safety) bölümünü
> doldururken kullanılacak referans yanıtlarını içerir.

---

## Google Play Console → Veri Güvenliği Formu

### Bölüm 1: Veri Toplama ve Paylaşma Genel Bakışı

| Soru | Yanıt |
|------|-------|
| **Uygulamanız herhangi bir gerekli kullanıcı veri türünü topluyor veya paylaşıyor mu?** | **Hayır** |

> ✅ Bu yanıtı seçtiğinizde Google, listelemenizde "Veri paylaşılmıyor" ve 
> "Veri toplanmıyor" etiketlerini gösterecektir.

---

### Bölüm 2: Veri Türleri (Tüm kategoriler için "Hayır")

| Veri Kategorisi | Toplanıyor mu? | Paylaşılıyor mu? |
|----------------|----------------|-------------------|
| Konum | ❌ Hayır | ❌ Hayır |
| Kişisel bilgiler (ad, e-posta, vb.) | ❌ Hayır | ❌ Hayır |
| Finansal bilgiler | ❌ Hayır | ❌ Hayır |
| Sağlık ve fitness | ❌ Hayır | ❌ Hayır |
| Mesajlar | ❌ Hayır | ❌ Hayır |
| Fotoğraflar ve videolar | ❌ Hayır | ❌ Hayır |
| Ses dosyaları | ❌ Hayır | ❌ Hayır |
| Dosyalar ve dokümanlar | ❌ Hayır | ❌ Hayır |
| Takvim | ❌ Hayır | ❌ Hayır |
| Kişiler | ❌ Hayır | ❌ Hayır |
| Uygulama etkinliği | ❌ Hayır | ❌ Hayır |
| Web'de gezinme | ❌ Hayır | ❌ Hayır |
| Uygulama bilgileri ve performans | ❌ Hayır | ❌ Hayır |
| Cihaz veya diğer tanımlayıcılar | ❌ Hayır | ❌ Hayır |

---

### Bölüm 3: Güvenlik Uygulamaları

| Soru | Yanıt |
|------|-------|
| **Veriler aktarım sırasında şifreleniyor mu?** | Uygulanamaz (veri aktarımı yok) |
| **Kullanıcılar verilerinin silinmesini isteyebilir mi?** | Uygulamanın cihaz depolamasını temizlemek yeterlidir |
| **Uygulamanız bir veri silme mekanizması sunuyor mu?** | Tüm veriler cihazda saklanır; uygulama kaldırıldığında otomatik silinir |

---

### Bölüm 4: Ek Açıklama

```
ZenFocus uygulaması tamamen çevrimdışı çalışır ve hiçbir kullanıcı verisini
toplamaz, paylaşmaz veya üçüncü taraflara iletmez.

Uygulama tarafından oluşturulan veriler (görev listesi, pomodoro istatistikleri,
kullanıcı tercihleri) yalnızca cihazın yerel depolama alanında (AsyncStorage)
saklanır ve hiçbir zaman cihaz dışına çıkmaz.

Uygulama:
- İnternet erişimi gerektirmez
- Analitik SDK içermez
- Reklam SDK'sı içermez
- Üçüncü parti izleme kodu içermez
- Firebase veya benzeri bulut servisi kullanmaz
- Kullanıcı hesabı/giriş gerektirmez

Uygulama kaldırıldığında tüm yerel veriler otomatik olarak silinir.
```

---

## 📋 Play Console'da Adım Adım Doldurma

1. **Google Play Console** → Uygulamanız → **Uygulama İçeriği** → **Veri güvenliği**
2. "Başlarken" → "Başla"
3. İlk soruya **"Hayır, uygulamamız herhangi bir gerekli kullanıcı verisi türünü toplamıyor veya paylaşmıyor"** seçin
4. Güvenlik uygulamaları sorusunu yukarıdaki tabloya göre doldurun
5. "Kaydet" → "İncelemeye gönder"

---

## ⚠️ Önemli Notlar

- **2026 Güncel Politika:** Google Play, tüm uygulamaların Veri Güvenliği formunu
  doldurmasını zorunlu kılmaktadır. Form doldurulmadığında uygulama güncellemesi
  reddedilebilir.
  
- **Doğruluk:** Google, form bilgilerinin uygulama davranışıyla tutarlı olduğunu
  otomatik tarama ile kontrol eder. ZenFocus hiçbir ağ çağrısı yapmadığı için
  "veri toplanmıyor" beyanı %100 doğrudur.

- **Periyodik İnceleme:** Uygulamaya yeni özellik ekledikçe bu formu
  güncellemeniz gerekebilir.
