import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AdminInfoRow from '../../components/admin/AdminInfoRow';
import AdminSection from '../../components/admin/AdminSection';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Screen from '../../components/common/Screen';
import SearchableSelector from '../../components/common/SearchableSelector';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import {
  createTournament,
  deleteTournament as deleteTournamentRequest,
  getTournaments,
  syncTournamentById,
  updateTournament,
} from '../../services/tournamentService';
import { showError, showSuccess } from '../../utils/feedback';

const sourceOptions = ['16Score', 'Manual'];
const statusOptions = ['Draft', 'Upcoming', 'Live', 'Completed', 'Archived'];

const initialForm = {
  name: '',
  status: 'Draft',
  source: '16Score',
  sourceUrl: '',
  autoSync: false,
};

const getId = (item = {}) => String(item.id || item._id || '');
const toSourceLabel = (source = '') => (String(source).toLowerCase() === '16score' ? '16Score' : 'Manual');
const toStatusLabel = (status = '') => {
  const normalized = String(status || 'draft').toLowerCase();
  return statusOptions.find((item) => item.toLowerCase() === normalized) || 'Draft';
};
const toApiStatus = (status = '') => String(status || 'draft').toLowerCase();

const getFormFromTournament = (tournament = {}) => ({
  name: tournament.name || '',
  status: toStatusLabel(tournament.status),
  source: toSourceLabel(tournament.source),
  sourceUrl: tournament.sourceUrl || tournament.matchesUrl || '',
  autoSync: Boolean(tournament.autoSync),
});

