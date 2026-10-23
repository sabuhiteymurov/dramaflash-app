import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Card, PrimaryButton, Serif } from '../../components/ui';
import { useEvents } from '../../analytics';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
  const events = useEvents();
  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, padding: 16, gap: 16 }}>
      <Card style={styles.user}>
        <Image source={require('../../../assets/img/avatar.jpg')} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Serif style={{ fontSize: 18 }}>Guest viewer</Serif>
          <Body style={{ fontSize: 12 }}>
            <MaterialCommunityIcons name="crown-outline" size={12} /> {wallet.vip ? 'Premium Member' : 'Free plan'}
          </Body>
        </View>
      </Card>
      <Card style={styles.wallet}>
        <View>
          <Body style={{ fontSize: 12 }}>Coin balance</Body>
          <Text style={styles.coins}>
            <Feather name="zap" size={18} color={colors.accent} /> {wallet.coins}
          </Text>
        </View>
        <PrimaryButton label="Recharge" icon="plus" onPress={() => router.push('/coins')} style={{ height: 42 }} />
      </Card>
      <Card style={{ gap: 8 }}>
        <Serif style={{ fontSize: 16 }}>Event log</Serif>
        <Body style={{ fontSize: 12 }}>What the app would send to analytics. Newest first.</Body>
        {events.length === 0 && <Body style={{ fontSize: 12, color: colors.textFaint }}>Play an episode to see events.</Body>}
        {events.slice(0, 25).map((e, i) => (
          <View key={e.at + e.name + i} style={styles.event}>
            <Text style={styles.eventName}>{e.name}</Text>
            <Text style={styles.eventProps}>
              {Object.entries(e.props)
                .map(([k, v]) => `${k}=${v}`)
                .join('  ')}
            </Text>
          </View>
        ))}
      </Card>
      <Pressable onPress={wallet.reset} style={styles.reset}>
        <Feather name="rotate-ccw" size={14} color={colors.textMuted} />
        <Body style={{ fontSize: 13 }}>Reset prototype (coins, unlocks, VIP)</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  user: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  wallet: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coins: { fontFamily: fonts.semibold, color: colors.text, fontSize: 26, marginTop: 4 },
  event: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
  eventName: { fontFamily: fonts.semibold, color: colors.accent, fontSize: 12, lineHeight: 16 },
  eventProps: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 11, lineHeight: 15 },
  reset: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', padding: 12 },
});
