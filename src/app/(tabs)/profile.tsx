import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Card, PrimaryButton, Serif } from '../../components/ui';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
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
  reset: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', padding: 12 },
});
