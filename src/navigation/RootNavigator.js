import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminRequestScreen from '../screens/AdminRequestScreen';
import AdoptionScreen from '../screens/AdoptionScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SuccessScreen from '../screens/SuccessScreen';
import { colors } from '../theme/theme';
import AdminTabs from './AdminTabs';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.pink} />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {!user ? (
        <Stack.Screen name='Login' component={LoginScreen} />
      ) : isAdmin ? (
        <>
          <Stack.Screen name='AdminTabs' component={AdminTabs} />
          <Stack.Screen name='AdminRequest' component={AdminRequestScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name='Tabs' component={MainTabs} />
          <Stack.Screen name='Detail' component={DetailScreen} />
          <Stack.Screen name='Adoption' component={AdoptionScreen} />
          <Stack.Screen name='Success' component={SuccessScreen} options={{ gestureEnabled: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}