import type { EnvanterUrunu, Nadirlik } from "./oyunTipleri";

export type Sahne = "ana" | "pazar" | "urunPazari" | "envanter" | "acikArtirma" | "depo" | "depoKur" | "depoUrunEkle" | "profil" | "depoSatis" | "gunSonu";
export type TeklifSahibi = "oyuncu" | string | null;
export type EnvanterSekmesi = "depolar" | "urunler";
export type SaticiRolu = "hizli" | "normal" | "sabirli" | "inatci";
export type AcikArtirmaZorlugu = "Kolay" | "Orta" | "Zor";
export type AliciTipi = "koleksiyoncu" | "toptanci" | "pazarlikci" | "aceleci";

export type AliciProfili = {
  tip: AliciTipi;
  isim: string;
  aciklama: string;
  renk: string;
  butceCarpani: number;
  hedefNadirlikler?: Nadirlik[];
};

export type KaynakliUrun = EnvanterUrunu & {
  kaynak: string;
  depoId?: string;
};

export type SatisTeklifi = {
  id: string;
  isim: string;
  teklif: number;
  renk: string;
  profil: AliciProfili;
  kalanSaniye: number;
};

export type DepoSatisDurumu = {
  urunler: KaynakliUrun[];
  baslangicMetni: string;
  sureMetni: string;
  basladi: boolean;
  kalanSaniye: number;
  teklifler: SatisTeklifi[];
  seciliTeklifId: string | null;
  teklifGecmisi: string[];
  mesaj: string;
  enYuksekTeklif: number;
  oneriFiyat: number;
  sonCagriYapildi: boolean;
};

export type PazarDeposu = {
  id: string;
  isim: string;
  konum: string;
  durum: string;
  urunler: EnvanterUrunu[];
  baslangicTeklifi: number;
  katilimciSayisi: number;
  zorluk: AcikArtirmaZorlugu;
  sureSaniye: number;
};

export type PazarUrunu = {
  id: string;
  urun: EnvanterUrunu;
  satici: string;
  ipucu: string;
  kabulFiyati: number;
  teklifMetni: string;
  mesaj: string;
  satildi: boolean;
  saticiRolu: SaticiRolu;
  cevapKalanSaniye: number;
  bekleyenTeklif: number | null;
};

export type Katilimci = {
  id: string;
  isim: string;
  cinsiyet: "K" | "E";
  butce: number;
  agresiflik: number;
  renk: string;
  aktif: boolean;
  takintili: boolean;
  sonTeklif?: number;
};

export type AcikArtirmaDurumu = {
  depoIsmi: string;
  urunler: EnvanterUrunu[];
  mevcutTeklif: number;
  teklifMetni: string;
  lider: TeklifSahibi;
  tur: number;
  sureSaniye: number;
  kalanSaniye: number;
  teklifsizSaniye: number;
  teklifBeklemeSaniye: number;
  zorluk: AcikArtirmaZorlugu;
  katilimcilar: Katilimci[];
  saticiSozu: string;
  salonMesaji: string;
};
