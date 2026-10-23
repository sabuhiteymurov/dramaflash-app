import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, IconCircle, PosterCard, PrimaryButton, SectionHeader, Serif } from '../../components/ui';
import { getSeries, series, shelves, type Series } from '../../data/catalog';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

const genres = ['All', 'Romance', 'Drama', 'Action', 'Mystery', 'Fantasy'];
const spotlight = getSeries('verbotene-liebe');

const openSeries = (s: Series) => router.push(`/series/${s.id}`);

export default function Home() {
  const insets = useSafeAreaInsets();
  const { lastWatched } = useWallet();
  const [genre, setGenre] = useState('All');
  const resume = lastWatched ? getSeries(lastWatched.seriesId) : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image source={spotlight.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(5,6,10,0.7)', 'transparent', 'rgba(5,6,10,0.6)', colors.bg]}
          locations={[0, 0.25, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.logo}>
            <Feather name="heart" size={18} color={colors.accentInk} />
          </View>
          <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
            <Feather name="search" size={21} color={colors.text} />
            <Feather name="bell" size={21} color={colors.text} />
            <Image source={require('../../../assets/img/avatar.jpg')} style={styles.avatar} />
          </View>
        </View>
        <View style={styles.heroContent}>
          <View style={styles.tags}>
            <Text style={styles.spotlight}>Spotlight</Text>
            {spotlight.genres.map((g) => (
              <Text key={g} style={styles.tag}>
                {g} •
              </Text>
            ))}
          </View>
          <Serif style={styles.heroTitle}>{spotlight.title}</Serif>
          <Text style={styles.heroTagline}>{spotlight.tagline}</Text>
          <View style={styles.heroMeta}>
            <Feather name="star" size={14} color={colors.text} />
            <Text style={styles.heroMetaText}>{spotlight.rating}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.heroMetaText}>{spotlight.episodeCount} Episoden</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
            <PrimaryButton
              label="Jetzt ansehen"
              icon="play"
              style={{ flex: 1 }}
              onPress={() => router.push(`/player/${spotlight.id}?ep=1`)}
            />
            <IconCircle icon="plus" />
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {genres.map((g) => (
          <Chip key={g} label={g} active={g === genre} onPress={() => setGenre(g)} />
        ))}
      </ScrollView>

      {resume && lastWatched && (
        <Pressable style={styles.resume} onPress={() => router.push(`/player/${resume.id}?ep=${lastWatched.episode}`)}>
          <Image source={resume.poster} style={styles.resumeThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeLabel}>CONTINUE WATCHING</Text>
            <Serif style={{ fontSize: 16 }}>{resume.title}</Serif>
            <Text style={styles.resumeEp}>Episode {lastWatched.episode}</Text>
          </View>
          <View style={styles.resumePlay}>
            <Feather name="play" size={18} color={colors.accentInk} />
          </View>
        </Pressable>
      )}

      <View style={styles.genreTitle}>
        <LinearGradient colors={[colors.accent, colors.purple]} style={styles.genreMark} />
        <Serif style={{ fontSize: 24, color: colors.purple }}>{genre === 'All' ? 'Romance' : genre}</Serif>
      </View>

      {shelves.map((shelf) => {
        const items = shelf.ids.map(getSeries).filter((s) => genre === 'All' || s.genres.includes(genre) || genre === 'Romance');
        const data = items.length ? items : series.slice(0, 4);
        return (
          <View key={shelf.title} style={{ marginBottom: 28 }}>
            <SectionHeader title={shelf.title} />
            <FlatList
              horizontal
              data={data}
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
              renderItem={({ item }) => <PosterCard item={item} onPress={() => openSeries(item)} />}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 560, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  logo: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  heroContent: { paddingHorizontal: 20, paddingBottom: 8 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  spotlight: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.purple,
    backgroundColor: 'rgba(123,63,228,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tag: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  heroTitle: { fontSize: 34 },
  heroTagline: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14, marginTop: 4 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  heroMetaText: { fontFamily: fonts.regular, color: colors.text, fontSize: 14 },
  dot: { color: colors.textMuted, marginHorizontal: 4 },
  chips: { paddingHorizontal: 16, gap: 10, paddingVertical: 18 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resumeThumb: { width: 48, height: 64, borderRadius: 8 },
  resumeLabel: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, color: colors.accent, marginBottom: 2 },
  resumeEp: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  resumePlay: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  genreTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 18 },
  genreMark: { width: 22, height: 22, borderRadius: 3 },
});
