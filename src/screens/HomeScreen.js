import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { collection, onSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PetCard from '../components/PetCard';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import useFavorites from '../hooks/useFavorites';
import useShake from '../hooks/useShake';
import { colors, font } from '../theme/theme';

const FILTROS = ['Todos', 'Cão', 'Gato', 'Filhote'];

// Mostra os animais disponíveis e deixa filtrar, buscar ou abrir um perfil.
export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { isFav, toggle } = useFavorites();
  const focado = useIsFocused();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => onSnapshot(
    collection(db, 'animais'),
    (snap) => {
      setPets(snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((pet) => pet.disponivel !== false));
      setLoadError(false);
      setLoading(false);
    },
    (error) => {
      console.warn('Não foi possível carregar os animais.', error);
      setLoadError(true);
      setLoading(false);
    },
  ), []);

  const lista = useMemo(() => pets.filter((p) => {
    const txt = [p.nome, p.raca, p.cidade].filter(Boolean).join(' ').toLowerCase();
    const okFiltro = filtro === 'Todos' || p.especie === filtro || (filtro === 'Filhote' && p.filhote);
    return okFiltro && txt.includes(busca.toLowerCase());
  }), [pets, busca, filtro]);

  // Escolhe um animal da lista e abre os detalhes dele.
  const sortear = useCallback(() => {
    if (!pets.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    navigation.navigate('Detail', { pet: pets[Math.floor(Math.random() * pets.length)] });
  }, [navigation, pets]);
  useShake(sortear, focado);

  const nome = user?.displayName || user?.email?.split('@')[0] || 'amigo';

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <FlatList
        data={lista}
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 13, paddingBottom: 110 }}
        ListHeaderComponent={
          <View style={{ padding: 7 }}>
            <Text style={s.hi}>Oi, {nome}!</Text>
            <Text style={s.title}>Quem vai te adotar hoje?</Text>
            <TextInput style={s.search} placeholder='Buscar nome ou raça do pet' placeholderTextColor={colors.soft} value={busca} onChangeText={setBusca} />
            <View style={s.chips}>
              {FILTROS.map((f) => (
                <Pressable key={f} onPress={() => setFiltro(f)} style={[s.chip, filtro === f && s.chipOn]}>
                  <Text style={[s.chipTxt, filtro === f && { color: '#fff' }]}>{f}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.dica}>Dica: sacuda o celular para sortear um amiguinho!</Text>
          </View>
        }
        ListEmptyComponent={loading
          ? <ActivityIndicator color={colors.pink} style={{ marginTop: 40 }} />
          : <Text style={s.empty}>{loadError ? 'Não foi possível carregar os animais. Verifique sua conexão e tente novamente.' : 'Nenhum bichinho encontrado 🐾'}</Text>}
        renderItem={({ item }) => (
          <PetCard pet={item} fav={isFav(item.id)} onFav={() => toggle(item)} onPress={() => navigation.navigate('Detail', { pet: item })} />
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  hi: { fontFamily: font.regular, color: colors.soft },
  title: { fontFamily: font.bold, fontSize: 28, color: colors.ink, marginBottom: 16 },
  search: { height: 52, borderRadius: 26, backgroundColor: '#fff', paddingHorizontal: 20, fontFamily: font.regular, fontSize: 16, color: colors.ink },
  chips: { flexDirection: 'row', gap: 8, marginTop: 16 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.pink },
  chipTxt: { fontFamily: font.medium, color: colors.ink },
  dica: { fontFamily: font.regular, fontSize: 13, color: colors.soft, marginTop: 12 },
  empty: { fontFamily: font.medium, textAlign: 'center', color: colors.soft, marginTop: 40 },
});
