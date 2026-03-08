# 🚀 ZenFocus - Google Play Store Yayınlama Kılavuzu (2026)

---

## 📋 Ön Gereksinimler

- [x] Google Play Developer Hesabı ($25 tek seferlik ücret)
- [x] Node.js 18+ ve npm/yarn kurulu
- [x] Expo CLI (`npm install -g expo-cli eas-cli`)
- [x] EAS hesabı (`npx eas login`)
- [x] Gizlilik Politikası yayınlanmış bir URL'de

---

## 📦 Build & Yayınlama Adımları

### Adım 1: Bağımlılıkları Kur
```bash
cd c:\Users\win10\Desktop\OYUN1
npm install
```

### Adım 2: EAS Projesi Yapılandır
```bash
npx eas init
# EAS proje ID'si otomatik oluşturulacak
```

### Adım 3: Assets Dosyalarını Yerleştir
```
assets/
├── icon.png           (1024x1024)
├── adaptive-icon.png  (1024x1024)
├── splash.png         (1284x2778)
└── favicon.png        (48x48)
```

### Adım 4: Android AAB Build
```bash
# Production build (AAB - Play Store için)
npx eas build --platform android --profile production

# Test APK (cihazda test için)
npx eas build --platform android --profile preview
```

### Adım 5: Play Console'a Yükle
```bash
# Otomatik yükleme
npx eas submit --platform android --profile production

# VEYA manuel: Play Console → Dahili test → AAB dosyasını yükle
```

---

## 🧪 12 Test Kullanıcısı ile 14 Günlük Kapalı Test Süreci

### 2026 Güncel Kuralı:
Google Play, **yeni geliştirici hesaplarının** üretim erişimi alabilmesi için
**en az 12 test kullanıcısı** ile **14 gün boyunca kapalı test** yapmasını
zorunlu kılmaktadır.

---

### ⚡ En Hızlı Geçiş İçin 3 Maddelik Strateji

---

#### 📌 STRATEJİ 1: "Gün-1 Hazırlığı" — Test Grubunu Önceden Kur

**Kapalı testi beklemeden ÖNCE tüm hazırlıkları tamamlayın:**

1. **Play Console'da Dahili Test Kanalı Oluşturun** (üretim değil)
   - Play Console → Test → Kapalı test → Yeni bir sürüm oluştur
   - "Test kullanıcıları" bölümüne e-posta listesi ekleyin

2. **12+ Gerçek Gmail Hesabı Toplayın:**
   - Aile ve yakın arkadaşlardan 12 farklı Gmail adresi isteyin
   - Her biri **farklı bir gerçek kişiye** ait olmalı (Google sahte hesapları algılayabilir)
   - Aynı gün tüm kullanıcıları davet edin

3. **Test Kullanıcılarına Basit Talimat Gönderin:**
   ```
   Merhaba! ZenFocus uygulaması test sürecinde.
   1. Bu linke tıklayın: [Play Store test linki]
   2. "Test programına katıl" butonuna basın
   3. Uygulamayı indirin
   4. Haftada en az 2-3 kez açıp birkaç dakika kullanın
   5. 14 gün boyunca uygulamayı cihazınızda tutun
   ```

4. **İLK GÜNDE AAB'yi yükleyin** — 14 günlük süre, ilk test kullanıcısının
   uygulamayı indirdiği andan itibaren başlar. Gecikme = kayıp gün.

> ⏱ **Hedef:** Hesap açtığınız gün veya ertesi gün kapalı testi başlatın.
> 14 günü 1 gün bile erkene çekemezsiniz, ama geç başlamak = gereksiz bekleme.

---

#### 📌 STRATEJİ 2: "Aktif Kullanım Garantisi" — Google'ın İstediği Sinyalleri Verin

**Google, test kullanıcılarının uygulamayı gerçekten kullandığını doğrular.
Pasif kurulum yetmez:**

1. **Her Test Kullanıcısı İçin Minimum Gereklilikler:**
   - Uygulamayı Play Store'dan indirmiş olmak (APK sideload değil!)
   - 14 gün boyunca uygulamayı en az **20 dakika** kullanmak
   - Uygulamayı kaldırmamak

2. **Kullanımı Kolaylaştırın:**
   - WhatsApp grubu oluşturun: "ZenFocus Test Ekibi"
   - 3. gün, 7. gün ve 12. gün hatırlatma mesajı gönderin:
     ```
     "Merhaba! ZenFocus'u bugün 5 dakika açabilir misiniz? 
      Bir Pomodoro başlatıp bir görev eklemeniz yeterli 🎯"
     ```
   - Sorun yaşayanlar için hızlı destek verin

3. **Crash/Hata Olmamasını Sağlayın:**
   - Build'i yüklemeden önce kendiniz 3-4 farklı cihazda test edin
   - Expo Go'da ve standalone build'de test edin
   - Uygulama çökmesi 14 günlük süreci riske atar

4. **Test Sırasında 1 Güncelleme Yayınlayın:**
   - 7-8. günde küçük bir güncelleme (versiyon 1.0.1) yükleyin
   - Bu, Google'a aktif geliştirme sinyali verir
   - Güncelleme küçük olabilir: Bir metin değişikliği veya ikon güncellemesi

