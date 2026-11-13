import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, font, shadow } from '../theme/theme';

// react-native-maps funciona no iOS e Android; na web, mostramos a lista de ONGs.
const MapView = Platform.OS === 'web' ? null : require('react-native-maps').default;
const Marker = Platform.OS === 'web' ? null : require('react-native-maps').Marker;
const SAO_PAULO = { latitude: -23.55, longitude: -46.63 };

// Calcula a distância em linha reta entre dois pontos do mapa.
function distanciaKm(a, b) {
  const radianos = (graus) => (graus * Math.PI) / 180;
  const dLat = radianos(b.latitude - a.latitude);
  const dLon = radianos(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(radianos(a.latitude)) * Math.cos(radianos(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export default function MapScreen() {
  const mapRef = useRef(null);
  const [ongs, setOngs] = useState([]);
  const [posicao, setPosicao] = useState(null);
  const [selecionada, setSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [localizacaoNegada, setLocalizacaoNegada] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLaidOut, setMapLaidOut] = useState(false);

  // Lê as ONGs em tempo real; só documentos com coordenadas válidas viram marcadores.
  useEffect(() => onSnapshot(
    collection(db, 'ongs'),
    (snapshot) => {
      const lista = snapshot.docs
        .map((documento) => ({ id: documento.id, ...documento.data() }))
        .filter((ong) => ong.latitude !== '' && ong.latitude != null
          && ong.longitude !== '' && ong.longitude != null
          && Number.isFinite(Number(ong.latitude)) && Number.isFinite(Number(ong.longitude))
          && Math.abs(Number(ong.latitude)) <= 90 && Math.abs(Number(ong.longitude)) <= 180);
      setOngs(lista);
      setErro(false);
      setCarregando(false);
    },
    (error) => {
      console.warn('Não foi possível carregar as ONGs.', error);
      setErro(true);
      setCarregando(false);
    },
  ), []);

  // Se a pessoa não liberar a localização, o mapa continua funcionando com uma posição padrão.
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    let ativo = true;

    async function buscarLocalizacao() {
      try {
        const permissao = await Location.requestForegroundPermissionsAsync();
        if (permissao.status !== 'granted') {
          if (ativo) setLocalizacaoNegada(true);
          return;
        }
        const local = await Location.getCurrentPositionAsync({});
        if (ativo) setPosicao({ latitude: local.coords.latitude, longitude: local.coords.longitude });
      } catch (error) {
        console.warn('Não foi possível obter a localização.', error);
        if (ativo) setLocalizacaoNegada(true);
      }
    }

    buscarLocalizacao();
    return () => { ativo = false; };
  }, []);

  const centro = posicao || SAO_PAULO;
  const ongsOrdenadas = useMemo(() => [...ongs].sort((a, b) => (
    distanciaKm(centro, a) - distanciaKm(centro, b)
  )), [centro, ongs]);

  // Enquadra os pontos cadastrados para não deixar os marcadores fora da tela.
  useEffect(() => {
    if (!mapReady || !mapLaidOut || ongs.length === 0) return;

    const coordenadas = ongs.map((ong) => ({
      latitude: Number(ong.latitude),
      longitude: Number(ong.longitude),
    }));

    if (coordenadas.length === 1) {
      mapRef.current?.animateToRegion({
        ...coordenadas[0],
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }, 500);
      return;
    }

    mapRef.current?.fitToCoordinates(coordenadas, {
      edgePadding: { top: 60, right: 40, bottom: 150, left: 40 },
      animated: true,
    });
  }, [mapReady, mapLaidOut, ongs]);

  // Na versão web, abre as coordenadas no Google Maps.
  function abrirMapaExterno(ong) {
    const url = `https://www.google.com/maps/search/?api=1&query=${ong.latitude},${ong.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Não foi possível abrir o mapa.'));
  }

  function detalhesOng(ong, noMapa = false) {
    return (
      <View style={[s.card, noMapa && s.mapCard]}>
        <View style={s.cardHead}>
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>{ong.nome || 'ONG parceira'}</Text>
            {!!ong.cidade && <Text style={s.info}>{ong.cidade}</Text>}
            {!!ong.endereco && <Text style={s.info}>{ong.endereco}</Text>}
            {posicao && <Text style={s.distance}>{distanciaKm(posicao, ong).toFixed(1).replace('.', ',')} km de você</Text>}
          </View>
          {selecionada?.id === ong.id && (
            <Pressable onPress={() => setSelecionada(null)} accessibilityLabel='Fechar detalhes'>
              <Ionicons name='close-circle' size={26} color={colors.soft} />
            </Pressable>
          )}
        </View>
        {Platform.OS === 'web' && (
          <View style={s.actions}>
            <Pressable style={[s.button, s.secondaryButton]} onPress={() => abrirMapaExterno(ong)}>
              <Ionicons name='map' size={17} color={colors.pink} />
              <Text style={[s.buttonText, s.secondaryText]}>Abrir mapa</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>ONGs perto de você</Text>
        <Text style={s.subtitle}>
          {posicao ? 'Veja no mapa onde encontrar nossos parceiros.' : 'Mostrando parceiros a partir de São Paulo.'}
        </Text>
      </View>

      {localizacaoNegada && (
        <View style={s.notice}>
          <Ionicons name='information-circle-outline' size={19} color={colors.soft} />
          <Text style={s.noticeText}>Localização indisponível. O mapa usa São Paulo como referência.</Text>
        </View>
      )}

      {Platform.OS === 'web' ? (
        <View style={s.webList}>
          {carregando ? <ActivityIndicator color={colors.pink} /> : erro ? (
            <Text style={s.empty}>Não foi possível carregar as ONGs. Confira sua conexão.</Text>
          ) : ongsOrdenadas.length ? ongsOrdenadas.map((ong) => (
            <View key={ong.id}>{detalhesOng(ong)}</View>
          )) : (
            <Text style={s.empty}>Nenhuma ONG com localização cadastrada.</Text>
          )}
        </View>
      ) : (
        <View style={s.mapWrap}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{ ...centro, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
            showsUserLocation={!!posicao}
            onMapReady={() => setMapReady(true)}
            onLayout={() => setMapLaidOut(true)}
            onPress={() => setSelecionada(null)}
          >
            {ongs.map((ong) => (
              <Marker
                key={ong.id}
                coordinate={{ latitude: Number(ong.latitude), longitude: Number(ong.longitude) }}
                pinColor={colors.pink}
                title={ong.nome || 'ONG parceira'}
                description={[ong.cidade, ong.endereco].filter(Boolean).join(' · ')}
                onPress={() => setSelecionada(ong)}
              />
            ))}
          </MapView>

          {carregando && <ActivityIndicator style={s.mapLoading} color={colors.pink} />}
          {erro && <Text style={s.mapError}>Não foi possível carregar as ONGs.</Text>}
          {!carregando && !erro && ongs.length === 0 && (
            <View style={s.mapEmpty}><Text style={s.empty}>Nenhuma ONG com localização cadastrada.</Text></View>
          )}
          {selecionada && detalhesOng(selecionada, true)}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  title: { fontFamily: font.bold, fontSize: 26, color: colors.ink },
  subtitle: { fontFamily: font.regular, fontSize: 14, color: colors.soft, marginTop: 3 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, padding: 10, borderRadius: 16, backgroundColor: '#fff' },
  noticeText: { flex: 1, fontFamily: font.regular, fontSize: 13, color: colors.soft },
  mapWrap: { flex: 1 },
  mapLoading: { position: 'absolute', top: 18, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 10 },
  mapError: { position: 'absolute', top: 18, alignSelf: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 16, color: colors.pink, fontFamily: font.medium },
  mapEmpty: { position: 'absolute', top: 18, left: 20, right: 20, backgroundColor: '#fff', padding: 14, borderRadius: 18 },
  webList: { flex: 1, gap: 12, padding: 16, paddingBottom: 110 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginHorizontal: 16, marginBottom: 12, ...shadow },
  mapCard: { position: 'absolute', left: 0, right: 0, bottom: 96, zIndex: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  nome: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  info: { fontFamily: font.regular, fontSize: 14, color: colors.soft, marginTop: 3 },
  distance: { fontFamily: font.medium, color: colors.soft, fontSize: 13, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, height: 44, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.pink, marginTop: 12 },
  secondaryButton: { backgroundColor: colors.pinkSoft },
  buttonText: { fontFamily: font.bold, color: '#fff', fontSize: 15 },
  secondaryText: { color: colors.pink },
  empty: { fontFamily: font.medium, fontSize: 15, color: colors.soft, textAlign: 'center' },
});
