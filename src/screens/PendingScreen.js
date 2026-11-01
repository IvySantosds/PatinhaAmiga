import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, font } from '../theme/theme';

const labels = {
  Adoption: 'Pedido de adoção',
  Success: 'Confirmação',
  Favorites: 'Favoritos',
  Map: 'Mapa',
  Profile: 'Perfil',
  AdminTabs: 'Painel administrativo',
  AdminRequest: 'Análise do pedido',
};

export default function PendingScreen({ route }) {
  const title = labels[route?.name] || 'Esta etapa';

  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.message}>Tela em construção</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  title: { fontFamily: font.bold, fontSize: 26, color: colors.ink, textAlign: 'center' },
  message: { fontFamily: font.regular, fontSize: 16, color: colors.soft, marginTop: 8 },
});
