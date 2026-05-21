import type { AliciProfili, SaticiRolu } from "../tipler/ekranTipleri";
import type { PazarHaberi } from "../tipler/oyunTipleri";

export const isimHavuzu = ["Maya", "Deniz", "Cem", "Ece", "Arda", "Selin", "Mert", "Lina", "Kerem", "Duru", "Emir", "Ada", "Bora", "Elif", "Kaan", "Nora", "Tuna", "Irem", "Atlas", "Sude"];
export const avatarRenkleri = ["#ff8fab", "#64c7ff", "#ffd166", "#7bd88f", "#c792ea", "#ff9f6e", "#5eead4", "#a3a3ff"];
export const depoOnAdlari = ["Kuzey", "Liman", "Eski Sanayi", "Gar", "Koleksiyoncu", "Nakliye", "Kapanan Dükkan", "Banliyö", "İcra", "Antika"];
export const depoTurleri = ["Deposu", "Eşya Garajı", "Kilitli Ünite", "Kutu Holü", "Ardiye Odası", "Lojistik Deposu"];
export const depoKonumlari = ["Liman arkası", "Sanayi sitesi", "Eski çarşı", "Gar yanı", "Banliyö yolu", "İcra avlusu"];
export const depoDurumlari = ["Tozlu raflar", "Ağır kilit", "Karışık koliler", "Ahşap paletler", "Eski ofis eşyası", "Kilitli dolaplar"];
export const krediTutarlari = [250, 500, 1000];
export const saticiIsimleri = ["Mahir", "Suna", "Yalçın", "Belgin", "Fikret", "Nalan", "Ozan", "Aylin"];
export const urunIpuclari = ["Kondisyonu iyi duruyor", "Kutusu biraz yıpranmış", "Satıcı hızlı elden çıkarmak istiyor", "Koleksiyoncu ürünü gibi", "Pazarlığa açık", "Az kullanılmış görünüyor"];
export const saticiRolleri: SaticiRolu[] = ["hizli", "normal", "sabirli", "inatci"];
export const aliciProfilleri: AliciProfili[] = [
  { tip: "koleksiyoncu", isim: "Koleksiyoncu", aciklama: "Nadir ve efsane ürünlerde daha cömert.", renk: "#c77dff", butceCarpani: 1.16, hedefNadirlikler: ["nadir", "efsane"] },
  { tip: "toptanci", isim: "Toptancı", aciklama: "Kalabalık depolara toplu teklif verir.", renk: "#178f5f", butceCarpani: 1.08 },
  { tip: "pazarlikci", isim: "Pazarlıkçı", aciklama: "Düşük başlar, son çağrıda hareketlenir.", renk: "#e76f51", butceCarpani: 0.94 },
  { tip: "aceleci", isim: "Aceleci", aciklama: "Hızlı teklif verir, süre uzarsa soğuyabilir.", renk: "#42a5ff", butceCarpani: 1.02 }
];

export const depoKaliteAyarlari = {
  1: { kalite: "standart", etiket: "Standart", carpani: 1, sonrakiUcret: 350 },
  2: { kalite: "duzenli", etiket: "Düzenli", carpani: 1.12, sonrakiUcret: 850 },
  3: { kalite: "premium", etiket: "Premium", carpani: 1.28, sonrakiUcret: 0 }
} as const;

