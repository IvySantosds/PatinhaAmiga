import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import useFavorites from '../hooks/useFavorites';
import { colors, font, shadow } from '../theme/theme';

const STATUS = {
  pendente: { label: 'Pendente', color: colors.butter },
  aprovado: { label: 'Aprovado', color: colors.mint },
  recusado: { label: 'Recusado', color: colors.pinkSoft },
};

// Mostra os dados da conta, os favoritos e o andamento dos pedidos de adoção.
export default function ProfileScreen() {
  const { user } = useAuth();
  const { favs, loading: loadingFavorites } = useFavorites();
  const [requestsState, setRequestsState] = useState({ uid: null, requests: [], loading: true, error: false });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user?.uid) return undefined;

    return onSnapshot(
      query(collection(db, 'pedidos'), where('uid', '==', user.uid)),
      (snapshot) => {
        const requests = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        requests.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
        setRequestsState({ uid: user.uid, requests, loading: false, error: false });
      },
      (error) => {
        console.warn('Não foi possível carregar seus pedidos.', error);
        setRequestsState({ uid: user.uid, requests: [], loading: false, error: true });
      },
    );
  }, [user?.uid]);

  const requests = requestsState.uid === user?.uid ? requestsState.requests : [];
  const loadingRequests = Boolean(user?.uid) && (requestsState.uid !== user.uid || requestsState.loading);
  const name = user?.displayName || user?.email?.split('@')[0] || 'Adotante';

  // Só encerra a sessão depois da confirmação da pessoa.
  function confirmLogout() {
    Alert.alert('Sair da conta', 'Quer mesmo encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await signOut(auth);
          } catch (error) {
            console.warn('Não foi possível encerrar a sessão.', error);
            setLoggingOut(false);
            Alert.alert('Não foi possível sair', 'Tente novamente.');
          }
        },
      },
    ]);
  }

  function renderRequest({ item }) {
    const status = STATUS[item.status] || STATUS.pendente;
    return (
      <View style={s.requestCard}>
        {item.animalFoto
          ? <Image source={{ uri: item.animalFoto }} style={s.petImage} />
          : <View style={[s.petImage, s.imageFallback]}><Ionicons name='paw' size={22} color={colors.pink} /></View>}
        <View style={s.requestInfo}>
          <Text numberOfLines={1} style={s.petName}>{item.animalNome || 'Animal'}</Text>
          <Text style={s.requestDate}>
            {item.criadoEm?.toDate ? `Enviado em ${item.criadoEm.toDate().toLocaleDateString('pt-BR')}` : 'Pedido enviado'}
          </Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: status.color }]}>
          <Text style={s.statusText}>{status.label}</Text>
        </View>
      </View>
    );
  }

  const header = (
    <View>
      <View style={s.account}>
        <View style={s.avatar}><Ionicons name='person' size={42} color={colors.pink} /></View>
        <Text numberOfLines={1} style={s.name}>{name}</Text>
        <Text numberOfLines={1} style={s.email}>{user?.email || ''}</Text>
      </View>

      <View style={s.stats}>
        <View style={s.statCard}>
          <Text style={s.statNumber}>{loadingRequests ? '—' : requests.length}</Text>
          <Text style={s.statLabel}>Pedidos</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statNumber}>{loadingFavorites ? '—' : favs.length}</Text>
          <Text style={s.statLabel}>Favoritos</Text>
        </View>
      </View>
      <Text style={s.sectionTitle}>Meus pedidos de adoção</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        ListHeaderComponent={header}
        ListEmptyComponent={loadingRequests
          ? <ActivityIndicator color={colors.pink} style={s.empty} />
          : <Text style={s.empty}>{requestsState.error ? 'Não foi possível carregar seus pedidos.' : 'Você ainda não enviou pedidos.'}</Text>}
        ListFooterComponent={(
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Sair da conta'
            onPress={confirmLogout}
            disabled={loggingOut}
            style={({ pressed }) => [s.logout, pressed && s.logoutPressed]}
          >
            {loggingOut ? <ActivityIndicator color='#B3261E' /> : <Text style={s.logoutText}>Sair da conta</Text>}
          </Pressable>
        )}
        contentContainerStyle={s.list}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 110, flexGrow: 1 },
  account: { alignItems: 'center', paddingTop: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', ...shadow },
  name: { maxWidth: '100%', fontFamily: font.bold, fontSize: 24, color: colors.ink, marginTop: 10 },
  email: { maxWidth: '100%', fontFamily: font.regular, color: colors.soft },
  stats: { flexDirection: 'row', gap: 12, marginTop: 18 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 22, padding: 12, alignItems: 'center', ...shadow },
  statNumber: { fontFamily: font.bold, fontSize: 24, color: colors.pink },
  statLabel: { fontFamily: font.regular, fontSize: 13, color: colors.soft },
  sectionTitle: { fontFamily: font.bold, fontSize: 18, color: colors.ink, marginTop: 24, marginBottom: 12 },
  requestCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 22, padding: 10, marginBottom: 10, ...shadow },
  petImage: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.lav },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  requestInfo: { flex: 1, minWidth: 0 },
  petName: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  requestDate: { fontFamily: font.regular, fontSize: 12, color: colors.soft, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontFamily: font.medium, fontSize: 12, color: colors.ink },
  empty: { flex: 1, textAlign: 'center', fontFamily: font.regular, color: colors.soft, marginTop: 18, marginBottom: 24 },
  logout: { height: 52, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  logoutPressed: { opacity: 0.8 },
  logoutText: { fontFamily: font.medium, color: '#B3261E' },
});
