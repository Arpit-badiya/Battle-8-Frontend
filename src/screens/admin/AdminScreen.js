import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../components/common/Button';
import BrandLogo from '../../components/common/BrandLogo';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import useAppData from '../../hooks/useAppData';
import {
  createContest,
  createPlayer,
  getAdminDashboard,
  getAdminLeaderboard,
  importContestPlayers,
  importContestResults,
  processResults,
  updateContestPlayers,
} from '../../services/adminService';
import { getContestPlayers } from '../../services/playerService';
import { showError, showSuccess } from '../../utils/feedback';

const initialContest = {
  title: '',
  players: '',
  entryFee: '',
  platformCommissionPercent: '10',
  startTime: '',
  estimatedEndTime: '',
};

const initialPlayer = {
  name: '',
  team: '',
  credits: '',
  role: 'Assaulter',
};

const placementPoints = {
  1: 20,
  2: 14,
  3: 10,
  4: 8,
  5: 6,
  6: 4,
  7: 2,
};

const getId = (item = {}) => String(item.id || item._id || item);
const calculateFantasyPoints = (kills, placement) =>
  Math.max(0, Number(kills || 0)) * 4 + (placementPoints[Number(placement)] || 0);

const formatDateTime = (value) => {
  if (!value) return 'Select date and time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Select date and time';
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPickerDate = (value) => {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  return Number.isNaN(date.getTime()) ? new Date(Date.now() + 60 * 60 * 1000) : date;
};

const Field = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textDim}
      keyboardType={keyboardType}
      style={styles.input}
    />
  </View>
);

const DateTimeField = ({ label, value, onPress }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Pressable onPress={onPress} style={styles.dateButton}>
      <Text numberOfLines={1} style={[styles.dateText, !value && styles.datePlaceholder]}>
        {formatDateTime(value)}
      </Text>
    </Pressable>
  </View>
);

