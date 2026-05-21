import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import type { EnvanterUrunu } from "../tipler/oyunTipleri";
import { nadirlikAyarlari } from "../veri/oyunVerisi";
import { paraYaz } from "../yardimcilar/para";

type UrunKutusuProps = {
  urun: EnvanterUrunu;
  acildi: boolean;
  onGoster: () => void;
  onSat: () => void;
};

export function UrunKutusu({ urun, acildi, onGoster, onSat }: UrunKutusuProps) {
  const animasyon = useRef(new Animated.Value(urun.goruldu ? 1 : 0)).current;
  const ayar = nadirlikAyarlari[urun.nadirlik];
  const degerliMi = urun.nadirlik === "iyi" || urun.nadirlik === "nadir" || urun.nadirlik === "efsane";

  const kutuyuCevir = () => {
    if (!acildi || urun.satildi) return;

    if (!urun.goruldu) {
      onGoster();
      Animated.spring(animasyon, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true
      }).start();
    }
  };

  const onYuzDonus = animasyon.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const arkaYuzDonus = animasyon.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <Pressable style={[stiller.flipKutusu, degerliMi && stiller.degerliFlipKutusu]} onPress={kutuyuCevir}>
      <Animated.View style={[stiller.kutuYuzu, stiller.kutuOnYuz, degerliMi && { borderColor: ayar.renk, borderWidth: 2 }, { transform: [{ rotateY: onYuzDonus }] }]}>
        <Text style={stiller.kapaliKutuIkonu}>BOX</Text>
        <Text style={stiller.kapaliKutuYazi}>{acildi ? "Dokun" : "Kilitli"}</Text>
      </Animated.View>
      <Animated.View style={[stiller.kutuYuzu, stiller.kutuArkaYuz, degerliMi && stiller.degerliKutuArka, { borderColor: ayar.renk, transform: [{ rotateY: arkaYuzDonus }] }]}>
        {degerliMi ? <Text style={[stiller.degerliEtiket, { color: ayar.renk }]}>DEĞERLİ</Text> : null}
        <Text style={[stiller.kutuNadirlik, { color: ayar.renk }]}>{ayar.etiket}</Text>
        <Text style={stiller.kutuUrunIsmi} numberOfLines={2}>{urun.isim}</Text>
        <Text style={[stiller.kutuDegeri, { color: ayar.renk }]}>{urun.satildi ? "Satıldı" : paraYaz(urun.deger)}</Text>
        {urun.goruldu && !urun.satildi ? (
          <Pressable style={[stiller.miniSatisButonu, { backgroundColor: ayar.renk }]} onPress={onSat}>
            <Text style={stiller.miniSatisYazi}>Kasaya Aktar</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const stiller = StyleSheet.create({
  flipKutusu: { height: 156, width: "31%" },
  degerliFlipKutusu: { shadowColor: "#f0c26b", shadowOpacity: 0.35, shadowRadius: 12 },
  kutuYuzu: { alignItems: "center", backfaceVisibility: "hidden", borderRadius: 8, borderWidth: 1, height: "100%", justifyContent: "center", padding: 8, position: "absolute", width: "100%" },
  kutuOnYuz: { backgroundColor: "#ffffff", borderColor: "#f0c26b" },
  kutuArkaYuz: { backgroundColor: "#fff8e9", borderColor: "#178f5f" },
  degerliKutuArka: { borderWidth: 3, shadowColor: "#f0c26b", shadowOpacity: 0.45, shadowRadius: 12 },
  degerliEtiket: { fontSize: 9, fontWeight: "900", marginBottom: 3 },
  kapaliKutuIkonu: { color: "#e76f51", fontSize: 20, fontWeight: "900" },
  kapaliKutuYazi: { color: "#786e73", fontSize: 11, fontWeight: "900", marginTop: 6 },
  kutuNadirlik: { fontSize: 11, fontWeight: "900" },
  kutuUrunIsmi: { color: "#25324a", fontSize: 12, fontWeight: "900", lineHeight: 16, marginTop: 6, minHeight: 32, textAlign: "center" },
  kutuDegeri: { fontSize: 13, fontWeight: "900", marginTop: 4 },
  miniSatisButonu: { alignItems: "center", borderRadius: 8, justifyContent: "center", marginTop: 7, minHeight: 30, paddingHorizontal: 10 },
  miniSatisYazi: { color: "#ffffff", fontSize: 10, fontWeight: "900" }
});
