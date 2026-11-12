import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MapScreen from '../screens/MapScreen';
import { colors, font, shadow } from '../theme/theme';

const Tab = createBottomTabNavigator();
const icons = { Home: 'home', Favorites: 'heart', Map: 'location', Profile: 'person' };
const labels = { Home: 'Início', Favorites: 'Favoritos', Map: 'Mapa', Profile: 'Perfil' };

// Abas que a pessoa usuária acessa durante a busca e o processo de adoção.
export default function MainTabs() {
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
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='Favorites' component={FavoritesScreen} />
      <Tab.Screen name='Map' component={MapScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
}
