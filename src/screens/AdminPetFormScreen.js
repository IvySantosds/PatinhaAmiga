import * as Haptics from 'expo-haptics';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, font, shadow } from '../theme/theme';

const EMPTY_FORM = { foto: '', nome: '', raca: '', idade: '', descricao: '' };

// Mostra opções em botões para não depender de listas nativas diferentes por plataforma.
function Options({ values, selected, onSelect }) {
  return (
    <View style={s.options}>
      {values.map((value) => (
        <Pressable key={value} onPress={() => onSelect(value)} style={[s.option, selected === value && s.optionOn]}>
          <Text style={[s.optionText, selected === value && s.optionTextOn]}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Alterna um dado de saúde do animal, como vacinação ou castração.
function Toggle({ label, value, onChange }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={[s.option, value && s.optionOn]}>
      <Text style={[s.optionText, value && s.optionTextOn]}>{value ? '✓ ' : ''}{label}</Text>
    </Pressable>
  );
}

// Coleta os dados básicos e relaciona o animal à ONG deste admin.
export default function AdminPetFormScreen() {
  const { admin } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [especie, setEspecie] = useState('Cão');
  const [sexo, setSexo] = useState('Fêmea');
  const [porte, setPorte] = useState('Médio');
  const [vacinado, setVacinado] = useState(false);
  const [castrado, setCastrado] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  // Valida os campos e publica o animal no Firestore.
  async function createPet() {
    const nome = form.nome.trim();
    const idade = form.idade.trim();
    const foto = form.foto.trim();
    if (!nome || !idade || !/^https?:\/\//i.test(foto)) {
      Alert.alert('Revise os dados', 'Informe nome, idade e um endereço de foto que comece com http ou https.');
      return;
    }
    if (!admin?.ongId || !admin?.ongNome) {
      Alert.alert('Dados da ONG ausentes', 'Preencha ongId e ongNome no documento deste admin no Firestore.');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'animais'), {
        foto,
        nome,
        raca: form.raca.trim(),
        idade,
        descricao: form.descricao.trim(),
        especie,
        sexo,
        porte,
        vacinado,
        castrado,
        filhote: idade.toLowerCase().includes('mes'),
        cidade: admin.cidade || '',
        ongId: admin.ongId,
        ongNome: admin.ongNome,
        disponivel: true,
        criadoEm: serverTimestamp(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      Alert.alert('Animal cadastrado', `${nome} foi salvo e já está disponível na Home.`);
      setForm(EMPTY_FORM);
      setVacinado(false);
      setCastrado(false);
    } catch (error) {
      console.warn('Não foi possível cadastrar o animal.', error);
      const code = error?.code || 'erro-desconhecido';
      const message = code === 'permission-denied'
        ? 'O Firestore negou a gravação. Confirme que o documento admins/{uid} usa o UID desta conta e que as regras permitem escrita em animais.'
        : 'Confira sua conexão e tente novamente.';
      Alert.alert('Não foi possível cadastrar', `${message}\n\nCódigo: ${code}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps='handled'>
        <View style={s.header}>
          <Text style={s.title}>Novo animal</Text>
          <View style={s.badge}><Text style={s.badgeText}>Admin</Text></View>
        </View>

        <Text style={s.label}>Link da foto</Text>
        <TextInput style={s.input} value={form.foto} onChangeText={update('foto')} autoCapitalize='none' keyboardType='url' placeholder='https://...' />

        <View style={s.twoColumns}>
          <View style={s.column}>
            <Text style={s.label}>Nome</Text>
            <TextInput style={s.input} value={form.nome} onChangeText={update('nome')} placeholder='Nome do animal' />
          </View>
          <View style={s.column}>
            <Text style={s.label}>Idade</Text>
            <TextInput style={s.input} value={form.idade} onChangeText={update('idade')} placeholder='2 anos' />
          </View>
        </View>

        <Text style={s.label}>Raça</Text>
        <TextInput style={s.input} value={form.raca} onChangeText={update('raca')} placeholder='SRD, Poodle...' />

        <Text style={s.label}>Espécie</Text>
        <Options values={['Cão', 'Gato']} selected={especie} onSelect={setEspecie} />
        <Text style={[s.label, s.spaced]}>Sexo</Text>
        <Options values={['Fêmea', 'Macho']} selected={sexo} onSelect={setSexo} />
        <Text style={[s.label, s.spaced]}>Porte</Text>
        <Options values={['Pequeno', 'Médio', 'Grande']} selected={porte} onSelect={setPorte} />
        <Text style={[s.label, s.spaced]}>Saúde</Text>
        <View style={s.options}>
          <Toggle label='Vacinado' value={vacinado} onChange={setVacinado} />
          <Toggle label='Castrado' value={castrado} onChange={setCastrado} />
        </View>

        <Text style={[s.label, s.spaced]}>Descrição</Text>
        <TextInput style={[s.input, s.description]} value={form.descricao} onChangeText={update('descricao')} multiline placeholder='Como é a personalidade?' />

        <Pressable style={s.submit} onPress={createPet} disabled={saving}>
          {saving ? <ActivityIndicator color='#fff' /> : <Text style={s.submitText}>Cadastrar animal</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontFamily: font.bold, fontSize: 26, color: colors.ink },
  badge: { backgroundColor: colors.lav, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: font.bold, fontSize: 13, color: '#4B3B8F' },
  label: { fontFamily: font.medium, color: colors.soft, marginBottom: 6 },
  spaced: { marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pinkSoft, borderRadius: 18, padding: 12, fontFamily: font.regular, fontSize: 16, color: colors.ink, marginBottom: 12 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1, minWidth: 0 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: 46, paddingHorizontal: 8, borderRadius: 24, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  optionOn: { backgroundColor: colors.pink, borderColor: colors.pink },
  optionText: { fontFamily: font.medium, color: colors.ink, textAlign: 'center' },
  optionTextOn: { color: '#fff' },
  description: { height: 92, textAlignVertical: 'top' },
  submit: { height: 56, borderRadius: 28, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginTop: 20, ...shadow },
  submitText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
});
