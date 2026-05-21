import type { AliciProfili, SaticiRolu } from "../tipler/ekranTipleri";

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
  { id: "elektronik", baslik: "Elektronik Aranıyor", aciklama: "Teknoloji ve iyi seviye ürünlerde alıcı iştahı yükseldi.", hedefNadirlik: "iyi", carpani: 1.18 },
  { id: "koleksiyon", baslik: "Koleksiyon Haftası", aciklama: "Nadir ürünler bugün daha hızlı teklif topluyor.", hedefNadirlik: "nadir", carpani: 1.22 },
  { id: "efsane", baslik: "Lüks Alıcılar Geldi", aciklama: "Efsane ürünlere yüksek bütçeli alıcılar bakıyor.", hedefNadirlik: "efsane", carpani: 1.3 },
  { id: "hurda", baslik: "Hurda Talebi", aciklama: "Çöp görünen küçük parçalar bile bugün para edebilir.", hedefNadirlik: "cop", carpani: 1.12 },
  { id: "dengeli", baslik: "Dengeli Piyasa", aciklama: "Bugün tüm ürünlerde sakin ve tahmin edilebilir fiyatlar var.", hedefNadirlik: "tum", carpani: 1 }
] as const;

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