> ⏱ **Hedef:** 14 günün sonunda Google'ın aradığı "gerçek kullanıcı aktivitesi"
> sinyallerini otomatik olarak geçmek.

---

#### 📌 STRATEJİ 3: "Paralel Hazırlık" — 14 Gün Beklerken Her Şeyi Tamamlayın

**14 günü boşa harcamayın. Bu süre içinde tüm Play Store gereksinimlerini
tamamlayın:**

1. **Gün 1-3: Store Listesini Tamamlayın**
   - Uygulama adı, açıklama, kısa açıklama → `PLAY_STORE_HAZIRLIGI.md` kullanın
   - Ekran görüntüleri hazırlayın (4-8 adet, 1080x1920)
   - Feature graphic (öne çıkan görsel) hazırlayın (1024x500)
   - İkon ve splash screen'leri son haline getirin

2. **Gün 1-3: Uygulama İçeriği Formlarını Doldurun**
   - Veri Güvenliği formu → `VERI_GUVENLIGI_FORMU.md` kullanın
   - İçerik derecelendirmesi anketi (IARC)
   - Hedef kitle ve içerik beyanı
   - Gizlilik politikası URL'si → `GIZLILIK_POLITIKASI.md` yayınlayın
   - Reklam beyanı: "Hayır, reklam içermiyor"

3. **Gün 4-10: Uygulamayı İyileştirin**
   - Test kullanıcı geri bildirimlerini toplayın
   - Küçük hataları düzeltin
   - UX iyileştirmeleri yapın
   - v1.0.1 güncelleme build'i hazırlayın

4. **Gün 10-13: Üretim Hazırlığı**
   - Tüm Play Console "Uygulama İçeriği" bölümlerinin ✅ olduğunu doğrulayın
   - Store listesinin tüm dillerde doldurulduğunu kontrol edin
   - "Sürüm genel bakışı"nda kırmızı uyarı olmadığından emin olun

5. **Gün 14: Üretime Gönder**
   - Kapalı test süresi dolduğunda
   - Play Console → Üretim → Yeni sürüm oluştur
   - AAB'yi yükle → İncelemeye gönder
   - Google inceleme süresi: genellikle 1-7 gün

> ⏱ **Hedef:** 14. gün geldiğinde **tek tıkla** üretime geçebilecek durumda olmak.
> "14 gün bekleme" = "14 gün hazırlık fırsatı"

---

## 📊 Zaman Çizelgesi Özeti

```
Gün  0: Play Console hesabı + EAS build + Kapalı test başlat
Gün  1: 12 test kullanıcısını davet et + Store listesi hazırla
Gün  2: Tüm form ve beyanları doldur + Gizlilik politikası yayınla
Gün  3: Ekran görüntüleri ve görselleri tamamla
Gün  7: Test kullanıcılarına hatırlatma + v1.0.1 güncelleme
Gün 12: Son hatırlatma + Store listing son kontrol
Gün 14: ✅ Kapalı test tamamlandı → Üretime gönder
Gün 15-21: Google inceleme süreci
Gün 21+: 🎉 Uygulama Play Store'da yayında!
```

---

## ⚠️ Sık Yapılan Hatalar

| Hata | Sonucu | Çözüm |
|------|--------|-------|
| 12'den az test kullanıcısı | Süre başlamaz | Tam 12+ kullanıcı ekleyin |
| Test kullanıcıları uygulamayı kullanmıyor | Google reddedebilir | Düzenli hatırlatma gönderin |
| Gizlilik politikası URL'si eksik | İnceleme reddedilir | Yayınlanmış URL ekleyin |
| Veri güvenliği formu boş | Güncelleme reddedilir | Formu tamamen doldurun |
| Target SDK 35'ten düşük | Yeni uygulama reddedilir | app.json'da targetSdkVersion: 35 |
| İkon/splash eksik | Build hatası | Assets dosyalarını tamamlayın |

---

## 🔧 Faydalı Komutlar

```bash
# Projeyi başlat
npx expo start

# Android'de test et
npx expo start --android

# Production AAB build
npx eas build --platform android --profile production

# Build durumunu kontrol et
npx eas build:list

# Play Store'a gönder
npx eas submit --platform android

# Expo Doctor ile sorunları kontrol et
npx expo-doctor
```

---

## ✅ Final Kontrol Listesi

- [ ] `icon.png` (1024x1024) assets klasöründe
- [ ] `adaptive-icon.png` (1024x1024) assets klasöründe
- [ ] `splash.png` (1284x2778) assets klasöründe
- [ ] `app.json` — package, versionCode, targetSdkVersion: 35
- [ ] `eas.json` — production profili yapılandırılmış
- [ ] Gizlilik Politikası yayınlanmış URL'de
- [ ] Play Console — Veri Güvenliği formu doldurulmuş
- [ ] Play Console — İçerik derecelendirmesi tamamlanmış
- [ ] Play Console — Store listesi (başlık, açıklama, görseller) tamamlanmış
- [ ] Play Console — Hedef kitle beyanı yapılmış
- [ ] 12+ test kullanıcısı eklenmiş ve aktif
- [ ] 14 günlük kapalı test süresi tamamlanmış
- [ ] Production AAB build başarılı
- [ ] Üretime gönderilmiş ve inceleme bekliyor
