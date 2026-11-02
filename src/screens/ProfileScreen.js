import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, font, shadow } from '../theme/theme';

// Mostra a conta ativa e oferece uma saída segura da sessão.
export default function ProfileScreen() {
  const { user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
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

  return (
    <SafeAreaView style={s.page}>
      <View style={s.avatar}><Text style={s.avatarText}>🐾</Text></View>
      <Text style={s.title}>Olá, {name}!</Text>
      <Text style={s.email}>{user?.email || ''}</Text>

      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Sair da conta'
        onPress={confirmLogout}
        disabled={loggingOut}
        style={({ pressed }) => [s.button, pressed && s.buttonPressed]}
      >
        {loggingOut
          ? <ActivityIndicator color={colors.pink} />
          : <Text style={s.buttonText}>Sair da conta</Text>}
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  avatar: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.butter, borderWidth: 5, borderColor: '#fff', ...shadow },
  avatarText: { fontSize: 48 },
  title: { fontFamily: font.bold, fontSize: 28, color: colors.ink, marginTop: 20 },
  email: { fontFamily: font.regular, fontSize: 15, color: colors.soft, marginTop: 4 },
  button: { minWidth: 180, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 32, paddingHorizontal: 24, borderRadius: 27, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pinkSoft },
  buttonPressed: { opacity: 0.8 },
  buttonText: { fontFamily: font.bold, fontSize: 17, color: colors.pink },
});
