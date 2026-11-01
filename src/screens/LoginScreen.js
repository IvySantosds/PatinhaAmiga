import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { colors, font, shadow } from '../theme/theme';

const ERROS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Esse e-mail já tem conta.',
  'auth/weak-password': 'A senha precisa ter 6 ou mais caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/network-request-failed': 'Sem conexão. Verifique a internet e tente novamente.',
  'permission-denied': 'O Firestore recusou a gravação. Confira as regras da coleção usuarios.',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cadastro, setCadastro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function enviar() {
    setErro('');
    setLoading(true);
    try {
      const emailNormalizado = email.trim().toLowerCase();
      const credential = cadastro
        ? await createUserWithEmailAndPassword(auth, emailNormalizado, senha)
        : await signInWithEmailAndPassword(auth, emailNormalizado, senha);

      const user = credential.user;
      const profileRef = doc(db, 'usuarios', user.uid);
      const profile = await getDoc(profileRef);

      // Cria também o perfil de quem já existia no Authentication, se estiver faltando.
      if (!profile.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email || emailNormalizado,
          nome: user.displayName || emailNormalizado.split('@')[0],
          criadoEm: serverTimestamp(),
        });
      }
    } catch (e) {
      const mensagem = ERROS[e.code] || 'Algo deu errado. Tente de novo.';
      // Se o Auth aceitou a sessão, mas a gravação no Firestore falhou, volta ao login.
      if (auth.currentUser) {
        try { await signOut(auth); } catch (signOutError) {
          console.warn('Não foi possível encerrar a sessão após falha no perfil.', signOutError);
        }
      }
      setErro(mensagem);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.page}>
      <View style={s.logo}><Text style={{ fontSize: 64 }}>🐶</Text></View>
      <Text style={s.title}>PatinhaAmiga</Text>
      <Text style={s.sub}>Encontre seu novo melhor amigo</Text>

      <Text style={s.label}>E-mail</Text>
      <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' placeholder='voce@email.com' />
      <Text style={s.label}>Senha</Text>
      <TextInput style={s.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder='******' />
      {!!erro && <Text style={s.erro}>{erro}</Text>}

      <Pressable style={s.btn} onPress={enviar} disabled={loading}>
        {loading ? <ActivityIndicator color='#fff' /> : <Text style={s.btnTxt}>{cadastro ? 'Criar conta' : 'Entrar'}</Text>}
      </Pressable>
      <Pressable onPress={() => { setCadastro(!cadastro); setErro(''); }} style={{ padding: 16 }}>
        <Text style={s.link}>{cadastro ? 'Já tenho conta' : 'Ainda não tem conta? Criar conta'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  logo: { alignSelf: 'center', width: 140, height: 140, borderRadius: 70, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#fff', ...shadow },
  title: { fontFamily: font.bold, fontSize: 34, color: colors.pink, textAlign: 'center', marginTop: 16 },
  sub: { fontFamily: font.regular, color: colors.soft, textAlign: 'center', marginBottom: 32 },
  label: { fontFamily: font.medium, color: colors.soft, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pinkSoft, borderRadius: 18, padding: 12, fontFamily: font.regular, fontSize: 16, color: colors.ink, marginBottom: 16 },
  erro: { fontFamily: font.medium, color: '#B3261E', marginBottom: 8 },
  btn: { height: 56, borderRadius: 28, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginTop: 8, ...shadow },
  btnTxt: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  link: { fontFamily: font.medium, color: colors.pink, textAlign: 'center' },
});
