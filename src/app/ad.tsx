import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { track } from '../analytics';
import { Body, Serif } from '../components/ui';
import { useWallet } from '../store/wallet';
import { colors, fonts } from '../theme';

const AD_SECONDS = 5;

// In production the unlock is granted by the ad network's server-side reward callback, not this timer.
export default function RewardedAd() {
  const { seriesId, ep } = useLocalSearchParams<{ seriesId: string; ep: string }>();
  const insets = useSafeAreaInsets();
  const { unlockWithAd } = useWallet();
  const [left, setLeft] = useState(AD_SECONDS);

  useEffect(() => {
    if (left === 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const claim = () => {
    if (unlockWithAd(seriesId, Number(ep))) {
      track('ad_reward_granted', { series: seriesId, episode: Number(ep) });
      track('unlock_success', { series: seriesId, episode: Number(ep), method: 'ad' });
    }
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.top}>
        <Text style={styles.adLabel}>Ad</Text>
        <Text style={styles.timer}>{left > 0 ? `Reward in ${left}s` : 'Reward ready'}</Text>
      </View>

      <View style={styles.creative}>
        <Image source={require('../../assets/img/unlock-bg.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.creativeShade} />
        <Text style={styles.brand}>PARTNER BRAND</Text>
        <Serif style={styles.headline}>Your evening, upgraded.</Serif>
        <Body style={{ color: colors.text, textAlign: 'center' }}>Sample rewarded ad creative</Body>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((AD_SECONDS - left) / AD_SECONDS) * 100}%` }]} />
      </View>

      <Pressable
        onPress={claim}
        disabled={left > 0}
        style={({ pressed }) => [styles.claim, left > 0 && { opacity: 0.4 }, pressed && { opacity: 0.85 }]}
      >
        <Feather name="unlock" size={18} color={colors.accentInk} />
        <Text style={styles.claimText}>{left > 0 ? `Unlock Episode ${ep} in ${left}s` : `Unlock Episode ${ep}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  adLabel: {
    fontFamily: fonts.semibold,
    color: '#000',
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 12,
  },
  timer: { fontFamily: fonts.medium, color: colors.text, fontSize: 13 },
  creative: { flex: 1, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', padding: 24 },
  creativeShade: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  brand: { fontFamily: fonts.semibold, color: colors.gold, letterSpacing: 3, fontSize: 12 },
  headline: { fontSize: 28, textAlign: 'center', marginVertical: 8 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 16, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: colors.gold, borderRadius: 2 },
  claim: {
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  claimText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.accentInk },
});
