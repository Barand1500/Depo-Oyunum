import type { DepoKaydi, EnvanterUrunu, OyunDurumu, PazarHaberi } from "../tipler/oyunTipleri";
import type { AcikArtirmaZorlugu, Katilimci, PazarDeposu, PazarUrunu, SaticiRolu, TeklifSahibi } from "../tipler/ekranTipleri";
import { GUN_BASLANGIC_DAKIKA, avatarRenkleri, depoDurumlari, depoKaliteAyarlari, depoKonumlari, depoOnAdlari, depoTurleri, isimHavuzu, pazarHaberleri, saticiIsimleri, saticiRolleri, urunIpuclari } from "../veri/ekranSabitleri";
import { ilkOyunDurumu } from "../veri/oyunVerisi";
import { depoUrunleriOlustur } from "./loot";

export function sayiArasi(minimum: number, maksimum: number) {
  return Math.floor(Math.random() * (maksimum - minimum + 1)) + minimum;
}

export function teklifOku(teklifMetni: string) {
  return Number(teklifMetni.replace(/[^0-9]/g, ""));
}

export function liderAdi(lider: TeklifSahibi, katilimcilar: Katilimci[]) {
  if (lider === "oyuncu") return "Sen";
  return katilimcilar.find((katilimci) => katilimci.id === lider)?.isim ?? "Yok";
}

export function sureYaz(saniye: number) {
  const dakika = Math.floor(saniye / 60);
  const kalanSaniye = saniye % 60;

  return `${dakika}:${String(kalanSaniye).padStart(2, "0")}`;
}

export function tarihYaz(gun: number) {
  return `${gun}. Gün`;
}

export function saatYaz(dakika: number) {
  const saat = Math.floor(dakika / 60) % 24;
  const kalanDakika = dakika % 60;

  return `${String(saat).padStart(2, "0")}.${String(kalanDakika).padStart(2, "0")}`;
}

export function profilBasHarfleri(ad: string, soyad: string) {
  const adHarf = ad.trim()[0] ?? "B";
  const soyadHarf = soyad.trim()[0] ?? "D";

  return `${adHarf}${soyadHarf}`.toLocaleUpperCase("tr-TR");
}

export function erkenOdemeIndirimiHesapla(oyunDurumu: OyunDurumu) {
  if (oyunDurumu.kredi.borc <= 0 || oyunDurumu.kredi.odemeGunu === null) return 0;

  const kalanGun = Math.max(0, oyunDurumu.kredi.odemeGunu - oyunDurumu.gun);
  const erkenIndirimOrani = Math.min(0.18, kalanGun * 0.018);

  return Math.round(oyunDurumu.kredi.borc * erkenIndirimOrani);
}

export function pazarHaberiOlustur(gun: number): PazarHaberi {
  const haber = pazarHaberleri[(gun - 1) % pazarHaberleri.length];
  return { ...haber, id: `${haber.id}-${gun}` };
}

export function itibarSinirla(itibar: number) {
  return Math.max(0, Math.min(100, Math.round(itibar)));
}

export function itibarEtiketi(itibar: number) {
  if (itibar >= 80) return "Güvenilir Satıcı";
  if (itibar >= 55) return "Tanınıyor";
  if (itibar >= 30) return "Yeni Satıcı";
  return "Riskli Satıcı";
}

export function depoKaliteSeviyesi(depo: DepoKaydi) {
  return Math.max(1, Math.min(3, depo.kaliteSeviyesi ?? 1)) as 1 | 2 | 3;
}

export function depoKaliteAyari(depo: DepoKaydi) {
  return depoKaliteAyarlari[depoKaliteSeviyesi(depo)];
}

export function urunGecmisiEkle(urun: EnvanterUrunu, olay: string) {
  return { ...urun, gecmis: [olay, ...(urun.gecmis ?? [])].slice(0, 6) };
}

export function haberCarpani(urun: EnvanterUrunu, haber: PazarHaberi) {
  return haber.hedefNadirlik === "tum" || haber.hedefNadirlik === urun.nadirlik ? haber.carpani : 1;
}

