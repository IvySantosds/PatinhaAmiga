import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PetCard from '../components/PetCard';
import useFavorites from '../hooks/useFavorites';
import { colors, font } from '../theme/theme';

// Mostra a lista que o usuário salvou na subcoleção favoritos do Firestore.
export default function FavoritesScreen({ navigation }) {
  const { favs, loading, toggle } = useFavorites();
  const [removendo, setRemovendo] = useState(null);

  // Pede confirmação para evitar remover um animal por toque acidental.
  function confirmarRemocao(pet) {
    Alert.alert('Remover dos favoritos?', `Quer tirar ${pet.nome || 'este animal'} da sua lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setRemovendo(pet.id);
          const ok = await toggle(pet);
          setRemovendo(null);
          if (!ok) Alert.alert('Não foi possível remover', 'Confira sua conexão e tente novamente.');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <Text style={s.title}>Meus favoritos</Text>
      {loading ? (
        <ActivityIndicator color={colors.pink} style={s.loading} />
      ) : (
        <FlatList
          data={favs}
          numColumns={2}
          keyExtractor={(pet) => pet.id}
          contentContainerStyle={favs.length ? s.list : s.emptyList}
          ListEmptyComponent={(
            <View style={s.empty}>
              <Ionicons name='heart-outline' size={60} color={colors.pink} />
              <Text style={s.emptyTitle}>Sua lista ainda está vazia</Text>
              <Text style={s.emptyText}>Toque no coração de um animal para guardá-lo aqui.</Text>
              <Pressable style={s.button} onPress={() => navigation.navigate('Home')}>
                <Text style={s.buttonText}>Explorar animais</Text>
              </Pressable>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={s.cardWrap}>
              <PetCard
                pet={item}
                fav
                onPress={() => navigation.navigate('Detail', { pet: item })}
                onFav={() => confirmarRemocao(item)}
              />
              {removendo === item.id && (
                <View style={s.overlay}>
                  <ActivityIndicator color={colors.pink} />
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: font.bold, fontSize: 28, color: colors.ink, paddingHorizontal: 20, paddingTop: 12 },
  loading: { flex: 1 },
  list: { padding: 7, paddingBottom: 110 },
  emptyList: { flexGrow: 1, paddingBottom: 110 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyTitle: { fontFamily: font.bold, fontSize: 22, color: colors.ink, marginTop: 16, textAlign: 'center' },
  emptyText: { fontFamily: font.regular, fontSize: 15, color: colors.soft, textAlign: 'center', marginTop: 8 },
  button: { marginTop: 22, paddingHorizontal: 28, height: 50, borderRadius: 25, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: font.bold, color: '#fff', fontSize: 16 },
  cardWrap: { flex: 1, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 28, margin: 7 },
});
