import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Card, PosterCard, Serif } from '../../components/ui';
import { getSeries } from '../../data/catalog';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

const saved = ['ceos-secret-life', 'schattenkuss', 'zweite-chance', 'blutige-rosen'];

export default function Library() {
  const insets = useSafeAreaInsets();
  const { lastWatched } = useWallet();
  const items = [lastWatched?.seriesId, ...saved].filter((id, i, all): id is string => !!id && all.indexOf(id) === i).slice(0, 4);

  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, padding: 16, paddingBottom: 32 }}>
      <Serif style={{ fontSize: 24, marginBottom: 16 }}>My Library</Serif>
      <View style={styles.grid}>
        {items.map((id) => {
          const s = getSeries(id);
          return <PosterCard key={id} item={s} width={170} onPress={() => router.push(`/series/${s.id}`)} />;
        })}
      </View>
      <Text style={styles.settings}>SETTINGS & MORE</Text>
      <Card style={{ padding: 0 }}>
        {(['Watch History', 'Purchases & Subscriptions', 'Notifications', 'Help & Support'] as const).map((label, i) => (
          <View key={label} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Body style={{ color: colors.text, flex: 1 }}>{label}</Body>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 20 },
  settings: { fontFamily: fonts.serif, color: colors.textMuted, letterSpacing: 1, marginTop: 28, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
});
