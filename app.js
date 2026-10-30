import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, useFonts } from '@expo-google-fonts/fredoka';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';

export default function App() {
  const [ok] = useFonts({ Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold });
  if (!ok) return <ActivityIndicator style={{ flex: 1 }} color={colors.pink} />;
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}