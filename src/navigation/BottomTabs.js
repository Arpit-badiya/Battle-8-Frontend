import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import ContestDetailsScreen from '../screens/home/ContestDetailsScreen';
import HomeScreen from '../screens/home/HomeScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import AdminNavigator from './AdminNavigator';
import useAuth from '../hooks/useAuth';

const Tab = createBottomTabNavigator();

const iconMap = {
  Home: 'home',
  MyContests: 'trophy',
  Leaderboard: 'people',
  Wallet: 'wallet',
  Profile: 'person',
  Admin: 'settings',
};

const labelMap = {
  Home: 'Home',
  MyContests: 'Contests',
  Leaderboard: 'Leaderboard',
  Wallet: 'Wallet',
  Profile: 'Profile',
  Admin: 'Admin',
};

const TabIcon = ({ route, focused, color }) => (
  <View style={styles.iconWrap}>
    {focused && <View style={styles.activeGlow} />}
    <Ionicons name={iconMap[route.name]} size={24} color={color} />
    <Text style={[styles.label, focused && styles.activeLabel]}>{labelMap[route.name]}</Text>
  </View>
);

const BottomTabs = () => {
  const { user } = useAuth();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarIcon: ({ focused, color }) => <TabIcon route={route} focused={focused} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyContests" component={ContestDetailsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminNavigator} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 86 : 72,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 20 : spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    elevation: 16,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    gap: 3,
  },
  activeGlow: {
    position: 'absolute',
    top: -6,
    width: 28,
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.tabInactive,
    fontSize: 10,
    fontWeight: '700',
  },
  activeLabel: {
    color: colors.primary,
  },
});

export default BottomTabs;
