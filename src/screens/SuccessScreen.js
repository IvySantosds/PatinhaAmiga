import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, font } from '../theme/theme';

// Confirma o envio e devolve a pessoa à lista de animais.
export default function SuccessScreen({ route, navigation }) {
  const pet = route.params?.pet;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.circle}>
        <Ionicons name='checkmark' size={72} color='#2E7D5B' />
      </View>
      <Text style={s.title}>Pedido enviado!</Text>
      <Text style={s.message}>
        Seu pedido para adotar {pet?.nome || 'este animal'} foi encaminhado para análise. A ONG poderá entrar em contato pelo WhatsApp informado.
      </Text>
      <View style={s.bottom}>
        <Pressable style={s.button} onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>
          <Text style={s.buttonText}>Voltar ao início</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 100, backgroundColor: colors.bg },
  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.bold, fontSize: 30, color: colors.ink, marginTop: 28 },
  message: { fontFamily: font.regular, fontSize: 16, lineHeight: 23, color: colors.soft, textAlign: 'center', marginTop: 10 },
  bottom: { position: 'absolute', left: 24, right: 24, bottom: 32 },
  button: { height: 56, borderRadius: 28, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
});
