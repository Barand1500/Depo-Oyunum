import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { DepoyaEklenecekUrunKarti } from "../bilesenler/DepoyaEklenecekUrunKarti";
import { UrunKutusu } from "../bilesenler/UrunKutusu";
import type { AcikArtirmaDurumu, DepoSatisDurumu, EnvanterSekmesi, KaynakliUrun, PazarDeposu, PazarUrunu, Sahne, SatisTeklifi, TeklifSahibi } from "../tipler/ekranTipleri";
import type { DepoKaydi, OyunDurumu } from "../tipler/oyunTipleri";
import { AKSIYON_SURELERI, GERCEK_ZAMAN_ARALIGI_MS, GERCEK_ZAMAN_OYUN_DAKIKASI, GUN_BASLANGIC_DAKIKA, GUN_BITIS_DAKIKA, aliciProfilleri, avatarRenkleri, depoKaliteAyarlari, isimHavuzu, krediTutarlari, saticiIsimleri } from "../veri/ekranSabitleri";
import { KAYIT_ANAHTARI, ilkOyunDurumu, nadirlikAyarlari } from "../veri/oyunVerisi";
import { depoKaliteAyari, depoKaliteSeviyesi, erkenOdemeIndirimiHesapla, haberCarpani, itibarEtiketi, itibarSinirla, katilimcilariOlustur, liderAdi, oyunuDuzenle, pazarDepolariOlustur, pazarHaberiOlustur, profilBasHarfleri, saatYaz, saticiCevapSuresi, sayiArasi, sureYaz, tarihYaz, teklifOku, urunGecmisiEkle, urunIkonuSec, urunPazariOlustur } from "../yardimcilar/ekranYardimcilari";
import { paraYaz } from "../yardimcilar/para";

