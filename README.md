# ZenFocus: Minimalist Verimlilik Sayacı

Pomodoro zamanlayıcı ve görev yöneticisi. React Native (Expo) ile geliştirilmiştir.

## Yeni Ozellikler (v1.1.0)

- Gorevlere `Yuksek / Orta / Dusuk` oncelik atama
- Hizli gorev sablonlari ile tek dokunusla gorev taslagi ekleme
- Ayni aktif gorevi tekrar eklemeyi engelleyen dogrulama
- Zamanlayici ayarlarinin cihazda kalici saklanmasi
- Uygulama ici `Bilgi` sekmesi:
    - Hakkimizda
    - Gizlilik ozeti
    - Tum yerel verileri sifirlama aksiyonu

## Kurulum

```bash
npm install
npx expo start
```

## Build

```bash
# Android AAB (Play Store)
npx eas build --platform android --profile production

# Android APK (Test)
npx eas build --platform android --profile preview
```

## Proje Yapısı

```
OYUN1/
├── App.js                          → Ana uygulama kodu
├── app.json                        → Expo yapılandırması
├── package.json                    → Bağımlılıklar
├── eas.json                        → EAS Build yapılandırması
├── babel.config.js                 → Babel yapılandırması
├── assets/                         → İkon, splash screen dosyaları
│   ├── icon.png                    (oluşturulmalı - 1024x1024)
│   ├── adaptive-icon.png           (oluşturulmalı - 1024x1024)
│   ├── splash.png                  (oluşturulmalı - 1284x2778)
│   └── favicon.png                 (oluşturulmalı - 48x48)
└── docs/                           → Dokümantasyon
    ├── PLAY_STORE_HAZIRLIGI.md     → Store listing metinleri
    ├── VERI_GUVENLIGI_FORMU.md     → Data Safety form yanıtları
    ├── HAKKIMIZDA.md               → Hakkımızda ve uyum özeti
    ├── GIZLILIK_POLITIKASI.md      → Privacy Policy
    ├── ASSETS_KILAVUZU.md          → İkon & splash screen rehberi
    └── YAYINLAMA_KILAVUZU.md       → Play Store yayınlama rehberi
```

## Teknik Bilgiler

- **Target SDK:** 35 (Android 15)
- **Minimum SDK:** 24 (Android 7.0)
- **Expo SDK:** 52
- **Veri Toplama:** Yok (tamamen çevrimdışı)
