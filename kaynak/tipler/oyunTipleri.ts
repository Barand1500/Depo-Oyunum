export type Nadirlik = "cop" | "normal" | "iyi" | "nadir" | "efsane";
export type DepoKalitesi = "standart" | "duzenli" | "premium";

export type PazarHaberi = {
  id: string;
  baslik: string;
  aciklama: string;
  hedefNadirlik: Nadirlik | "tum";
  carpani: number;
};

export type EnvanterUrunu = {
  id: string;
  isim: string;
  deger: number;
  nadirlik: Nadirlik;
  goruldu?: boolean;
  satildi?: boolean;
  gecmis?: string[];
};

export type DepoKaydi = {
  id: string;
  isim: string;
  satinAlmaFiyati: number;
  urunler: EnvanterUrunu[];
  acildi: boolean;
  olusturmaZamani: number;
  satinAlmaGunu?: number;
  oyuncuDeposu?: boolean;
  kalite?: DepoKalitesi;
  kaliteSeviyesi?: number;
};

export type ProfilBilgisi = {
  ad: string;
  soyad: string;
};

export type KrediBilgisi = {
  borc: number;
  anaPara: number;
  faizOrani: number;
  odemeGunu: number | null;
};

export type PazarSatisKaydi = {
  id: string;
  urun: EnvanterUrunu & { depoId?: string };
  kaynak: string;
  teklif: number | null;
  musteri: string | null;
  durum: "bekliyor" | "teklif" | "vazgecti";
  sonrakiMusteriGunu: number;
};

export type OyunDurumu = {
  para: number;
  envanter: EnvanterUrunu[];
  acilanDepo: number;
  toplamKazanc: number;
  toplamHarcama: number;
  sahipDepolar: DepoKaydi[];
  gun: number;
  saatDakika: number;
  gunSonu: boolean;
  profil: ProfilBilgisi;
  kredi: KrediBilgisi;
  pazarSatislari: PazarSatisKaydi[];
  itibar: number;
  pazarHaberi: PazarHaberi;
};

export type NadirlikAyari = {
  etiket: string;
  renk: string;
  arkaPlan: string;
  minDeger: number;
  maxDeger: number;
  isimler: string[];
};