import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, font, shadow } from '../theme/theme';

function Row({ label, value }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value || 'Não informado'}</Text>
    </View>
  );
}

// Exibe os dados enviados e permite ao admin decidir o pedido.
export default function AdminRequestScreen({ route, navigation }) {
  const pedido = route.params?.pedido;
  const [saving, setSaving] = useState(false);

  // Salva a decisão; quando aprova, também tira o animal da lista disponível.
  function decide(status) {
    if (!pedido?.id || !pedido?.animalId || saving) return;
    const approve = status === 'aprovado';

    Alert.alert(
      approve ? 'Aprovar pedido' : 'Recusar pedido',
      approve ? `${pedido.animalNome || 'O animal'} será marcado como adotado.` : 'O adotante verá o pedido como recusado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSaving(true);
            try {
              const batch = writeBatch(db);
              batch.update(doc(db, 'pedidos', pedido.id), { status, avaliadoEm: serverTimestamp() });
              if (approve) batch.update(doc(db, 'animais', pedido.animalId), { disponivel: false });
              await batch.commit();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              navigation.goBack();
            } catch (error) {
              console.warn('Não foi possível atualizar o pedido.', error);
              setSaving(false);
              Alert.alert('Não foi possível salvar', 'Verifique as regras do Firestore e tente novamente.');
            }
          },
        },
      ],
    );
  }

  if (!pedido) {
    return (
      <SafeAreaView style={s.page}>
        <Text style={s.title}>Pedido não encontrado</Text>
        <Pressable onPress={() => navigation.goBack()} style={s.secondaryButton}><Text style={s.secondaryText}>Voltar</Text></Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityLabel='Voltar'>
          <Ionicons name='chevron-back' size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.title}>Analisar pedido</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          {pedido.animalFoto
            ? <Image source={{ uri: pedido.animalFoto }} style={s.photo} />
            : <View style={[s.photo, s.photoFallback]}><Text>🐾</Text></View>}
          <View style={{ flex: 1 }}>
            <Text style={s.animal}>{pedido.animalNome || 'Animal'}</Text>
            <Text style={s.muted}>Status: {pedido.status || 'pendente'}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Dados do adotante</Text>
        <View style={[s.card, s.fields]}>
          <Row label='Nome' value={pedido.nome} />
          <Row label='WhatsApp' value={pedido.telefone} />
          <Row label='Moradia' value={pedido.moradia} />
          <Row label='Já teve animais?' value={typeof pedido.teveBicho === 'boolean' ? (pedido.teveBicho ? 'Sim' : 'Não') : 'Não informado'} />
        </View>

        <Text style={s.sectionTitle}>Motivo da adoção</Text>
        <Text style={[s.card, s.motivation]}>{pedido.motivo || 'Não informado.'}</Text>
      </ScrollView>

      {pedido.status === 'pendente' && (
        <View style={s.actions}>
          {saving ? <ActivityIndicator color={colors.pink} style={{ flex: 1 }} /> : (
            <>
              <Pressable style={[s.actionButton, s.reject]} onPress={() => decide('recusado')}>
                <Text style={[s.actionText, { color: colors.pink }]}>Recusar</Text>
              </Pressable>
              <Pressable style={[s.actionButton, s.approve]} onPress={() => decide('aprovado')}>
                <Text style={[s.actionText, { color: '#fff' }]}>Aprovar</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.bold, fontSize: 24, color: colors.ink },
  content: { padding: 20, paddingBottom: 140 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 24, padding: 12, ...shadow },
  photo: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.lav, alignItems: 'center', justifyContent: 'center' },
  photoFallback: { flexDirection: 'row' },
  animal: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  muted: { fontFamily: font.regular, fontSize: 14, color: colors.soft, marginTop: 2 },
  sectionTitle: { fontFamily: font.bold, fontSize: 17, color: colors.ink, marginTop: 22, marginBottom: 8 },
  fields: { flexDirection: 'column', alignItems: 'stretch', paddingHorizontal: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFE3EA' },
  rowLabel: { flex: 1, fontFamily: font.regular, fontSize: 14, color: colors.soft },
  rowValue: { flex: 1, fontFamily: font.medium, fontSize: 15, color: colors.ink, textAlign: 'right' },
  motivation: { padding: 16, fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.soft },
  actions: { position: 'absolute', left: 20, right: 20, bottom: 28, flexDirection: 'row', gap: 10, height: 56 },
  actionButton: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  reject: { backgroundColor: '#fff', borderWidth: 2, borderColor: colors.pink },
  approve: { backgroundColor: '#2E7D5B' },
  actionText: { fontFamily: font.bold, fontSize: 18 },
  secondaryButton: { margin: 24, alignSelf: 'center', padding: 14, backgroundColor: colors.pink, borderRadius: 24 },
  secondaryText: { color: '#fff', fontFamily: font.bold },
});
