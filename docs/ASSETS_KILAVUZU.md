# 🎨 ZenFocus - Assets (İkon & Splash Screen) Yapılandırma Kılavuzu

## 📁 Gerekli Dosyalar

`assets/` klasörüne aşağıdaki dosyaları oluşturmanız gerekmektedir:

```
assets/
├── icon.png              → 1024x1024 px (Play Store ikonu)
├── adaptive-icon.png     → 1024x1024 px (Android Adaptive Icon foreground)
├── splash.png            → 1284x2778 px (Açılış ekranı)
└── favicon.png           → 48x48 px (Web favicon)
```

---

## 1. 📱 Uygulama İkonu (`icon.png`)

### Özellikler:
- **Boyut:** 1024 x 1024 piksel
- **Format:** PNG (şeffaf arka plan yok, tam dolgu)
- **Renk Şeması:** Koyu mor arka plan (#0a0a1a) üzerine mor-beyaz minimalist zamanlayıcı ikonu
- **Köşe Yuvarlatma:** Google Play otomatik uygular, kare bırakın

### Tasarım Önerisi:
```
┌─────────────────────┐
│   Arka plan: #0a0a1a│
│                     │
│    ┌──────────┐     │
│    │  Minimal │     │
│    │  Timer   │     │
│    │  İcon    │     │
│    │ (#7c5cfc)│     │
│    └──────────┘     │
│                     │
│   "ZF" harfleri     │
│   veya saat ikonu   │
└─────────────────────┘
```

**Araçlar:** Figma, Canva, Adobe Illustrator veya Android Studio Image Asset Studio

---

## 2. 🤖 Android Adaptive Icon (`adaptive-icon.png`)

### Özellikler:
- **Boyut:** 1024 x 1024 piksel
- **Safe Zone:** İçerik merkeze odaklı, kenarlardan en az 200px boşluk
- **Format:** PNG, şeffaf arka plan ÖNERİLİR (arka plan rengi app.json'da tanımlı: #0a0a1a)

### Yapılandırma (app.json'da mevcut):
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#0a0a1a"
  }
}
```

### Adaptive Icon Katmanları:
- **Arka Plan (Background):** `#0a0a1a` rengi (app.json ile ayarlanır)
- **Ön Plan (Foreground):** `adaptive-icon.png` dosyası (logo/ikon)
- Android sistemi bu iki katmanı birleştirerek cihaza uygun şekil uygular (daire, kare, damla vb.)

---

## 3. 🌊 Splash Screen (`splash.png`)

### Özellikler:
- **Boyut:** 1284 x 2778 piksel (iPhone 15 Pro Max oranı, tüm cihazlarda iyi ölçeklenir)
- **Format:** PNG
- **Arka Plan:** #0a0a1a (app.json ile eşleşmeli)
- **İçerik:** Merkeze yerleştirilmiş logo + "ZenFocus" yazısı

### Yapılandırma (app.json'da mevcut):
```json
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#0a0a1a"
}
```

### Tasarım Önerisi:
```
┌───────────────────┐
│                   │
│                   │
│                   │
│      [Logo]       │
│                   │
│    ZenFocus       │
│                   │
│  Minimalist       │
│  Verimlilik       │
│                   │
│                   │
│                   │
│  bg: #0a0a1a      │
└───────────────────┘
```

---

## 4. 🌐 Favicon (`favicon.png`)

### Özellikler:
- **Boyut:** 48 x 48 piksel
- **Format:** PNG
- **Kullanım:** Yalnızca web sürümü için (isteğe bağlı)

---

## 🛠 Hızlı Oluşturma Adımları

### Yöntem 1: Figma (Ücretsiz)
1. Figma'da 1024x1024 frame oluştur
2. Arka plan: #0a0a1a
3. Merkeze zamanlayıcı/saat ikonu ekle (renk: #7c5cfc)
4. PNG olarak export et → `icon.png` ve `adaptive-icon.png`
5. 1284x2778 frame ile splash ekranı oluştur → `splash.png`

### Yöntem 2: Canva (Ücretsiz)
1. Özel boyut ile 1024x1024 canvas oluştur
2. Koyu arka plan + mor ikon tasarla
3. İndir → assets klasörüne kopyala

### Yöntem 3: Expo CLI ile Placeholder
```bash
# Expo, varsayılan placeholder ikonları üretir
# Projeyi oluşturduğunuzda assets/ klasöründe hazır gelir
npx expo init zenfocus --template blank
```

---

## ⚠️ Önemli Notlar

1. **Play Store İkon Gereksinimleri (2026):**
   - 512x512 minimum (1024x1024 önerilir)
   - Alfa kanalı/şeffaflık YOK (ikon.png için)
   - 1MB maksimum dosya boyutu

2. **Android 15 (API 35) Uyumluluk:**
   - Adaptive icon zorunlu (Android 8+ cihazlarda)
   - Monochrome icon desteği opsiyonel (Android 13+ Material You teması)
   
3. **Splash Screen:**
   - Android 12+ varsayılan sistem splash screen kullanır
   - Expo `expo-splash-screen` ile uyumlu geçiş sağlar

4. **Test:** 
   ```bash
   npx expo start
   # Expo Go uygulamasında ikon ve splash screen'i doğrulayın
   ```