export default function AnaOyunEkrani() {
  const [oyunDurumu, setOyunDurumu] = useState<OyunDurumu>(ilkOyunDurumu);
  const [yuklendi, setYuklendi] = useState(false);
  const [sahne, setSahne] = useState<Sahne>("ana");
  const [aktifDepoId, setAktifDepoId] = useState<string | null>(null);
  const [sonMesaj, setSonMesaj] = useState("Depo pazarına gir, açık artırmadan depo kap ve kutuları tek tek aç.");
  const [acikArtirma, setAcikArtirma] = useState<AcikArtirmaDurumu | null>(null);
  const [pazarDepolari, setPazarDepolari] = useState<PazarDeposu[]>([]);
  const [seciliPazarDeposuId, setSeciliPazarDeposuId] = useState<string | null>(null);
  const [pazarUrunleri, setPazarUrunleri] = useState<PazarUrunu[]>([]);
  const [krediMetni, setKrediMetni] = useState("500");
  const [krediOdemeAcik, setKrediOdemeAcik] = useState(false);
  const [envanterSekmesi, setEnvanterSekmesi] = useState<EnvanterSekmesi>("depolar");
  const [depoSatis, setDepoSatis] = useState<DepoSatisDurumu | null>(null);
  const [depoKurUrunu, setDepoKurUrunu] = useState<KaynakliUrun | null>(null);
  const [depoIsimMetni, setDepoIsimMetni] = useState("Benim Depom");
  const [bankaAcik, setBankaAcik] = useState(false);
  const [urunEklenecekDepoId, setUrunEklenecekDepoId] = useState<string | null>(null);

  useEffect(() => {
    async function oyunuYukle() {
      const kayitliOyun = await AsyncStorage.getItem(KAYIT_ANAHTARI);

      if (kayitliOyun) {
        setOyunDurumu(oyunuDuzenle(JSON.parse(kayitliOyun) as Partial<OyunDurumu>));
      }

      setYuklendi(true);
    }

    void oyunuYukle();
  }, []);

  useEffect(() => {
    if (!yuklendi) return;

    void AsyncStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(oyunDurumu));
  }, [oyunDurumu, yuklendi]);

  const sahipDepoSayisi = oyunDurumu.sahipDepolar.length;
  const acilmisDepoSayisi = oyunDurumu.acilanDepo;
  const karZarar = oyunDurumu.toplamKazanc - oyunDurumu.toplamHarcama;
  const aktifDepo = oyunDurumu.sahipDepolar.find((depo) => depo.id === aktifDepoId) ?? null;
  const urunEklenecekDepo = oyunDurumu.sahipDepolar.find((depo) => depo.id === urunEklenecekDepoId) ?? null;
  const seciliPazarDeposu = pazarDepolari.find((depo) => depo.id === seciliPazarDeposuId) ?? null;
  const profilHarfleri = profilBasHarfleri(oyunDurumu.profil.ad, oyunDurumu.profil.soyad);
  const krediGeciktiMi = oyunDurumu.kredi.odemeGunu !== null && oyunDurumu.gun > oyunDurumu.kredi.odemeGunu && oyunDurumu.kredi.borc > 0;
  const erkenOdemeIndirimi = erkenOdemeIndirimiHesapla(oyunDurumu);
  const krediKapamaTutari = Math.max(0, oyunDurumu.kredi.borc - erkenOdemeIndirimi);
  const itibarMetni = itibarEtiketi(oyunDurumu.itibar);
  const depoUrunleri = oyunDurumu.sahipDepolar
    .filter((depo) => depo.acildi)
    .flatMap((depo) => depo.urunler.map((urun) => ({ ...urun, kaynak: depo.isim, depoId: depo.id })));
  const envanterUrunleri: KaynakliUrun[] = [
    ...oyunDurumu.envanter.map((urun) => ({ ...urun, kaynak: "Ürünlerim" })),
    ...depoUrunleri
  ];
  const bildirimSayisi = oyunDurumu.pazarSatislari.filter((satis) => satis.durum === "teklif").length;
  const satilmisKayitSayisi = envanterUrunleri.filter((urun) => urun.satildi).length + oyunDurumu.sahipDepolar.filter((depo) => depo.urunler.length > 0 && depo.urunler.every((urun) => urun.satildi)).length;
  const depoyaEklenebilirUrunler = urunEklenecekDepo
    ? envanterUrunleri.filter((urun) => !urun.satildi && urun.depoId !== urunEklenecekDepo.id && !oyunDurumu.pazarSatislari.some((satis) => satis.urun.id === urun.id))
    : [];

  const zamanIlerle = useCallback((dakika: number) => {
    setOyunDurumu((mevcutDurum) => {
      if (mevcutDurum.gunSonu) return mevcutDurum;

      const yeniDakikaHam = mevcutDurum.saatDakika + dakika;
      const gunBitti = yeniDakikaHam >= GUN_BITIS_DAKIKA;
      const yeniDakika = gunBitti ? 0 : yeniDakikaHam;
      const gecikmisKredi = mevcutDurum.kredi.borc > 0 && mevcutDurum.kredi.odemeGunu !== null && mevcutDurum.gun > mevcutDurum.kredi.odemeGunu;
      const gecikmeFaizi = gecikmisKredi ? Math.max(5, Math.round(mevcutDurum.kredi.borc * 0.03)) : 0;

      return {
        ...mevcutDurum,
        saatDakika: yeniDakika,
        gunSonu: gunBitti,
        kredi: {
          ...mevcutDurum.kredi,
          borc: mevcutDurum.kredi.borc + gecikmeFaizi
        }
      };
    });
  }, []);

  useEffect(() => {
    if (!yuklendi || oyunDurumu.gunSonu) return;

    const zamanSayaci = setInterval(() => zamanIlerle(GERCEK_ZAMAN_OYUN_DAKIKASI), GERCEK_ZAMAN_ARALIGI_MS);

    return () => clearInterval(zamanSayaci);
  }, [oyunDurumu.gunSonu, yuklendi, zamanIlerle]);

  const sonrakiGuneGec = useCallback(() => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      gun: mevcutDurum.gun + 1,
      saatDakika: GUN_BASLANGIC_DAKIKA,
      gunSonu: false,
      pazarHaberi: pazarHaberiOlustur(mevcutDurum.gun + 1),
      pazarSatislari: mevcutDurum.pazarSatislari.map((satis) => satis.durum === "vazgecti" && satis.sonrakiMusteriGunu <= mevcutDurum.gun + 1
        ? {
          ...satis,
          durum: "teklif",
          musteri: saticiIsimleri[sayiArasi(0, saticiIsimleri.length - 1)],
          teklif: Math.max(1, Math.round(satis.urun.deger * sayiArasi(45, 92) / 100))
        }
        : satis)
    }));
    setSahne("ana");
  }, []);

  const acikArtirmayaGir = useCallback(() => {
    const yeniPazar = pazarDepolariOlustur();

    zamanIlerle(AKSIYON_SURELERI.depoPazarinaGit);
    setPazarDepolari(yeniPazar);
    setSeciliPazarDeposuId(yeniPazar[0]?.id ?? null);
    setSahne("pazar");
  }, [zamanIlerle]);

  const urunPazarinaGir = useCallback(() => {
    setPazarUrunleri(urunPazariOlustur());
    setSahne("urunPazari");
  }, []);

  const urunTeklifMetniGuncelle = useCallback((urunId: string, teklifMetni: string) => {
    setPazarUrunleri((mevcutUrunler) => mevcutUrunler.map((pazarUrunu) => pazarUrunu.id === urunId
      ? { ...pazarUrunu, teklifMetni }
      : pazarUrunu));
  }, []);

  const uruneTeklifVer = useCallback((pazarUrunu: PazarUrunu) => {
    const teklif = teklifOku(pazarUrunu.teklifMetni);

    if (pazarUrunu.satildi) return;
    if (pazarUrunu.cevapKalanSaniye > 0) return;

    if (teklif <= 0) {
      setPazarUrunleri((mevcutUrunler) => mevcutUrunler.map((urun) => urun.id === pazarUrunu.id ? { ...urun, mesaj: "Satıcı boş teklife bakmadı." } : urun));
      return;
    }

    if (teklif > oyunDurumu.para) {
      setPazarUrunleri((mevcutUrunler) => mevcutUrunler.map((urun) => urun.id === pazarUrunu.id ? { ...urun, mesaj: "Cüzdandaki para bu teklife yetmiyor." } : urun));
      return;
    }

    setPazarUrunleri((mevcutUrunler) => mevcutUrunler.map((urun) => urun.id === pazarUrunu.id ? {
      ...urun,
      bekleyenTeklif: teklif,
      cevapKalanSaniye: saticiCevapSuresi(urun.saticiRolu),
      mesaj: "Satıcı teklifi inceliyor..."
    } : urun));
    zamanIlerle(AKSIYON_SURELERI.urunPazariTeklif);
  }, [oyunDurumu.para, zamanIlerle]);

  const pazarDeposuAcikArtirmayaGir = useCallback((pazarDeposu: PazarDeposu) => {
    setAcikArtirma({
      depoIsmi: pazarDeposu.isim,
      urunler: pazarDeposu.urunler,
      mevcutTeklif: pazarDeposu.baslangicTeklifi,
      teklifMetni: String(pazarDeposu.baslangicTeklifi + 20),
      lider: null,
      tur: 1,
      sureSaniye: pazarDeposu.sureSaniye,
      kalanSaniye: pazarDeposu.sureSaniye,
      teklifsizSaniye: 0,
      teklifBeklemeSaniye: 0,
      zorluk: pazarDeposu.zorluk,
      katilimcilar: katilimcilariOlustur(pazarDeposu.baslangicTeklifi, pazarDeposu.zorluk, pazarDeposu.katilimciSayisi),
      saticiSozu: `${pazarDeposu.isim} için salon açıldı. Bugün tek depo hakkını burada kullanıyorsun.`,
      salonMesaji: `${tarihYaz(oyunDurumu.gun)} ${saatYaz(oyunDurumu.saatDakika)}. Bu ${pazarDeposu.zorluk.toLowerCase()} açık artırma ${sureYaz(pazarDeposu.sureSaniye)} sürecek.`
    });
    setSahne("acikArtirma");
  }, [oyunDurumu.gun, oyunDurumu.saatDakika]);

  const depoyuKaydet = useCallback((teklif: number, acikArtirmaDurumu: AcikArtirmaDurumu) => {
    const yeniDepo: DepoKaydi = {
      id: `depo-${Date.now()}`,
      isim: acikArtirmaDurumu.depoIsmi,
      satinAlmaFiyati: teklif,
      urunler: acikArtirmaDurumu.urunler.map((urun) => urunGecmisiEkle(urun, `${tarihYaz(oyunDurumu.gun)} açık artırmadan depo ile alındı.`)),
      acildi: false,
      olusturmaZamani: Date.now(),
      satinAlmaGunu: oyunDurumu.gun,
      kalite: "standart",
      kaliteSeviyesi: 1
    };

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para - teklif,
      toplamHarcama: mevcutDurum.toplamHarcama + teklif,
      sahipDepolar: [yeniDepo, ...mevcutDurum.sahipDepolar]
    }));
    setAktifDepoId(yeniDepo.id);
    setAcikArtirma(null);
    setSahne("depo");
    setSonMesaj(`${yeniDepo.isim} ${paraYaz(teklif)} ile senin oldu. Depoya girip kutuları açabilirsin.`);
  }, [oyunDurumu.gun]);

  const acikArtirmayiBitir = useCallback((bitenArtirma: AcikArtirmaDurumu) => {
    if (bitenArtirma.lider === "oyuncu") {
      depoyuKaydet(bitenArtirma.mevcutTeklif, bitenArtirma);
      return;
    }

    const kazanan = liderAdi(bitenArtirma.lider, bitenArtirma.katilimcilar);

    setAcikArtirma(null);
    setSahne("ana");
    setSonMesaj(
      bitenArtirma.lider
        ? `Süre bitti. ${kazanan} depoyu ${paraYaz(bitenArtirma.mevcutTeklif)} ile aldı.`
        : "Süre bitti ama güçlü teklif gelmedi. Depo pazarı yeni fırsat bekliyor."
    );
  }, [depoyuKaydet]);

  useEffect(() => {
    if (sahne !== "acikArtirma") return;

    const sayac = setInterval(() => {
      setAcikArtirma((mevcutArtirma) => {
        if (!mevcutArtirma) return mevcutArtirma;

        const yeniTeklifsizSaniye = mevcutArtirma.teklifsizSaniye + 1;
        const erkenSayimBasladi = yeniTeklifsizSaniye >= 8 && mevcutArtirma.lider !== null;
        const yeniKalanSaniye = Math.max(0, erkenSayimBasladi
          ? Math.min(mevcutArtirma.kalanSaniye - 1, 10)
          : mevcutArtirma.kalanSaniye - 1);

        return {
          ...mevcutArtirma,
          kalanSaniye: yeniKalanSaniye,
          teklifsizSaniye: yeniTeklifsizSaniye,
          teklifBeklemeSaniye: Math.max(0, mevcutArtirma.teklifBeklemeSaniye - 1),
          saticiSozu: erkenSayimBasladi
            ? `Uzun sessizlik oldu. Erken bırakıyorum... ${yeniKalanSaniye}`
            : mevcutArtirma.saticiSozu,
          salonMesaji: erkenSayimBasladi
            ? `8 saniyedir yeni teklif yok. Lider korunursa ${sureYaz(yeniKalanSaniye)} içinde satış kapanır.`
            : mevcutArtirma.salonMesaji
        };
      });
    }, 1000);

    return () => clearInterval(sayac);
  }, [sahne]);

  useEffect(() => {
    if (sahne !== "acikArtirma" || !acikArtirma || acikArtirma.kalanSaniye > 0) return;

    acikArtirmayiBitir(acikArtirma);
  }, [acikArtirma, acikArtirmayiBitir, sahne]);

  useEffect(() => {
    if (sahne !== "acikArtirma") return;

    const rakipSayaci = setInterval(() => {
      setAcikArtirma((mevcutArtirma) => {
        if (!mevcutArtirma || mevcutArtirma.kalanSaniye <= 0) return mevcutArtirma;
        if (mevcutArtirma.teklifBeklemeSaniye > 0) return mevcutArtirma;

        const adaylar = mevcutArtirma.katilimcilar.filter(
          (katilimci) => katilimci.aktif && katilimci.butce > mevcutArtirma.mevcutTeklif + 10 && katilimci.id !== mevcutArtirma.lider
        );

        if (adaylar.length === 0) {
          return {
            ...mevcutArtirma,
            saticiSozu: "Salonda bekleyiş var. Son saniyeler değerli.",
            salonMesaji: "Kimse yeni teklif vermedi. Lider korunuyor."
          };
        }

        const takintiliAday = mevcutArtirma.lider === "oyuncu"
          ? adaylar.find((katilimci) => katilimci.takintili && Math.random() < 0.86)
          : undefined;
        const istekliAdaylar = adaylar.filter((katilimci) => Math.random() < 0.34 + katilimci.agresiflik * 0.36);
        const teklifVeren = (takintiliAday ?? istekliAdaylar[0] ?? adaylar[sayiArasi(0, adaylar.length - 1)]);
        const yeniTeklif = Math.min(teklifVeren.butce, mevcutArtirma.mevcutTeklif + sayiArasi(6, 28));
        const yeniKatilimcilar = mevcutArtirma.katilimcilar.map((katilimci) => {
          if (katilimci.id === teklifVeren.id) return { ...katilimci, sonTeklif: yeniTeklif };
          if (katilimci.aktif && katilimci.butce < yeniTeklif + 10 && Math.random() < 0.35) return { ...katilimci, aktif: false };
          return katilimci;
        });

        return {
          ...mevcutArtirma,
          mevcutTeklif: yeniTeklif,
          lider: teklifVeren.id,
          tur: mevcutArtirma.tur + 1,
          teklifsizSaniye: 0,
          teklifBeklemeSaniye: 2,
          katilimcilar: yeniKatilimcilar,
          saticiSozu: teklifVeren.takintili
            ? `${teklifVeren.isim} sana taktı! Teklifi yine yükseltti.`
            : `${teklifVeren.isim} el kaldırdı! Teklif yükseldi.`,
          salonMesaji: teklifVeren.takintili
            ? `${teklifVeren.isim} özellikle seni geçmeye çalışıyor: ${paraYaz(yeniTeklif)}.`
            : `${teklifVeren.isim} şu an önde: ${paraYaz(yeniTeklif)}.`,
          teklifMetni: String(Math.min(oyunDurumu.para, yeniTeklif + 20))
        };
      });
    }, 1000);

    return () => clearInterval(rakipSayaci);
  }, [oyunDurumu.para, sahne]);

  useEffect(() => {
    if (sahne !== "urunPazari") return;

    const cevapSayaci = setInterval(() => {
      setPazarUrunleri((mevcutUrunler) => mevcutUrunler.map((pazarUrunu) => {
        if (pazarUrunu.satildi || pazarUrunu.bekleyenTeklif === null || pazarUrunu.cevapKalanSaniye <= 0) return pazarUrunu;

        if (pazarUrunu.cevapKalanSaniye > 1) {
          return {
            ...pazarUrunu,
            cevapKalanSaniye: pazarUrunu.cevapKalanSaniye - 1,
            mesaj: `Satıcı düşünüyor... ${pazarUrunu.cevapKalanSaniye - 1} sn`
          };
        }

        const rolCarpani = pazarUrunu.saticiRolu === "hizli" ? 0.95 : pazarUrunu.saticiRolu === "sabirli" ? 1.08 : pazarUrunu.saticiRolu === "inatci" ? 1.35 : 1;
        const kabulEderMi = pazarUrunu.bekleyenTeklif >= Math.round(pazarUrunu.kabulFiyati * rolCarpani);

        if (!kabulEderMi) {
          const yeniOneri = Math.min(oyunDurumu.para, Math.max(pazarUrunu.bekleyenTeklif + sayiArasi(5, 35), Math.round(pazarUrunu.kabulFiyati * rolCarpani)));

          return {
            ...pazarUrunu,
            teklifMetni: String(yeniOneri),
            bekleyenTeklif: null,
            cevapKalanSaniye: 0,
            mesaj: pazarUrunu.saticiRolu === "inatci" ? "Satıcı tok. Bu teklifle bırakmıyor." : "Satıcı kabul etmedi, biraz daha yükseltmeni bekliyor."
          };
        }

        setOyunDurumu((mevcutDurum) => {
          if (mevcutDurum.para < (pazarUrunu.bekleyenTeklif ?? 0)) return mevcutDurum;

          return {
            ...mevcutDurum,
            para: mevcutDurum.para - (pazarUrunu.bekleyenTeklif ?? 0),
            toplamHarcama: mevcutDurum.toplamHarcama + (pazarUrunu.bekleyenTeklif ?? 0),
            envanter: [urunGecmisiEkle({ ...pazarUrunu.urun, id: `envanter-${Date.now()}`, satildi: false, goruldu: true }, `${tarihYaz(mevcutDurum.gun)} ürün pazarından alındı.`), ...mevcutDurum.envanter]
          };
        });
        setSonMesaj(`${pazarUrunu.urun.isim} Ürün Pazarı'ndan alındı.`);

        return {
          ...pazarUrunu,
          satildi: true,
          bekleyenTeklif: null,
          cevapKalanSaniye: 0,
          mesaj: `Satıcı kabul etti. Ürün ${paraYaz(pazarUrunu.bekleyenTeklif)} teklifine alındı.`
        };
      }));
    }, 1000);

    return () => clearInterval(cevapSayaci);
  }, [oyunDurumu.para, sahne]);

  const rakipleriCalistir = useCallback((oyuncuTeklifi: number, mevcutArtirma: AcikArtirmaDurumu) => {
    let yeniTeklif = oyuncuTeklifi;
    let yeniLider: TeklifSahibi = "oyuncu";
    const yeniKatilimcilar = mevcutArtirma.katilimcilar.map((katilimci) => {
      if (!katilimci.aktif) return katilimci;

      const istekliMi = katilimci.butce > yeniTeklif + 10 && Math.random() < 0.35 + katilimci.agresiflik * 0.45;

      if (!istekliMi) {
        return Math.random() < 0.18 ? { ...katilimci, aktif: false } : katilimci;
      }

      const teklif = Math.min(katilimci.butce, yeniTeklif + sayiArasi(10, 45));
      yeniTeklif = teklif;
      yeniLider = katilimci.id;

      return { ...katilimci, sonTeklif: teklif };
    });

    return { yeniTeklif, yeniLider, yeniKatilimcilar };
  }, []);

  const teklifVer = useCallback(() => {
    if (!acikArtirma) return;

    const teklif = teklifOku(acikArtirma.teklifMetni);

    if (teklif <= acikArtirma.mevcutTeklif) {
      setAcikArtirma({
        ...acikArtirma,
        saticiSozu: "Bu teklif düşük kaldı. Depo hâlâ masada.",
        salonMesaji: "Salonda hareket yok. Daha güçlü bir teklif gerekiyor."
      });
      return;
    }

    if (teklif > oyunDurumu.para) {
      setAcikArtirma({
        ...acikArtirma,
        saticiSozu: "Cüzdan bu teklifi taşımıyor. Daha gerçekçi bir rakam yaz.",
        salonMesaji: "Rakipler beklemeye geçti."
      });
      return;
    }

    setAcikArtirma({
      ...acikArtirma,
      mevcutTeklif: teklif,
      teklifMetni: String(Math.min(oyunDurumu.para, teklif + 20)),
      lider: "oyuncu",
      tur: acikArtirma.tur + 1,
      teklifsizSaniye: 0,
      teklifBeklemeSaniye: 2,
      saticiSozu: "Satıyorum... Satıyorum... Lider şu an sensin!",
      salonMesaji: `Sen öndesin: ${paraYaz(teklif)}. Süre bitene kadar koru.`
    });
  }, [acikArtirma, oyunDurumu.para]);

  const hizliAl = useCallback(() => {
    if (!acikArtirma) return;
    const hizliAlFiyati = acikArtirma.mevcutTeklif * 3;

    if (oyunDurumu.para < hizliAlFiyati) {
      setAcikArtirma({
        ...acikArtirma,
        saticiSozu: "Hızlı al için cüzdanda yeterli para yok.",
        salonMesaji: `${paraYaz(hizliAlFiyati)} gerekir. Teklif vererek şansını deneyebilirsin.`
      });
      return;
    }

    depoyuKaydet(hizliAlFiyati, {
      ...acikArtirma,
      mevcutTeklif: hizliAlFiyati,
      lider: "oyuncu"
    });
  }, [acikArtirma, depoyuKaydet, oyunDurumu.para]);

  const acikArtirmadanCekil = useCallback(() => {
    if (!acikArtirma) return;

    const aktifler = acikArtirma.katilimcilar.filter((katilimci) => katilimci.aktif);
    const kazanan = aktifler[sayiArasi(0, Math.max(0, aktifler.length - 1))] ?? acikArtirma.katilimcilar[0];
    setAcikArtirma(null);
    setSahne("ana");
    setSonMesaj(`${kazanan.isim} depoyu aldı. Sen çekildin, paran kasada kaldı.`);
  }, [acikArtirma]);

  const depoyaGir = useCallback((depoId: string) => {
    setAktifDepoId(depoId);
    setSahne("depo");
  }, []);

  const depoAc = useCallback((depoId: string) => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      acilanDepo: mevcutDurum.acilanDepo + (mevcutDurum.sahipDepolar.find((depo) => depo.id === depoId)?.acildi ? 0 : 1),
      sahipDepolar: mevcutDurum.sahipDepolar.map((depo) => depo.id === depoId ? { ...depo, acildi: true } : depo)
    }));
  }, []);

  const depoSil = useCallback((depoId: string) => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      sahipDepolar: mevcutDurum.sahipDepolar.filter((depo) => depo.id !== depoId)
    }));
    setAktifDepoId(null);
    setSahne("ana");
    setSonMesaj("Açılmış depo listeden kaldırıldı.");
  }, []);

  const satilmisUrunuSil = useCallback((urun: KaynakliUrun) => {
    setOyunDurumu((mevcutDurum) => {
      const yeniDepolar = mevcutDurum.sahipDepolar
        .map((depo) => depo.id === urun.depoId
          ? { ...depo, urunler: depo.urunler.filter((depoUrunu) => depoUrunu.id !== urun.id) }
          : depo)
        .filter((depo) => depo.urunler.length > 0 || !depo.acildi);

      return {
        ...mevcutDurum,
        envanter: urun.depoId ? mevcutDurum.envanter : mevcutDurum.envanter.filter((envanterUrunu) => envanterUrunu.id !== urun.id),
        sahipDepolar: yeniDepolar
      };
    });
    setSonMesaj(`${urun.isim} satılmış listesinden silindi.`);
  }, []);

  const satilmisleriTemizle = useCallback(() => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      envanter: mevcutDurum.envanter.filter((urun) => !urun.satildi),
      sahipDepolar: mevcutDurum.sahipDepolar
        .filter((depo) => !(depo.urunler.length > 0 && depo.urunler.every((urun) => urun.satildi)))
        .map((depo) => ({ ...depo, urunler: depo.urunler.filter((urun) => !urun.satildi) }))
        .filter((depo) => depo.urunler.length > 0 || !depo.acildi)
    }));
    setAktifDepoId((mevcutDepoId) => {
      const depo = oyunDurumu.sahipDepolar.find((depoKaydi) => depoKaydi.id === mevcutDepoId);
      return depo && depo.urunler.length > 0 && depo.urunler.every((urun) => urun.satildi) ? null : mevcutDepoId;
    });
    setSonMesaj("Satılmış ürünler ve satışı bitmiş depolar temizlendi.");
  }, [oyunDurumu.sahipDepolar]);

  const kutuyuGoster = useCallback((depoId: string, urunId: string) => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      sahipDepolar: mevcutDurum.sahipDepolar.map((depo) => depo.id === depoId
        ? { ...depo, urunler: depo.urunler.map((urun) => urun.id === urunId ? { ...urun, goruldu: true } : urun) }
        : depo)
    }));
  }, []);

  const urunuKasayaAktar = useCallback((depoId: string, urunId: string) => {
    const depo = oyunDurumu.sahipDepolar.find((depoKaydi) => depoKaydi.id === depoId);
    const urun = depo?.urunler.find((urunKaydi) => urunKaydi.id === urunId);

    if (!urun || urun.satildi || !urun.goruldu) return;

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      envanter: [urunGecmisiEkle({ ...urun, id: `envanter-${Date.now()}`, goruldu: true, satildi: false }, `${tarihYaz(mevcutDurum.gun)} ${depo?.isim ?? "depodan"} kasaya aktarıldı.`), ...mevcutDurum.envanter],
      sahipDepolar: mevcutDurum.sahipDepolar.map((depoKaydi) => depoKaydi.id === depoId
        ? { ...depoKaydi, urunler: depoKaydi.urunler.filter((urunKaydi) => urunKaydi.id !== urunId) }
        : depoKaydi).filter((depoKaydi) => depoKaydi.urunler.length > 0 || !depoKaydi.acildi)
    }));
    setSonMesaj(`${urun.isim} kasaya aktarıldı. Artık Ürünlerim kısmından satış seçebilirsin.`);
  }, [oyunDurumu.sahipDepolar]);

  const hizliSat = useCallback((urun: KaynakliUrun) => {
    const satisDegeri = Math.round(urun.deger * haberCarpani(urun, oyunDurumu.pazarHaberi));

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para + satisDegeri,
      toplamKazanc: mevcutDurum.toplamKazanc + satisDegeri,
      itibar: itibarSinirla(mevcutDurum.itibar + 1),
      envanter: urun.depoId ? mevcutDurum.envanter : mevcutDurum.envanter.filter((envanterUrunu) => envanterUrunu.id !== urun.id),
      sahipDepolar: mevcutDurum.sahipDepolar.map((depo) => depo.id === urun.depoId
        ? { ...depo, urunler: depo.urunler.map((depoUrunu) => depoUrunu.id === urun.id ? { ...depoUrunu, satildi: true } : depoUrunu) }
        : depo)
    }));
    zamanIlerle(AKSIYON_SURELERI.hizliSatis);
    setSonMesaj(`${urun.isim} hızlı satışla ${paraYaz(satisDegeri)} kazandırdı.`);
  }, [oyunDurumu.pazarHaberi, zamanIlerle]);

  const depoKurulumunuAc = useCallback((urun: KaynakliUrun) => {
    setDepoKurUrunu(urun);
    setDepoIsimMetni("Benim Depom");
    setSahne("depoKur");
  }, []);

  const oyuncuDeposuOlustur = useCallback(() => {
    if (!depoKurUrunu) return;

    const depoIsmi = depoIsimMetni.trim() || "Benim Depom";
    const yeniDepo: DepoKaydi = {
      id: `oyuncu-depo-${Date.now()}`,
      isim: depoIsmi,
      satinAlmaFiyati: 0,
      urunler: [urunGecmisiEkle({ ...depoKurUrunu, goruldu: true, satildi: false }, `${tarihYaz(oyunDurumu.gun)} ${depoIsmi} içine kondu.`)],
      acildi: true,
      olusturmaZamani: Date.now(),
      satinAlmaGunu: oyunDurumu.gun,
      oyuncuDeposu: true,
      kalite: "standart",
      kaliteSeviyesi: 1
    };

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      envanter: depoKurUrunu.depoId ? mevcutDurum.envanter : mevcutDurum.envanter.filter((urun) => urun.id !== depoKurUrunu.id),
      sahipDepolar: [yeniDepo, ...mevcutDurum.sahipDepolar.map((depo) => depo.id === depoKurUrunu.depoId
        ? { ...depo, urunler: depo.urunler.filter((urun) => urun.id !== depoKurUrunu.id) }
        : depo).filter((depo) => depo.urunler.length > 0 || !depo.acildi)]
    }));
    zamanIlerle(AKSIYON_SURELERI.depoKur);
    setAktifDepoId(yeniDepo.id);
    setDepoKurUrunu(null);
    setEnvanterSekmesi("depolar");
    setSahne("depo");
    setSonMesaj(`${depoIsmi} kuruldu. + butonuyla hızlı ürün ekleyip 5 üründe satışa çıkarabilirsin.`);
  }, [depoIsimMetni, depoKurUrunu, oyunDurumu.gun, zamanIlerle]);

  const depoyaUrunEklemeEkraniniAc = useCallback((depoId: string) => {
    setUrunEklenecekDepoId(depoId);
    setSahne("depoUrunEkle");
    setSonMesaj("Eklemek istediğin ürünün kartına dokun.");
  }, []);

  const depoyaUrunEkle = useCallback((depoId: string, eklenecekUrun: KaynakliUrun) => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      envanter: eklenecekUrun.depoId ? mevcutDurum.envanter : mevcutDurum.envanter.filter((urun) => urun.id !== eklenecekUrun.id),
      sahipDepolar: mevcutDurum.sahipDepolar.map((depo) => {
        if (depo.id === depoId) {
          return { ...depo, urunler: [urunGecmisiEkle({ ...eklenecekUrun, goruldu: true, satildi: false }, `${tarihYaz(mevcutDurum.gun)} ${depo.isim} içine eklendi.`), ...depo.urunler] };
        }

        if (depo.id === eklenecekUrun.depoId) {
          return { ...depo, urunler: depo.urunler.filter((urun) => urun.id !== eklenecekUrun.id) };
        }

        return depo;
      }).filter((depo) => depo.urunler.length > 0 || !depo.acildi)
    }));
    zamanIlerle(AKSIYON_SURELERI.depoyaUrunEkle);
    setSonMesaj(`${eklenecekUrun.isim} depoya eklendi.`);
    setSahne("depo");
    setAktifDepoId(depoId);
    setUrunEklenecekDepoId(null);
  }, [zamanIlerle]);

  const depoKalitesiniYukselt = useCallback((depoId: string) => {
    const depo = oyunDurumu.sahipDepolar.find((depoKaydi) => depoKaydi.id === depoId);
    if (!depo) return;

    if (!depo.oyuncuDeposu) {
      setSonMesaj("Açık artırmadan alınan depolar yükseltilemez. Kalite sadece kendi kurduğun depolarda var.");
      return;
    }

    const mevcutSeviye = Math.max(1, Math.min(3, depo.kaliteSeviyesi ?? 1)) as 1 | 2 | 3;
    const mevcutAyar = depoKaliteAyarlari[mevcutSeviye];
    if (mevcutSeviye >= 3) {
      setSonMesaj("Bu depo zaten premium seviyede.");
      return;
    }

    if (oyunDurumu.para < mevcutAyar.sonrakiUcret) {
      setSonMesaj(`Kalite yükseltmek için ${paraYaz(mevcutAyar.sonrakiUcret)} gerekiyor.`);
      return;
    }

    const yeniSeviye = (mevcutSeviye + 1) as 2 | 3;
    const yeniAyar = depoKaliteAyarlari[yeniSeviye];

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para - mevcutAyar.sonrakiUcret,
      toplamHarcama: mevcutDurum.toplamHarcama + mevcutAyar.sonrakiUcret,
      sahipDepolar: mevcutDurum.sahipDepolar.map((depoKaydi) => depoKaydi.id === depoId
        ? { ...depoKaydi, kaliteSeviyesi: yeniSeviye, kalite: yeniAyar.kalite }
        : depoKaydi)
    }));
    setSonMesaj(`${depo.isim} artık ${yeniAyar.etiket}. Sunum daha güçlü, alıcı güveni daha yüksek.`);
  }, [oyunDurumu.para, oyunDurumu.sahipDepolar]);

  const pazaraKoy = useCallback((urun: KaynakliUrun) => {
    const itibarCarpani = 0.92 + oyunDurumu.itibar / 250;
    const teklif = Math.max(1, Math.round(urun.deger * haberCarpani(urun, oyunDurumu.pazarHaberi) * itibarCarpani * sayiArasi(45, 90) / 100));

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      pazarSatislari: [{
        id: `satis-${Date.now()}`,
        urun,
        kaynak: urun.kaynak,
        teklif,
        musteri: saticiIsimleri[sayiArasi(0, saticiIsimleri.length - 1)],
        durum: "teklif",
        sonrakiMusteriGunu: mevcutDurum.gun
      }, ...mevcutDurum.pazarSatislari.filter((satis) => satis.urun.id !== urun.id)]
    }));
    zamanIlerle(AKSIYON_SURELERI.pazaraKoy);
    setSonMesaj(`${urun.isim} pazara koyuldu. Envanterde yeni teklif bildirimi var.`);
  }, [oyunDurumu.itibar, oyunDurumu.pazarHaberi, zamanIlerle]);

  const pazarTeklifiniKabulEt = useCallback((satisId: string) => {
    const satis = oyunDurumu.pazarSatislari.find((kayit) => kayit.id === satisId);
    if (!satis || satis.teklif === null) return;

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para + (satis.teklif ?? 0),
      toplamKazanc: mevcutDurum.toplamKazanc + (satis.teklif ?? 0),
      itibar: itibarSinirla(mevcutDurum.itibar + 2),
      pazarSatislari: mevcutDurum.pazarSatislari.filter((kayit) => kayit.id !== satisId),
      envanter: satis.urun.depoId ? mevcutDurum.envanter : mevcutDurum.envanter.filter((urun) => urun.id !== satis.urun.id),
      sahipDepolar: mevcutDurum.sahipDepolar.map((depo) => depo.id === satis.urun.depoId
        ? { ...depo, urunler: depo.urunler.map((urun) => urun.id === satis.urun.id ? { ...urun, satildi: true } : urun) }
        : depo)
    }));
    setSonMesaj(`${satis.urun.isim} pazarda ${paraYaz(satis.teklif)} teklifine satıldı.`);
  }, [oyunDurumu.pazarSatislari]);

  const pazarMusterisiyleKonus = useCallback((satisId: string) => {
    let musteriVazgecti = false;

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      pazarSatislari: mevcutDurum.pazarSatislari.map((satis) => {
        if (satis.id !== satisId || satis.teklif === null) return satis;

        const vazgecerMi = Math.random() < 0.35;
        if (vazgecerMi) {
          musteriVazgecti = true;
          return { ...satis, durum: "vazgecti", teklif: null, musteri: null, sonrakiMusteriGunu: mevcutDurum.gun + 1 };
        }

        return { ...satis, teklif: Math.round(satis.teklif * 1.08), durum: "teklif" };
      }),
      itibar: itibarSinirla(mevcutDurum.itibar + (musteriVazgecti ? -2 : 1))
    }));
    zamanIlerle(AKSIYON_SURELERI.pazarPazarlik);
    setSonMesaj(musteriVazgecti ? "Müşteri vazgeçti. İtibar biraz sarsıldı ama yarın yeni müşteri gelebilir." : "Müşteriyle konuşma iyi geçti. Teklif yükseldi ve itibarın güçlendi.");
  }, [zamanIlerle]);

  const oyuncuDeposunuSatisaHazirla = useCallback((depo: DepoKaydi) => {
    const satilacakUrunler = depo.urunler.filter((urun) => !urun.satildi).map((urun) => ({ ...urun, kaynak: depo.isim, depoId: depo.id }));

    if (satilacakUrunler.length < 5) {
      setSonMesaj("Depoyu satışa çıkarmak için en az 5 ürün gerekiyor.");
      return;
    }

    const kalite = depoKaliteAyari(depo);
    const haberliDeger = satilacakUrunler.reduce((toplam, seciliUrun) => toplam + Math.round(seciliUrun.deger * haberCarpani(seciliUrun, oyunDurumu.pazarHaberi)), 0);
    const itibarCarpani = 0.9 + oyunDurumu.itibar / 220;
    const toplamDeger = Math.round(haberliDeger * kalite.carpani * itibarCarpani);
    const oneriFiyat = Math.max(10, Math.round(toplamDeger * 0.48));

    setDepoSatis({
      urunler: satilacakUrunler,
      baslangicMetni: String(oneriFiyat),
      sureMetni: "90",
      basladi: false,
      kalanSaniye: 90,
      teklifler: [],
      seciliTeklifId: null,
      teklifGecmisi: [`Önerilen açılış ${paraYaz(oneriFiyat)}. ${kalite.etiket} kalite ve ${itibarMetni} itibarı hesaba katıldı.`],
      mesaj: "Açılış ücretini gir. Satış başlayınca gelen tekliflerden birini seç; süre bitince seçtiğin alıcıya satabilirsin.",
      enYuksekTeklif: 0,
      oneriFiyat,
      sonCagriYapildi: false
    });
    setSahne("depoSatis");
  }, [itibarMetni, oyunDurumu.itibar, oyunDurumu.pazarHaberi]);

  const depoSatisiniBaslat = useCallback(() => {
    if (!depoSatis) return;

    const sure = Math.max(30, Math.min(180, teklifOku(depoSatis.sureMetni)));
    const baslangic = Math.max(1, teklifOku(depoSatis.baslangicMetni));

    setDepoSatis({
      ...depoSatis,
      basladi: true,
      kalanSaniye: sure,
      enYuksekTeklif: baslangic,
      teklifler: [],
      seciliTeklifId: null,
      teklifGecmisi: [`Satış ${paraYaz(baslangic)} açılışla başladı.`, ...depoSatis.teklifGecmisi].slice(0, 8),
      mesaj: `Satış başladı. Açılış ${paraYaz(baslangic)}. Teklife dokunarak alıcıyı seç, teklif gecikirse geri çekilir.`
    });
    zamanIlerle(AKSIYON_SURELERI.depoSatisBaslat);
  }, [depoSatis, zamanIlerle]);

  const depoSatisFiyatDusur = useCallback(() => {
    setDepoSatis((mevcutSatis) => {
      if (!mevcutSatis || mevcutSatis.basladi) return mevcutSatis;
      const yeniFiyat = Math.max(1, Math.round(teklifOku(mevcutSatis.baslangicMetni) * 0.9));
      return {
        ...mevcutSatis,
        baslangicMetni: String(yeniFiyat),
        teklifGecmisi: [`Açılış ${paraYaz(yeniFiyat)} seviyesine düşürüldü.`, ...mevcutSatis.teklifGecmisi].slice(0, 8),
        mesaj: "Açılış fiyatını düşürdün. Pazarlıkçı alıcılar daha rahat gelebilir."
      };
    });
  }, []);

  const depoSatisSureUzat = useCallback(() => {
    setDepoSatis((mevcutSatis) => mevcutSatis ? {
      ...mevcutSatis,
      kalanSaniye: Math.min(240, mevcutSatis.kalanSaniye + 30),
      sureMetni: String(Math.min(240, teklifOku(mevcutSatis.sureMetni) + 30)),
      teklifGecmisi: ["Süre 30 saniye uzatıldı.", ...mevcutSatis.teklifGecmisi].slice(0, 8),
      mesaj: "Süre uzadı. Aceleci alıcılar soğuyabilir ama toptancıların teklif şansı arttı."
    } : mevcutSatis);
  }, []);

  const depoSatisSonCagri = useCallback(() => {
    setDepoSatis((mevcutSatis) => mevcutSatis ? {
      ...mevcutSatis,
      kalanSaniye: Math.min(mevcutSatis.kalanSaniye, 15),
      sonCagriYapildi: true,
      teklifGecmisi: ["Son çağrı yapıldı. Salon hızlandı.", ...mevcutSatis.teklifGecmisi].slice(0, 8),
      mesaj: "Son çağrı yaptın. Alıcılar daha hızlı karar verecek."
    } : mevcutSatis);
  }, []);

  const depoSatisTeklifiniKabulEt = useCallback((teklif: SatisTeklifi) => {
    if (!depoSatis) return;

    const satilanUrunler = depoSatis.urunler;
    const tahminiDeger = satilanUrunler.reduce((toplam, urun) => toplam + urun.deger, 0);
    const itibarOdulu = teklif.teklif >= tahminiDeger ? 4 : 2;

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para + teklif.teklif,
      toplamKazanc: mevcutDurum.toplamKazanc + teklif.teklif,
      itibar: itibarSinirla(mevcutDurum.itibar + itibarOdulu),
      envanter: mevcutDurum.envanter.filter((envanterUrunu) => !satilanUrunler.some((urun) => !urun.depoId && urun.id === envanterUrunu.id)),
      sahipDepolar: mevcutDurum.sahipDepolar.map((depo) => ({
        ...depo,
        urunler: depo.urunler.map((depoUrunu) => satilanUrunler.some((urun) => urun.depoId === depo.id && urun.id === depoUrunu.id)
          ? { ...depoUrunu, satildi: true }
          : depoUrunu)
      })).filter((depo) => !depo.urunler.every((urun) => urun.satildi))
    }));
    setSonMesaj(`${teklif.isim} depo paketini ${paraYaz(teklif.teklif)} teklifine aldı.`);
    setDepoSatis(null);
    setSahne("envanter");
    setEnvanterSekmesi("urunler");
  }, [depoSatis]);

  const depoSatisTeklifiniSec = useCallback((teklifId: string) => {
    setDepoSatis((mevcutSatis) => {
      if (!mevcutSatis) return mevcutSatis;
      const teklif = mevcutSatis.teklifler.find((kayit) => kayit.id === teklifId);
      if (!teklif) return mevcutSatis;

      return {
        ...mevcutSatis,
        seciliTeklifId: teklifId,
        enYuksekTeklif: teklif.teklif,
        mesaj: `${teklif.isim} seçildi. Süre bitince veya hazır olduğunda bu alıcıya satabilirsin.`,
        teklifGecmisi: [`${teklif.isim} seçildi: ${paraYaz(teklif.teklif)}.`, ...mevcutSatis.teklifGecmisi].slice(0, 8)
      };
    });
  }, []);

  useEffect(() => {
    if (sahne !== "depoSatis" || !depoSatis?.basladi) return;

    const sayac = setInterval(() => {
      setDepoSatis((mevcutSatis) => {
        if (!mevcutSatis || !mevcutSatis.basladi) return mevcutSatis;

        if (mevcutSatis.kalanSaniye <= 0) {
          return {
            ...mevcutSatis,
            basladi: false,
            teklifler: mevcutSatis.teklifler.filter((teklif) => teklif.kalanSaniye > 0),
            mesaj: mevcutSatis.seciliTeklifId ? "Süre bitti. Seçtiğin alıcı hâlâ bekliyorsa satışı kapatabilirsin." : "Süre bitti. Aktif tekliflerden birini seçebilir veya açılışı düşürüp tekrar deneyebilirsin."
          };
        }

        const baslangic = teklifOku(mevcutSatis.baslangicMetni);
        const toplamDeger = mevcutSatis.urunler.reduce((toplam, urun) => toplam + Math.round(urun.deger * haberCarpani(urun, oyunDurumu.pazarHaberi)), 0);
        const aktifTeklifler = mevcutSatis.teklifler
          .map((teklif) => teklif.id === mevcutSatis.seciliTeklifId ? teklif : { ...teklif, kalanSaniye: teklif.kalanSaniye - 1 })
          .filter((teklif) => teklif.kalanSaniye > 0);
        const pahaliMi = baslangic > toplamDeger * 1.08;
        const teklifGelirMi = aktifTeklifler.length < 4 && !pahaliMi && Math.random() < (mevcutSatis.sonCagriYapildi ? 0.34 : 0.18);
        const profil = aliciProfilleri[sayiArasi(0, aliciProfilleri.length - 1)];
        const hedefUrunVarMi = profil.hedefNadirlikler ? mevcutSatis.urunler.some((urun) => profil.hedefNadirlikler?.includes(urun.nadirlik)) : true;
        const profilCarpani = hedefUrunVarMi ? profil.butceCarpani : Math.max(0.84, profil.butceCarpani - 0.12);
        const teklifTabani = Math.max(baslangic, Math.round(toplamDeger * 0.58));
        const teklifTavani = Math.max(teklifTabani, Math.round(toplamDeger * (mevcutSatis.sonCagriYapildi ? 1.08 : 0.98) * Math.min(1.08, profilCarpani)));
        const yeniTeklif = teklifGelirMi
          ? Math.min(teklifTavani, Math.max(teklifTabani, baslangic + sayiArasi(5, Math.max(12, Math.round(toplamDeger * 0.16)))))
          : null;
        const teklifKaydi = yeniTeklif ? {
          id: `satis-teklif-${Date.now()}`,
          isim: isimHavuzu[sayiArasi(0, isimHavuzu.length - 1)],
          teklif: yeniTeklif,
          renk: profil.renk,
          profil,
          kalanSaniye: profil.tip === "aceleci" ? 7 : profil.tip === "pazarlikci" ? 13 : 10
        } satisfies SatisTeklifi : null;
        const seciliTeklifVarMi = aktifTeklifler.some((teklif) => teklif.id === mevcutSatis.seciliTeklifId) || teklifKaydi?.id === mevcutSatis.seciliTeklifId;
        const cekilenTeklifSayisi = mevcutSatis.teklifler.length - aktifTeklifler.length;

        return {
          ...mevcutSatis,
          kalanSaniye: Math.max(0, mevcutSatis.kalanSaniye - 1),
          enYuksekTeklif: seciliTeklifVarMi ? mevcutSatis.enYuksekTeklif : baslangic,
          seciliTeklifId: seciliTeklifVarMi ? mevcutSatis.seciliTeklifId : null,
          teklifler: teklifKaydi ? [teklifKaydi, ...aktifTeklifler].slice(0, 4) : aktifTeklifler,
          teklifGecmisi: teklifKaydi ? [`${teklifKaydi.isim} (${teklifKaydi.profil.isim}) ${paraYaz(teklifKaydi.teklif)} verdi.`, ...mevcutSatis.teklifGecmisi].slice(0, 8) : cekilenTeklifSayisi > 0 ? ["Bir müşteri beklemekten vazgeçti.", ...mevcutSatis.teklifGecmisi].slice(0, 8) : mevcutSatis.teklifGecmisi,
          mesaj: pahaliMi ? "Açılış yüksek kaldı, alıcılar bekliyor." : teklifKaydi ? `${teklifKaydi.isim} yeni teklif verdi. Dokunmazsan kısa sürede geri çekebilir.` : !seciliTeklifVarMi && mevcutSatis.seciliTeklifId ? "Seçili alıcı bulunamadı, yeni bir alıcı seç." : mevcutSatis.mesaj
        };
      });
    }, 1000);

    return () => clearInterval(sayac);
  }, [depoSatis?.basladi, oyunDurumu.pazarHaberi, sahne]);

  const profilGuncelle = useCallback((alan: "ad" | "soyad", deger: string) => {
    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      profil: {
        ...mevcutDurum.profil,
        [alan]: deger
      }
    }));
  }, []);

  const krediCek = useCallback(() => {
    const tutar = teklifOku(krediMetni);

    if (tutar <= 0) {
      setSonMesaj("Banka geçerli bir kredi tutarı istiyor.");
      return;
    }

    if (oyunDurumu.kredi.borc > 0) {
      setSonMesaj("Önce mevcut krediyi kapatman gerekiyor.");
      return;
    }

    const faizliBorc = Math.round(tutar * (1 + oyunDurumu.kredi.faizOrani));

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para + tutar,
      kredi: {
        ...mevcutDurum.kredi,
        anaPara: tutar,
        borc: faizliBorc,
        odemeGunu: mevcutDurum.gun + 7
      }
    }));
    setSonMesaj(`${paraYaz(tutar)} kredi çekildi. Bankaya geri ödeme: ${paraYaz(faizliBorc)}.`);
  }, [krediMetni, oyunDurumu.kredi.borc, oyunDurumu.kredi.faizOrani]);

  const krediOde = useCallback(() => {
    if (oyunDurumu.kredi.borc <= 0) {
      setSonMesaj("Bankaya aktif borcun yok.");
      return;
    }

    setKrediOdemeAcik(true);
  }, [oyunDurumu.kredi.borc]);

  const krediyiKapat = useCallback(() => {
    if (oyunDurumu.kredi.borc <= 0) {
      setSonMesaj("Bankaya aktif borcun yok.");
      return;
    }

    const odeme = Math.min(oyunDurumu.para, krediKapamaTutari);

    if (odeme < krediKapamaTutari) {
      setSonMesaj("Kredi ödemek için kasada para yok.");
      return;
    }

    setOyunDurumu((mevcutDurum) => ({
      ...mevcutDurum,
      para: mevcutDurum.para - odeme,
      kredi: {
        ...mevcutDurum.kredi,
        borc: 0,
        anaPara: 0,
        odemeGunu: null
      }
    }));
    setKrediOdemeAcik(false);
    setSonMesaj(`${paraYaz(odeme)} ödeyerek krediyi kapattın. Erken ödeme indirimi: ${paraYaz(erkenOdemeIndirimi)}.`);
  }, [erkenOdemeIndirimi, krediKapamaTutari, oyunDurumu.kredi.borc, oyunDurumu.para]);

  const oyunuSifirla = useCallback(() => {
    setOyunDurumu(ilkOyunDurumu);
    setAcikArtirma(null);
    setPazarDepolari([]);
    setPazarUrunleri([]);
    setSeciliPazarDeposuId(null);
    setKrediOdemeAcik(false);
    setAktifDepoId(null);
    setSahne("ana");
    setSonMesaj("Yeni oyun başladı. Depo pazarı hazır.");
  }, []);

  if (oyunDurumu.gunSonu || sahne === "gunSonu") {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.gunSonuPaneli}>
            <Text style={stiller.kucukEtiket}>GÜN SONU</Text>
            <Text style={stiller.buyukBaslik}>{tarihYaz(oyunDurumu.gun)} Bitti</Text>
            <Text style={stiller.heroAlt}>Saat 00.00 oldu. Bugünün kasasını kontrol edip sonraki güne geç.</Text>
            <View style={stiller.profilGrid}>
              <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Cüzdan</Text><Text style={stiller.profilBilgiDeger}>{paraYaz(oyunDurumu.para)}</Text></View>
              <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Kâr / Zarar</Text><Text style={[stiller.profilBilgiDeger, { color: karZarar >= 0 ? "#178f5f" : "#d94b4b" }]}>{paraYaz(karZarar)}</Text></View>
              <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Açılan Depo</Text><Text style={stiller.profilBilgiDeger}>{oyunDurumu.acilanDepo}</Text></View>
              <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Pazar Teklifi</Text><Text style={stiller.profilBilgiDeger}>{bildirimSayisi}</Text></View>
            </View>
            <Pressable style={stiller.genisButon} onPress={sonrakiGuneGec}><Text style={stiller.genisButonYazi}>Sonraki Güne Geç</Text></Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "acikArtirma" && acikArtirma) {
    const kutuSayisi = acikArtirma.urunler.length;

    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("ana")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Depo Pazarı</Text>
            <Text style={stiller.cuzdan}>👛 {paraYaz(oyunDurumu.para)}</Text>
          </View>

          <View style={stiller.acikArtirmaHero}>
            <Text style={stiller.kucukEtiket}>CANLI AÇIK ARTIRMA</Text>
            <Text style={stiller.buyukBaslik}>{acikArtirma.depoIsmi}</Text>
            <Text style={stiller.heroAlt}>Zorluk: {acikArtirma.zorluk} • Lider: {liderAdi(acikArtirma.lider, acikArtirma.katilimcilar)} • Süre: {sureYaz(acikArtirma.kalanSaniye)}</Text>
            <View style={stiller.sayacKarti}>
              <Text style={stiller.sayacEtiket}>Açık artırma süresi</Text>
              <Text style={stiller.sayacDeger}>{sureYaz(acikArtirma.kalanSaniye)}</Text>
              <View style={stiller.sayacCubugu}>
                <View style={[stiller.sayacDolgu, { width: `${Math.max(4, (acikArtirma.kalanSaniye / acikArtirma.sureSaniye) * 100)}%` }]} />
              </View>
            </View>
          </View>

          <View style={stiller.adminKarti}>
            <View style={stiller.adminRozet}><Text style={stiller.adminHarf}>A</Text></View>
            <View style={stiller.esnekAlan}>
              <Text style={stiller.adminBaslik}>Açık Artırma Yöneticisi</Text>
              <Text style={stiller.adminSoz}>{acikArtirma.saticiSozu}</Text>
            </View>
          </View>

          <View style={stiller.depoOnizleme}>
            <View style={stiller.depoCati} />
            <View style={stiller.depoKutulari}>
              {acikArtirma.urunler.map((urun, index) => (
                <View key={urun.id} style={stiller.onizlemeKutusu}><Text style={stiller.onizlemeKutuNo}>{index + 1}</Text></View>
              ))}
            </View>
            <View style={stiller.olasilikSatiri}>
              <Text style={stiller.olasilikMetni}>Kutu: {kutuSayisi}</Text>
            </View>
          </View>

          <View style={[stiller.teklifPaneli, acikArtirma.lider === "oyuncu" && stiller.oyuncuLiderPaneli]}>
            <Text style={stiller.teklifBaslik}>Mevcut teklif</Text>
            <Text style={stiller.teklifDegeri}>{paraYaz(acikArtirma.mevcutTeklif)}</Text>
            <View style={stiller.hizliAlSatiri}>
              <View>
                <Text style={stiller.hizliAlEtiket}>Hızlı al fiyatı</Text>
                <Text style={stiller.hizliAlFiyat}>{paraYaz(acikArtirma.mevcutTeklif * 3)}</Text>
              </View>
              <Pressable style={stiller.hizliAlButonu} onPress={hizliAl}>
                <Text style={stiller.hizliAlYazi}>Hızlı Al</Text>
              </Pressable>
            </View>
            <Text style={stiller.salonMesaji}>{acikArtirma.salonMesaji}</Text>
            {acikArtirma.teklifBeklemeSaniye > 0 ? (
              <Text style={stiller.beklemeYazi}>Yeni teklif için {acikArtirma.teklifBeklemeSaniye} sn bekleme</Text>
            ) : null}
            <View style={stiller.teklifSatiri}>
              <TextInput
                value={acikArtirma.teklifMetni}
                onChangeText={(teklifMetni) => setAcikArtirma({ ...acikArtirma, teklifMetni })}
                keyboardType="number-pad"
                placeholder="Teklif yaz"
                placeholderTextColor="#8a7f78"
                style={stiller.teklifInput}
              />
              <Pressable style={stiller.teklifButonu} onPress={teklifVer}><Text style={stiller.teklifButonuYazi}>Teklif Ver</Text></Pressable>
            </View>
            <Pressable style={stiller.cekilButonu} onPress={acikArtirmadanCekil}><Text style={stiller.cekilYazi}>Açık artırmadan çekil</Text></Pressable>
          </View>

          <View style={stiller.katilimciPaneli}>
            <Text style={stiller.bolumBasligiKoyu}>Katılımcılar</Text>
            <View style={stiller.katilimciIzgara}>
              {acikArtirma.katilimcilar.map((katilimci) => (
                <View key={katilimci.id} style={[
                  stiller.katilimciKarti,
                  acikArtirma.lider === katilimci.id && stiller.liderKatilimci,
                  !katilimci.aktif && stiller.pasifKatilimci
                ]}>
                  <View style={[stiller.insanIconu, { backgroundColor: katilimci.renk }]}><Text style={stiller.insanHarf}>{katilimci.cinsiyet}</Text></View>
                  <Text style={stiller.katilimciIsim}>{katilimci.isim}</Text>
                  {katilimci.takintili ? <Text style={stiller.takintiliRozet}>Takipte</Text> : null}
                  <Text style={stiller.katilimciTeklif}>{katilimci.sonTeklif ? paraYaz(katilimci.sonTeklif) : katilimci.aktif ? "Bekliyor" : "Çekildi"}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "pazar") {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("ana")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Depo Pazarı</Text>
            <Text style={stiller.cuzdan}>{tarihYaz(oyunDurumu.gun)}</Text>
          </View>

          <View style={stiller.pazarHeroYeni}>
            <Text style={stiller.kucukEtiket}>BUGÜNKÜ LİSTE</Text>
            <Text style={stiller.buyukBaslik}>Depo Seç</Text>
            <Text style={stiller.heroAlt}>Kartlarda sadece katılımcı sayısı ve açılış teklifi var. Depoya dokununca iç düzenini görüp ihaleye girebilirsin.</Text>
          </View>

          <View style={stiller.pazarListe}>
            {pazarDepolari.map((depo) => {
              const seciliMi = seciliPazarDeposuId === depo.id;

              return (
                <Pressable key={depo.id} style={[stiller.pazarDepoKarti, seciliMi && stiller.seciliPazarDepoKarti]} onPress={() => setSeciliPazarDeposuId(depo.id)}>
                  <View style={stiller.depoDisGorunum}>
                    <View style={stiller.depoTabela}><Text style={stiller.depoTabelaYazi}>UNIT</Text></View>
                    <View style={stiller.depoKapisi}><View style={stiller.depoKilit} /></View>
                  </View>
                  <View style={stiller.esnekAlan}>
                    <Text style={stiller.depoKartBaslik}>{depo.isim}</Text>
                    <Text style={stiller.depoKartYazi}>{depo.konum} • {depo.zorluk}</Text>
                    <View style={stiller.pazarMiniSatir}>
                      <Text style={stiller.pazarMiniBilgi}>{depo.katilimciSayisi} kişi</Text>
                      <Text style={stiller.pazarMiniBilgi}>{paraYaz(depo.baslangicTeklifi)}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {seciliPazarDeposu ? (
            <View style={stiller.depoIcPaneli}>
              <Text style={stiller.bolumBasligiKoyu}>{seciliPazarDeposu.isim}</Text>
              <Text style={stiller.depoKartYazi}>{seciliPazarDeposu.durum} • {seciliPazarDeposu.urunler.length} kapalı kutu</Text>
              <View style={stiller.depoIcGorunum}>
                {seciliPazarDeposu.urunler.map((urun, index) => (
                  <View key={urun.id} style={stiller.depoIcKutusu}><Text style={stiller.onizlemeKutuNo}>{index + 1}</Text></View>
                ))}
              </View>
              <View style={stiller.pazarAksiyonSatiri}>
                <View>
                  <Text style={stiller.hizliAlEtiket}>Açılış teklifi</Text>
                  <Text style={stiller.hizliAlFiyat}>{paraYaz(seciliPazarDeposu.baslangicTeklifi)}</Text>
                </View>
                <Pressable style={stiller.pazarButonuKisa} onPress={() => pazarDeposuAcikArtirmayaGir(seciliPazarDeposu)}>
                  <Text style={stiller.pazarButonuYazi}>İhaleye Gir</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "urunPazari") {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("ana")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Ürün Pazarı</Text>
            <Text style={stiller.cuzdan}>👛 {paraYaz(oyunDurumu.para)}</Text>
          </View>

          <View style={stiller.urunPazariHero}>
            <Text style={stiller.kucukEtiket}>GİZLİ FİYAT</Text>
            <Text style={stiller.buyukBaslik}>Ürünü Gör, Teklif Ver</Text>
            <Text style={stiller.heroAlt}>Burada ürünü görürsün ama satıcının kabul fiyatını görmezsin. Doğru teklif verirsen ürün envantere geçer.</Text>
          </View>

          <View style={stiller.urunPazariListe}>
            {pazarUrunleri.map((pazarUrunu) => {
              return (
                <View key={pazarUrunu.id} style={[stiller.urunPazarKarti, pazarUrunu.satildi && stiller.satilmisUrunKarti]}>
                  <View style={stiller.urunPazarGorsel}>
                    <Text style={stiller.urunPazarIkon}>{urunIkonuSec(pazarUrunu.urun.isim)}</Text>
                  </View>
                  <View style={stiller.esnekAlan}>
                    <Text style={stiller.depoKartBaslik}>{pazarUrunu.urun.isim}</Text>
                    <Text style={stiller.gizliFiyatYazi}>Fiyat gizli</Text>
                    <Text style={stiller.salonMesaji}>{pazarUrunu.mesaj}</Text>
                    {!pazarUrunu.satildi ? (
                      <View style={stiller.urunTeklifSatiri}>
                        <TextInput
                          value={pazarUrunu.teklifMetni}
                          onChangeText={(teklifMetni) => urunTeklifMetniGuncelle(pazarUrunu.id, teklifMetni)}
                          keyboardType="number-pad"
                          placeholder="Teklif"
                          placeholderTextColor="#8a7f78"
                          style={stiller.urunTeklifInput}
                        />
                        <Pressable style={stiller.urunTeklifButonu} onPress={() => uruneTeklifVer(pazarUrunu)}>
                          <Text style={stiller.teklifButonuYazi}>Teklif Ver</Text>
                        </Pressable>
                      </View>
                    ) : <Text style={stiller.satildiYazi}>Envantere alındı</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "depoKur" && depoKurUrunu) {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("envanter")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Depo Kur</Text>
            <Text style={stiller.cuzdan}>{saatYaz(oyunDurumu.saatDakika)}</Text>
          </View>

          <View style={stiller.depoKurPaneli}>
            <Text style={stiller.kucukEtiket}>BENİM DEPOM</Text>
            <Text style={stiller.buyukBaslik}>Depoya İsim Ver</Text>
            <Text style={stiller.heroAlt}>{depoKurUrunu.isim} ilk ürün olarak bu depoya taşınacak.</Text>
            <TextInput
              value={depoIsimMetni}
              onChangeText={setDepoIsimMetni}
              placeholder="Depo adı"
              placeholderTextColor="#8a7f78"
              style={stiller.profilInput}
            />
            <Pressable style={stiller.genisButon} onPress={oyuncuDeposuOlustur}><Text style={stiller.genisButonYazi}>Depoyu Oluştur</Text></Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "depoUrunEkle" && urunEklenecekDepo) {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => depoyaGir(urunEklenecekDepo.id)}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Ürün Ekle</Text>
            <Text style={stiller.cuzdan}>{saatYaz(oyunDurumu.saatDakika)}</Text>
          </View>

          <View style={stiller.envanterHero}>
            <Text style={stiller.kucukEtiket}>DEPONUN RAFINA</Text>
            <Text style={stiller.buyukBaslik}>{urunEklenecekDepo.isim}</Text>
            <Text style={stiller.heroAlt}>Eklemek istediğin ürün kartına dokun. Kart yukarı kayıp depoya taşınır.</Text>
          </View>

          <View style={stiller.envanterListe}>
            {depoyaEklenebilirUrunler.length === 0 ? (
              <View style={stiller.bosDepoAlani}><Text style={stiller.bosBaslik}>Boşta ürün yok</Text><Text style={stiller.bosYazi}>Satılmamış ve pazarda beklemeyen ürünleri buradan depoya taşıyabilirsin.</Text></View>
            ) : depoyaEklenebilirUrunler.map((urun) => (
              <DepoyaEklenecekUrunKarti key={`${urun.kaynak}-${urun.id}`} urun={urun} onEkle={() => depoyaUrunEkle(urunEklenecekDepo.id, urun)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "depo" && aktifDepo) {
    const kalanDeger = aktifDepo.urunler.filter((urun) => !urun.satildi).reduce((toplam, urun) => toplam + urun.deger, 0);
    const satilabilirUrunSayisi = aktifDepo.urunler.filter((urun) => !urun.satildi).length;
    const kalite = depoKaliteAyari(aktifDepo);
    const kaliteUcreti = kalite.sonrakiUcret;

    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("ana")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>{aktifDepo.isim}</Text>
            <Text style={stiller.cuzdan}>👛 {paraYaz(oyunDurumu.para)}</Text>
          </View>

          <View style={[stiller.depoDetayHero, aktifDepo.oyuncuDeposu && depoKaliteSeviyesi(aktifDepo) >= 2 && stiller.depoDetayHeroDuzenli, aktifDepo.oyuncuDeposu && depoKaliteSeviyesi(aktifDepo) >= 3 && stiller.depoDetayHeroPremium]}>
            <Text style={stiller.kucukEtiket}>SAHİP OLDUĞUM DEPO</Text>
            <Text style={stiller.buyukBaslik}>{aktifDepo.isim}</Text>
            <Text style={stiller.heroAlt}>Satın alma: {paraYaz(aktifDepo.satinAlmaFiyati)} • Kalan değer: {paraYaz(kalanDeger)} • Kalite: {kalite.etiket}</Text>
            {aktifDepo.acildi && aktifDepo.oyuncuDeposu ? (
              <View style={stiller.kalitePaneli}>
                <View>
                  <Text style={stiller.hizliAlEtiket}>Depo kalitesi</Text>
                  <Text style={stiller.hizliAlFiyat}>{kalite.etiket} x{kalite.carpani.toFixed(2)}</Text>
                  <View style={stiller.kaliteSeviyeSatiri}>
                    {[1, 2, 3].map((seviye) => <View key={seviye} style={[stiller.kaliteSeviyeAdim, depoKaliteSeviyesi(aktifDepo) >= seviye && stiller.kaliteSeviyeAdimAktif]} />)}
                  </View>
                  <Text style={stiller.kaliteEtkiYazi}>{depoKaliteSeviyesi(aktifDepo) === 1 ? "Basit raf düzeni" : depoKaliteSeviyesi(aktifDepo) === 2 ? "Etiketli kutular ve temiz sunum" : "Vitrinli premium satış alanı"}</Text>
                </View>
                <Pressable style={[stiller.kaliteButonu, kaliteUcreti === 0 && stiller.pasifButon]} onPress={() => depoKalitesiniYukselt(aktifDepo.id)}>
                  <Text style={stiller.kaliteButonYazi}>{kaliteUcreti === 0 ? "Maks" : paraYaz(kaliteUcreti)}</Text>
                </Pressable>
              </View>
            ) : null}
            {!aktifDepo.acildi ? (
              <Pressable style={stiller.genisButon} onPress={() => depoAc(aktifDepo.id)}><Text style={stiller.genisButonYazi}>Depoyu Aç</Text></Pressable>
            ) : aktifDepo.oyuncuDeposu ? (
              <View style={stiller.depoYonetimPaneli}>
                <View>
                  <Text style={stiller.hizliAlEtiket}>Satış durumu</Text>
                  <Text style={stiller.hizliAlFiyat}>{satilabilirUrunSayisi} ürün • Min 5</Text>
                </View>
                <View style={stiller.depoYonetimButonlari}>
                  <Pressable style={stiller.artiButonu} onPress={() => depoyaUrunEklemeEkraniniAc(aktifDepo.id)}><Text style={stiller.artiButonYazi}>+</Text></Pressable>
                  <Pressable style={[stiller.satisaCikarButonu, satilabilirUrunSayisi < 5 && stiller.pasifButon]} onPress={() => oyuncuDeposunuSatisaHazirla(aktifDepo)}><Text style={stiller.satisaCikarYazi}>Satışa Çıkar</Text></Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={stiller.silButonu} onPress={() => depoSil(aktifDepo.id)}><Text style={stiller.silButonuYazi}>Depoyu Listeden Sil</Text></Pressable>
            )}
          </View>

          <View style={stiller.kutuGrid}>
            {aktifDepo.urunler.map((urun) => (
              <UrunKutusu
                key={urun.id}
                urun={urun}
                acildi={aktifDepo.acildi}
                onGoster={() => kutuyuGoster(aktifDepo.id, urun.id)}
                onSat={() => urunuKasayaAktar(aktifDepo.id, urun.id)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "depoSatis" && depoSatis) {
    const toplamDeger = depoSatis.urunler.reduce((toplam, urun) => toplam + urun.deger, 0);
    const seciliTeklif = depoSatis.teklifler.find((teklif) => teklif.id === depoSatis.seciliTeklifId) ?? null;

    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("envanter")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Depo Satışı</Text>
            <Text style={stiller.cuzdan}>{saatYaz(oyunDurumu.saatDakika)}</Text>
          </View>

          <View style={stiller.acikArtirmaHero}>
            <Text style={stiller.kucukEtiket}>SATICI SENSİN</Text>
            <Text style={stiller.buyukBaslik}>Mini Depo Paketi</Text>
            <Text style={stiller.heroAlt}>{depoSatis.urunler.length} ürün • Ham değer: {paraYaz(toplamDeger)} • Öneri: {paraYaz(depoSatis.oneriFiyat)}</Text>
          </View>

          <View style={stiller.teklifPaneli}>
            <Text style={stiller.salonMesaji}>{depoSatis.mesaj}</Text>
            {!depoSatis.basladi && depoSatis.teklifler.length === 0 ? (
              <>
                <View style={stiller.teklifSatiri}>
                  <TextInput value={depoSatis.baslangicMetni} onChangeText={(baslangicMetni) => setDepoSatis({ ...depoSatis, baslangicMetni })} keyboardType="number-pad" placeholder="Açılış" placeholderTextColor="#8a7f78" style={stiller.teklifInput} />
                  <TextInput value={depoSatis.sureMetni} onChangeText={(sureMetni) => setDepoSatis({ ...depoSatis, sureMetni })} keyboardType="number-pad" placeholder="Süre sn" placeholderTextColor="#8a7f78" style={stiller.teklifInput} />
                </View>
                <View style={stiller.adminKontrolSatiri}>
                  <Pressable style={stiller.kucukIkincilButon} onPress={depoSatisFiyatDusur}><Text style={stiller.kucukIkincilYazi}>Fiyat Düşür</Text></Pressable>
                  <Pressable style={stiller.kucukIkincilButon} onPress={depoSatisSureUzat}><Text style={stiller.kucukIkincilYazi}>Süre Uzat</Text></Pressable>
                </View>
                <Pressable style={stiller.genisButon} onPress={depoSatisiniBaslat}><Text style={stiller.genisButonYazi}>Satışı Başlat</Text></Pressable>
              </>
            ) : (
              <>
                <Text style={stiller.sayacDeger}>{sureYaz(depoSatis.kalanSaniye)}</Text>
                <Text style={stiller.teklifDegeri}>{seciliTeklif ? paraYaz(seciliTeklif.teklif) : "Alıcı seç"}</Text>
                <Text style={stiller.beklemeYazi}>{seciliTeklif ? `${seciliTeklif.isim} kilitlendi` : depoSatis.basladi ? "Teklife dokun, alıcıyı kilitle" : "Süre bitti, son aktif alıcıyı seç"}</Text>
                {depoSatis.basladi ? (
                  <View style={stiller.adminKontrolSatiri}>
                    <Pressable style={stiller.kucukIkincilButon} onPress={depoSatisSureUzat}><Text style={stiller.kucukIkincilYazi}>Süre Uzat</Text></Pressable>
                    <Pressable style={stiller.kucukAksiyonButonu} onPress={depoSatisSonCagri}><Text style={stiller.kucukAksiyonYazi}>Son Çağrı</Text></Pressable>
                  </View>
                ) : null}
                <View style={stiller.katilimciIzgara}>
                  {depoSatis.teklifler.length === 0 ? <Text style={stiller.salonMesaji}>Henüz teklif yok. Açılış yüksekse alıcılar bekleyebilir.</Text> : depoSatis.teklifler.map((teklif) => (
                    <Pressable key={teklif.id} style={[stiller.satisTeklifKarti, depoSatis.seciliTeklifId === teklif.id && stiller.seciliSatisTeklifi]} onPress={() => depoSatisTeklifiniSec(teklif.id)}>
                      <View style={[stiller.insanIconu, { backgroundColor: teklif.renk }]}><Text style={stiller.insanHarf}>{teklif.isim[0]}</Text></View>
                      <Text style={stiller.katilimciIsim}>{teklif.isim}</Text>
                      <Text style={stiller.aliciProfilYazi}>{teklif.profil.isim}</Text>
                      <Text style={stiller.katilimciTeklif}>{paraYaz(teklif.teklif)}</Text>
                      <Text style={stiller.teklifSureYazi}>{depoSatis.seciliTeklifId === teklif.id ? "Kilitli" : `${teklif.kalanSaniye} sn`}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            {seciliTeklif ? (
              <Pressable style={stiller.genisButon} onPress={() => depoSatisTeklifiniKabulEt(seciliTeklif)}><Text style={stiller.genisButonYazi}>Seçili Alıcıya Sat</Text></Pressable>
            ) : depoSatis.teklifler.length > 0 ? (
              <View style={stiller.pasifSatisButonu}><Text style={stiller.pasifSatisYazi}>Satmak için bir teklif seç</Text></View>
            ) : null}
            <View style={stiller.gecmisPaneli}>
              <Text style={stiller.hizliAlEtiket}>Teklif geçmişi</Text>
              {depoSatis.teklifGecmisi.slice(0, 4).map((olay, index) => <Text key={`${olay}-${index}`} style={stiller.gecmisSatiri}>{olay}</Text>)}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "envanter") {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("ana")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Envanterim</Text>
            <Text style={stiller.cuzdan}>👛 {paraYaz(oyunDurumu.para)}</Text>
          </View>

          <View style={stiller.envanterHero}>
            <Text style={stiller.kucukEtiket}>KASA VE DEPOLAR</Text>
            <Text style={stiller.buyukBaslik}>Envanter</Text>
            <Text style={stiller.heroAlt}>Depolar ayrı, açılmış depolardan çıkan ürünler ve Ürün Pazarı alımları ayrı listelenir.</Text>
          </View>

          <View style={stiller.sekmeSatiri}>
            <Pressable style={[stiller.sekmeButonu, envanterSekmesi === "depolar" && stiller.sekmeAktif]} onPress={() => setEnvanterSekmesi("depolar")}>
              <Text style={[stiller.sekmeYazi, envanterSekmesi === "depolar" && stiller.sekmeYaziAktif]}>Depolar</Text>
            </Pressable>
            <Pressable style={[stiller.sekmeButonu, envanterSekmesi === "urunler" && stiller.sekmeAktif]} onPress={() => setEnvanterSekmesi("urunler")}>
              <Text style={[stiller.sekmeYazi, envanterSekmesi === "urunler" && stiller.sekmeYaziAktif]}>Ürünler</Text>
            </Pressable>
          </View>

          {satilmisKayitSayisi > 0 ? (
            <Pressable style={stiller.temizleButonu} onPress={satilmisleriTemizle}><Text style={stiller.temizleYazi}>Satılmışları Temizle ({satilmisKayitSayisi})</Text></Pressable>
          ) : null}

          {envanterSekmesi === "depolar" ? (
            <View style={stiller.envanterListe}>
              {oyunDurumu.sahipDepolar.length === 0 ? (
                <View style={stiller.bosDepoAlani}><Text style={stiller.bosBaslik}>Depo yok</Text><Text style={stiller.bosYazi}>Depo Pazarı'ndan depo aldığında burada görünür.</Text></View>
              ) : oyunDurumu.sahipDepolar.map((depo) => (
                <Pressable key={depo.id} style={stiller.depoKartYeni} onPress={() => depoyaGir(depo.id)}>
                  <View style={stiller.depoKartSol}>
                    <View style={stiller.miniDepoCati} />
                    <View style={stiller.miniDepoKapisi}><Text style={stiller.depoMiniIcon}>▥</Text></View>
                  </View>
                  <View style={stiller.esnekAlan}>
                    <Text style={stiller.depoKartBaslik}>{depo.isim}</Text>
                    <Text style={stiller.depoKartYazi}>{depo.oyuncuDeposu ? "Benim Depom" : `Satın alma: ${paraYaz(depo.satinAlmaFiyati)}`} • {depo.urunler.filter((urun) => !urun.satildi).length} ürün • {depoKaliteAyari(depo).etiket}</Text>
                    <Text style={stiller.depoKartDurum}>{depo.oyuncuDeposu ? (depo.urunler.filter((urun) => !urun.satildi).length >= 5 ? "Satışa hazır" : "Ürün ekleniyor") : depo.acildi ? "Açıldı" : "Kapalı depo"}</Text>
                  </View>
                  <Text style={stiller.depoGirYaziKoyu}>Gir</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={stiller.envanterListe}>
              {envanterUrunleri.length === 0 ? (
                <View style={stiller.bosDepoAlani}><Text style={stiller.bosBaslik}>Ürün yok</Text><Text style={stiller.bosYazi}>Depo açtığında veya Ürün Pazarı'ndan aldığında ürünler burada görünür.</Text></View>
              ) : envanterUrunleri.map((urun) => {
                const ayar = nadirlikAyarlari[urun.nadirlik];
                const pazarSatisi = oyunDurumu.pazarSatislari.find((satis) => satis.urun.id === urun.id);
                const satilabilirMi = !urun.satildi && !pazarSatisi;

                return (
                  <View key={`${urun.kaynak}-${urun.id}`} style={stiller.envanterUrunKarti}>
                    <View style={[stiller.envanterUrunRozet, { borderColor: ayar.renk }]}><Text style={stiller.envanterUrunIkon}>{urunIkonuSec(urun.isim)}</Text></View>
                    <View style={stiller.esnekAlan}>
                      <Text style={stiller.depoKartBaslik}>{urun.isim}</Text>
                      <Text style={stiller.depoKartYazi}>{urun.kaynak} • {ayar.etiket} • {urun.satildi ? "Satıldı" : paraYaz(urun.deger)}</Text>
                      {(urun.gecmis ?? []).length > 0 ? <Text style={stiller.urunGecmisYazi}>Geçmiş: {(urun.gecmis ?? [])[0]}</Text> : null}
                      {urun.satildi ? (
                        <View style={stiller.satilmisSatiri}>
                          <Text style={stiller.satildiYazi}>Satıldı</Text>
                          <Pressable style={stiller.satildiSilButonu} onPress={() => satilmisUrunuSil(urun)}><Text style={stiller.satildiSilYazi}>Sil</Text></Pressable>
                        </View>
                      ) : null}
                      {pazarSatisi ? (
                        <View style={stiller.pazarTeklifPaneli}>
                          <Text style={stiller.depoKartDurum}>{pazarSatisi.durum === "teklif" ? `Teklif geldi: ${paraYaz(pazarSatisi.teklif ?? 0)}` : `Müşteri vazgeçti. Yeni müşteri ${tarihYaz(pazarSatisi.sonrakiMusteriGunu)}.`}</Text>
                          {pazarSatisi.durum === "teklif" ? (
                            <View style={stiller.urunAksiyonSatiri}>
                              <Pressable style={stiller.kucukAksiyonButonu} onPress={() => pazarTeklifiniKabulEt(pazarSatisi.id)}><Text style={stiller.kucukAksiyonYazi}>Kabul Et</Text></Pressable>
                              <Pressable style={stiller.kucukIkincilButon} onPress={() => pazarMusterisiyleKonus(pazarSatisi.id)}><Text style={stiller.kucukIkincilYazi}>Konuş</Text></Pressable>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                      {satilabilirMi ? (
                        <View style={stiller.urunAksiyonSatiri}>
                          <Pressable style={stiller.kucukAksiyonButonu} onPress={() => hizliSat(urun)}><Text style={stiller.kucukAksiyonYazi}>Hızlı Sat</Text></Pressable>
                          <Pressable style={stiller.kucukIkincilButon} onPress={() => depoKurulumunuAc(urun)}><Text style={stiller.kucukIkincilYazi}>Depoya Koy</Text></Pressable>
                          <Pressable style={stiller.kucukIkincilButon} onPress={() => pazaraKoy(urun)}><Text style={stiller.kucukIkincilYazi}>Pazara Koy</Text></Pressable>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (sahne === "profil") {
    return (
      <SafeAreaView style={stiller.ekranAcik}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
          <View style={stiller.ustBar}>
            <Pressable style={stiller.geriButonu} onPress={() => setSahne("ana")}><Text style={stiller.geriYazi}>Geri</Text></Pressable>
            <Text style={stiller.merkezLogo}>Profil</Text>
            <Text style={stiller.cuzdan}>👛 {paraYaz(oyunDurumu.para)}</Text>
          </View>

          <View style={stiller.profilHero}>
            <View style={stiller.profilBuyukRozet}><Text style={stiller.profilBuyukHarf}>{profilHarfleri}</Text></View>
            <Text style={stiller.anaLogo}>{oyunDurumu.profil.ad.trim() || "Depo"} {oyunDurumu.profil.soyad.trim() || "Avcısı"}</Text>
            <Text style={stiller.anaAltYazi}>Açık artırma salonunda depoları kovalayan girişimci profilin.</Text>
            <View style={stiller.isimFormu}>
              <TextInput
                value={oyunDurumu.profil.ad}
                onChangeText={(deger) => profilGuncelle("ad", deger)}
                placeholder="İsim"
                placeholderTextColor="#8a7f78"
                style={stiller.profilInput}
              />
              <TextInput
                value={oyunDurumu.profil.soyad}
                onChangeText={(deger) => profilGuncelle("soyad", deger)}
                placeholder="Soy isim"
                placeholderTextColor="#8a7f78"
                style={stiller.profilInput}
              />
            </View>
          </View>

          <View style={[stiller.bankaKarti, krediGeciktiMi && stiller.bankaGecikmis]}>
            <Pressable style={stiller.bankaBaslikSatiri} onPress={() => setBankaAcik((acikMi) => !acikMi)}>
              <View>
                <Text style={stiller.kucukEtiket}>BANKA</Text>
                <Text style={stiller.pazarBaslik}>Kredi Hesabı</Text>
              </View>
              <Text style={stiller.gunRozeti}>{bankaAcik ? "Kapat" : "Aç"}</Text>
            </Pressable>
            <View style={stiller.profilGrid}>
              <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Borç</Text><Text style={stiller.profilBilgiDeger}>{paraYaz(oyunDurumu.kredi.borc)}</Text></View>
              <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Ödeme Günü</Text><Text style={stiller.profilBilgiDeger}>{oyunDurumu.kredi.odemeGunu ? tarihYaz(oyunDurumu.kredi.odemeGunu) : "Yok"}</Text></View>
            </View>
            {bankaAcik ? (
              <>
                <Text style={stiller.bankaAciklama}>Faiz oranı %{Math.round(oyunDurumu.kredi.faizOrani * 100)}. Vade 7 gün. Gecikirse her yeni depo ihalesinde borca gecikme faizi eklenir.</Text>
                <View style={stiller.krediSecenekleri}>
                  {krediTutarlari.map((tutar) => (
                    <Pressable key={tutar} style={[stiller.krediSecenek, krediMetni === String(tutar) && stiller.krediSecenekAktif]} onPress={() => setKrediMetni(String(tutar))}>
                      <Text style={stiller.krediSecenekYazi}>{paraYaz(tutar)}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={stiller.teklifSatiri}>
                  <TextInput
                    value={krediMetni}
                    onChangeText={setKrediMetni}
                    keyboardType="number-pad"
                    placeholder="Kredi tutarı"
                    placeholderTextColor="#8a7f78"
                    style={stiller.teklifInput}
                  />
                  <Pressable style={stiller.teklifButonu} onPress={krediCek}><Text style={stiller.teklifButonuYazi}>Kredi Çek</Text></Pressable>
                </View>
                <Pressable style={stiller.krediOdeButonu} onPress={krediOde}><Text style={stiller.krediOdeYazi}>Kredi Öde</Text></Pressable>
                {krediOdemeAcik ? (
                  <View style={stiller.krediOdemePaneli}>
                    <Text style={stiller.krediOdemeBaslik}>Borcunuz</Text>
                    <Text style={stiller.krediOdemeBorc}>{paraYaz(oyunDurumu.kredi.borc)}</Text>
                    <View style={stiller.krediOdemeSatir}><Text style={stiller.krediOdemeEtiket}>Erken ödeme indirimi</Text><Text style={stiller.krediOdemeDeger}>-{paraYaz(erkenOdemeIndirimi)}</Text></View>
                    <View style={stiller.krediOdemeSatir}><Text style={stiller.krediOdemeEtiket}>Bugün kapama</Text><Text style={stiller.krediOdemeDeger}>{paraYaz(krediKapamaTutari)}</Text></View>
                    <Pressable style={stiller.krediKapatButonu} onPress={krediyiKapat}><Text style={stiller.krediKapatYazi}>Erken Öde ve Kapat</Text></Pressable>
                  </View>
                ) : null}
              </>
            ) : null}
          </View>

          <View style={stiller.profilGrid}>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Cüzdan</Text><Text style={stiller.profilBilgiDeger}>{paraYaz(oyunDurumu.para)}</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Toplam Kazanç</Text><Text style={stiller.profilBilgiDeger}>{paraYaz(oyunDurumu.toplamKazanc)}</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Toplam Harcama</Text><Text style={stiller.profilBilgiDeger}>{paraYaz(oyunDurumu.toplamHarcama)}</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Kâr / Zarar</Text><Text style={[stiller.profilBilgiDeger, { color: karZarar >= 0 ? "#178f5f" : "#d94b4b" }]}>{paraYaz(karZarar)}</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Açılan Depo</Text><Text style={stiller.profilBilgiDeger}>{oyunDurumu.acilanDepo}</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Sahip Depo</Text><Text style={stiller.profilBilgiDeger}>{sahipDepoSayisi}</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>İtibar</Text><Text style={stiller.profilBilgiDeger}>{oyunDurumu.itibar}/100</Text></View>
            <View style={stiller.profilBilgiKarti}><Text style={stiller.profilBilgiEtiket}>Seviye</Text><Text style={stiller.profilBilgiDeger}>{itibarMetni}</Text></View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={stiller.ekranAcik}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stiller.sayfaIci}>
        <View style={stiller.profilSatiri}>
          <Pressable style={stiller.profilButonu} onPress={() => setSahne("profil")}><Text style={stiller.profilHarf}>{profilHarfleri}</Text></Pressable>
          <View style={stiller.ustBilgiSag}>
            <View style={stiller.ustLinkSatiri}>
              <Text style={stiller.cuzdan}>👛 {paraYaz(oyunDurumu.para)}</Text>
              <Pressable onPress={() => setSahne("envanter")}><Text style={stiller.envanterLinkYazi}>Envanterim{bildirimSayisi > 0 ? ` ${bildirimSayisi}` : ""}</Text></Pressable>
            </View>
            <Text style={stiller.anaGunYazi}>{tarihYaz(oyunDurumu.gun)} • {saatYaz(oyunDurumu.saatDakika)}</Text>
          </View>
        </View>

        <View style={stiller.istatistikSatiriYeni}>
          <View style={stiller.istatistikKartiYeni}><Text style={stiller.istatistikIkon}>🏗️</Text><Text style={stiller.istatistikSayi} numberOfLines={1} adjustsFontSizeToFit>{acilmisDepoSayisi}</Text><Text style={stiller.istatistikYazi}>Açtığın Depolar</Text></View>
          <View style={stiller.istatistikKartiYeni}><Text style={stiller.istatistikIkon}>{karZarar >= 0 ? "📈" : "📉"}</Text><Text style={[stiller.istatistikSayi, { color: karZarar >= 0 ? "#178f5f" : "#d94b4b" }]} numberOfLines={1} adjustsFontSizeToFit>{paraYaz(karZarar)}</Text><Text style={stiller.istatistikYazi}>Kâr / Zarar</Text></View>
          <View style={stiller.istatistikKartiYeni}><Text style={stiller.istatistikIkon}>🏢</Text><Text style={stiller.istatistikSayi} numberOfLines={1} adjustsFontSizeToFit>{sahipDepoSayisi}</Text><Text style={stiller.istatistikYazi}>Sahip Depolar</Text></View>
        </View>

        <View style={stiller.haberKarti}>
          <View style={stiller.haberUstSatir}>
            <View>
              <Text style={stiller.kucukEtiket}>PİYASA HABERİ</Text>
              <Text style={stiller.pazarBaslik}>{oyunDurumu.pazarHaberi.baslik}</Text>
            </View>
            <Text style={stiller.itibarRozeti}>{oyunDurumu.itibar}/100</Text>
          </View>
          <Text style={stiller.pazarYazi}>{oyunDurumu.pazarHaberi.aciklama}</Text>
          <Text style={stiller.mesajYeni}>İtibar: {itibarMetni}. İyi itibar daha güçlü teklif getirir.</Text>
        </View>

        <View style={stiller.pazarKarti}>
          <Text style={stiller.pazarBaslik}>Depo Pazarı</Text>
          <Text style={stiller.pazarYazi}>Canlı kalabalık, akıllı rakipler ve kapalı kutular. İçeri girince gerçekten açık artırmadaymış gibi teklif ver.</Text>
          <Pressable style={stiller.pazarButonu} onPress={acikArtirmayaGir}><Text style={stiller.pazarButonuYazi}>Açık Artırmaya Gir</Text></Pressable>
          <Text style={stiller.mesajYeni}>{sonMesaj}</Text>
        </View>

        <View style={stiller.urunPazariAnaKarti}>
          <View style={stiller.urunPazariAnaUst}>
            <View>
              <Text style={stiller.kucukEtiket}>YENİ PAZAR</Text>
              <Text style={stiller.pazarBaslik}>Ürün Pazarı</Text>
            </View>
            <Text style={stiller.gizliRozet}>Gizli fiyat</Text>
          </View>
          <Text style={stiller.pazarYazi}>Depo almadan tek ürün kovala. Ürünü gör, fiyatı görme; satıcıyı ikna edecek teklifi yaz.</Text>
          <Pressable style={stiller.urunPazarButonu} onPress={urunPazarinaGir}><Text style={stiller.pazarButonuYazi}>Ürünlere Bak</Text></Pressable>
        </View>

        <Pressable style={stiller.sifirlaAltButonu} onPress={oyunuSifirla}><Text style={stiller.sifirlaYazi}>Oyunu Sıfırla</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const stiller = StyleSheet.create({
  ekranAcik: { flex: 1, backgroundColor: "#f8f2e8" },
  sayfaIci: { padding: 18, paddingBottom: 32 },
  profilSatiri: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  profilButonu: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#f0c26b", borderRadius: 24, borderWidth: 2, height: 48, justifyContent: "center", width: 48 },
  profilHarf: { color: "#25324a", fontSize: 16, fontWeight: "900" },
  envanterUstButonu: { alignItems: "center", backgroundColor: "#25324a", borderRadius: 8, justifyContent: "center", minHeight: 44, paddingHorizontal: 16 },
  envanterUstYazi: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
  envanterLinkYazi: { color: "#178f5f", fontSize: 13, fontWeight: "900" },
  ustBilgiSag: { alignItems: "flex-end", gap: 3 },
  ustLinkSatiri: { alignItems: "center", flexDirection: "row", gap: 12 },
  gunMetni: { color: "#e76f51", fontSize: 12, fontWeight: "900" },
  cuzdan: { color: "#25324a", fontSize: 15, fontWeight: "900" },
  anaGunYazi: { color: "#e76f51", fontSize: 12, fontWeight: "900", textAlign: "right" },
  anaHero: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#f2d28d", borderRadius: 8, borderWidth: 1, padding: 22 },
  anaKisaPanel: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kisaBilgiKarti: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexBasis: "31%", flexGrow: 1, minHeight: 72, minWidth: 96, padding: 10 },
  kisaEnvanterKarti: { backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, flexBasis: "31%", flexGrow: 1, minHeight: 72, minWidth: 96, padding: 10 },
  kisaBilgiEtiket: { color: "#786e73", fontSize: 11, fontWeight: "900" },
  kisaBilgiDeger: { color: "#25324a", fontSize: 15, fontWeight: "900", marginTop: 6 },
  kisaEnvanterYazi: { color: "#178f5f", fontSize: 15, fontWeight: "900", marginTop: 6 },
  kucukEtiket: { color: "#e76f51", fontSize: 12, fontWeight: "900", letterSpacing: 2, textAlign: "center" },
  anaLogo: { color: "#25324a", fontSize: 34, fontWeight: "900", letterSpacing: 0, marginTop: 6, textAlign: "center" },
  anaAltYazi: { color: "#6d6470", fontSize: 14, fontWeight: "700", lineHeight: 20, marginTop: 8, textAlign: "center" },
  istatistikSatiriYeni: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  istatistikKartiYeni: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexBasis: "31%", flexGrow: 1, minHeight: 116, minWidth: 96, padding: 9 },
  istatistikIkon: { fontSize: 22, marginBottom: 8 },
  istatistikSayi: { color: "#25324a", fontSize: 16, fontWeight: "900" },
  istatistikYazi: { color: "#786e73", fontSize: 11, fontWeight: "800", lineHeight: 15, marginTop: 4 },
  pazarKarti: { backgroundColor: "#ffffff", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, marginTop: 16, padding: 16 },
  pazarBaslik: { color: "#25324a", fontSize: 24, fontWeight: "900" },
  pazarYazi: { color: "#6d6470", fontSize: 14, fontWeight: "700", lineHeight: 20, marginTop: 7 },
  pazarButonu: { alignItems: "center", backgroundColor: "#e76f51", borderRadius: 8, justifyContent: "center", marginTop: 14, minHeight: 52 },
  pazarButonuYazi: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  mesajYeni: { color: "#53606f", fontSize: 12, fontWeight: "800", lineHeight: 17, marginTop: 10 },
  haberKarti: { backgroundColor: "#ffffff", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 16 },
  haberUstSatir: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  itibarRozeti: { backgroundColor: "#d9f3ea", borderRadius: 8, color: "#178f5f", fontSize: 12, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 7 },
  urunPazariAnaKarti: { backgroundColor: "#ffffff", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 16 },
  urunPazariAnaUst: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  gizliRozet: { backgroundColor: "#d9f3ea", borderRadius: 8, color: "#178f5f", fontSize: 11, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 7 },
  urunPazarButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, justifyContent: "center", marginTop: 14, minHeight: 52 },
  depolarBaslikSatiri: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 18, marginBottom: 10 },
  bolumBasligiKoyu: { color: "#25324a", fontSize: 19, fontWeight: "900" },
  sifirlaYazi: { color: "#e76f51", fontSize: 12, fontWeight: "900" },
  sifirlaAltButonu: { alignItems: "center", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, justifyContent: "center", marginTop: 14, minHeight: 42 },
  bosDepoAlani: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderStyle: "dashed", borderWidth: 1, padding: 24 },
  bosBaslik: { color: "#25324a", fontSize: 18, fontWeight: "900" },
  bosYazi: { color: "#786e73", fontSize: 13, fontWeight: "700", lineHeight: 18, marginTop: 5, textAlign: "center" },
  depoKartYeni: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 10, marginBottom: 10, padding: 12 },
  depoKartSol: { alignItems: "center", backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, height: 56, justifyContent: "center", overflow: "hidden", width: 56 },
  miniDepoCati: { backgroundColor: "#e76f51", height: 8, width: "100%" },
  miniDepoKapisi: { alignItems: "center", flex: 1, justifyContent: "center" },
  depoMiniIcon: { color: "#178f5f", fontSize: 24, fontWeight: "900" },
  depoKartBaslik: { color: "#25324a", fontSize: 15, fontWeight: "900" },
  depoKartYazi: { color: "#786e73", fontSize: 12, fontWeight: "700", marginTop: 3 },
  depoKartDurum: { color: "#178f5f", fontSize: 11, fontWeight: "900", marginTop: 4 },
  depoGirButonu: { alignItems: "center", backgroundColor: "#25324a", borderRadius: 8, justifyContent: "center", minHeight: 42, paddingHorizontal: 12 },
  depoGirYazi: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  depoGirYaziKoyu: { color: "#25324a", fontSize: 12, fontWeight: "900" },
  esnekAlan: { flex: 1 },
  ustBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  geriButonu: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 42, paddingHorizontal: 14 },
  geriYazi: { color: "#25324a", fontSize: 13, fontWeight: "900" },
  merkezLogo: { color: "#25324a", fontSize: 16, fontWeight: "900" },
  acikArtirmaHero: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, padding: 18 },
  pazarHeroYeni: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, padding: 18 },
  urunPazariHero: { backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, padding: 18 },
  envanterHero: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, padding: 18 },
  gunSonuPaneli: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, padding: 18 },
  depoDetayHero: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, padding: 18 },
  depoDetayHeroDuzenli: { backgroundColor: "#f2fbf6", borderColor: "#a6ddc9", borderWidth: 2 },
  depoDetayHeroPremium: { backgroundColor: "#fffaf0", borderColor: "#e76f51", borderWidth: 3 },
  depoKurPaneli: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, gap: 12, padding: 18 },
  kalitePaneli: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 12, padding: 10 },
  kaliteButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, justifyContent: "center", minHeight: 40, paddingHorizontal: 12 },
  kaliteButonYazi: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  kaliteSeviyeSatiri: { flexDirection: "row", gap: 5, marginTop: 8 },
  kaliteSeviyeAdim: { backgroundColor: "#f3e5c9", borderRadius: 8, height: 8, width: 34 },
  kaliteSeviyeAdimAktif: { backgroundColor: "#178f5f" },
  kaliteEtkiYazi: { color: "#786e73", fontSize: 11, fontWeight: "800", marginTop: 6 },
  buyukBaslik: { color: "#25324a", fontSize: 30, fontWeight: "900", letterSpacing: 0, marginTop: 5, textAlign: "center" },
  heroAlt: { color: "#6d6470", fontSize: 13, fontWeight: "800", lineHeight: 18, marginTop: 7, textAlign: "center" },
  sayacKarti: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, marginTop: 14, padding: 12 },
  sayacEtiket: { color: "#786e73", fontSize: 11, fontWeight: "900", textAlign: "center" },
  sayacDeger: { color: "#178f5f", fontSize: 28, fontWeight: "900", marginTop: 2, textAlign: "center" },
  sayacCubugu: { backgroundColor: "#f3e5c9", borderRadius: 8, height: 8, marginTop: 10, overflow: "hidden" },
  sayacDolgu: { backgroundColor: "#178f5f", borderRadius: 8, height: "100%" },
  adminKarti: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 12, padding: 14 },
  adminRozet: { alignItems: "center", backgroundColor: "#25324a", borderRadius: 8, height: 54, justifyContent: "center", width: 54 },
  adminHarf: { color: "#f0c26b", fontSize: 24, fontWeight: "900" },
  adminBaslik: { color: "#e76f51", fontSize: 12, fontWeight: "900" },
  adminSoz: { color: "#25324a", fontSize: 15, fontWeight: "900", lineHeight: 20, marginTop: 3 },
  depoOnizleme: { backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 14 },
  depoCati: { alignSelf: "center", backgroundColor: "#e76f51", borderRadius: 8, height: 6, marginBottom: 12, width: "70%" },
  depoKutulari: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  onizlemeKutusu: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, height: 42, justifyContent: "center", width: "18%" },
  onizlemeKutuNo: { color: "#25324a", fontSize: 12, fontWeight: "900" },
  olasilikSatiri: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 12 },
  olasilikMetni: { backgroundColor: "#ffffff", borderRadius: 8, color: "#25324a", fontSize: 11, fontWeight: "900", paddingHorizontal: 9, paddingVertical: 6 },
  pazarListe: { gap: 10, marginTop: 14 },
  pazarDepoKarti: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 12, padding: 12 },
  seciliPazarDepoKarti: { borderColor: "#e76f51", borderWidth: 2, shadowColor: "#e76f51", shadowOpacity: 0.18, shadowRadius: 10 },
  depoDisGorunum: { alignItems: "center", backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, height: 76, justifyContent: "flex-end", overflow: "hidden", width: 72 },
  depoTabela: { alignItems: "center", backgroundColor: "#25324a", height: 22, justifyContent: "center", width: "100%" },
  depoTabelaYazi: { color: "#f0c26b", fontSize: 10, fontWeight: "900" },
  depoKapisi: { alignItems: "center", backgroundColor: "#f8f2e8", borderColor: "#a6ddc9", borderTopWidth: 1, flex: 1, justifyContent: "center", width: "72%" },
  depoKilit: { backgroundColor: "#e76f51", borderRadius: 6, height: 12, width: 12 },
  pazarMiniSatir: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  pazarMiniBilgi: { backgroundColor: "#fff8e9", borderRadius: 8, color: "#25324a", fontSize: 11, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5 },
  depoIcPaneli: { backgroundColor: "#ffffff", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, marginTop: 14, padding: 14 },
  depoIcGorunum: { backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 12, padding: 12 },
  depoIcKutusu: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, height: 42, justifyContent: "center", width: "18%" },
  pazarAksiyonSatiri: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  pazarButonuKisa: { alignItems: "center", backgroundColor: "#e76f51", borderRadius: 8, justifyContent: "center", minHeight: 44, paddingHorizontal: 14 },
  urunPazariListe: { gap: 12, marginTop: 14 },
  urunPazarKarti: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 12, padding: 12 },
  satilmisUrunKarti: { opacity: 0.58 },
  urunPazarGorsel: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 2, height: 88, justifyContent: "center", width: 76 },
  urunPazarNadirlik: { fontSize: 10, fontWeight: "900" },
  urunPazarIkon: { color: "#25324a", fontSize: 30, fontWeight: "900" },
  gizliFiyatYazi: { alignSelf: "flex-start", backgroundColor: "#25324a", borderRadius: 8, color: "#f0c26b", fontSize: 11, fontWeight: "900", marginTop: 7, paddingHorizontal: 8, paddingVertical: 5 },
  urunTeklifSatiri: { flexDirection: "row", gap: 8, marginTop: 10 },
  urunTeklifInput: { backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, color: "#25324a", flex: 1, fontSize: 15, fontWeight: "900", minHeight: 44, paddingHorizontal: 10 },
  urunTeklifButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, justifyContent: "center", minHeight: 44, paddingHorizontal: 10 },
  satildiYazi: { color: "#178f5f", fontSize: 12, fontWeight: "900", marginTop: 8 },
  teklifPaneli: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 14 },
  oyuncuLiderPaneli: { borderColor: "#178f5f", borderWidth: 3 },
  teklifBaslik: { color: "#786e73", fontSize: 12, fontWeight: "900" },
  teklifDegeri: { color: "#e76f51", fontSize: 30, fontWeight: "900", marginTop: 2 },
  hizliAlSatiri: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 10, padding: 10 },
  hizliAlEtiket: { color: "#786e73", fontSize: 11, fontWeight: "900" },
  hizliAlFiyat: { color: "#25324a", fontSize: 15, fontWeight: "900", marginTop: 2 },
  hizliAlButonu: { alignItems: "center", backgroundColor: "#25324a", borderRadius: 8, justifyContent: "center", minHeight: 40, paddingHorizontal: 14 },
  hizliAlYazi: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  salonMesaji: { color: "#53606f", fontSize: 13, fontWeight: "800", lineHeight: 18, marginTop: 6 },
  beklemeYazi: { color: "#e76f51", fontSize: 12, fontWeight: "900", marginTop: 7 },
  teklifSatiri: { flexDirection: "row", gap: 10, marginTop: 12 },
  teklifInput: { backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, color: "#25324a", flex: 1, fontSize: 18, fontWeight: "900", minHeight: 50, paddingHorizontal: 12 },
  teklifButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, justifyContent: "center", minHeight: 50, paddingHorizontal: 14 },
  teklifButonuYazi: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
  adminKontrolSatiri: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  gecmisPaneli: { backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 10 },
  gecmisSatiri: { color: "#53606f", fontSize: 11, fontWeight: "800", lineHeight: 16, marginTop: 4 },
  cekilButonu: { alignItems: "center", borderColor: "#e76f51", borderRadius: 8, borderWidth: 1, justifyContent: "center", marginTop: 10, minHeight: 42 },
  cekilYazi: { color: "#e76f51", fontSize: 13, fontWeight: "900" },
  katilimciPaneli: { marginTop: 14 },
  katilimciIzgara: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  katilimciKarti: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, padding: 8, width: "31%" },
  satisTeklifKarti: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#178f5f", borderRadius: 8, borderWidth: 2, padding: 8, width: "31%" },
  seciliSatisTeklifi: { backgroundColor: "#d9f3ea", borderColor: "#e76f51", borderWidth: 3 },
  aliciProfilYazi: { color: "#e76f51", fontSize: 9, fontWeight: "900", marginTop: 2 },
  teklifSureYazi: { backgroundColor: "#fff8e9", borderRadius: 8, color: "#25324a", fontSize: 9, fontWeight: "900", marginTop: 5, paddingHorizontal: 6, paddingVertical: 2 },
  liderKatilimci: { borderColor: "#178f5f", borderWidth: 3, shadowColor: "#178f5f", shadowOpacity: 0.25, shadowRadius: 10 },
  pasifKatilimci: { opacity: 0.48 },
  insanIconu: { alignItems: "center", borderRadius: 22, height: 40, justifyContent: "center", width: 40 },
  insanHarf: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  katilimciIsim: { color: "#25324a", fontSize: 12, fontWeight: "900", marginTop: 5 },
  takintiliRozet: { backgroundColor: "#fff0e8", borderRadius: 8, color: "#e76f51", fontSize: 9, fontWeight: "900", marginTop: 3, paddingHorizontal: 6, paddingVertical: 2 },
  katilimciTeklif: { color: "#786e73", fontSize: 10, fontWeight: "800", marginTop: 3 },
  genisButon: { alignItems: "center", backgroundColor: "#e76f51", borderRadius: 8, justifyContent: "center", marginTop: 14, minHeight: 50 },
  genisButonYazi: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  pasifSatisButonu: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, justifyContent: "center", marginTop: 14, minHeight: 46 },
  pasifSatisYazi: { color: "#786e73", fontSize: 13, fontWeight: "900" },
  silButonu: { alignItems: "center", backgroundColor: "#25324a", borderRadius: 8, justifyContent: "center", marginTop: 14, minHeight: 50 },
  silButonuYazi: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  depoYonetimPaneli: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 14, padding: 10 },
  depoYonetimButonlari: { alignItems: "center", flexDirection: "row", gap: 8 },
  artiButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, height: 44, justifyContent: "center", width: 44 },
  artiButonYazi: { color: "#ffffff", fontSize: 24, fontWeight: "900" },
  satisaCikarButonu: { alignItems: "center", backgroundColor: "#e76f51", borderRadius: 8, justifyContent: "center", minHeight: 44, paddingHorizontal: 12 },
  satisaCikarYazi: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  pasifButon: { opacity: 0.45 },
  kutuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  profilHero: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, padding: 22 },
  profilBuyukRozet: { alignItems: "center", backgroundColor: "#25324a", borderColor: "#f0c26b", borderRadius: 36, borderWidth: 3, height: 72, justifyContent: "center", marginBottom: 10, width: 72 },
  profilBuyukHarf: { color: "#f0c26b", fontSize: 26, fontWeight: "900" },
  isimFormu: { gap: 10, marginTop: 14, width: "100%" },
  profilInput: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, color: "#25324a", fontSize: 15, fontWeight: "900", minHeight: 48, paddingHorizontal: 12 },
  bankaKarti: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, marginTop: 14, padding: 14 },
  bankaGecikmis: { borderColor: "#d94b4b", borderWidth: 2 },
  bankaBaslikSatiri: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  gunRozeti: { backgroundColor: "#fff8e9", borderRadius: 8, color: "#e76f51", fontSize: 12, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 7 },
  bankaAciklama: { color: "#6d6470", fontSize: 12, fontWeight: "800", lineHeight: 18, marginTop: 10 },
  krediSecenekleri: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  krediSecenek: { backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  krediSecenekAktif: { backgroundColor: "#25324a", borderColor: "#25324a" },
  krediSecenekYazi: { color: "#e76f51", fontSize: 12, fontWeight: "900" },
  krediOdeButonu: { alignItems: "center", borderColor: "#178f5f", borderRadius: 8, borderWidth: 1, justifyContent: "center", marginTop: 10, minHeight: 44 },
  krediOdeYazi: { color: "#178f5f", fontSize: 13, fontWeight: "900" },
  krediOdemePaneli: { backgroundColor: "#fff8e9", borderColor: "#f0c26b", borderRadius: 8, borderWidth: 1, marginTop: 10, padding: 12 },
  krediOdemeBaslik: { color: "#786e73", fontSize: 11, fontWeight: "900" },
  krediOdemeBorc: { color: "#25324a", fontSize: 24, fontWeight: "900", marginTop: 3 },
  krediOdemeSatir: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  krediOdemeEtiket: { color: "#786e73", fontSize: 12, fontWeight: "800" },
  krediOdemeDeger: { color: "#25324a", fontSize: 13, fontWeight: "900" },
  krediKapatButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, justifyContent: "center", marginTop: 12, minHeight: 44 },
  krediKapatYazi: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
  profilGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  profilBilgiKarti: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, padding: 12, width: "48%" },
  profilBilgiEtiket: { color: "#786e73", fontSize: 11, fontWeight: "900" },
  profilBilgiDeger: { color: "#25324a", fontSize: 16, fontWeight: "900", marginTop: 4 },
  sekmeSatiri: { backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 8, marginTop: 14, padding: 6 },
  sekmeButonu: { alignItems: "center", borderRadius: 8, flex: 1, justifyContent: "center", minHeight: 42 },
  sekmeAktif: { backgroundColor: "#25324a" },
  sekmeYazi: { color: "#786e73", fontSize: 13, fontWeight: "900" },
  sekmeYaziAktif: { color: "#ffffff" },
  temizleButonu: { alignItems: "center", borderColor: "#e76f51", borderRadius: 8, borderWidth: 1, justifyContent: "center", marginTop: 10, minHeight: 42 },
  temizleYazi: { color: "#e76f51", fontSize: 12, fontWeight: "900" },
  envanterListe: { gap: 10, marginTop: 14 },
  envanterUrunKarti: { alignItems: "flex-start", backgroundColor: "#ffffff", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 10, marginBottom: 10, padding: 12 },
  envanterUrunRozet: { alignItems: "center", backgroundColor: "#fff8e9", borderRadius: 8, borderWidth: 2, height: 48, justifyContent: "center", width: 58 },
  envanterUrunIkon: { color: "#25324a", fontSize: 22, fontWeight: "900" },
  urunGecmisYazi: { color: "#53606f", fontSize: 11, fontWeight: "800", lineHeight: 16, marginTop: 5 },
  urunAksiyonSatiri: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  kucukAksiyonButonu: { alignItems: "center", backgroundColor: "#178f5f", borderRadius: 8, justifyContent: "center", minHeight: 32, paddingHorizontal: 8 },
  kucukAksiyonYazi: { color: "#ffffff", fontSize: 10, fontWeight: "900" },
  kucukIkincilButon: { alignItems: "center", backgroundColor: "#fff8e9", borderColor: "#efd7a7", borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 32, paddingHorizontal: 8 },
  kucukIkincilYazi: { color: "#25324a", fontSize: 10, fontWeight: "900" },
  satilmisSatiri: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  satildiSilButonu: { alignItems: "center", backgroundColor: "#25324a", borderRadius: 8, justifyContent: "center", minHeight: 30, paddingHorizontal: 10 },
  satildiSilYazi: { color: "#ffffff", fontSize: 10, fontWeight: "900" },
  pazarTeklifPaneli: { backgroundColor: "#d9f3ea", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 1, marginTop: 8, padding: 8 }
});
