import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, shadow } from '../theme/theme';

// Cartão compacto usado na lista de animais da Home.
export default function PetCard({ pet, fav, onPress, onFav }) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={`Ver detalhes de ${pet.nome || 'animal'}`}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
    >
      <View style={s.imageWrap}>
        {pet.foto ? (
          <Image source={{ uri: pet.foto }} style={s.image} resizeMode='cover' />
        ) : (
          <View style={[s.image, s.imageFallback]}>
            <Ionicons name='paw' size={34} color={colors.pink} />
          </View>
        )}
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={`${fav ? 'Remover' : 'Adicionar'} ${pet.nome || 'animal'} ${fav ? 'dos' : 'aos'} favoritos`}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onFav?.();
          }}
          style={s.heart}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={colors.pink} />
        </Pressable>
      </View>
      <Text numberOfLines={1} style={s.name}>{pet.nome || 'Sem nome'}</Text>
      <Text numberOfLines={1} style={s.info}>
        {[pet.raca, pet.idade].filter(Boolean).join(' · ') || 'Informações em breve'}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, minWidth: 0, margin: 7, padding: 10, backgroundColor: '#fff', borderRadius: 28, ...shadow },
  cardPressed: { opacity: 0.9 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 120, borderRadius: 20, backgroundColor: colors.lav },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  heart: { position: 'absolute', top: 8, right: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: font.bold, fontSize: 18, color: colors.ink, marginTop: 10, marginHorizontal: 4 },
  info: { fontFamily: font.regular, fontSize: 13, color: colors.soft, margin: 4 },
});
