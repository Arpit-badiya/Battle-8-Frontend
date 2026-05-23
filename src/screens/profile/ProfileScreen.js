import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import GameAvatar from '../../components/common/GameAvatar';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import NamePromptModal from '../../components/profile/NamePromptModal';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import useAuth from '../../hooks/useAuth';
import { showError, showSuccess } from '../../utils/feedback';

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileScreen = () => {
  const { logout, profileLoading, refreshProfile, updateProfile, user } = useAuth();
  const [stats, setStats] = useState({
    totalContestsJoined: 0,
    totalTeamsCreated: 0,
    wins: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const displayName = user?.name || 'Player';

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        try {
          const response = await refreshProfile();
          if (active && response?.stats) {
            setStats(response.stats);
          }
        } catch (error) {
          if (active) {
            showError('Profile load failed', error);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [refreshProfile])
  );

  const handleUpdateName = async (name) => {
    try {
      const response = await updateProfile({ name });
      if (response?.stats) {
        setStats(response.stats);
      }
      setEditing(false);
      showSuccess('Profile updated');
    } catch (error) {
      showError('Profile update failed', error);
    }
  };

  return (
    <Screen contentStyle={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Ionicons name="settings-outline" size={24} color={colors.text} />
      </View>

      {loading && !user ? (
        <Loader />
      ) : (
        <>
          <View style={styles.profileHero}>
            <GameAvatar name={displayName} size={104} />
            <Text numberOfLines={1} style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email || 'Player'}</Text>
          </View>

          <GlassCard style={styles.stats}>
            <Stat label="Contests" value={stats.totalContestsJoined || 0} />
            <Stat label="Teams" value={stats.totalTeamsCreated || 0} />
            <Stat label="Wins" value={stats.wins || 0} />
          </GlassCard>

          <GlassCard style={styles.menu}>
            <Pressable style={styles.menuItem} onPress={() => setEditing(true)}>
              <Ionicons name="person-outline" size={20} color={colors.text} />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            {[
              ['megaphone-outline', 'Refer & Earn', 'Earn 20 Coins'],
              ['help-circle-outline', 'Help & Support', ''],
              ['reader-outline', 'Terms & Conditions', ''],
            ].map(([icon, label, right]) => (
              <View key={label} style={styles.menuItem}>
                <Ionicons name={icon} size={20} color={colors.text} />
                <Text style={styles.menuText}>{label}</Text>
                {!!right && <Text style={styles.reward}>{right}</Text>}
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            ))}
          </GlassCard>

          <Button title="Logout" variant="purple" onPress={logout} style={styles.logout} />
        </>
      )}

      <NamePromptModal
        visible={editing}
        initialName={user?.name || ''}
        loading={profileLoading}
        title="Edit Display Name"
        subtitle="Use the name you want other players to see."
        onSubmit={handleUpdateName}
        onCancel={() => setEditing(false)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  safe: {
    paddingHorizontal: spacing.screen,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  profileHero: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  name: {
    maxWidth: '90%',
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  email: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  menu: {
    marginTop: spacing.xl,
  },
  menuItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  menuText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  reward: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  logout: {
    marginTop: spacing.xxl,
  },
});

export default ProfileScreen;