export function haberTeklifCarpani(urun: EnvanterUrunu, haber: PazarHaberi) {
  return haberCarpani(urun, haber) * (haber.pazarTeklifCarpani ?? 1);
}

export function haberBeklemeSaniyesi(minimum: number, maksimum: number, haber: PazarHaberi) {
  return Math.max(8, sayiArasi(minimum, maksimum) + (haber.musteriBeklemeBonus ?? 0));
}

export function haberMusteriGelmeSansi(temelSans: number, haber: PazarHaberi) {
  return Math.min(0.12, temelSans * (haber.musteriGelmeCarpani ?? 1));
}

export function oyunuDuzenle(kayitliDurum: Partial<OyunDurumu>): OyunDurumu {
  return {
    ...ilkOyunDurumu,
    ...kayitliDurum,
    toplamHarcama: kayitliDurum.toplamHarcama ?? 0,
    toplamKazanc: kayitliDurum.toplamKazanc ?? 0,
    acilanDepo: kayitliDurum.acilanDepo ?? 0,
    gun: kayitliDurum.gun ?? 1,
    saatDakika: kayitliDurum.saatDakika ?? GUN_BASLANGIC_DAKIKA,
    gunSonu: kayitliDurum.gunSonu ?? false,
    sahipDepolar: (kayitliDurum.sahipDepolar ?? []).map((depo) => ({
      ...depo,
      kaliteSeviyesi: depo.kaliteSeviyesi ?? 1,
      kalite: depo.kalite ?? "standart",
      urunler: depo.urunler.map((urun) => ({ ...urun, gecmis: urun.gecmis ?? [] }))
    })),
    envanter: (kayitliDurum.envanter ?? []).map((urun) => ({ ...urun, gecmis: urun.gecmis ?? [] })),
    profil: {
      ...ilkOyunDurumu.profil,
      ...(kayitliDurum.profil ?? {})
    },
    kredi: {
      ...ilkOyunDurumu.kredi,
      ...(kayitliDurum.kredi ?? {})
    },
    pazarSatislari: (kayitliDurum.pazarSatislari ?? []).map((satis) => ({
      ...satis,
      sohbetler: satis.sohbetler ?? []
    })),
    itibar: kayitliDurum.itibar ?? ilkOyunDurumu.itibar,
    exp: kayitliDurum.exp ?? ilkOyunDurumu.exp,
    acilanBasarimlar: kayitliDurum.acilanBasarimlar ?? [],
    istatistik: {
      ...ilkOyunDurumu.istatistik,
      ...(kayitliDurum.istatistik ?? {})
    },
    pazarHaberi: kayitliDurum.pazarHaberi ?? pazarHaberiOlustur(kayitliDurum.gun ?? 1)
  };
}

export function zorlukSec(): AcikArtirmaZorlugu {
  const sans = Math.random();

  if (sans < 0.48) return "Kolay";
  if (sans < 0.84) return "Orta";
  return "Zor";
}

export function katilimcilariOlustur(baslangicTeklifi: number, zorluk: AcikArtirmaZorlugu, kisiSayisi = sayiArasi(3, 20)) {
  const zorlukCarpani = zorluk === "Kolay" ? 1.45 : zorluk === "Orta" ? 2.15 : 3.1;
  const takintiliIndex = Math.random() < 0.38 ? sayiArasi(0, kisiSayisi - 1) : -1;

  return Array.from({ length: kisiSayisi }, (_, index) => ({
    id: `katilimci-${Date.now()}-${index}`,
    isim: isimHavuzu[index % isimHavuzu.length],
    cinsiyet: index % 2 === 0 ? "K" : "E",
    butce: Math.round(baslangicTeklifi * sayiArasi(105, Math.round(zorlukCarpani * 100)) / 100),
    agresiflik: Math.min(0.95, Math.random() * (zorluk === "Zor" ? 0.9 : zorluk === "Orta" ? 0.7 : 0.52)),
    renk: avatarRenkleri[index % avatarRenkleri.length],
    aktif: true,
    takintili: index === takintiliIndex
  })) satisfies Katilimci[];
}