const AdminScreen = ({ navigation }) => {
  const { contests, players, refreshContests, refreshPlayers, refreshLeaderboard } = useAppData();
  const [dashboard, setDashboard] = useState(null);
  const [contestForm, setContestForm] = useState(initialContest);
  const [playerForm, setPlayerForm] = useState(initialPlayer);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [contestPlayerIds, setContestPlayerIds] = useState([]);
  const [contestPlayers, setContestPlayers] = useState([]);
  const [resultRows, setResultRows] = useState({});
  const [playerSearch, setPlayerSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(null);
  const [importSummary, setImportSummary] = useState(null);

  const selectedContest = useMemo(
    () => contests.find((contest) => getId(contest) === selectedContestId),
    [contests, selectedContestId]
  );

  const accountingPreview = useMemo(() => {
    const entryFee = Number(contestForm.entryFee || 0);
    const spots = Number(contestForm.players || 0);
    const commission = Number(contestForm.platformCommissionPercent || 0);
    const totalCollection = entryFee * spots;
    const commissionAmount = (totalCollection * commission) / 100;

    return {
      totalCollection,
      commissionAmount,
      prizePool: Math.max(totalCollection - commissionAmount, 0),
    };
  }, [contestForm.entryFee, contestForm.platformCommissionPercent, contestForm.players]);

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.trim().toLowerCase();
    if (!query) return players;

    return players.filter((player) =>
      `${player.name} ${player.team} ${player.role}`.toLowerCase().includes(query)
    );
  }, [playerSearch, players]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          const [stats, latestContests] = await Promise.all([
            getAdminDashboard(),
            refreshContests({ silent: contests.length > 0 }),
            refreshPlayers({ silent: true }),
          ]);

          if (active) {
            setDashboard(stats);
            setSelectedContestId((current) => current || latestContests[0]?.id || '');
          }
        } catch (error) {
          if (active) {
            showError('Admin load failed', error);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [contests.length, refreshContests, refreshPlayers])
  );

  useEffect(() => {
    let active = true;

    const loadContestPlayers = async () => {
      if (!selectedContestId) {
        setContestPlayers([]);
        setContestPlayerIds([]);
        setResultRows({});
        return;
      }

      try {
        const scopedPlayers = await getContestPlayers(selectedContestId);
        if (!active) return;

        setContestPlayers(scopedPlayers);
        setContestPlayerIds(scopedPlayers.map(getId));
        setResultRows((current) => {
          const next = {};
          scopedPlayers.forEach((player) => {
            const id = getId(player);
            next[id] = current[id] || { kills: '', placement: '' };
          });
          return next;
        });
      } catch (error) {
        if (active) {
          showError('Contest players load failed', error);
        }
      }
    };

    loadContestPlayers();

    return () => {
      active = false;
    };
  }, [selectedContestId]);

  const toggleContestPlayer = useCallback((playerId) => {
    setContestPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }, []);

  const submitContest = async () => {
    setSaving(true);
    try {
      const response = await createContest({
        ...contestForm,
        players: Number(contestForm.players),
        entryFee: Number(contestForm.entryFee),
        platformCommissionPercent: Number(contestForm.platformCommissionPercent || 10),
        contestPlayers: contestPlayerIds,
      });
      setContestForm(initialContest);
      await refreshContests({ silent: true });
      setSelectedContestId(response.contest?.id || response.contest?._id || '');
      showSuccess('Contest created');
    } catch (error) {
      showError('Contest creation failed', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (!picker) return;

    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setPicker(null);
      return;
    }

    const currentDate = selectedDate || getPickerDate(contestForm[picker.field]);
    const nextDate = new Date(getPickerDate(contestForm[picker.field]));

    if (picker.mode === 'datetime') {
      nextDate.setTime(currentDate.getTime());
    } else if (picker.mode === 'date') {
      nextDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    } else {
      nextDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
    }

    setContestForm((current) => ({
      ...current,
      [picker.field]: nextDate.toISOString(),
    }));

    if (Platform.OS === 'android' && picker.mode === 'date') {
      setPicker({ ...picker, mode: 'time' });
      return;
    }

    if (Platform.OS === 'android') {
      setPicker(null);
    }
  };

  const openDatePicker = (field) => {
    setPicker({
      field,
      mode: Platform.OS === 'ios' ? 'datetime' : 'date',
    });
  };

  const submitContestPlayers = async () => {
    if (!selectedContestId) {
      Alert.alert('Contest required', 'Select a contest first.');
      return;
    }

    if (contestPlayerIds.length === 0) {
      Alert.alert('Players required', 'Select players participating in this contest.');
      return;
    }

    setSaving(true);
    try {
      await updateContestPlayers({ contestId: selectedContestId, players: contestPlayerIds });
      await refreshContests({ silent: true });
      const scopedPlayers = await getContestPlayers(selectedContestId);
      setContestPlayers(scopedPlayers);
      showSuccess('Contest players saved');
    } catch (error) {
      showError('Contest player update failed', error);
    } finally {
      setSaving(false);
    }
  };

  const submitPlayer = async () => {
    setSaving(true);
    try {
      await createPlayer({
        ...playerForm,
        credits: Number(playerForm.credits),
      });
      setPlayerForm(initialPlayer);
      await refreshPlayers({ silent: true });
      showSuccess('Player created');
    } catch (error) {
      showError('Player creation failed', error);
    } finally {
      setSaving(false);
    }
  };

  const updateResultRow = (playerId, patch) => {
    setResultRows((current) => ({
      ...current,
      [playerId]: {
        ...(current[playerId] || { kills: '', placement: '' }),
        ...patch,
      },
    }));
  };

  const completeMatch = async () => {
    if (!selectedContestId) {
      Alert.alert('Contest required', 'Select a contest before completing the match.');
      return;
    }

    if (contestPlayers.length === 0) {
      Alert.alert('Contest players required', 'Add players to this contest before entering results.');
      return;
    }

    const playerResults = contestPlayers.map((player) => {
      const id = getId(player);
      const row = resultRows[id] || {};
      return {
        playerId: id,
        kills: Number(row.kills),
        placement: Number(row.placement),
      };
    });

    const invalid = playerResults.some(
      (row) =>
        !Number.isInteger(row.kills) ||
        row.kills < 0 ||
        !Number.isInteger(row.placement) ||
        row.placement < 1 ||
        row.placement > 16
    );

    if (invalid) {
      Alert.alert('Invalid results', 'Enter kills >= 0 and placement between 1 and 16 for every player.');
      return;
    }

    setSaving(true);
    try {
      const response = await processResults({ contestId: selectedContestId, playerResults });
      const rows = response.leaderboard || await getAdminLeaderboard(selectedContestId);
      setLeaderboard(rows);
      await Promise.all([
        refreshContests({ silent: true }),
        refreshLeaderboard(selectedContestId, { silent: true }),
      ]);
      showSuccess('Match completed and payouts processed');
    } catch (error) {
      showError('Match completion failed', error);
    } finally {
      setSaving(false);
    }
  };

  const pickImportFile = async (type) => {
    if (!selectedContestId) {
      Alert.alert('Contest required', 'Select a contest before importing a file.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      setSaving(true);
      const file = result.assets[0];
      const response =
        type === 'players'
          ? await importContestPlayers({ contestId: selectedContestId, file })
          : await importContestResults({ contestId: selectedContestId, file });

      setImportSummary(response.summary || null);

      if (type === 'players') {
        await Promise.all([
          refreshPlayers({ silent: true }),
          refreshContests({ silent: true }),
        ]);
        const scopedPlayers = await getContestPlayers(selectedContestId);
        setContestPlayers(scopedPlayers);
        setContestPlayerIds(scopedPlayers.map(getId));
        showSuccess('Player file imported');
      } else {
        const rows = response.leaderboard || await getAdminLeaderboard(selectedContestId);
        setLeaderboard(rows);
        await Promise.all([
          refreshContests({ silent: true }),
          refreshLeaderboard(selectedContestId, { silent: true }),
        ]);
        showSuccess('Result file processed');
      }
    } catch (error) {
      const importErrors = error?.data?.details?.errors || error?.details?.errors;
      if (importErrors?.length) {
        Alert.alert('Import failed', importErrors.slice(0, 5).map((item) => `Line ${item.line}: ${item.message}`).join('\n'));
        return;
      }
      showError(type === 'players' ? 'Player import failed' : 'Result import failed', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="Admin" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandHeader}>
          <BrandLogo size={44} glow />
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Battle-8 Control</Text>
            <Text style={styles.brandSub}>Contests, imports, results and payouts</Text>
          </View>
        </View>

        <GlassCard style={styles.stats}>
          {[
            ['Users', dashboard?.totalUsers ?? 0],
            ['Contests', dashboard?.totalContests ?? 0],
            ['Teams', dashboard?.totalTeams ?? 0],
            ['Earnings', dashboard?.platformEarnings ?? 0],
          ].map(([label, value]) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Create Contest</Text>
          <Field label="Title" value={contestForm.title} onChangeText={(title) => setContestForm((current) => ({ ...current, title }))} />
          <View style={styles.row}>
            <Field label="Spots" keyboardType="number-pad" value={contestForm.players} onChangeText={(players) => setContestForm((current) => ({ ...current, players }))} />
            <Field label="Entry" keyboardType="number-pad" value={contestForm.entryFee} onChangeText={(entryFee) => setContestForm((current) => ({ ...current, entryFee }))} />
          </View>
          <Field label="Commission %" keyboardType="decimal-pad" value={contestForm.platformCommissionPercent} onChangeText={(platformCommissionPercent) => setContestForm((current) => ({ ...current, platformCommissionPercent }))} />
          <DateTimeField label="Start Time" value={contestForm.startTime} onPress={() => openDatePicker('startTime')} />
          <DateTimeField label="Estimated End" value={contestForm.estimatedEndTime} onPress={() => openDatePicker('estimatedEndTime')} />
          <View style={styles.accountingBox}>
            <Text style={styles.accountingText}>Collection: {accountingPreview.totalCollection.toFixed(2)}</Text>
            <Text style={styles.accountingText}>Commission: {accountingPreview.commissionAmount.toFixed(2)}</Text>
            <Text style={styles.accountingPrize}>Prize Pool: {accountingPreview.prizePool.toFixed(2)}</Text>
          </View>
          <Button title="Create Contest" loading={saving} disabled={saving} onPress={submitContest} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Player Management</Text>
          <Field label="Name" value={playerForm.name} onChangeText={(name) => setPlayerForm((current) => ({ ...current, name }))} />
          <Field label="Team" value={playerForm.team} onChangeText={(team) => setPlayerForm((current) => ({ ...current, team }))} />
          <View style={styles.row}>
            <Field label="Credits" keyboardType="decimal-pad" value={playerForm.credits} onChangeText={(credits) => setPlayerForm((current) => ({ ...current, credits }))} />
            <Field label="Role" value={playerForm.role} onChangeText={(role) => setPlayerForm((current) => ({ ...current, role }))} />
          </View>
          <Button title="Create Player" loading={saving} disabled={saving} onPress={submitPlayer} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Contest Players</Text>
          <Field label="Search" value={playerSearch} onChangeText={setPlayerSearch} placeholder="Search player, team, role" />
          <View style={styles.chipWrap}>
            {contests.map((contest) => {
              const contestId = getId(contest);
              const selected = contestId === selectedContestId;

              return (
                <Pressable key={contestId} onPress={() => setSelectedContestId(contestId)} style={[styles.chip, selected && styles.chipActive]}>
                  <Text numberOfLines={1} style={[styles.chipText, selected && styles.chipTextActive]}>
                    {contest.title || contestId}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.statusLine}>
            {(selectedContest?.status || 'upcoming').toUpperCase()} | {contestPlayerIds.length} players selected
          </Text>
          <View style={styles.importRow}>
            <Button title="Import CSV/XLSX" variant="outline" loading={saving} disabled={saving || selectedContest?.status !== 'upcoming'} onPress={() => pickImportFile('players')} />
          </View>
          <View style={styles.chipWrap}>
            {filteredPlayers.map((player) => {
              const playerId = getId(player);
              const selected = contestPlayerIds.includes(playerId);

              return (
                <Pressable key={playerId} onPress={() => toggleContestPlayer(playerId)} style={[styles.chip, selected && styles.chipActive]}>
                  <Text numberOfLines={1} style={[styles.chipText, selected && styles.chipTextActive]}>
                    {player.name} | {player.team}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button title="Save Contest Players" loading={saving} disabled={saving || selectedContest?.status !== 'upcoming'} onPress={submitContestPlayers} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Complete Match</Text>
          <Button title="Import Result File" variant="outline" loading={saving} disabled={saving || !selectedContestId || selectedContest?.status === 'completed'} onPress={() => pickImportFile('results')} />
          {importSummary && (
            <View style={styles.importSummary}>
              <Text style={styles.accountingText}>Rows: {importSummary.rows ?? 0}</Text>
              <Text style={styles.accountingText}>Processed: {importSummary.processed ?? importSummary.imported ?? 0}</Text>
              <Text style={styles.accountingText}>Created: {importSummary.created ?? 0}</Text>
            </View>
          )}
          {contestPlayers.length === 0 ? (
            <Text style={styles.emptyText}>Select a contest with configured players.</Text>
          ) : (
            contestPlayers.map((player) => {
              const playerId = getId(player);
              const row = resultRows[playerId] || {};
              const points = calculateFantasyPoints(row.kills, row.placement);

              return (
                <View key={playerId} style={styles.resultRow}>
                  <View style={styles.resultPlayer}>
                    <Text numberOfLines={1} style={styles.resultName}>{player.name}</Text>
                    <Text numberOfLines={1} style={styles.resultTeam}>{player.team}</Text>
                  </View>
                  <TextInput
                    value={row.kills}
                    onChangeText={(kills) => updateResultRow(playerId, { kills })}
                    keyboardType="number-pad"
                    placeholder="K"
                    placeholderTextColor={colors.textDim}
                    style={styles.smallInput}
                  />
                  <TextInput
                    value={row.placement}
                    onChangeText={(placement) => updateResultRow(playerId, { placement })}
                    keyboardType="number-pad"
                    placeholder="#"
                    placeholderTextColor={colors.textDim}
                    style={styles.smallInput}
                  />
                  <Text style={styles.resultPoints}>{points}</Text>
                </View>
              );
            })
          )}
          <Button title="Complete Match" loading={saving} disabled={saving || contestPlayers.length === 0 || selectedContest?.status === 'completed'} onPress={completeMatch} />
          {leaderboard.slice(0, 5).map((row) => (
            <View key={`${row.rank}-${row.teamId}`} style={styles.leaderRow}>
              <Text style={styles.leaderText}>{row.rank}. {row.team}</Text>
              <Text style={styles.leaderPoints}>{row.points} pts | +{row.winnings || 0}</Text>
            </View>
          ))}
        </GlassCard>
        {picker && (
          <DateTimePicker
            value={getPickerDate(contestForm[picker.field])}
            mode={picker.mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: 112,
    gap: spacing.md,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  brandSub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
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
    marginTop: spacing.xs,
    fontWeight: '800',
  },
  panel: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontWeight: '800',
  },
  dateButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dateText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  datePlaceholder: {
    color: colors.textDim,
  },
  accountingBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  accountingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  accountingPrize: {
    color: colors.coin,
    fontSize: 14,
    fontWeight: '900',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    maxWidth: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(85, 255, 23, 0.12)',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 220,
  },
  chipTextActive: {
    color: colors.primary,
  },
  statusLine: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  importRow: {
    gap: spacing.sm,
  },
  importSummary: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: 'rgba(177,255,0,0.06)',
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    padding: spacing.md,
  },
  resultRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  resultPlayer: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  resultTeam: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  smallInput: {
    width: 48,
    minHeight: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '900',
  },
  resultPoints: {
    width: 44,
    color: colors.coin,
    textAlign: 'right',
    fontWeight: '900',
  },
  leaderRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  leaderText: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
  },
  leaderPoints: {
    color: colors.primary,
    fontWeight: '900',
  },
});

export default AdminScreen;