export const pazarHaberleri = [
  { id: "elektronik", baslik: "Elektronik Aranıyor", aciklama: "Teknoloji ve iyi seviye ürünlerde alıcı iştahı yükseldi.", etki: "İyi ürünler daha değerli, pazar teklifleri biraz daha güçlü.", hedefNadirlik: "iyi", carpani: 1.18, pazarTeklifCarpani: 1.05, musteriGelmeCarpani: 1.1 },
  { id: "koleksiyon", baslik: "Koleksiyon Haftası", aciklama: "Nadir ürünler bugün daha hızlı teklif topluyor.", etki: "Nadir ürünlerde fiyat ve müşteri ilgisi artar.", hedefNadirlik: "nadir", carpani: 1.22, pazarTeklifCarpani: 1.07, musteriGelmeCarpani: 1.2 },
  { id: "efsane", baslik: "Lüks Alıcılar Geldi", aciklama: "Efsane ürünlere yüksek bütçeli alıcılar bakıyor.", etki: "Efsane ürünlerde teklif tavanı yükselir, salonlar kalabalıklaşır.", hedefNadirlik: "efsane", carpani: 1.3, pazarTeklifCarpani: 1.1, acikArtirmaTalepCarpani: 1.18 },
  { id: "hurda", baslik: "Hurda Talebi", aciklama: "Çöp görünen küçük parçalar bile bugün para edebilir.", etki: "Çöp ürünler daha iyi para eder, hızlı satışlar şaşırtabilir.", hedefNadirlik: "cop", carpani: 1.12, pazarTeklifCarpani: 1.04 },
  { id: "dengeli", baslik: "Dengeli Piyasa", aciklama: "Bugün tüm ürünlerde sakin ve tahmin edilebilir fiyatlar var.", etki: "Risk az, fiyatlar normal seyrinde.", hedefNadirlik: "tum", carpani: 1 },
  { id: "erken-firsat", baslik: "Erken Fırsat Günü", aciklama: "Depo sahipleri hızlı satış istiyor, açılış fiyatları aşağı çekildi.", etki: "Açık artırma başlangıç fiyatları düşer.", hedefNadirlik: "tum", carpani: 0.98, acikArtirmaBaslangicCarpani: 0.78 },
  { id: "kalabalik-salon", baslik: "Kalabalık Salon", aciklama: "Bugün salonlar dolu, herkes depo peşinde.", etki: "Açık artırmalarda daha çok rakip olur ama iyi depolar daha görünür hale gelir.", hedefNadirlik: "tum", carpani: 1.03, acikArtirmaTalepCarpani: 1.35 },
  { id: "pazarlik-ruzgari", baslik: "Pazarlık Rüzgarı", aciklama: "Satıcılar nakde sıkıştı, ürün pazarında kabul fiyatları yumuşadı.", etki: "Ürün Pazarı kabul fiyatları düşer.", hedefNadirlik: "tum", carpani: 1, urunPazariFiyatCarpani: 0.86 },
  { id: "aceleci-alicilar", baslik: "Aceleci Alıcılar", aciklama: "Alıcılar hızlı karar veriyor, ürün sohbetleri daha çabuk hareketleniyor.", etki: "Pazara koyduğun ürünlere daha sık yeni müşteri gelir.", hedefNadirlik: "tum", carpani: 1.02, musteriGelmeCarpani: 1.6, pazarTeklifCarpani: 0.98 },
  { id: "sabirli-musteriler", baslik: "Sabırlı Müşteriler", aciklama: "Alıcılar bugün beklemeye daha istekli, pazarlığa zaman var.", etki: "Sohbet müşterileri daha uzun süre bekler.", hedefNadirlik: "tum", carpani: 1.01, musteriBeklemeBonus: 18 },
  { id: "normal-urun-akimi", baslik: "Ev Eşyası Akımı", aciklama: "Günlük kullanım ürünlerine talep yükseldi.", etki: "Normal ürünler daha değerli hale gelir.", hedefNadirlik: "normal", carpani: 1.16, pazarTeklifCarpani: 1.04 },
  { id: "premium-vitrin", baslik: "Premium Vitrin", aciklama: "Temiz sunulan ürün ve depolar bugün daha güven veriyor.", etki: "Tüm pazar teklifleri güçlenir, özellikle kaliteli ürünlerde satış rahatlar.", hedefNadirlik: "tum", carpani: 1.06, pazarTeklifCarpani: 1.08, musteriBeklemeBonus: 8 }
] as const satisfies readonly PazarHaberi[];

export const GUN_BASLANGIC_DAKIKA = 360;
export const GUN_BITIS_DAKIKA = 1440;
export const GERCEK_ZAMAN_ARALIGI_MS = 5000;
export const GERCEK_ZAMAN_OYUN_DAKIKASI = 9;

export const AKSIYON_SURELERI = {
  depoPazarinaGit: 30,
  urunPazariTeklif: 15,
  hizliSatis: 10,
  pazaraKoy: 20,
  pazarPazarlik: 30,
  depoKur: 15,
  depoyaUrunEkle: 10,
  depoSatisBaslat: 45
};
