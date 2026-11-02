import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { signOut } from 'firebase/auth';
import AdminPetFormScreen from '../screens/AdminPetFormScreen';
import AdminRequestsScreen from '../screens/AdminRequestsScreen';
import { auth } from '../config/firebase';
import { colors, font, shadow } from '../theme/theme';

const Tab = createBottomTabNavigator();
const icons = { Requests: 'list', NewPet: 'add-circle', Logout: 'log-out' };
const labels = { Requests: 'Pedidos', NewPet: 'Novo animal', Logout: 'Sair' };

function LogoutTab() {
  return <View />;
}

// Reúne a fila de pedidos, o cadastro de animais e a saída da conta admin.
export default function AdminTabs() {
  const [signingOut, setSigningOut] = useState(false);

  // Confirma antes de encerrar a sessão administrativa.
  function askToSignOut() {
    if (signingOut) return;
    Alert.alert('Sair da conta', 'Quer encerrar a sessão de administrador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut(auth);
          } catch (error) {
            console.warn('Não foi possível encerrar a sessão.', error);
            setSigningOut(false);
            Alert.alert('Não foi possível sair', 'Tente novamente.');
          }
        },
      },
    ]);
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.soft,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11 },
        tabBarStyle: {
          position: 'absolute', left: 16, right: 16, bottom: 16, height: 68,
          borderRadius: 34, backgroundColor: '#fff', borderTopWidth: 0,
          paddingTop: 8, paddingBottom: 8, ...shadow,
        },
      })}
    >
      <Tab.Screen name='Requests' component={AdminRequestsScreen} />
      <Tab.Screen name='NewPet' component={AdminPetFormScreen} />
      <Tab.Screen
        name='Logout'
        component={LogoutTab}
        listeners={{ tabPress: (event) => { event.preventDefault(); askToSignOut(); } }}
      />
    </Tab.Navigator>
  );
}
