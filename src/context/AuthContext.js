import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

const Ctx = createContext({ user: null, admin: null, isAdmin: false, loading: true });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    let dados = null;
    if (u) {
      try {
        const snap = await getDoc(doc(db, 'admins', u.uid));
        dados = snap.exists() ? snap.data() : null;
      } catch (e) { dados = null; }
    }
    setAdmin(dados);
    setUser(u);
    setLoading(false);
  }), []);

  return <Ctx.Provider value={{ user, admin, isAdmin: !!admin, loading }}>{children}</Ctx.Provider>;
}