import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDQYYuwn0TuRTw8r1UiJxoYtHNydPke6vw",
  authDomain: "patinhaamigadb.firebaseapp.com",
  projectId: "patinhaamigadb",
  storageBucket: "patinhaamigadb.firebasestorage.app",
  messagingSenderId: "412550094530",
  appId: "1:412550094530:web:bf85b6ed36c70dd585655b",
  measurementId: "G-P7GSRD1VVZ"
};

// Aqui ficam as conexões usadas pelo restante do app: login e Firestore.
const app = initializeApp(firebaseConfig);
// Mantém a sessão salva no aparelho, mesmo depois de fechar o app.
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
