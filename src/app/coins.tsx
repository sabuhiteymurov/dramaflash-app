import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Serif } from '../components/ui';
import { coinPacks } from '../data/catalog';
import { useWallet } from '../store/wallet';
import { colors, fonts } from '../theme';

export default function CoinStore() {
  const { need, tab } = useLocalSearchParams<{ need?: string; tab?: string }>();
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
  const [selected, setSelected] = useState(tab === 'vip' ? 'vip' : 'c800');
  const [buying, setBuying] = useState(false);

  const pack = coinPacks.find((p) => p.id === selected);

  // Stand-in for the StoreKit / Play Billing sheet. The real flow sends the receipt to the
  // backend for validation and only then credits coins, so a crash mid-purchase cannot lose them.
  const buy = () => {
    setBuying(true);
    setTimeout(() => {
      if (pack) wallet.addCoins(pack.coins + pack.bonus);
      else wallet.subscribe();
      setBuying(false);
      router.back();
    }, 900);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="chevron-left" size={26} color={colors.text} />
        </Pressable>
        <Serif style={{ fontSize: 20 }}>Recharge Coins</Serif>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.balance}>
          <Body style={{ color: colors.text }}>Your Balance</Body>
          <Text style={styles.balanceValue}>
            <Feather name="zap" size={15} color={colors.accent} /> {wallet.coins} Coins
          </Text>
        </View>
        {need && <Text style={styles.need}>You need {need} more coins for this unlock.</Text>}

        <View style={styles.grid}>
          {coinPacks.map((p) => {
            const active = selected === p.id;
            return (
              <Pressable key={p.id} onPress={() => setSelected(p.id)} style={[styles.pack, active && styles.packActive]}>
                {p.tag && <Text style={[styles.packTag, p.tag === 'BEST VALUE' && { backgroundColor: colors.purple }]}>{p.tag}</Text>}
                <Feather name="zap" size={26} color={colors.accent} />
                <Serif style={{ fontSize: 26, marginTop: 6 }}>{p.coins}</Serif>
                <Text style={styles.bonus}>{p.bonus ? `+ ${p.bonus} Bonus` : ' '}</Text>
                <View style={[styles.price, active && { backgroundColor: colors.accent }]}>
                  <Text style={[styles.priceText, active && { color: colors.accentInk }]}>{p.price}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR BEST DEAL</Text>
          <View style={styles.line} />
        </View>

        <Pressable onPress={() => setSelected('vip')} style={[styles.vip, selected === 'vip' && styles.packActive]}>
          <View style={styles.crown}>
            <MaterialCommunityIcons name="crown-outline" size={22} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Serif style={{ fontSize: 17 }}>VIP Membership</Serif>
            <Body style={{ fontSize: 12 }}>All episodes • No ads</Body>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.vipPrice}>€4.99</Text>
            <Body style={{ fontSize: 11 }}>/ Week</Body>
          </View>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.trust}>
          <Body style={{ fontSize: 12 }}>
            <Feather name="shield" size={12} /> Secure
          </Body>
          <Body style={{ fontSize: 12 }}>
            <Feather name="credit-card" size={12} /> App Store Pay
          </Body>
        </View>
        <Pressable onPress={buy} disabled={buying} style={({ pressed }) => [styles.buy, pressed && { opacity: 0.85 }]}>
          {buying ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Text style={styles.buyTitle}>{pack ? `Buy ${pack.coins + pack.bonus} Coins` : 'Start VIP'}</Text>
              <Body style={{ fontSize: 12 }}>{pack ? `for ${pack.price}` : '€4.99 / week, cancel anytime'}</Body>
            </>
          )}
        </Pressable>
        <Text style={styles.legal}>Prototype. No real payment is made. Subscriptions auto-renew unless canceled.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  balance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceValue: { fontFamily: fonts.semibold, color: colors.text, fontSize: 16 },
  need: { fontFamily: fonts.medium, color: colors.purple, marginTop: 10, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  pack: {
    width: '47.5%',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  packActive: { borderColor: colors.accent, borderWidth: 2 },
  packTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.accentInk,
    backgroundColor: colors.accent,
    paddingVertical: 2,
  },
  bonus: { fontFamily: fonts.medium, color: colors.accent, fontSize: 12, marginTop: 2, marginBottom: 12 },
  price: { backgroundColor: '#000', borderRadius: 10, paddingVertical: 8, width: '80%', alignItems: 'center' },
  priceText: { fontFamily: fonts.semibold, color: colors.text },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: fonts.medium, color: colors.textMuted, fontSize: 11, letterSpacing: 1 },
  vip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  crown: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  vipPrice: { fontFamily: fonts.semibold, color: colors.text, fontSize: 16 },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#11122A', borderTopWidth: 1, borderTopColor: colors.border },
  trust: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 10 },
  buy: {
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.purple },
  legal: { fontFamily: fonts.regular, color: colors.textFaint, fontSize: 10, textAlign: 'center', marginTop: 8 },
});
