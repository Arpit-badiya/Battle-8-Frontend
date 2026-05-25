import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../constants/colors';
import Loader from '../components/common/Loader';
import NamePromptModal from '../components/profile/NamePromptModal';
import useAuth from '../hooks/useAuth';
import { showError, showSuccess } from '../utils/feedback';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import TeamBuilderScreen from '../screens/team/TeamBuilderScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

const AppNavigator = () => {
  const { booting, isAuthenticated, needsName, profileLoading, updateProfile, user } = useAuth();

  if (booting) {
    return <Loader label="Syncing profile" fullScreen />;
  }

  const handleSaveName = async (name) => {
    try {
      await updateProfile({ name });
      showSuccess('Profile name saved');
    } catch (error) {
      showError('Name update failed', error);
    }
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="TeamBuilder" component={TeamBuilderScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
      <NamePromptModal
        visible={isAuthenticated && needsName}
        loading={profileLoading}
        initialName={user?.name || ''}
        onSubmit={handleSaveName}
      />
    </NavigationContainer>
  );
};

export default AppNavigator;