const TournamentManagementScreen = ({ navigation }) => {
  const [form, setForm] = useState(initialForm);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const apiSource = useMemo(() => form.source === '16Score' ? '16score' : 'manual', [form.source]);
  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => getId(tournament) === selectedTournamentId) || null,
    [selectedTournamentId, tournaments]
  );
  const tournamentNames = useMemo(() => tournaments.map((tournament) => tournament.name), [tournaments]);

  const loadTournaments = async () => {
    setLoadingTournaments(true);
    try {
      const data = await getTournaments();
      setTournaments(data);

      if (!selectedTournamentId && data[0]) {
        setSelectedTournamentId(getId(data[0]));
        setForm(getFormFromTournament(data[0]));
        setSyncResult(data[0].lastSyncSummary || null);
      }
    } catch (error) {
      showError('Tournament load failed', error);
    } finally {
      setLoadingTournaments(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const updateForm = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
    setSyncResult(null);
  };

  const validate = () => {
    if (!form.name.trim()) {
      Alert.alert('Tournament required', 'Tournament Name is required.');
      return false;
    }

    if (!form.source) {
      Alert.alert('Source required', 'Tournament Source is required.');
      return false;
    }

    if (apiSource === '16score') {
      if (!form.sourceUrl.trim()) {
        Alert.alert('Source URL required', 'Tournament Source URL is required for 16Score.');
        return false;
      }

      if (!form.sourceUrl.trim().startsWith('https://www.16score.com/')) {
        Alert.alert('Invalid URL', 'Tournament Source URL must start with https://www.16score.com/.');
        return false;
      }
    }

    return true;
  };

  const getPayload = () => ({
    name: form.name.trim(),
    status: toApiStatus(form.status),
    source: apiSource,
    sourceUrl: form.sourceUrl.trim(),
    autoSync: form.autoSync,
  });

  const saveTournament = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = getPayload();
      const savedTournament = selectedTournament
        ? await updateTournament({ tournamentId: getId(selectedTournament), ...payload })
        : await createTournament(payload);

      await loadTournaments();
      setSelectedTournamentId(getId(savedTournament));
      setForm(getFormFromTournament(savedTournament));
      setSyncResult(savedTournament.lastSyncSummary || null);
      showSuccess(selectedTournament ? 'Tournament updated' : 'Tournament created');
    } catch (error) {
      showError(selectedTournament ? 'Tournament update failed' : 'Tournament creation failed', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteTournament = () => {
    if (!selectedTournament) {
      Alert.alert('Tournament required', 'Create or select a tournament first.');
      return;
    }

    Alert.alert('Delete tournament?', `Delete ${selectedTournament.name}?`, [
      { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteTournamentRequest(getId(selectedTournament));
            setSelectedTournamentId('');
            setForm(initialForm);
            setSyncResult(null);
            await loadTournaments();
            showSuccess('Tournament deleted');
          } catch (error) {
            showError('Tournament delete failed', error);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const syncSelectedTournament = async () => {
    if (!validate()) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const payload = getPayload();
      const tournament = selectedTournament
        ? await updateTournament({ tournamentId: getId(selectedTournament), ...payload })
        : await createTournament(payload);
      const response = await syncTournamentById(getId(tournament));

      setSyncResult({
        discovered: response.discovered || 0,
        synced: response.synced || 0,
        failed: response.failed || 0,
        syncedAt: new Date().toLocaleString(),
      });
      setSelectedTournamentId(getId(tournament));
      await loadTournaments();
      showSuccess('Tournament synced successfully.');
    } catch (error) {
      showError('Tournament sync failed', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Screen>
      <Header title="Tournament Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AdminSection title="Tournament Form" glow>
          <SearchableSelector
            label="View Tournament"
            value={selectedTournament?.name || ''}
            placeholder={loadingTournaments ? 'Loading tournaments' : 'Select tournament'}
            options={tournamentNames}
            onSelect={(name) => {
              const tournament = tournaments.find((item) => item.name === name);
              if (!tournament) return;
              setSelectedTournamentId(getId(tournament));
              setForm(getFormFromTournament(tournament));
              setSyncResult(tournament.lastSyncSummary || null);
            }}
            emptyText="No tournaments found."
            disabled={loadingTournaments}
          />
          <Input label="Tournament Name" value={form.name} onChangeText={(name) => updateForm({ name })} placeholder="Champions Circuit" />
          <SearchableSelector
            label="Tournament Status"
            value={form.status}
            options={statusOptions}
            onSelect={(status) => updateForm({ status })}
          />
          <SearchableSelector
            label="Tournament Source"
            value={form.source}
            options={sourceOptions}
            onSelect={(source) => updateForm({ source, sourceUrl: source === '16Score' ? form.sourceUrl : '' })}
          />
          <Input
            label="Tournament Source URL"
            value={form.sourceUrl}
            onChangeText={(sourceUrl) => updateForm({ sourceUrl })}
            placeholder="https://www.16score.com/..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.label}>Auto Sync</Text>
              <Text style={styles.meta}>{form.autoSync ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={form.autoSync}
              onValueChange={(autoSync) => updateForm({ autoSync })}
              disabled={syncing}
              trackColor={{ false: colors.surfaceMuted, true: colors.primarySoft }}
              thumbColor={form.autoSync ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.actions}>
            <Button title="Create Tournament" onPress={saveTournament} loading={saving && !selectedTournament} disabled={syncing || saving} />
            <Button title="Edit Tournament" variant="outline" onPress={saveTournament} loading={saving && Boolean(selectedTournament)} disabled={syncing || saving || !selectedTournament} />
            <Button title="Delete Tournament" variant="purple" onPress={deleteTournament} disabled={syncing || saving || !selectedTournament} />
          </View>
          <Button
            title={syncing ? 'Syncing...' : 'Sync Tournament'}
            loading={syncing}
            disabled={syncing}
            onPress={syncSelectedTournament}
          />
        </AdminSection>

        <AdminSection title="View Tournament">
          <View style={styles.statusHeader}>
            <Text style={styles.tournamentTitle}>{selectedTournament?.name || form.name || 'No tournament selected'}</Text>
            <StatusChip label={selectedTournament?.status || form.status} status="upcoming" />
          </View>
          <AdminInfoRow label="Tournament Source" value={selectedTournament?.source || form.source} />
          <AdminInfoRow label="Tournament Source URL" value={selectedTournament?.sourceUrl || form.sourceUrl} />
          <AdminInfoRow label="Auto Sync" value={(selectedTournament?.autoSync ?? form.autoSync) ? 'Enabled' : 'Disabled'} />
          <AdminInfoRow label="Updated" value={selectedTournament?.updatedAt ? new Date(selectedTournament.updatedAt).toLocaleString() : 'Not saved yet'} />
          {syncResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Tournament synced successfully.</Text>
              <Text style={styles.meta}>Discovered: {syncResult.discovered || 0}</Text>
              <Text style={styles.meta}>Synced: {syncResult.synced || 0}</Text>
              <Text style={styles.meta}>Failed: {syncResult.failed || 0}</Text>
            </View>
          )}
        </AdminSection>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: 140,
    gap: spacing.md,
  },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchCopy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    ...typography.label,
  },
  meta: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
  statusHeader: {
    gap: spacing.sm,
  },
  tournamentTitle: {
    color: colors.text,
    ...typography.h3,
  },
  resultBox: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
  },
  resultTitle: {
    color: colors.primary,
    ...typography.subtitle,
  },
});

export default TournamentManagementScreen;
