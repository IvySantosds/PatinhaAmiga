import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

const Ctx = createContext({ user: null, admin: null, isAdmin: false, loading: true });
// Permite que qualquer tela consulte quem está conectado.
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // O Firebase avisa quando alguém entra ou sai. O documento em admins indica se é admin.
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    let dados = null;
    if (u) {
      try {
        // O UID da conta aponta para o documento que libera o painel de admin.
        const snap = await getDoc(doc(db, 'admins', u.uid));
        dados = snap.exists() ? snap.data() : null;
      } catch { dados = null; }
    }
    setAdmin(dados);
    setUser(u);
    setLoading(false);
  }), []);

  return <Ctx.Provider value={{ user, admin, isAdmin: !!admin, loading }}>{children}</Ctx.Provider>;
}
