import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// Mantém os favoritos do usuário sincronizados com a subcoleção do Firestore.
export default function useFavorites() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState({ uid: null, favs: [], loading: true });
  const favs = useMemo(() => (user?.uid === snapshot.uid ? snapshot.favs : []), [snapshot.favs, snapshot.uid, user?.uid]);
  const loading = Boolean(user) && (user.uid !== snapshot.uid || snapshot.loading);

  useEffect(() => {
    if (!user) return undefined;

    return onSnapshot(
      collection(db, 'usuarios', user.uid, 'favoritos'),
      (snapshot) => {
        setSnapshot({
          uid: user.uid,
          favs: snapshot.docs.map((favorite) => ({ id: favorite.id, ...favorite.data() })),
          loading: false,
        });
      },
      (error) => {
        console.warn('Não foi possível carregar os favoritos.', error);
        setSnapshot({ uid: user.uid, favs: [], loading: false });
      },
    );
  }, [user]);

  // Informa se o animal já está salvo na lista.
  const isFav = useCallback((id) => favs.some((favorite) => favorite.id === id), [favs]);

  // Salva ou remove o animal e dá retorno tátil quando a operação funciona.
  const toggle = useCallback(async (pet) => {
    if (!user || !pet?.id) return false;

    const favoriteRef = doc(db, 'usuarios', user.uid, 'favoritos', pet.id);
    try {
      if (favs.some((favorite) => favorite.id === pet.id)) {
        await deleteDoc(favoriteRef);
      } else {
        const { id, ...data } = pet;
        await setDoc(favoriteRef, data);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      return true;
    } catch (error) {
      console.warn('Não foi possível atualizar os favoritos.', error);
      return false;
    }
  }, [favs, user]);

  return { favs, loading, isFav, toggle };
}
