import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminModuleScreen from '../screens/admin/AdminModuleScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import MatchManagementScreen from '../screens/admin/MatchManagementScreen';
import ScraperManagementScreen from '../screens/admin/ScraperManagementScreen';
import TournamentManagementScreen from '../screens/admin/TournamentManagementScreen';

const Stack = createNativeStackNavigator();

const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="TournamentManagement" component={TournamentManagementScreen} />
    <Stack.Screen name="MatchManagement" component={MatchManagementScreen} />
    <Stack.Screen name="ScraperManagement" component={ScraperManagementScreen} />
    <Stack.Screen name="ContestManagement" component={AdminModuleScreen} />
    <Stack.Screen name="PlayerManagement" component={AdminModuleScreen} />
    <Stack.Screen name="TeamManagement" component={AdminModuleScreen} />
    <Stack.Screen name="ResultManagement" component={AdminModuleScreen} />
    <Stack.Screen name="WalletManagement" component={AdminModuleScreen} />
    <Stack.Screen name="UsersManagement" component={AdminModuleScreen} />
    <Stack.Screen name="AdminSettings" component={AdminModuleScreen} />
    <Stack.Screen name="AdminOperations" component={AdminScreen} />
  </Stack.Navigator>
);

export default AdminNavigator;
