import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import type { KaynakliUrun } from "../tipler/ekranTipleri";
import { nadirlikAyarlari } from "../veri/oyunVerisi";
import { urunIkonuSec } from "../yardimcilar/ekranYardimcilari";
import { paraYaz } from "../yardimcilar/para";

type DepoyaEklenecekUrunKartiProps = {
  urun: KaynakliUrun;
  onEkle: () => void;
};

export function DepoyaEklenecekUrunKarti({ urun, onEkle }: DepoyaEklenecekUrunKartiProps) {
  const kayma = useRef(new Animated.Value(0)).current;
  const opaklik = useRef(new Animated.Value(1)).current;
  const ayar = nadirlikAyarlari[urun.nadirlik];

  const urunuEkle = () => {
    Animated.parallel([
      Animated.timing(kayma, { toValue: -34, duration: 260, useNativeDriver: true }),
      Animated.timing(opaklik, { toValue: 0.35, duration: 260, useNativeDriver: true })
    ]).start(() => onEkle());
  };

  return (
    <Animated.View style={{ opacity: opaklik, transform: [{ translateY: kayma }] }}>
      <Pressable style={stiller.kart} onPress={urunuEkle}>
        <View style={[stiller.rozet, { borderColor: ayar.renk }]}><Text style={stiller.ikon}>{urunIkonuSec(urun.isim)}</Text></View>
        <View style={stiller.esnekAlan}>
          <Text style={stiller.baslik}>{urun.isim}</Text>
          <Text style={stiller.yazi}>{urun.kaynak} - {ayar.etiket} - {paraYaz(urun.deger)}</Text>
          <Text style={stiller.durum}>Dokununca depoya eklenir</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const stiller = StyleSheet.create({
  kart: { alignItems: "flex-start", backgroundColor: "#ffffff", borderColor: "#a6ddc9", borderRadius: 8, borderWidth: 2, flexDirection: "row", gap: 10, marginBottom: 10, padding: 12 },
  rozet: { alignItems: "center", backgroundColor: "#fff8e9", borderRadius: 8, borderWidth: 2, height: 48, justifyContent: "center", width: 58 },
  ikon: { color: "#25324a", fontSize: 22, fontWeight: "900" },
  esnekAlan: { flex: 1 },
  baslik: { color: "#25324a", fontSize: 15, fontWeight: "900" },
  yazi: { color: "#786e73", fontSize: 12, fontWeight: "700", marginTop: 3 },
  durum: { color: "#178f5f", fontSize: 11, fontWeight: "900", marginTop: 4 }
});
