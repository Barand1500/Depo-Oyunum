# 🎮 OYUN.md — STORAGE EMPIRE (çalışma adı)

## 0. OYUNUN TEMEL FİKRİ

Oyuncu depo satın alır, içinden çıkan rastgele eşyaları satar ve para kazanır. Amaç: küçük depodan başlayıp büyük bir şirkete dönüşmek, otomasyon kurmak ve pasif gelir ile büyümek.

Oyuncu zamanla:
- Depolar satın alır
- Eşyaları satar
- İşçiler alır
- Otomatik sistem kurar
- Şirket kurar

---

## 1. OYUNUN ANA HEDEFİ

Oyuncu:

→ Para kazanacak  
→ Şirket kuracak  
→ Otomasyon kurup pasif gelir elde edecek  
→ En büyük “Storage Empire” olacak  

Final hedef:
- Tam otomatik depo ağı + çalışan sistem

---

## 2. OYUN DÖNGÜSÜ (CORE LOOP)

1. Depo satın al
2. Depoyu aç
3. İçinden rastgele eşyalar çıkar
4. Eşyaları sat
5. Para kazan
6. Upgrade / yeni depo / işçi al
7. Tekrar döngü

Bu döngü oyunun kalbi.

---

## 3. DEPO SİSTEMİ

Depolar rastgele içerik üretir.

### Depo Türleri:
- Küçük depo (ucuz, düşük risk)
- Orta depo
- Büyük depo (yüksek risk, yüksek kazanç)

### Mantık:
Her depo açıldığında:
- 3–10 arası item spawn olur
- itemler rastgele seçilir
- nadirlik sistemi çalışır

---

## 4. EŞYA SİSTEMİ

Eşyalar satış değerine göre sınıflanır:

- Çöp (0–50₺)
- Normal (50–300₺)
- İyi (300–1000₺)
- Nadir (1000–5000₺)
- Efsane (5000₺+)

Her item:
- isim
- değer
- nadirlik

---

## 5. PARA SİSTEMİ

Para sadece şuradan gelir:
- eşya satışı

Ek sistem:
- “şanslı satış” → bazen %20 fazla kazanç
- görev ödülleri (ileride)

---

## 6. OTOMASYON SİSTEMİ (KRİTİK)

Oyuncu ilerledikçe:

### İşçiler:
- Satışçı (otomatik satış yapar)
- Depo açıcı (otomatik depo açar)
- Tespit uzmanı (nadir item şansı artırır)

### Sistem:
- İşçi = pasif gelir + otomasyon

---

## 7. UPGRADE SİSTEMİ

- Daha büyük depo açma
- Daha hızlı satış
- Daha yüksek nadirlik şansı
- Daha fazla işçi slotu

Upgrade maliyeti exponential artar:
→ 100 → 300 → 900 → 3000

---

## 8. RASTGELELİK (LOOT MEKANİĞİ)

Loot sistemi:

- %50 düşük değer
- %30 normal
- %15 iyi
- %4 nadir
- %1 efsane

Bu sistem oyunun bağımlılık kısmı.

---

## 9. OYUN GÖRSEL TASARIMI (ÇOK ÖNEMLİ)

Stil:

- Minimal UI
- Dark theme + neon highlight
- Kart tabanlı item sistemi
- Depo açılınca “scan animasyonu”

UI hissi:
- temiz
- modern
- cyber / business vibe

Animasyonlar:
- item çıkınca glow
- para artışı float text
- depo açılma “slide”

---

## 10. TEKNİK PLAN (VS CODE + EXPO)

Stack:
- React Native (Expo)
- Local storage (AsyncStorage)

Veri:
- money
- inventory
- upgrades
- workers
- warehouses

---

## 11. MVP (İLK SÜRÜM - ZORUNLU)

İlk sürümde sadece:

✔ Para sistemi  
✔ Depo açma  
✔ Rastgele item üretimi  
✔ Satış sistemi  
✔ Basit UI  

YOK:
- işçi
- advanced upgrade
- animasyon fazla

---

## 12. 1. AŞAMA GÖREVLER

### Aşama 1 — TEMEL OYUN (MVP)

1. Para sistemi oluştur
2. “Depo aç” butonu yap
3. Random item generator kur
4. Item list UI yap
5. Satış sistemi ekle
6. Para güncelleme sistemi
7. Save system (local)

---

## 13. 2. AŞAMA — GELİŞİM

1. Upgrade sistemi
2. Depo çeşitleri
3. Nadirlik sistemi
4. Basit animasyonlar

---

## 14. 3. AŞAMA — OTOMASYON

1. İşçi sistemi
2. Otomatik satış
3. Otomatik depo açma
4. Pasif gelir

---

## 15. 4. AŞAMA — POLISH

1. UI iyileştirme
2. Ses efektleri
3. Animasyonlar
4. Play Store hazırlık

---

## 16. OYUN İSMİ (GEÇİCİ)

Storage Empire  
veya  
Loot Depot  
veya  
Warehouse Tycoon  

---

## 17. OYUNUN 1 CÜMLE TANIMI

“Depolar satın al, içinden çıkan eşyaları sat, otomasyon kur ve kendi depolama imparatorluğunu inşa et.”