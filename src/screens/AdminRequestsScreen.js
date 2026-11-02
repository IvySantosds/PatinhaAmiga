import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, font, shadow } from '../theme/theme';

const FILTERS = [
  ['pendente', 'Pendentes'],
  ['aprovado', 'Aprovados'],
  ['recusado', 'Recusados'],
];
const STATUS_COLORS = { pendente: colors.butter, aprovado: colors.mint, recusado: colors.pinkSoft };

// Acompanha os pedidos do status selecionado e abre sua análise.
export default function AdminRequestsScreen({ navigation }) {
  const [status, setStatus] = useState('pendente');
  const [result, setResult] = useState({ status: null, pedidos: [], loading: true, error: false });
  const loading = result.status !== status || result.loading;

  useEffect(() => onSnapshot(
    query(collection(db, 'pedidos'), where('status', '==', status)),
    (snapshot) => {
      const pedidos = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      pedidos.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
      setResult({ status, pedidos, loading: false, error: false });
    },
    (error) => {
      console.warn('Não foi possível carregar os pedidos.', error);
      setResult({ status, pedidos: [], loading: false, error: true });
    },
  ), [status]);

  const pedidos = result.status === status ? result.pedidos : [];

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Pedidos</Text>
        <View style={s.badge}><Text style={s.badgeText}>Admin</Text></View>
      </View>
      <View style={s.filters}>
        {FILTERS.map(([value, label]) => (
          <Pressable key={value} onPress={() => setStatus(value)} style={[s.filter, status === value && s.filterOn]}>
            <Text style={[s.filterText, status === value && s.filterTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={pedidos}
        keyExtractor={(pedido) => pedido.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={loading
          ? <ActivityIndicator color={colors.pink} style={s.empty} />
          : <Text style={s.empty}>{result.error ? 'Não foi possível carregar os pedidos.' : 'Nenhum pedido nesta categoria.'}</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => navigation.navigate('AdminRequest', { pedido: item })}>
            {item.animalFoto
              ? <Image source={{ uri: item.animalFoto }} style={s.photo} />
              : <View style={[s.photo, s.photoFallback]}><Text>🐾</Text></View>}
            <View style={s.details}>
              <Text numberOfLines={1} style={s.animal}>{item.animalNome || 'Animal'}</Text>
              <Text numberOfLines={1} style={s.info}>{item.nome || 'Adotante'} · {item.moradia || 'Moradia não informada'}</Text>
              <Text style={s.date}>{item.criadoEm?.toDate ? item.criadoEm.toDate().toLocaleDateString('pt-BR') : ''}</Text>
            </View>
            <View style={[s.status, { backgroundColor: STATUS_COLORS[item.status] || colors.lav }]}>
              <Text style={s.statusText}>{item.status || 'pendente'}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  title: { fontFamily: font.bold, fontSize: 28, color: colors.ink },
  badge: { backgroundColor: colors.lav, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: font.bold, fontSize: 13, color: '#4B3B8F' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16 },
  filter: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff' },
  filterOn: { backgroundColor: colors.pink },
  filterText: { fontFamily: font.medium, color: colors.ink },
  filterTextOn: { color: '#fff' },
  list: { padding: 20, paddingBottom: 110, gap: 12, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 24, padding: 10, ...shadow },
  photo: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.lav, alignItems: 'center', justifyContent: 'center' },
  photoFallback: { flexDirection: 'row' },
  details: { flex: 1, minWidth: 0 },
  animal: { fontFamily: font.bold, fontSize: 17, color: colors.ink },
  info: { fontFamily: font.regular, fontSize: 13, color: colors.soft },
  date: { fontFamily: font.regular, fontSize: 12, color: colors.soft, marginTop: 2 },
  status: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontFamily: font.medium, fontSize: 12, color: colors.ink },
  empty: { flex: 1, textAlign: 'center', color: colors.soft, marginTop: 40, fontFamily: font.medium },
});
