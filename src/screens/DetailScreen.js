import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useFavorites from '../hooks/useFavorites';
import { colors, font, shadow } from '../theme/theme';

const sim = (value) => (value ? 'Sim' : 'Não');

function Info({ titulo, valor, cor }) {
  return (
    <View style={[s.info, { backgroundColor: cor }]}>
      <Text style={s.infoTitle}>{titulo}</Text>
      <Text style={s.infoValue}>{valor || 'Não informado'}</Text>
    </View>
  );
}

export default function DetailScreen({ route, navigation }) {
  const pet = route.params?.pet;
  const { isFav, toggle } = useFavorites();

  if (!pet) {
    return (
      <SafeAreaView style={s.missing}>
        <Text style={s.name}>Animal não encontrado</Text>
        <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
          <Text style={s.buttonText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.page}>
      {pet.foto ? (
        <Image source={{ uri: pet.foto }} style={s.hero} resizeMode='cover' />
      ) : (
        <View style={[s.hero, s.heroFallback]}>
          <Ionicons name='paw' size={60} color={colors.pink} />
        </View>
      )}

      <SafeAreaView edges={['top']} style={s.top}>
        <Pressable style={s.round} onPress={() => navigation.goBack()} accessibilityLabel='Voltar'>
          <Ionicons name='chevron-back' size={24} color={colors.ink} />
        </Pressable>
        <Pressable style={s.round} onPress={() => toggle(pet)} accessibilityLabel='Favoritar animal'>
          <Ionicons name={isFav(pet.id) ? 'heart' : 'heart-outline'} size={24} color={colors.pink} />
        </Pressable>
      </SafeAreaView>

      <ScrollView style={s.sheet} contentContainerStyle={s.content}>
        <Text style={s.name}>{pet.nome || 'Sem nome'}</Text>
        <Text style={s.subtitle}>
          {[pet.raca, pet.sexo, pet.idade, pet.cidade].filter(Boolean).join(' · ')}
        </Text>

        <View style={s.row}>
          <Info titulo='Vacinas' valor={sim(pet.vacinado)} cor={colors.mint} />
          <Info titulo='Castração' valor={sim(pet.castrado)} cor={colors.lav} />
          <Info titulo='Porte' valor={pet.porte} cor={colors.butter} />
        </View>

        <Text style={s.heading}>Sobre {pet.nome || 'este animal'}</Text>
        <Text style={s.description}>{pet.descricao || 'Descrição ainda não disponível.'}</Text>

        {!!pet.ongNome && (
          <View style={s.ong}>
            <Ionicons name='location' size={22} color='#2E7D5B' />
            <Text style={s.ongName}>{pet.ongNome}</Text>
          </View>
        )}
      </ScrollView>

      <Pressable style={s.adoptButton} onPress={() => navigation.navigate('Adoption', { pet })}>
        <Text style={s.buttonText}>Quero adotar</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  hero: { position: 'absolute', top: 0, width: '100%', height: 360, backgroundColor: colors.lav },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  sheet: { flex: 1, marginTop: 320, backgroundColor: colors.bg, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  content: { padding: 24, paddingBottom: 120 },
  name: { fontFamily: font.bold, fontSize: 32, color: colors.ink },
  subtitle: { fontFamily: font.regular, color: colors.soft, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 16 },
  info: { flex: 1, minWidth: 0, borderRadius: 20, padding: 12, alignItems: 'center' },
  infoTitle: { fontFamily: font.regular, fontSize: 12, color: colors.soft },
  infoValue: { fontFamily: font.bold, fontSize: 15, color: colors.ink, textAlign: 'center' },
  heading: { fontFamily: font.bold, fontSize: 17, color: colors.ink, marginTop: 24 },
  description: { fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.soft, marginTop: 8 },
  ong: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: 24 },
  ongName: { fontFamily: font.bold, color: colors.ink },
  adoptButton: { position: 'absolute', left: 24, right: 24, bottom: 32, height: 56, borderRadius: 28, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', ...shadow },
  buttonText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  missing: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backButton: { marginTop: 20, backgroundColor: colors.pink, borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14 },
});
