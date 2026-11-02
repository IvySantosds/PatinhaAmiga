import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminRequestScreen from '../screens/AdminRequestScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import PendingScreen from '../screens/PendingScreen';
import AdminTabs from './AdminTabs';
import { colors } from '../theme/theme';
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
          <Stack.Screen name='Adoption' component={PendingScreen} />
          <Stack.Screen name='Success' component={PendingScreen} options={{ gestureEnabled: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
