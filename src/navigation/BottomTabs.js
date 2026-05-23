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
import AdminScreen from '../screens/admin/AdminScreen';
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
  MyContests: 'My Contests',
  Leaderboard: 'Leaderboard',
  Wallet: 'Wallet',
  Profile: 'Profile',
  Admin: 'Admin',
};

const TabIcon = ({ route, focused, color }) => (
  <View style={styles.iconWrap}>
    {focused && <View style={styles.activeGlow} />}
    <Ionicons name={iconMap[route.name]} size={26} color={color} />
    <Text style={[styles.label, focused && styles.activeLabel]}>{labelMap[route.name]}</Text>
  </View>
);

const BottomTabs = () => {
  const { user } = useAuth();

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
    {user?.role === 'admin' && <Tab.Screen name="Admin" component={AdminScreen} />}
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 86 : 76,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 18 : spacing.sm,
    backgroundColor: 'rgba(3, 7, 9, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(85,255,23,0.18)',
    elevation: 18,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    gap: 2,
  },
  activeGlow: {
    position: 'absolute',
    top: -4,
    width: 34,
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  label: {
    color: colors.tabInactive,
    fontSize: 11,
    fontWeight: '700',
  },
  activeLabel: {
    color: colors.primary,
  },
});

export default BottomTabs;
