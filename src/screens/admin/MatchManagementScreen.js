import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { showSuccess } from '../../utils/feedback';

const matchStatusOptions = ['Upcoming', 'Live', 'Completed', 'Cancelled'];

const initialMatches = [
  {
    id: 'match-preview-1',
    title: 'Tournament Match 1',
    status: 'Upcoming',
    matchUrl: 'https://www.16score.com/',
    startTime: 'Not scheduled',
    endTime: 'Not scheduled',
  },
];

const MatchManagementScreen = ({ navigation }) => {
  const [matches, setMatches] = useState(initialMatches);
  const [selectedId, setSelectedId] = useState(initialMatches[0].id);
  const selectedMatch = matches.find((match) => match.id === selectedId) || matches[0];

  const updateSelected = (patch) => {
    setMatches((current) =>
      current.map((match) => (match.id === selectedId ? { ...match, ...patch } : match))
    );
  };

  const refresh = () => {
    updateSelected({ refreshedAt: new Date().toLocaleString() });
    showSuccess('Match refreshed');
  };

  return (
    <Screen>
      <Header title="Match Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AdminSection title="Match List" glow>
          <SearchableSelector
            label="Select Match"
            value={selectedMatch.title}
            options={matches.map((match) => match.title)}
            onSelect={(title) => {
              const match = matches.find((item) => item.title === title);
              if (match) setSelectedId(match.id);
            }}
          />
          <View style={styles.matchHeader}>
            <Text style={styles.title}>{selectedMatch.title}</Text>
            <StatusChip label={selectedMatch.status} status={selectedMatch.status.toLowerCase()} />
          </View>
        </AdminSection>

        <AdminSection title="Match Details">
          <Input label="Match URL" value={selectedMatch.matchUrl} onChangeText={(matchUrl) => updateSelected({ matchUrl })} autoCapitalize="none" />
          <SearchableSelector
            label="Match Status"
            value={selectedMatch.status}
            options={matchStatusOptions}
            onSelect={(status) => updateSelected({ status })}
          />
          <Input label="Start Time" value={selectedMatch.startTime} onChangeText={(startTime) => updateSelected({ startTime })} />
          <Input label="End Time" value={selectedMatch.endTime} onChangeText={(endTime) => updateSelected({ endTime })} />
          <Button title="Manual Refresh" onPress={refresh} />
        </AdminSection>

        <AdminSection title="Current Match">
          <AdminInfoRow label="Match Status" value={selectedMatch.status} />
          <AdminInfoRow label="Match URL" value={selectedMatch.matchUrl} />
          <AdminInfoRow label="Start Time" value={selectedMatch.startTime} />
          <AdminInfoRow label="End Time" value={selectedMatch.endTime} />
          <AdminInfoRow label="Last Refresh" value={selectedMatch.refreshedAt || 'Not refreshed yet'} />
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
  matchHeader: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    ...typography.h3,
  },
});

export default MatchManagementScreen;
