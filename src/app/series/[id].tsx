import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, IconCircle, PrimaryButton, Serif } from '../../components/ui';
import { getEpisodes, getSeries, SEASON_PRICE } from '../../data/catalog';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

const VISIBLE_EPISODES = 8;

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isUnlocked } = useWallet();
  const s = getSeries(id);
  const episodes = getEpisodes(s).slice(0, VISIBLE_EPISODES);

  const play = (ep: number) =>
    isUnlocked(s.id, ep) ? router.push(`/player/${s.id}?ep=${ep}`) : router.push(`/unlock?seriesId=${s.id}&ep=${ep}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={s.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(5,6,10,0.5)', 'transparent', colors.bg]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Feather name="chevron-left" size={26} color={colors.text} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <Feather name="heart" size={22} color={colors.text} />
              <Feather name="share" size={22} color={colors.text} />
            </View>
          </View>
          <View style={styles.heroBottom}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              {s.genres.map((g) => (
                <Text key={g} style={styles.genre}>
                  {g}
                </Text>
              ))}
            </View>
            <Serif style={{ fontSize: 30 }}>{s.title}</Serif>
            <View style={styles.meta}>
              <Feather name="star" size={14} color={colors.text} />
              <Text style={styles.metaText}>
                {s.rating} <Text style={{ color: colors.textMuted }}>({s.reviews})</Text>
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{s.year}</Text>
              <Text style={styles.dot}>•</Text>
              <Feather name="list" size={14} color={colors.text} />
              <Text style={styles.metaText}>{s.episodeCount} Eps</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
          <PrimaryButton label="Play Ep 1" icon="play" style={{ flex: 1 }} onPress={() => play(1)} />
          <IconCircle icon="heart" />
        </View>

        <View style={styles.section}>
          <Serif style={styles.h2}>Synopsis</Serif>
          <Body style={{ lineHeight: 22 }}>{s.synopsis}</Body>
          <View style={styles.why}>
            <Serif style={{ fontSize: 14, marginBottom: 8 }}>✦ Why you’ll love it</Serif>
            {s.highlights.map((h) => (
              <Body key={h} style={{ marginTop: 4, color: colors.text }}>
                🔥 {h}
              </Body>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Serif style={styles.h2}>Cast & Crew</Serif>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {s.cast.map((c) => (
              <View key={c.name} style={{ alignItems: 'center', width: 80 }}>
                <Image source={c.photo} style={styles.castPhoto} />
                <Text style={styles.castName}>{c.name}</Text>
                <Text style={styles.castRole} numberOfLines={1}>
                  {c.role}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Serif style={[styles.h2, { marginBottom: 0 }]}>Episodes</Serif>
            <Text style={styles.count}>{s.episodeCount}</Text>
          </View>

          <Pressable onPress={() => router.push(`/unlock?seriesId=${s.id}&ep=4&plan=season`)}>
            <LinearGradient colors={['#2A1840', '#1A1530']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.season}>
              <View>
                <Serif style={{ fontSize: 16 }}>Unlock Full Season</Serif>
                <Body style={{ fontSize: 12, marginTop: 2 }}>Save 40% with the bundle</Body>
              </View>
              <Text style={styles.seasonPrice}>{SEASON_PRICE} coins</Text>
            </LinearGradient>
          </Pressable>

          {episodes.map((ep) => {
            const open = isUnlocked(s.id, ep.number);
            return (
              <Pressable key={ep.number} style={styles.episode} onPress={() => play(ep.number)}>
                <View style={styles.thumb}>
                  <Image source={ep.thumb} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <View style={[styles.thumbIcon, !open && { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                    <Feather name={open ? 'play' : 'lock'} size={14} color={open ? colors.accentInk : colors.text} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Serif style={{ fontSize: 15 }}>
                    {ep.number}. {ep.title}
                  </Serif>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, alignItems: 'center' }}>
                    <Body style={{ fontSize: 12 }}>⏱ {ep.duration}</Body>
                    {!open && <Text style={styles.unlock}>Unlock 🔒</Text>}
                  </View>
                </View>
              </Pressable>
            );
          })}
          <Text style={styles.more}>Show more episodes ›</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 460, justifyContent: 'space-between', marginBottom: 16 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  heroBottom: { paddingHorizontal: 20 },
  genre: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(20,21,38,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontFamily: fonts.regular, color: colors.text, fontSize: 14 },
  dot: { color: colors.textMuted, marginHorizontal: 4 },
  section: { paddingHorizontal: 20, marginTop: 30 },
  h2: { fontSize: 20, marginBottom: 12 },
  why: { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  castPhoto: { width: 64, height: 64, borderRadius: 32, marginBottom: 6 },
  castName: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text },
  castRole: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  count: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  season: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D2A5C',
    marginBottom: 12,
  },
  seasonPrice: {
    fontFamily: fonts.semibold,
    color: '#fff',
    backgroundColor: colors.purpleDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  episode: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  thumb: { width: 112, height: 63, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  unlock: { fontFamily: fonts.medium, fontSize: 12, color: colors.purple },
  more: { fontFamily: fonts.medium, color: colors.textMuted, textAlign: 'center', marginTop: 16 },
});
