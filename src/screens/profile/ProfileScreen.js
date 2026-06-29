import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../components/common/Button';
import GameAvatar from '../../components/common/GameAvatar';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import NamePromptModal from '../../components/profile/NamePromptModal';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAuth from '../../hooks/useAuth';
import { applyReferralCode } from '../../services/profileService';
import { showError, showSuccess } from '../../utils/feedback';

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, label, right, onPress }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconWrap}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
    {!!right && <Text style={styles.reward}>{right}</Text>}
    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
  </Pressable>
);

const ProfileScreen = ({ navigation }) => {
  const { logout, profileLoading, refreshProfile, updateProfile, user } = useAuth();
  const [stats, setStats] = useState({
    totalContestsJoined: 0,
    totalTeamsCreated: 0,
    wins: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [referral, setReferral] = useState(null);
  const [referralInput, setReferralInput] = useState('');
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
            setReferral(response.referral || null);
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

  const copyReferral = async () => {
    if (!referral?.referralCode) return;
    await Clipboard.setStringAsync(referral.referralCode);
    showSuccess('Referral code copied');
  };

  const shareReferral = async () => {
    if (!referral?.referralCode) return;
    await Share.share({
      message: `Join Battle-8 with my referral code ${referral.referralCode} and win coins.`,
    });
  };

  const applyReferral = async () => {
    try {
      const response = await applyReferralCode({ code: referralInput });
      setReferral(response.referral || referral);
      setReferralInput('');
      showSuccess('Referral applied');
    } catch (error) {
      showError('Referral failed', error);
    }
  };

  const openStackScreen = (screen) => {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate(screen);
      return;
    }
    navigation.navigate(screen);
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHero}>
            <GameAvatar name={displayName} size={96} />
            <Text numberOfLines={1} style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email || 'Player'}</Text>
          </View>

          <GlassCard style={styles.stats}>
            <Stat label="Contests" value={stats.totalContestsJoined || 0} />
            <Stat label="Teams" value={stats.totalTeamsCreated || 0} />
            <Stat label="Wins" value={stats.wins || 0} />
          </GlassCard>

          <GlassCard style={styles.referralCard} glow>
            <View style={styles.referralTop}>
              <View>
                <Text style={styles.referralTitle}>Refer & Earn</Text>
                <Text style={styles.referralSub}>Friend joins first paid contest, both wallets get rewards.</Text>
              </View>
              <Ionicons name="gift" size={24} color={colors.primary} />
            </View>
            <View style={styles.referralCodeBox}>
              <Text style={styles.referralCode}>{referral?.referralCode || user?.referralCode || 'LOADING'}</Text>
              <View style={styles.referralActions}>
                <Pressable onPress={copyReferral} style={styles.smallAction}>
                  <Ionicons name="copy-outline" size={18} color={colors.text} />
                </Pressable>
                <Pressable onPress={shareReferral} style={styles.smallAction}>
                  <Ionicons name="share-social-outline" size={18} color={colors.text} />
                </Pressable>
              </View>
            </View>
            <View style={styles.referralStats}>
              <Stat label="Referrals" value={referral?.totalReferrals || 0} />
              <Stat label="Rewarded" value={referral?.rewardedReferrals || 0} />
              <Stat label="Earned" value={referral?.referralEarnings || 0} />
            </View>
            <View style={styles.applyRow}>
              <TextInput
                value={referralInput}
                onChangeText={setReferralInput}
                placeholder="Have a referral code?"
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                style={styles.referralInput}
              />
              <Pressable onPress={applyReferral} style={styles.applyButton}>
                <Text style={styles.applyText}>APPLY</Text>
              </Pressable>
            </View>
          </GlassCard>

          <GlassCard style={styles.menu}>
            <MenuItem icon="person-outline" label="Edit Profile" onPress={() => setEditing(true)} />
            <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => openStackScreen('HelpSupport')} />
            <MenuItem icon="reader-outline" label="Terms & Conditions" onPress={() => openStackScreen('Terms')} />
          </GlassCard>

          <Button title="Logout" variant="purple" onPress={logout} style={styles.logout} />
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 112,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    ...typography.h2,
  },
  profileHero: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  name: {
    maxWidth: '90%',
    color: colors.text,
    ...typography.h2,
    marginTop: spacing.md,
  },
  email: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  referralCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  referralTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  referralTitle: {
    color: colors.text,
    ...typography.title,
  },
  referralSub: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 3,
    maxWidth: 260,
  },
  referralCodeBox: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  referralCode: {
    flex: 1,
    color: colors.primary,
    ...typography.h3,
  },
  referralActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  smallAction: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  referralStats: {
    flexDirection: 'row',
  },
  applyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  referralInput: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  applyButton: {
    minWidth: 78,
    minHeight: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  applyText: {
    color: colors.textInverse,
    ...typography.micro,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    ...typography.h2,
  },
  statLabel: {
    color: colors.textMuted,
    ...typography.micro,
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
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  menuText: {
    flex: 1,
    color: colors.text,
    ...typography.body,
  },
  reward: {
    color: colors.primary,
    ...typography.micro,
  },
  logout: {
    marginTop: spacing.xxl,
  },
});

export default ProfileScreen;
