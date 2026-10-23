import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, PrimaryButton, Serif } from '../components/ui';
import { EPISODE_PRICE, getEpisodes, getSeries, SEASON_PRICE } from '../data/catalog';
import { useWallet } from '../store/wallet';
import { colors, fonts } from '../theme';

type Plan = 'ad' | 'episode' | 'season' | 'vip';

export default function UnlockSheet() {
  const params = useLocalSearchParams<{ seriesId: string; ep: string; plan?: Plan }>();
  const wallet = useWallet();
  const series = getSeries(params.seriesId);
  const episodeNumber = Number(params.ep);
  const episode = getEpisodes(series)[episodeNumber - 1];
  const [plan, setPlan] = useState<Plan>(params.plan ?? 'episode');

  const price = plan === 'episode' ? EPISODE_PRICE : plan === 'season' ? SEASON_PRICE : 0;
  const short = price > wallet.coins;

  const confirm = () => {
    switch (plan) {
      case 'ad':
        router.replace(`/ad?seriesId=${series.id}&ep=${episodeNumber}`);
        return;
      case 'vip':
        router.push('/coins?tab=vip');
        return;
      case 'episode':
      case 'season':
        if (short) {
          router.push(`/coins?need=${price - wallet.coins}`);
          return;
        }
        if (plan === 'episode') wallet.unlockWithCoins(series.id, episodeNumber);
        else wallet.unlockSeason(series.id);
        router.back();
    }
  };

  // Premium bought on the store screen while this sheet was open: nothing left to choose.
  useEffect(() => {
    if (wallet.vip) router.back();
  }, [wallet.vip]);

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={styles.sheet}>
        <View style={styles.thumb}>
          <Image source={episode.thumb} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={6} />
          <View style={styles.thumbLock}>
            <Feather name="lock" size={16} color={colors.text} />
            <Text style={styles.thumbLockText}>LOCKED</Text>
          </View>
        </View>
        <Text style={styles.kicker}>EPISODE {episodeNumber}</Text>
        <Serif style={styles.title}>Continue the romance</Serif>
        <Body style={styles.sub}>Unlock this episode and find out what happens next in {series.title}.</Body>

        <View style={styles.balance}>
          <Body style={{ fontSize: 13 }}>Your balance</Body>
          <Text style={styles.balanceValue}>
            <Feather name="zap" size={13} color={colors.accent} /> {wallet.coins} Coins
          </Text>
        </View>

        <Option
          selected={plan === 'ad'}
          onPress={() => setPlan('ad')}
          title="Watch a short ad"
          sub="Free • unlocks this episode"
          value="Free"
          icon={<MaterialCommunityIcons name="play-box-outline" size={18} color={colors.accent} />}
        />
        <Option selected={plan === 'episode'} onPress={() => setPlan('episode')} title="Unlock Episode" sub="One-time access" value={`${EPISODE_PRICE} Coins`} />
        <Option
          selected={plan === 'season'}
          onPress={() => setPlan('season')}
          title="Unlock Full Season"
          sub={`Episodes ${episodeNumber} - ${series.episodeCount}`}
          value={`${SEASON_PRICE} Coins`}
          badge="BEST VALUE"
        />
        <Option selected={plan === 'vip'} onPress={() => setPlan('vip')} title="Premium Membership" sub="Unlimited access • No ads" value="€4.99/wk" />

        <PrimaryButton
          label={plan === 'ad' ? 'Watch Ad & Unlock' : short ? `Get ${price - wallet.coins} more coins` : plan === 'vip' ? 'Go Premium' : 'Unlock Now'}
          icon={plan === 'ad' ? 'play' : short ? 'zap' : 'unlock'}
          onPress={confirm}
          style={{ marginTop: 18, alignSelf: 'stretch' }}
        />
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.later}>Maybe Later</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Option({
  selected,
  onPress,
  title,
  sub,
  value,
  badge,
  icon,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  sub: string;
  value: string;
  badge?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected && styles.optionSelected]}>
      {badge && <Text style={styles.badge}>{badge}</Text>}
      <Feather name={selected ? 'check-circle' : 'circle'} size={18} color={selected ? colors.accent : colors.textMuted} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.optionTitle}>{title}</Text>
          {icon}
        </View>
        <Text style={styles.optionSub}>{sub}</Text>
      </View>
      <Text style={[styles.optionValue, selected && { color: colors.accent }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  sheet: {
    backgroundColor: '#1A1A35',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  thumb: { width: 84, height: 104, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbLock: { alignItems: 'center', gap: 2, backgroundColor: 'rgba(0,0,0,0.45)', padding: 8, borderRadius: 10 },
  thumbLockText: { fontFamily: fonts.semibold, color: colors.text, fontSize: 9, letterSpacing: 1 },
  kicker: { fontFamily: fonts.serif, color: colors.accent, fontSize: 12, letterSpacing: 1, marginTop: 14 },
  title: { fontSize: 24, marginTop: 4 },
  sub: { textAlign: 'center', fontSize: 13, marginTop: 6, marginBottom: 14, lineHeight: 19 },
  balance: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: 10, paddingHorizontal: 4 },
  balanceValue: { fontFamily: fonts.semibold, color: colors.text, fontSize: 13 },
  option: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    backgroundColor: 'rgba(5,6,10,0.35)',
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: 'rgba(94,231,245,0.07)' },
  optionTitle: { fontFamily: fonts.semibold, color: colors.text, fontSize: 14 },
  optionSub: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 11, marginTop: 2 },
  optionValue: { fontFamily: fonts.semibold, color: colors.text, fontSize: 13 },
  badge: {
    position: 'absolute',
    top: -9,
    right: 14,
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.accentInk,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  later: { fontFamily: fonts.medium, color: colors.textMuted, marginTop: 14 },
});
