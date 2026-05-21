import { nadirlikAyarlari } from "../veri/oyunVerisi";
import type { EnvanterUrunu, Nadirlik } from "../tipler/oyunTipleri";

function sayiArasi(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function rastgeleSec<T>(liste: T[]) {
  return liste[Math.floor(Math.random() * liste.length)];
}

function nadirlikSec(): Nadirlik {
  const sans = Math.random() * 100;

  if (sans < 78) return "cop";
  if (sans < 96) return "normal";
  if (sans < 99) return "iyi";
  if (sans < 99.8) return "nadir";
  return "efsane";
}

export function urunKutusuOlustur(): EnvanterUrunu {
  const nadirlik = nadirlikSec();
  const ayar = nadirlikAyarlari[nadirlik];

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    isim: rastgeleSec(ayar.isimler),
    deger: sayiArasi(ayar.minDeger, ayar.maxDeger),
    nadirlik
  };
}

export function depoUrunleriOlustur() {
  const urunSayisi = sayiArasi(3, 10);
  const urunler = Array.from({ length: urunSayisi }, urunKutusuOlustur);
  const enIyiUrun = urunler.reduce((enIyi, urun) => (urun.deger > enIyi.deger ? urun : enIyi), urunler[0]);

  return { urunSayisi, urunler, enIyiUrun };
}