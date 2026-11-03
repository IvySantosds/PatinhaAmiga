import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, font, shadow } from '../theme/theme';

function ChoiceRow({ options, value, onChange }) {
  return (
    <View style={s.options}>
      {options.map(([optionValue, label]) => (
        <Pressable
          key={label}
          accessibilityRole='button'
          accessibilityState={{ selected: value === optionValue }}
          onPress={() => onChange(optionValue)}
          style={[s.option, value === optionValue && s.optionOn]}
        >
          <Text style={[s.optionText, value === optionValue && s.optionTextOn]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Reúne as informações do adotante e registra o pedido para análise da ONG.
export default function AdoptionScreen({ route, navigation }) {
  const pet = route.params?.pet;
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [phone, setPhone] = useState('');
  const [housing, setHousing] = useState('Casa');
  const [hadPet, setHadPet] = useState(null);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  // Confere os dados essenciais e grava o pedido vinculado ao usuário e ao animal.
  async function submitRequest() {
    const cleanName = name.trim();
    const digits = phone.replace(/\D/g, '');

    if (!pet?.id) {
      Alert.alert('Animal não encontrado', 'Volte à lista e escolha o animal novamente.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Entre na sua conta', 'É necessário estar conectado para enviar um pedido.');
      return;
    }
    if (!cleanName) {
      Alert.alert('Falta seu nome', 'Preencha o campo “Seu nome” para continuar.');
      return;
    }
    if (digits.length < 10) {
      Alert.alert('Confira o WhatsApp', 'Informe o número com DDD. Digite pelo menos 10 números.');
      return;
    }
    if (hadPet === null) {
      Alert.alert('Responda uma pergunta', 'Selecione “Sim” ou “Não” em “Já teve animais?” para continuar.');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'pedidos'), {
        uid: user.uid,
        animalId: pet.id,
        animalNome: pet.nome || 'Animal',
        animalFoto: pet.foto || '',
        ongId: pet.ongId || null,
        nome: cleanName,
        telefone: phone.trim(),
        moradia: housing,
        teveBicho: hadPet,
        motivo: reason.trim(),
        status: 'pendente',
        criadoEm: serverTimestamp(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.replace('Success', { pet });
    } catch (error) {
      console.warn('Não foi possível enviar o pedido de adoção.', error);
      const detail = error?.code === 'permission-denied'
        ? 'O Firestore recusou o pedido. Confira a regra de criação em pedidos e tente novamente.'
        : 'Verifique sua conexão e tente novamente.';
      Alert.alert('Pedido não enviado', detail);
    } finally {
      setSending(false);
    }
  }

  if (!pet) {
    return (
      <SafeAreaView style={s.page}>
        <Text style={s.title}>Animal não encontrado</Text>
        <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
          <Text style={s.backText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <View style={s.header}>
        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityLabel='Voltar'>
          <Ionicons name='chevron-back' size={24} color={colors.ink} />
        </Pressable>
        <Text numberOfLines={1} style={s.title}>Quero adotar {pet.nome || 'este animal'}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps='handled'>
        <Text style={s.intro}>Conte um pouco sobre você para a ONG analisar seu pedido.</Text>

        <Text style={s.label}>Seu nome *</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} autoCapitalize='words' placeholder='Nome completo' returnKeyType='next' />

        <Text style={s.label}>WhatsApp com DDD *</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType='phone-pad' placeholder='(11) 90000-0000' />

        <Text style={s.label}>Onde você mora?</Text>
        <ChoiceRow options={[[ 'Casa', 'Casa' ], [ 'Apartamento', 'Apartamento' ]]} value={housing} onChange={setHousing} />

        <Text style={[s.label, s.spaced]}>Já teve animais? *</Text>
        <ChoiceRow options={[[true, 'Sim'], [false, 'Não']]} value={hadPet} onChange={setHadPet} />

        <Text style={[s.label, s.spaced]}>Por que quer adotar?</Text>
        <TextInput
          style={[s.input, s.reason]}
          value={reason}
          onChangeText={setReason}
          multiline
          textAlignVertical='top'
          placeholder='Conte um pouco, se quiser.'
        />

        <Pressable style={s.submit} onPress={submitRequest} disabled={sending}>
          {sending ? <ActivityIndicator color='#fff' /> : <Text style={s.submitText}>Enviar pedido</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: font.bold, fontSize: 23, color: colors.ink },
  content: { padding: 20, paddingBottom: 48 },
  intro: { fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.soft, marginBottom: 20 },
  label: { fontFamily: font.medium, color: colors.soft, marginBottom: 6 },
  spaced: { marginTop: 18 },
  input: { backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pinkSoft, borderRadius: 18, padding: 12, fontFamily: font.regular, fontSize: 16, color: colors.ink, marginBottom: 16 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, height: 48, borderRadius: 24, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  optionOn: { backgroundColor: colors.pink, borderColor: colors.pink },
  optionText: { fontFamily: font.medium, color: colors.ink },
  optionTextOn: { color: '#fff' },
  reason: { minHeight: 100, marginBottom: 8 },
  submit: { height: 56, borderRadius: 28, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginTop: 20, ...shadow },
  submitText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  backButton: { alignSelf: 'center', marginTop: 20, paddingHorizontal: 28, paddingVertical: 14, backgroundColor: colors.pink, borderRadius: 28 },
  backText: { fontFamily: font.bold, color: '#fff' },
});