export function depoIsmiOlustur() {
  return `${depoOnAdlari[sayiArasi(0, depoOnAdlari.length - 1)]} ${depoTurleri[sayiArasi(0, depoTurleri.length - 1)]}`;
}

export function pazarDepolariOlustur(haber?: PazarHaberi) {
  return Array.from({ length: 4 }, (_, index) => {
    const { urunler } = depoUrunleriOlustur();
    const degerTahmini = urunler.reduce((toplam, urun) => toplam + urun.deger, 0);
    const baslangicCarpani = haber?.acikArtirmaBaslangicCarpani ?? 1;
    const talepCarpani = haber?.acikArtirmaTalepCarpani ?? 1;
    const baslangicTeklifi = Math.max(25, Math.round(degerTahmini * sayiArasi(7, 14) / 100 * baslangicCarpani));
    const zorluk = zorlukSec();

    return {
      id: `pazar-${Date.now()}-${index}`,
      isim: depoIsmiOlustur(),
      konum: depoKonumlari[sayiArasi(0, depoKonumlari.length - 1)],
      durum: depoDurumlari[sayiArasi(0, depoDurumlari.length - 1)],
      urunler: urunler.map((urun) => ({ ...urun, goruldu: false, satildi: false })),
      baslangicTeklifi,
      katilimciSayisi: Math.max(2, Math.min(24, Math.round(sayiArasi(3, 18) * talepCarpani))),
      zorluk,
      sureSaniye: sayiArasi(60, 300)
    } satisfies PazarDeposu;
  });
}

export function urunPazariOlustur(haber?: PazarHaberi) {
  const { urunler } = depoUrunleriOlustur();

  return urunler.slice(0, 5).map((urun, index) => {
    const kabulCarpani = urun.nadirlik === "cop" ? 0.45 : urun.nadirlik === "normal" ? 0.58 : urun.nadirlik === "iyi" ? 0.68 : 0.78;
    const haberFiyatCarpani = haber?.urunPazariFiyatCarpani ?? 1;
    const kabulFiyati = Math.max(1, Math.round(urun.deger * kabulCarpani * haberFiyatCarpani));
    const saticiRolu = saticiRolleri[sayiArasi(0, saticiRolleri.length - 1)];

    return {
      id: `urun-pazari-${Date.now()}-${index}`,
      urun: { ...urun, goruldu: true, satildi: false },
      satici: saticiIsimleri[index % saticiIsimleri.length],
      ipucu: urunIpuclari[sayiArasi(0, urunIpuclari.length - 1)],
      kabulFiyati,
      teklifMetni: String(Math.max(1, Math.round(kabulFiyati * 0.85))),
      mesaj: "Fiyat gizli. Ürünü incele, teklifini yaz.",
      satildi: false,
      saticiRolu,
      cevapKalanSaniye: 0,
      bekleyenTeklif: null
    } satisfies PazarUrunu;
  });
}

export function saticiCevapSuresi(rol: SaticiRolu) {
  if (rol === "hizli") return 1;
  if (rol === "sabirli") return sayiArasi(3, 5);
  if (rol === "inatci") return sayiArasi(3, 6);
  return sayiArasi(2, 3);
}

export function urunIkonuSec(urunIsmi: string) {
  const isim = urunIsmi.toLocaleLowerCase("tr-TR");

  if (isim.includes("saat")) return "⌚";
  if (isim.includes("kamera")) return "📷";
  if (isim.includes("bisiklet")) return "🚲";
  if (isim.includes("radyo")) return "📻";
  if (isim.includes("matkap") || isim.includes("vida")) return "🔧";
  if (isim.includes("televizyon")) return "📺";
  if (isim.includes("forma")) return "👕";
  if (isim.includes("plak")) return "💿";
  if (isim.includes("kolye")) return "💎";
  if (isim.includes("gitar")) return "🎸";
  if (isim.includes("tablo")) return "🖼️";
  if (isim.includes("kablo")) return "🔌";
  if (isim.includes("lamba")) return "💡";
  if (isim.includes("çanta")) return "🧳";
  if (isim.includes("bardak")) return "☕";
  return "📦";
}
