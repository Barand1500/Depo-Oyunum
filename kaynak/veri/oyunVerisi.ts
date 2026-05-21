import type { Nadirlik, NadirlikAyari, OyunDurumu } from "../tipler/oyunTipleri";

export const KAYIT_ANAHTARI = "storage-empire-save-v1";
export const BASLANGIC_PARASI = 250;
export const DEPO_UCRETI = 75;

export const ilkOyunDurumu: OyunDurumu = {
  para: BASLANGIC_PARASI,
  envanter: [],
  acilanDepo: 0,
  toplamKazanc: 0,
  toplamHarcama: 0,
  sahipDepolar: [],
  gun: 1,
  saatDakika: 360,
  gunSonu: false,
  profil: {
    ad: "Baran",
    soyad: "Depocu"
  },
  kredi: {
    borc: 0,
    anaPara: 0,
    faizOrani: 0.18,
    odemeGunu: null
  },
  pazarSatislari: [],
  itibar: 35,
  exp: 0,
  acilanBasarimlar: [],
  istatistik: {
    satilanUrunSayisi: 0,
    pazarSohbetSayisi: 0,
    zararSatisSayisi: 0,
    yukseltilenDepoSayisi: 0,
    efsaneSatisSayisi: 0
  },
  pazarHaberi: {
    id: "haber-baslangic",
    baslik: "Sakin Pazar",
    aciklama: "Bugün piyasada büyük dalga yok. Dengeli fiyatlar bekleniyor.",
    etki: "Tüm fiyatlar normal seyrinde.",
    hedefNadirlik: "tum",
    carpani: 1
  }
};

export const nadirlikAyarlari: Record<Nadirlik, NadirlikAyari> = {
  cop: {
    etiket: "Çöp",
    renk: "#8b93a7",
    arkaPlan: "#161b26",
    minDeger: 1,
    maxDeger: 25,
    isimler: ["Yırtık Uzatma Kablosu", "Boş Karton Kutu", "Paslı Vida Poşeti", "Kırık Plastik Sandalye", "Eski Gazete Demeti", "Çatlak Bardak Seti"]
  },
  normal: {
    etiket: "Normal",
    renk: "#38d4a2",
    arkaPlan: "#10251f",
    minDeger: 20,
    maxDeger: 120,
    isimler: ["Temiz Spor Çanta", "Masa Lambası", "Küçük El Aleti", "Kablo Kutusu", "Ofis Organizeri", "İkinci El Tost Makinesi"]
  },
  iyi: {
    etiket: "İyi",
    renk: "#42a5ff",
    arkaPlan: "#0d2136",
    minDeger: 150,
    maxDeger: 550,
    isimler: ["Sağlam Bisiklet", "Retro Radyo", "Profesyonel Matkap", "Mini Buzdolabı", "Küçük Televizyon", "Fotoğraf Tripodu"]
  },
  nadir: {
    etiket: "Nadir",
    renk: "#c77dff",
    arkaPlan: "#251333",
    minDeger: 800,
    maxDeger: 2500,
    isimler: ["Antika Kamera", "İmzalı Forma", "Koleksiyon Plağı", "Gümüş Çatal Seti", "Drone Seti", "Vintage Oyun Konsolu"]
  },
  efsane: {
    etiket: "Efsane",
    renk: "#ffd166",
    arkaPlan: "#30260c",
    minDeger: 4500,
    maxDeger: 15000,
    isimler: ["Altın Cep Saati", "Nadir Yağlı Boya Tablo", "Klasik Arcade Kabini", "Elmas Kolye", "İmzalı Gitar", "Lüks Saat Kutusu"]
  }
};