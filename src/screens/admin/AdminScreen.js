import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Button from '../../components/common/Button';
import BrandLogo from '../../components/common/BrandLogo';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import SearchableSelector from '../../components/common/SearchableSelector';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import {
  cancelContest,
  createContest,
  createPlayer,
  createTeamPlayers,
  deletePlayer,
  deleteTeam as deleteTeamRequest,
  forceCompleteContest,
  getAdminAdRewards,
  getAdminDashboard,
  getAdminLeaderboard,
  getAdminWithdrawals,
  importContestPlayers,
  importContestResults,
  markContestLive,
  processResults,
  processTeamResults,
  refundContest,
  rehostContest,
  restartResultProcessing,
  setUserPremium,
  updateWithdrawalStatus,
} from '../../services/adminService';
import { getContestPlayers } from '../../services/playerService';
import { syncTournament } from '../../services/tournamentService';
import { showError, showSuccess } from '../../utils/feedback';

const initialContest = {
  game: 'BGMI',
  title: '',
  players: '',
  entryFee: '',
  platformCommissionPercent: '10',
  startTime: '',
  estimatedEndTime: '',
  tournamentName: '',
  contestType: 'fantasy',
};

const initialPlayer = {
  game: 'BGMI',
  name: '',
  team: '',
  credits: '',
  role: 'Assaulter',
};

const initialTournamentSync = {
  name: '',
  source: '16score',
  sourceUrl: '',
  autoSync: false,
};

const emptyBulkPlayer = () => ({ name: '', credits: '', role: 'Assaulter' });
const roleOptions = ['IGL', 'Assaulter', 'Supporter'];
const gameOptions = ['BGMI', 'Free Fire', 'Valorant', 'COD Mobile'];

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
const getGame = (item = {}) => item.game || 'BGMI';
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

const RolePicker = ({ value, onChange }) => (
  <View style={styles.rolePicker}>
    {roleOptions.map((item) => {
      const selected = value === item;
      return (
        <Pressable key={item} onPress={() => onChange(item)} style={[styles.roleOption, selected && styles.roleOptionActive]}>
          <Text style={[styles.roleOptionText, selected && styles.roleOptionTextActive]}>{item}</Text>
        </Pressable>
      );
    })}
  </View>
);

const GamePicker = ({ value, onChange }) => (
  <View style={styles.gamePicker}>
    {gameOptions.map((item) => {
      const selected = value === item;
      return (
        <Pressable key={item} onPress={() => onChange(item)} style={[styles.gameOption, selected && styles.gameOptionActive]}>
          <Text numberOfLines={1} style={[styles.gameOptionText, selected && styles.gameOptionTextActive]}>{item}</Text>
        </Pressable>
      );
    })}
  </View>
);

const contestTypeOptions = [
  { value: 'fantasy', label: 'Fantasy Contest' },
  { value: 'team', label: 'Team Contest' },
];

const tournamentSourceOptions = [
  { value: '16score', label: '16Score' },
  { value: 'manual', label: 'Manual' },
];

const tournamentSourceLabels = tournamentSourceOptions.map((item) => item.label);

