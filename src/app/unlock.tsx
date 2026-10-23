import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { track } from '../analytics';
import { Body, PrimaryButton, Serif } from '../components/ui';
import { EPISODE_PRICE, getEpisodes, getSeries, seasonPrice, toEuro } from '../data/catalog';
import { AD_UNLOCKS_PER_DAY, useWallet } from '../store/wallet';
import { colors, fonts } from '../theme';

type Plan = 'ad' | 'episode' | 'season' | 'vip';

export default function UnlockSheet() {
  const params = useLocalSearchParams<{ seriesId: string; ep: string; plan?: Plan; trigger?: string }>();
  const wallet = useWallet();
  const series = getSeries(params.seriesId);
  const episodeNumber = Number(params.ep);
  const episode = getEpisodes(series)[episodeNumber - 1];
  const season = seasonPrice(series);
  const adAvailable = wallet.adUnlocksLeft > 0;
  const [plan, setPlan] = useState<Plan>(params.plan ?? (adAvailable ? 'ad' : 'episode'));

  const price = plan === 'episode' ? EPISODE_PRICE : plan === 'season' ? season : 0;
  const short = price > wallet.coins;

  useEffect(() => {
    track('paywall_view', { series: series.id, episode: episodeNumber, trigger: params.trigger ?? 'tap', coins: wallet.coins });
  }, []);

  useEffect(() => {
    if (wallet.vip) router.back();
  }, [wallet.vip]);

  const choose = (p: Plan) => {
    setPlan(p);
    track('unlock_option_selected', { series: series.id, episode: episodeNumber, option: p });
  };

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
        else wallet.unlockSeason(series.id, season);
        track('unlock_success', { series: series.id, episode: episodeNumber, method: plan === 'episode' ? 'coins' : 'season' });
        router.back();
    }
  };

  const cta =
    plan === 'ad'
      ? 'Watch Ad & Unlock'
      : plan === 'vip'
        ? 'See Premium'
        : short
          ? `Get ${price - wallet.coins} more coins`
          : `Unlock for ${price} coins (${toEuro(price)})`;

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
        <Body style={styles.sub}>Next up in {series.title}: “{episode.title}”.</Body>

        <View style={styles.balance}>
          <Body style={{ fontSize: 13 }}>Your balance</Body>
          <Text style={styles.balanceValue}>
            <Feather name="zap" size={13} color={colors.accent} /> {wallet.coins} coins · {toEuro(wallet.coins)}
          </Text>
        </View>

        <Option
          selected={plan === 'ad'}
          disabled={!adAvailable}
          onPress={() => choose('ad')}
          title="Watch a short ad"
          sub={adAvailable ? `${wallet.adUnlocksLeft} of ${AD_UNLOCKS_PER_DAY} free unlocks left today` : 'Daily free unlocks used, back tomorrow'}
          value="Free"
          icon={<MaterialCommunityIcons name="play-box-outline" size={18} color={colors.accent} />}
        />
        <Option
          selected={plan === 'episode'}
          onPress={() => choose('episode')}
          title="Unlock this episode"
          sub="Yours to rewatch"
          value={`${EPISODE_PRICE} coins`}
          sub2={toEuro(EPISODE_PRICE)}
        />
        <Option
          selected={plan === 'season'}
          onPress={() => choose('season')}
          title="Unlock the rest of the season"
          sub={`Episodes ${episodeNumber} - ${series.episodeCount}, about a third off`}
          value={`${season} coins`}
          sub2={toEuro(season)}
          badge="BEST VALUE"
        />
        <Option selected={plan === 'vip'} onPress={() => choose('vip')} title="Premium" sub="Every episode, no ads" value="€4.99" sub2="per week" />

        <PrimaryButton label={cta} icon={plan === 'ad' ? 'play' : short ? 'zap' : 'unlock'} onPress={confirm} style={{ marginTop: 18, alignSelf: 'stretch' }} />

        <View style={styles.auto}>
          <Body style={{ fontSize: 12, flex: 1 }}>Auto-unlock next episodes with coins. You can undo each one.</Body>
          <Switch
            value={wallet.autoUnlock}
            onValueChange={wallet.setAutoUnlock}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor="#fff"
          />
        </View>

        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.later}>Maybe Later</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Option({
  selected,
  disabled,
  onPress,
  title,
  sub,
  value,
  sub2,
  badge,
  icon,
}: {
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  title: string;
  sub: string;
  value: string;
  sub2?: string;
  badge?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.option, selected && styles.optionSelected, disabled && { opacity: 0.45 }]}>
      {badge && <Text style={styles.badge}>{badge}</Text>}
      <Feather name={selected ? 'check-circle' : 'circle'} size={18} color={selected ? colors.accent : colors.textMuted} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.optionTitle}>{title}</Text>
          {icon}
        </View>
        <Text style={styles.optionSub}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.optionValue, selected && { color: colors.accent }]}>{value}</Text>
        {sub2 && <Text style={styles.optionSub}>{sub2}</Text>}
      </View>
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
    padding: 18,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 90, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbLock: { alignItems: 'center', gap: 2, backgroundColor: 'rgba(0,0,0,0.45)', padding: 8, borderRadius: 10 },
  thumbLockText: { fontFamily: fonts.semibold, color: colors.text, fontSize: 9, letterSpacing: 1 },
  kicker: { fontFamily: fonts.serif, color: colors.accent, fontSize: 12, letterSpacing: 1, marginTop: 12 },
  title: { fontSize: 22, marginTop: 2 },
  sub: { textAlign: 'center', fontSize: 13, marginTop: 4, marginBottom: 12 },
  balance: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: 6, paddingHorizontal: 4 },
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
    paddingVertical: 10,
    marginTop: 9,
    backgroundColor: 'rgba(5,6,10,0.35)',
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: 'rgba(94,231,245,0.07)' },
  optionTitle: { fontFamily: fonts.semibold, color: colors.text, fontSize: 14, lineHeight: 19 },
  optionSub: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 11, lineHeight: 15, marginTop: 1 },
  optionValue: { fontFamily: fonts.semibold, color: colors.text, fontSize: 13, lineHeight: 18 },
  badge: {
    position: 'absolute',
    top: -9,
    right: 14,
    fontFamily: fonts.semibold,
    fontSize: 9,
    lineHeight: 13,
    color: colors.accentInk,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  auto: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch', marginTop: 14 },
  later: { fontFamily: fonts.medium, color: colors.textMuted, marginTop: 10 },
});
