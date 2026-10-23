import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EpisodePage } from '../../components/EpisodePage';
import { getEpisodes, getSeries, type Episode } from '../../data/catalog';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

export default function Player() {
  const { id, ep } = useLocalSearchParams<{ id: string; ep?: string }>();
  const insets = useSafeAreaInsets();
  const { isUnlocked, setLastWatched } = useWallet();
  const series = getSeries(id);
  const [episodes] = useState(() => getEpisodes(series));
  const startIndex = Math.min(Math.max(Number(ep ?? 1) - 1, 0), episodes.length - 1);

  const [height, setHeight] = useState(0);
  const [active, setActive] = useState(startIndex);
  const listRef = useRef<FlatList<Episode>>(null);

  // On web a covered screen can lose its scroll offset; put the feed back on the active page
  // whenever the player regains focus (after the unlock sheet, coin store or ad).
  const activeRef = useRef(active);
  activeRef.current = active;
  const focusedRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      if (height) listRef.current?.scrollToOffset({ offset: activeRef.current * height, animated: false });
      return () => {
        focusedRef.current = false;
      };
    }, [height]),
  );

  const onLayout = (e: LayoutChangeEvent) => setHeight(Math.round(e.nativeEvent.layout.height));

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!height || !focusedRef.current) return;
    const index = Math.round(e.nativeEvent.contentOffset.y / height);
    if (index !== active && index >= 0 && index < episodes.length) setActive(index);
  };

  const activeEpisode = episodes[active];
  const activeUnlocked = isUnlocked(series.id, activeEpisode.number);
  useEffect(() => {
    if (activeUnlocked) setLastWatched({ seriesId: series.id, episode: activeEpisode.number });
  }, [activeEpisode.number, activeUnlocked, series.id, setLastWatched]);

  const openUnlock = useCallback(
    (episodeNumber: number) => router.push(`/unlock?seriesId=${series.id}&ep=${episodeNumber}`),
    [series.id],
  );

  // Binge loop: when an episode ends, move to the next one. If the next one is locked this is the
  // cliffhanger moment, so the unlock sheet opens on top of the locked page.
  const onEnded = useCallback(
    (index: number) => {
      const next = episodes[index + 1];
      if (!next) return;
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setActive(index + 1);
      if (!isUnlocked(series.id, next.number)) setTimeout(() => openUnlock(next.number), 450);
    },
    [episodes, isUnlocked, openUnlock, series.id],
  );

  return (
    <View style={styles.root} onLayout={onLayout}>
      {height > 0 && (
        <FlatList
          ref={listRef}
          data={episodes}
          keyExtractor={(e) => String(e.number)}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <EpisodePage
              series={series}
              episode={item}
              total={episodes.length}
              height={height}
              active={index === active}
              // Mount a player for the visible page and its neighbours only. The next episode
              // buffers while the current one plays, which is what makes the swipe feel instant.
              preload={Math.abs(index - active) <= 1}
              locked={!isUnlocked(series.id, item.number)}
              nextLocked={index + 1 < episodes.length && !isUnlocked(series.id, item.number + 1)}
              onEnded={() => onEnded(index)}
              onUnlock={() => openUnlock(item.number)}
            />
          )}
        />
      )}

      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} style={styles.back}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.counter}>
          Ep {activeEpisode.number} / {episodes.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { position: 'absolute', left: 12, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  counter: {
    fontFamily: fonts.semibold,
    color: colors.text,
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