const ContestTypePicker = ({ value, onChange }) => (
  <View style={styles.rolePicker}>
    {contestTypeOptions.map((item) => {
      const selected = value === item.value;
      return (
        <Pressable key={item.value} onPress={() => onChange(item.value)} style={[styles.roleOption, selected && styles.roleOptionActive]}>
          <Text style={[styles.roleOptionText, selected && styles.roleOptionTextActive]}>{item.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const AdminScreen = ({ navigation }) => {
  const { contests, players, refreshContests, refreshPlayers, refreshLeaderboard } = useAppData();
  const [dashboard, setDashboard] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [adRewards, setAdRewards] = useState([]);
  const [contestForm, setContestForm] = useState(initialContest);
  const [tournamentSyncForm, setTournamentSyncForm] = useState(initialTournamentSync);
  const [tournamentSyncing, setTournamentSyncing] = useState(false);
  const [tournamentSyncResult, setTournamentSyncResult] = useState(null);
  const [playerForm, setPlayerForm] = useState(initialPlayer);
  const [bulkGame, setBulkGame] = useState('BGMI');
  const [bulkTeamName, setBulkTeamName] = useState('');
  const [bulkPlayers, setBulkPlayers] = useState(Array.from({ length: 5 }, emptyBulkPlayer));
  const [selectedContestId, setSelectedContestId] = useState('');
  const [selectedContestTeamNames, setSelectedContestTeamNames] = useState([]);
  const [contestPlayers, setContestPlayers] = useState([]);
  const [resultRows, setResultRows] = useState({});
  const [teamResultRows, setTeamResultRows] = useState({});
  const [teamDeleteGame, setTeamDeleteGame] = useState('BGMI');
  const [teamDeleteName, setTeamDeleteName] = useState('');
  const [deleteGame, setDeleteGame] = useState('BGMI');
  const [deleteTeamName, setDeleteTeamName] = useState('');
  const [deletePlayerId, setDeletePlayerId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(null);
  const [importSummary, setImportSummary] = useState(null);

  const selectedContest = useMemo(
    () => contests.find((contest) => getId(contest) === selectedContestId),
    [contests, selectedContestId]
  );

  const isTeamContest = selectedContest?.contestType === 'team';
  const selectedTournamentSourceLabel =
    tournamentSourceOptions.find((item) => item.value === tournamentSyncForm.source)?.label || '';

  const getTeamNamesForGame = useCallback(
    (game) => [...new Set(players.filter((player) => getGame(player) === game).map((player) => player.team).filter(Boolean))].sort(),
    [players]
  );

  const teamNames = useMemo(() => getTeamNamesForGame(contestForm.game), [contestForm.game, getTeamNamesForGame]);
  const singleTeamNames = useMemo(() => getTeamNamesForGame(playerForm.game), [getTeamNamesForGame, playerForm.game]);
  const bulkTeamExists = useMemo(
    () => getTeamNamesForGame(bulkGame).some((teamName) => teamName.toLowerCase() === bulkTeamName.trim().toLowerCase()),
    [bulkGame, bulkTeamName, getTeamNamesForGame]
  );
  const deleteTeamNames = useMemo(() => getTeamNamesForGame(deleteGame), [deleteGame, getTeamNamesForGame]);
  const teamDeleteNames = useMemo(() => getTeamNamesForGame(teamDeleteGame), [getTeamNamesForGame, teamDeleteGame]);

  const teamDeletePlayerCount = useMemo(
    () => players.filter((player) => getGame(player) === teamDeleteGame && player.team === teamDeleteName).length,
    [players, teamDeleteGame, teamDeleteName]
  );

  const deleteTeamPlayers = useMemo(
    () => players.filter((player) => getGame(player) === deleteGame && player.team === deleteTeamName),
    [deleteGame, deleteTeamName, players]
  );
  const selectedDeletePlayer = useMemo(
    () => deleteTeamPlayers.find((player) => getId(player) === deletePlayerId),
    [deletePlayerId, deleteTeamPlayers]
  );

  const accountingPreview = useMemo(() => {
    const entryFee = Number(contestForm.entryFee || 0);
    const spots = Number(contestForm.players || 0);
    const commission = Number(contestForm.platformCommissionPercent || 0);
    const joined = Number(selectedContest?.joined || 0);
    const totalCollection = entryFee * joined;
    const maxCollection = entryFee * spots;
    const commissionAmount = (totalCollection * commission) / 100;

    return {
      totalCollection,
      maxCollection,
      commissionAmount,
      prizePool: Math.max(totalCollection, 0),
    };
  }, [contestForm.entryFee, contestForm.platformCommissionPercent, contestForm.players, selectedContest?.joined]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          const [stats, latestContests, , latestWithdrawals, latestAdRewards] = await Promise.all([
            getAdminDashboard(),
            refreshContests({ silent: contests.length > 0 }),
            refreshPlayers({ silent: true }),
            getAdminWithdrawals(),
            getAdminAdRewards(),
          ]);

          if (active) {
            setDashboard(stats);
            setWithdrawals(latestWithdrawals);
            setAdRewards(latestAdRewards);
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
        setResultRows({});
        setTeamResultRows({});
        return;
      }

      try {
        const scopedPlayers = await getContestPlayers(selectedContestId);
        if (!active) return;

        setContestPlayers(scopedPlayers);
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

    // Initialise team result rows from the selected contest's contestTeams
    const initTeamResultRows = () => {
      const teams = selectedContest?.contestTeams || [];
      setTeamResultRows((current) => {
        const next = {};
        teams.forEach((teamName) => {
          next[teamName] = current[teamName] || { position: '', totalKills: '' };
        });
        return next;
      });
    };

    loadContestPlayers();
    initTeamResultRows();

    return () => {
      active = false;
    };
  }, [selectedContestId, selectedContest?.contestTeams]);

  const toggleContestTeam = useCallback((teamName) => {
    setSelectedContestTeamNames((current) =>
      current.includes(teamName)
        ? current.filter((item) => item !== teamName)
        : [...current, teamName]
    );
  }, []);

  const submitContest = async () => {
    if (selectedContestTeamNames.length === 0) {
      Alert.alert('Teams required', 'Select at least one participating team.');
      return;
    }

    setSaving(true);
    try {
      const response = await createContest({
        ...contestForm,
        players: Number(contestForm.players),
        entryFee: Number(contestForm.entryFee),
        platformCommissionPercent: Number(contestForm.platformCommissionPercent || 10),
        contestTeams: selectedContestTeamNames,
      });
      setContestForm(initialContest);
      setSelectedContestTeamNames([]);
      await refreshContests({ silent: true });
      setSelectedContestId(response.contest?.id || response.contest?._id || '');
      showSuccess('Contest created');
    } catch (error) {
      showError('Contest creation failed', error);
    } finally {
      setSaving(false);
    }
  };

  const submitTournamentSync = async () => {
    const name = tournamentSyncForm.name.trim();
    const source = tournamentSyncForm.source;
    const sourceUrl = tournamentSyncForm.sourceUrl.trim();

    if (!name) {
      Alert.alert('Tournament required', 'Tournament Name is required.');
      return;
    }

    if (!source) {
      Alert.alert('Source required', 'Tournament Source is required.');
      return;
    }

    if (source === '16score') {
      if (!sourceUrl) {
        Alert.alert('Source URL required', 'Tournament Source URL is required for 16Score.');
        return;
      }

      if (!sourceUrl.startsWith('https://www.16score.com/')) {
        Alert.alert('Invalid URL', 'Tournament Source URL must start with https://www.16score.com/.');
        return;
      }
    }

    setTournamentSyncing(true);
    setTournamentSyncResult(null);

    try {
      const response = await syncTournament({
        name,
        source,
        sourceUrl,
        autoSync: tournamentSyncForm.autoSync,
      });

      setTournamentSyncResult({
        htmlLength: response.htmlLength || 0,
      });
      showSuccess('Tournament synced successfully.');
    } catch (error) {
      showError('Tournament sync failed', error);
    } finally {
      setTournamentSyncing(false);
    }
  };

  const updateBulkPlayer = (index, patch) => {
    setBulkPlayers((current) =>
      current.map((player, itemIndex) => (itemIndex === index ? { ...player, ...patch } : player))
    );
  };

  const addBulkPlayerRow = () => {
    setBulkPlayers((current) => [...current, emptyBulkPlayer()]);
  };

  const removeBulkPlayerRow = (index) => {
    setBulkPlayers((current) => (current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const submitBulkTeam = async () => {
    if (!bulkTeamName.trim()) {
      Alert.alert('Team required', 'Enter a team name before saving players.');
      return;
    }

    if (bulkPlayers.filter((player) => player.name.trim()).length === 0) {
      Alert.alert('Players required', 'Add at least one player for this team.');
      return;
    }

    if (bulkTeamExists) {
      Alert.alert('Team already added', 'This team name already exists for the selected game.');
      return;
    }

    setSaving(true);
    try {
      await createTeamPlayers({
        game: bulkGame,
        team: bulkTeamName.trim(),
        players: bulkPlayers.filter((player) => player.name.trim()).map((player) => ({
          ...player,
          name: player.name.trim(),
          credits: Number(player.credits),
        })),
      });
      setBulkTeamName('');
      setBulkPlayers(Array.from({ length: 5 }, emptyBulkPlayer));
      await refreshPlayers({ silent: true });
      showSuccess('Team players saved');
    } catch (error) {
      showError('Team player creation failed', error);
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

  const submitPlayer = async () => {
    const selectedTeam = singleTeamNames.find((teamName) => teamName.toLowerCase() === playerForm.team.trim().toLowerCase());

    if (!selectedTeam) {
      Alert.alert('Select valid team', 'Select an existing team from the selected game before creating a player.');
      return;
    }

    setSaving(true);
    try {
      await createPlayer({
        ...playerForm,
        team: selectedTeam,
        name: playerForm.name.trim(),
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

  const updateResultPlacement = (player, placement) => {
    const playerId = getId(player);
    setResultRows((current) => {
      const next = {
        ...current,
        [playerId]: {
          ...(current[playerId] || { kills: '', placement: '' }),
          placement,
        },
      };

      contestPlayers
        .filter((item) => item.team === player.team && getId(item) !== playerId)
        .forEach((teammate) => {
          const teammateId = getId(teammate);
          const existing = current[teammateId] || { kills: '', placement: '' };
          if (!existing.placement) {
            next[teammateId] = {
              ...existing,
              placement,
            };
          }
        });

      return next;
    });
  };

  const confirmDeletePlayer = () => {
    const player = deleteTeamPlayers.find((item) => getId(item) === deletePlayerId);

    if (!player) {
      Alert.alert('Player required', 'Select a player to delete.');
      return;
    }

    Alert.alert(
      'Delete player?',
      `Delete ${player.name} from ${player.team}? Historical records stay safe, but this player will be hidden from new contests.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await deletePlayer(getId(player));
              setDeletePlayerId('');
              await refreshPlayers({ silent: true });
              showSuccess('Player deleted');
            } catch (error) {
              showError('Player delete failed', error);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const confirmDeleteTeam = () => {
    if (!teamDeleteName) {
      Alert.alert('Team required', 'Select a team to delete.');
      return;
    }

    Alert.alert(
      'Delete team?',
      `Are you sure you want to delete this team?\n\n${teamDeleteName} (${teamDeleteGame})\n${teamDeletePlayerCount} player${teamDeletePlayerCount === 1 ? '' : 's'} will be hidden from new contests.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              const result = await deleteTeamRequest({
                game: teamDeleteGame,
                team: teamDeleteName,
              });

              setTeamDeleteName('');

              if (deleteGame === teamDeleteGame && deleteTeamName === teamDeleteName) {
                setDeleteTeamName('');
                setDeletePlayerId('');
              }

              await Promise.all([
                refreshPlayers({ silent: true }),
                refreshContests({ silent: true }),
              ]);

              showSuccess(`Team deleted (${result.deletedPlayers || teamDeletePlayerCount} players)`);
            } catch (error) {
              showError('Team delete failed', error);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
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
      if (row.kills === '' && row.placement === '') {
        return null;
      }
      return {
        playerId: id,
        kills: Number(row.kills),
        placement: Number(row.placement),
      };
    }).filter(Boolean);

    const invalid = playerResults.some(
      (row) =>
        !Number.isInteger(row.kills) ||
        row.kills < 0 ||
        !Number.isInteger(row.placement) ||
        row.placement < 1 ||
        row.placement > 16
    );

    if (invalid) {
      Alert.alert('Invalid results', 'Enter kills >= 0 and placement between 1 and 16 for each active player.');
      return;
    }

    if (playerResults.length === 0) {
      Alert.alert('Results required', 'Enter results for at least one active player.');
      return;
    }

    setSaving(true);
    try {
      const response = await processResults({
        contestId: selectedContestId,
        playerResults,
        matchName: selectedContest?.matchName,
        tournamentName: selectedContest?.tournamentName,
        matchIdentifier: selectedContest?.matchIdentifier,
        matchDateTime: selectedContest?.matchDateTime,
      });
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

  const completeTeamMatch = async () => {
    if (!selectedContestId) {
      Alert.alert('Contest required', 'Select a contest before completing the match.');
      return;
    }

    const contestTeams = selectedContest?.contestTeams || [];
    if (contestTeams.length === 0) {
      Alert.alert('No teams configured', 'This contest has no participating teams.');
      return;
    }

    const teamResults = contestTeams.map((teamName) => {
      const row = teamResultRows[teamName] || {};
      return {
        teamName,
        position: Number(row.position),
        totalKills: Number(row.totalKills),
      };
    });

    const invalid = teamResults.some(
      (r) =>
        !Number.isInteger(r.position) ||
        r.position < 1 ||
        !Number.isInteger(r.totalKills) ||
        r.totalKills < 0 ||
        (teamResultRows[r.teamName]?.position === '' || teamResultRows[r.teamName]?.totalKills === '')
    );

    if (invalid) {
      Alert.alert('Invalid results', 'Enter position (≥ 1) and total kills (≥ 0) for every team.');
      return;
    }

    setSaving(true);
    try {
      const response = await processTeamResults({
        contestId: selectedContestId,
        teamResults,
        matchName: selectedContest?.matchName,
        tournamentName: selectedContest?.tournamentName,
        matchIdentifier: selectedContest?.matchIdentifier,
        matchDateTime: selectedContest?.matchDateTime,
      });
      const rows = response.leaderboard || await getAdminLeaderboard(selectedContestId);
      setLeaderboard(rows);
      await Promise.all([
        refreshContests({ silent: true }),
        refreshLeaderboard(selectedContestId, { silent: true }),
      ]);
      showSuccess('Team match completed and payouts processed');
    } catch (error) {
      showError('Team match completion failed', error);
    } finally {
      setSaving(false);
    }
  };

  const runAdminControl = async (action, label) => {
    if (!selectedContestId) {
      Alert.alert('Contest required', 'Select a contest first.');
      return;
    }

    setSaving(true);
    try {
      const nextStart = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      if (action === 'live') await markContestLive(selectedContestId);
      if (action === 'cancel') await cancelContest({ contestId: selectedContestId, reason: 'Manual admin cancellation' });
      if (action === 'rehost') {
        await rehostContest({
          contestId: selectedContestId,
          startTime: nextStart,
          reason: 'Manual admin rehost',
          matchName: selectedContest?.matchName,
          tournamentName: selectedContest?.tournamentName,
          matchIdentifier: selectedContest?.matchIdentifier,
          matchDateTime: selectedContest?.matchDateTime,
        });
      }
      if (action === 'complete') await forceCompleteContest(selectedContestId);
      if (action === 'refund') await refundContest(selectedContestId);
      if (action === 'restart') await restartResultProcessing(selectedContestId);

      await Promise.all([
        refreshContests({ silent: true }),
        refreshLeaderboard(selectedContestId, { silent: true }),
      ]);
      showSuccess(label);
    } catch (error) {
      showError(label, error);
    } finally {
      setSaving(false);
    }
  };

  const runWithdrawalControl = async (withdrawalId, status) => {
    setSaving(true);
    try {
      await updateWithdrawalStatus({ withdrawalId, status });
      setWithdrawals(await getAdminWithdrawals());
      showSuccess(`Withdrawal ${status}`);
    } catch (error) {
      showError('Withdrawal update failed', error);
    } finally {
      setSaving(false);
    }
  };

  const activatePremiumForWithdrawalUser = async (userId, active) => {
    setSaving(true);
    try {
      await setUserPremium({ userId, active });
      showSuccess(active ? 'Premium activated' : 'Premium expired');
    } catch (error) {
      showError('Premium update failed', error);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 24}
        style={styles.keyboardWrap}
      >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            ['Pending WD', dashboard?.pendingWithdrawals ?? 0],
            ['Ad Coins', dashboard?.adRewardCoins ?? 0],
          ].map(([label, value]) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Withdrawals & Economy</Text>
          {withdrawals.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.economyRow}>
              <View style={styles.economyMain}>
                <Text style={styles.economyTitle}>{item.user?.name || item.accountName || 'Player'} · {item.amountCoins} coins</Text>
                <Text style={styles.economyMeta}>{item.status.toUpperCase()} · {item.upiId}</Text>
              </View>
              <View style={styles.economyActions}>
                {item.status === 'requested' && (
                  <Pressable style={styles.miniButton} onPress={() => runWithdrawalControl(item.id, 'approved')}>
                    <Text style={styles.miniText}>Approve</Text>
                  </Pressable>
                )}
                {item.status === 'approved' && (
                  <Pressable style={styles.miniButton} onPress={() => runWithdrawalControl(item.id, 'paid')}>
                    <Text style={styles.miniText}>Paid</Text>
                  </Pressable>
                )}
                {['requested', 'approved'].includes(item.status) && (
                  <Pressable style={[styles.miniButton, styles.dangerButton]} onPress={() => runWithdrawalControl(item.id, 'rejected')}>
                    <Text style={styles.miniText}>Reject</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          {withdrawals.length === 0 && <Text style={styles.statusLine}>No withdrawal requests yet.</Text>}
          <Text style={styles.statusLine}>{adRewards.length} recent ad reward logs loaded</Text>
          {withdrawals[0]?.user?._id && (
            <View style={styles.controlGrid}>
              <Pressable style={styles.controlButton} onPress={() => activatePremiumForWithdrawalUser(withdrawals[0].user._id, true)}>
                <Text style={styles.controlText}>Premium On</Text>
              </Pressable>
              <Pressable style={styles.controlButton} onPress={() => activatePremiumForWithdrawalUser(withdrawals[0].user._id, false)}>
                <Text style={styles.controlText}>Premium Off</Text>
              </Pressable>
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Tournament Management</Text>
          <Field
            label="Tournament Name"
            value={tournamentSyncForm.name}
            onChangeText={(name) => setTournamentSyncForm((current) => ({ ...current, name }))}
          />
          <SearchableSelector
            label="Tournament Source"
            value={selectedTournamentSourceLabel}
            placeholder="Select source"
            options={tournamentSourceLabels}
            onSelect={(label) => {
              const source = tournamentSourceOptions.find((item) => item.label === label)?.value || '';
              setTournamentSyncForm((current) => ({
                ...current,
                source,
                sourceUrl: source === '16score' ? current.sourceUrl : '',
              }));
              setTournamentSyncResult(null);
            }}
            emptyText="No sources found."
          />
          <Field
            label="Tournament Source URL"
            value={tournamentSyncForm.sourceUrl}
            placeholder="https://www.16score.com/..."
            onChangeText={(sourceUrl) => setTournamentSyncForm((current) => ({ ...current, sourceUrl }))}
          />
          <View style={styles.syncSwitchRow}>
            <View style={styles.syncSwitchCopy}>
              <Text style={styles.label}>Auto Sync</Text>
              <Text style={styles.statusLine}>{tournamentSyncForm.autoSync ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={tournamentSyncForm.autoSync}
              onValueChange={(autoSync) => setTournamentSyncForm((current) => ({ ...current, autoSync }))}
              disabled={tournamentSyncing}
              trackColor={{ false: colors.surfaceMuted, true: colors.primarySoft }}
              thumbColor={tournamentSyncForm.autoSync ? colors.primary : colors.textMuted}
            />
          </View>
          {tournamentSyncing && (
            <View style={styles.syncStatusRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.statusLine}>Syncing...</Text>
            </View>
          )}
          {tournamentSyncResult && (
            <View style={styles.importSummary}>
              <Text style={styles.accountingPrize}>Tournament synced successfully.</Text>
              <Text style={styles.accountingText}>HTML downloaded.</Text>
              <Text style={styles.accountingText}>HTML size: {tournamentSyncResult.htmlLength} bytes.</Text>
            </View>
          )}
          <Button
            title={tournamentSyncing ? 'Syncing...' : 'Sync Tournament'}
            disabled={saving || tournamentSyncing}
            onPress={submitTournamentSync}
          />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Create Contest</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Game</Text>
            <GamePicker
              value={contestForm.game}
              onChange={(game) => {
                setContestForm((current) => ({ ...current, game }));
                setSelectedContestTeamNames([]);
              }}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Contest Type</Text>
            <ContestTypePicker
              value={contestForm.contestType}
              onChange={(contestType) => setContestForm((current) => ({ ...current, contestType }))}
            />
          </View>
          <Field label="Title" value={contestForm.title} onChangeText={(title) => setContestForm((current) => ({ ...current, title }))} />
          <View style={styles.row}>
            <Field label="Spots" keyboardType="number-pad" value={contestForm.players} onChangeText={(players) => setContestForm((current) => ({ ...current, players }))} />
            <Field label="Entry" keyboardType="number-pad" value={contestForm.entryFee} onChangeText={(entryFee) => setContestForm((current) => ({ ...current, entryFee }))} />
          </View>
          <Field label="Commission %" keyboardType="decimal-pad" value={contestForm.platformCommissionPercent} onChangeText={(platformCommissionPercent) => setContestForm((current) => ({ ...current, platformCommissionPercent }))} />
          <DateTimeField label="Start Time" value={contestForm.startTime} onPress={() => openDatePicker('startTime')} />
          <DateTimeField label="Estimated End" value={contestForm.estimatedEndTime} onPress={() => openDatePicker('estimatedEndTime')} />
          <Field label="Tournament" value={contestForm.tournamentName} onChangeText={(tournamentName) => setContestForm((current) => ({ ...current, tournamentName }))} />
          <SearchableSelector
            label="Select Team"
            value={selectedContestTeamNames.length ? `${selectedContestTeamNames.length} team(s) selected` : ''}
            placeholder="Select teams"
            options={teamNames}
            onSelect={toggleContestTeam}
            multi
            selectedValues={selectedContestTeamNames}
            emptyText="No teams found for this game."
          />
          <Text style={styles.statusLine}>{selectedContestTeamNames.length} team(s) selected</Text>
          <View style={styles.accountingBox}>
            <Text style={styles.accountingText}>Current Collection: {accountingPreview.totalCollection.toFixed(2)}</Text>
            <Text style={styles.accountingText}>Max Collection: {accountingPreview.maxCollection.toFixed(2)}</Text>
            <Text style={styles.accountingText}>Commission: {accountingPreview.commissionAmount.toFixed(2)}</Text>
            <Text style={styles.accountingPrize}>Live Prize Pool: {accountingPreview.prizePool.toFixed(2)}</Text>
          </View>
          <Button title="Create Contest" loading={saving} disabled={saving} onPress={submitContest} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Team Player Creation</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Game</Text>
            <GamePicker
              value={bulkGame}
              onChange={(game) => {
                setBulkGame(game);
                setBulkTeamName('');
              }}
            />
          </View>
          <Field label="Team Name" value={bulkTeamName} onChangeText={setBulkTeamName} />
          {bulkPlayers.map((player, index) => (
            <View key={String(index)} style={styles.bulkRow}>
              <Text style={styles.bulkIndex}>{index + 1}</Text>
              <TextInput
                value={player.name}
                onChangeText={(name) => updateBulkPlayer(index, { name })}
                placeholder="Player name"
                placeholderTextColor={colors.textDim}
                style={[styles.input, styles.bulkName]}
              />
              <TextInput
                value={player.credits}
                onChangeText={(credits) => updateBulkPlayer(index, { credits })}
                keyboardType="decimal-pad"
                placeholder="Cr"
                placeholderTextColor={colors.textDim}
                style={[styles.input, styles.bulkCredits]}
              />
              <View style={styles.bulkRole}>
                <RolePicker value={player.role} onChange={(role) => updateBulkPlayer(index, { role })} />
              </View>
            </View>
          ))}
          <Button title="Save Team Players" loading={saving} disabled={saving} onPress={submitBulkTeam} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Single Player</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Game</Text>
            <GamePicker
              value={playerForm.game}
              onChange={(game) => {
                setPlayerForm((current) => ({ ...current, game, team: '' }));
              }}
            />
          </View>
          <Field label="Name" value={playerForm.name} onChangeText={(name) => setPlayerForm((current) => ({ ...current, name }))} />
          <SearchableSelector
            label="Team"
            value={playerForm.team}
            placeholder="Select existing team"
            options={singleTeamNames}
            onSelect={(team) => {
              setPlayerForm((current) => ({ ...current, team }));
            }}
            emptyText="No teams found for this game."
          />
          <View style={styles.row}>
            <Field label="Credits" keyboardType="decimal-pad" value={playerForm.credits} onChangeText={(credits) => setPlayerForm((current) => ({ ...current, credits }))} />
            <View style={styles.field}>
              <Text style={styles.label}>Role</Text>
              <RolePicker value={playerForm.role} onChange={(role) => setPlayerForm((current) => ({ ...current, role }))} />
            </View>
          </View>
          <Button title="Create Player" loading={saving} disabled={saving} onPress={submitPlayer} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Delete Team</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Game</Text>
            <GamePicker
              value={teamDeleteGame}
              onChange={(game) => {
                setTeamDeleteGame(game);
                setTeamDeleteName('');
              }}
            />
          </View>
          <SearchableSelector
            label="Select Team"
            value={teamDeleteName}
            placeholder="Select team"
            options={teamDeleteNames}
            onSelect={(teamName) => {
              setTeamDeleteName(teamName);
            }}
            emptyText="No teams found for this game."
          />
          {!!teamDeleteName && (
            <Text style={styles.statusLine}>
              {teamDeletePlayerCount} active player{teamDeletePlayerCount === 1 ? '' : 's'} will be removed from this team.
            </Text>
          )}
          <Button
            title="Delete Team"
            variant="purple"
            loading={saving}
            disabled={saving || !teamDeleteName}
            onPress={confirmDeleteTeam}
          />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Delete Player</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Game</Text>
            <GamePicker
              value={deleteGame}
              onChange={(game) => {
                setDeleteGame(game);
                setDeleteTeamName('');
                setDeletePlayerId('');
              }}
            />
          </View>
          <SearchableSelector
            label="Select Team"
            value={deleteTeamName}
            placeholder="Select team"
            options={deleteTeamNames}
            onSelect={(teamName) => {
              setDeleteTeamName(teamName);
              setDeletePlayerId('');
            }}
            emptyText="No teams found for this game."
          />
          <SearchableSelector
            label="Select Player"
            value={selectedDeletePlayer?.name || ''}
            placeholder={deleteTeamName ? 'Select player' : 'Select a team first'}
            options={deleteTeamPlayers.map((player) => player.name)}
            onSelect={(playerName) => {
              const player = deleteTeamPlayers.find((item) => item.name === playerName);
              setDeletePlayerId(player ? getId(player) : '');
            }}
            disabled={!deleteTeamName}
            emptyText={deleteTeamName ? 'No players in selected team.' : 'Select a team first.'}
          />
          <Button title="Delete Player" variant="purple" loading={saving} disabled={saving || !deletePlayerId} onPress={confirmDeletePlayer} />
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Contest Controls</Text>
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
            {(selectedContest?.status || 'upcoming').toUpperCase()} | {isTeamContest ? `${(selectedContest?.contestTeams || []).length} teams` : `${contestPlayers.length} active players`} | {isTeamContest ? 'Team Contest' : 'Fantasy Contest'}
          </Text>
          <View style={styles.controlGrid}>
            <Pressable style={styles.controlButton} onPress={() => runAdminControl('live', 'Match marked live')}>
              <Text style={styles.controlText}>Live</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => runAdminControl('cancel', 'Match cancelled')}>
              <Text style={styles.controlText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => runAdminControl('rehost', 'Match rehosted')}>
              <Text style={styles.controlText}>Rehost</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => runAdminControl('complete', 'Force completed')}>
              <Text style={styles.controlText}>Complete</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => runAdminControl('refund', 'Refund processed')}>
              <Text style={styles.controlText}>Refund</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => runAdminControl('restart', 'Results restarted')}>
              <Text style={styles.controlText}>Restart</Text>
            </Pressable>
          </View>
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
          {isTeamContest ? (
            <>
              <Text style={styles.statusLine}>
                Team Contest — enter position and total kills for each team
              </Text>
              {(selectedContest?.contestTeams || []).map((teamName) => {
                const row = teamResultRows[teamName] || {};
                const pos = row.position || '';
                const kills = row.totalKills || '';
                const posNum = Number(pos);
                const killsNum = Number(kills);
                const placementPts = { 1: 20, 2: 14, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2 };
                const displayPoints =
                  pos !== '' && kills !== ''
                    ? killsNum * 4 + (placementPts[posNum] || 0)
                    : null;

                return (
                  <View key={teamName} style={styles.resultRow}>
                    <View style={styles.resultPlayer}>
                      <Text numberOfLines={1} style={styles.resultName}>{teamName}</Text>
                      <Text numberOfLines={1} style={styles.resultTeam}>Participating Team</Text>
                    </View>
                    <TextInput
                      value={pos}
                      onChangeText={(value) =>
                        setTeamResultRows((current) => ({
                          ...current,
                          [teamName]: { ...(current[teamName] || {}), position: value },
                        }))
                      }
                      keyboardType="number-pad"
                      placeholder="#"
                      placeholderTextColor={colors.textDim}
                      style={styles.smallInput}
                    />
                    <TextInput
                      value={kills}
                      onChangeText={(value) =>
                        setTeamResultRows((current) => ({
                          ...current,
                          [teamName]: { ...(current[teamName] || {}), totalKills: value },
                        }))
                      }
                      keyboardType="number-pad"
                      placeholder="K"
                      placeholderTextColor={colors.textDim}
                      style={styles.smallInput}
                    />
                    <Text style={styles.resultPoints}>
                      {displayPoints !== null ? displayPoints : '—'}
                    </Text>
                  </View>
                );
              })}
              {(selectedContest?.contestTeams || []).length === 0 && (
                <Text style={styles.emptyText}>No teams configured for this contest.</Text>
              )}
              <Button
                title="Complete Team Match"
                loading={saving}
                disabled={saving || (selectedContest?.contestTeams || []).length === 0 || selectedContest?.status === 'completed'}
                onPress={completeTeamMatch}
              />
            </>
          ) : (
            <>
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
                        onChangeText={(placement) => updateResultPlacement(player, placement)}
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
            </>
          )}
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
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  content: {
    padding: spacing.screen,
    paddingBottom: 156,
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
    ...typography.title,
  },
  brandSub: {
    color: colors.textMuted,
    ...typography.micro,
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
    ...typography.h3,
  },
  statLabel: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: spacing.xs,
  },
  panel: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  panelTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bulkRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  bulkIndex: {
    width: 22,
    color: colors.primary,
    ...typography.caption,
    textAlign: 'center',
  },
  bulkName: {
    flex: 1,
  },
  bulkCredits: {
    width: 72,
    textAlign: 'center',
  },
  bulkRole: {
    width: '100%',
    paddingLeft: 30,
  },
  rolePicker: {
    minHeight: 42,
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
  },
  roleOptionText: {
    color: colors.textMuted,
    ...typography.micro,
    textAlign: 'center',
  },
  roleOptionTextActive: {
    color: colors.textInverse,
  },
  gamePicker: {
    minHeight: 42,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  gameOption: {
    minHeight: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  gameOptionText: {
    color: colors.textMuted,
    ...typography.micro,
    maxWidth: 96,
  },
  gameOptionTextActive: {
    color: colors.textInverse,
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  controlButton: {
    minWidth: '30%',
    minHeight: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  controlText: {
    color: colors.text,
    ...typography.micro,
    textTransform: 'uppercase',
  },
  economyRow: {
    minHeight: 64,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  economyMain: {
    flex: 1,
    minWidth: 0,
  },
  economyTitle: {
    color: colors.text,
    ...typography.caption,
  },
  economyMeta: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: 2,
  },
  economyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    width: 118,
  },
  miniButton: {
    minHeight: 28,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  miniText: {
    color: colors.textInverse,
    ...typography.micro,
    textTransform: 'uppercase',
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  dateButton: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dateText: {
    color: colors.text,
    ...typography.bodySmall,
  },
  datePlaceholder: {
    color: colors.textDim,
  },
  selectButton: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  selectText: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
  },
  selectPlaceholder: {
    color: colors.textDim,
  },
  selectChevron: {
    color: colors.primary,
    ...typography.micro,
  },
  selectPanel: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  selectSearch: {
    minHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    color: colors.text,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  selectList: {
    maxHeight: 178,
  },
  accountingBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  accountingText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  accountingPrize: {
    color: colors.coin,
    ...typography.subtitle,
  },
  teamDropdown: {
    maxHeight: 178,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  teamOption: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  teamOptionActive: {
    backgroundColor: colors.primarySoft,
  },
  teamOptionText: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
  },
  teamOptionTextActive: {
    color: colors.primary,
  },
  teamSelectedMark: {
    color: colors.primary,
    ...typography.micro,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    maxWidth: '100%',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    ...typography.caption,
    maxWidth: 220,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  statusLine: {
    color: colors.text,
    ...typography.caption,
  },
  syncSwitchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  syncSwitchCopy: {
    flex: 1,
    minWidth: 0,
  },
  syncStatusRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  importRow: {
    gap: spacing.sm,
  },
  importSummary: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.bodySmall,
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
    ...typography.bodySmall,
  },
  resultTeam: {
    color: colors.textMuted,
    ...typography.micro,
  },
  smallInput: {
    width: 48,
    minHeight: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  resultPoints: {
    width: 44,
    color: colors.coin,
    textAlign: 'right',
    ...typography.caption,
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
    ...typography.bodySmall,
  },
  leaderPoints: {
    color: colors.primary,
    ...typography.bodySmall,
  },
});

export default AdminScreen;
