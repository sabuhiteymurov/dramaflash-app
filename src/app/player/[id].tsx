import { Feather } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, type VideoPlayer } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type ListViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { track } from '../../analytics';
import { EpisodePage } from '../../components/EpisodePage';
import { EPISODE_PRICE, getEpisodes, getSeries, toEuro, type Episode } from '../../data/catalog';
import { useWallet } from '../../store/wallet';
import { colors, fonts } from '../../theme';

// Page i borrows slot i % 3, so the previous, current and next pages never share a player.
const POOL_SIZE = 3;

const setupPlayer = (p: VideoPlayer) => {
  p.muted = true; // the sample clips carry no audio, and browsers only autoplay muted video
  p.timeUpdateEventInterval = 0.25;
};

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

type Join = { ms: number; preloaded: boolean };

export default function Player() {
  const { id, ep } = useLocalSearchParams<{ id: string; ep?: string }>();
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
  const { isUnlocked } = wallet;
  const series = getSeries(id);
  const [episodes] = useState(() => getEpisodes(series));
  const startIndex = Math.min(Math.max(Number(ep ?? 1) - 1, 0), episodes.length - 1);

  const p0 = useVideoPlayer(null, setupPlayer);
  const p1 = useVideoPlayer(null, setupPlayer);
  const p2 = useVideoPlayer(null, setupPlayer);
  const pool = useMemo(() => [p0, p1, p2], [p0, p1, p2]);

  const [height, setHeight] = useState(0);
  const [active, setActive] = useState(startIndex);
  const [loaded, setLoaded] = useState<(number | null)[]>([null, null, null]);
  const [paused, setPaused] = useState(false);
  const [activePlaying, setActivePlaying] = useState(false);
  const [readyTick, setReadyTick] = useState(0);
  const [join, setJoin] = useState<Join | null>(null);
  const [showHud, setShowHud] = useState(true);
  const [toast, setToast] = useState<number | null>(null);

  const listRef = useRef<FlatList<Episode>>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const loadedRef = useRef(loaded);
  const focusedRef = useRef(true);
  const settle = useRef({ at: now(), preloaded: false, measured: false });

  useEffect(() => {
    const slot = active % POOL_SIZE;
    settle.current = {
      at: now(),
      preloaded: loadedRef.current[slot] === active && pool[slot].status === 'readyToPlay',
      measured: false,
    };
    setPaused(false);
    setActivePlaying(false);
  }, [active, pool]);

  useEffect(() => {
    const next = [...loadedRef.current];
    for (const i of [active, active + 1, active - 1]) {
      if (i < 0 || i >= episodes.length || !isUnlocked(series.id, episodes[i].number)) continue;
      const slot = i % POOL_SIZE;
      if (next[slot] !== i) {
        next[slot] = i;
        void pool[slot].replaceAsync(episodes[i].video);
        if (i === active) settle.current = { at: now(), preloaded: false, measured: false };
      }
      if (Platform.OS !== 'web') {
        pool[slot].bufferOptions = { preferredForwardBufferDuration: i === active ? 20 : 4, waitsToMinimizeStalling: true };
      }
    }
    loadedRef.current = next;
    setLoaded(next);
  }, [active, episodes, isUnlocked, pool, series.id]);

  // Re-runs on readyToPlay: browsers drop a play() issued while the source is still loading.
  useEffect(() => {
    pool.forEach((p, slot) => {
      if (loaded[slot] === active && !paused) {
        if (p.duration > 0 && p.currentTime >= p.duration - 0.2) p.currentTime = 0;
        p.play();
      } else {
        p.pause();
      }
    });
  }, [active, loaded, paused, pool, readyTick]);

  const openUnlock = useCallback(
    (episodeNumber: number, trigger: 'cliffhanger' | 'tap') =>
      router.push(`/unlock?seriesId=${series.id}&ep=${episodeNumber}&trigger=${trigger}`),
    [series.id],
  );

  const onEnded = useCallback(
    (index: number) => {
      const next = episodes[index + 1];
      if (!next) return;
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setActive(index + 1);
      if (isUnlocked(series.id, next.number)) return;
      if (wallet.autoUnlock && wallet.unlockWithCoins(series.id, next.number)) {
        track('unlock_success', { series: series.id, episode: next.number, method: 'auto_coins' });
        setToast(next.number);
        return;
      }
      setTimeout(() => openUnlock(next.number, 'cliffhanger'), 450);
    },
    [episodes, isUnlocked, openUnlock, series.id, wallet],
  );

  useEffect(() => {
    if (toast === null) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const onPlaying = useCallback(
    (slot: number, isPlaying: boolean) => {
      if (loadedRef.current[slot] !== activeRef.current) return;
      setActivePlaying(isPlaying);
      if (!isPlaying || settle.current.measured) return;
      settle.current.measured = true;
      const result = { ms: Math.round(now() - settle.current.at), preloaded: settle.current.preloaded };
      setJoin(result);
      const episode = episodes[activeRef.current];
      track('episode_start', { series: series.id, episode: episode.number, join_ms: result.ms, preloaded: result.preloaded });
    },
    [episodes, series.id],
  );

  const onSlotEnded = useCallback(
    (slot: number) => {
      const index = activeRef.current;
      if (loadedRef.current[slot] !== index) return;
      track('episode_complete', { series: series.id, episode: episodes[index].number });
      onEnded(index);
    },
    [episodes, onEnded, series.id],
  );

  const onReady = useCallback(() => setReadyTick((t) => t + 1), []);
  usePoolEvents(p0, 0, onPlaying, onSlotEnded, onReady);
  usePoolEvents(p1, 1, onPlaying, onSlotEnded, onReady);
  usePoolEvents(p2, 2, onPlaying, onSlotEnded, onReady);

  const activeEpisode = episodes[active];
  const activeUnlocked = isUnlocked(series.id, activeEpisode.number);
  const { setLastWatched } = wallet;
  useEffect(() => {
    if (activeUnlocked) setLastWatched({ seriesId: series.id, episode: activeEpisode.number });
  }, [activeEpisode.number, activeUnlocked, series.id, setLastWatched]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems[0];
    if (!focusedRef.current || first?.index == null) return;
    setActive(first.index);
  }).current;

  // On web a covered screen can lose its scroll offset.
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      if (height) listRef.current?.scrollToOffset({ offset: activeRef.current * height, animated: false });
      return () => {
        focusedRef.current = false;
      };
    }, [height]),
  );

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const unlockTap = useCallback((n: number) => openUnlock(n, 'tap'), [openUnlock]);
  const onLayout = (e: LayoutChangeEvent) => setHeight(Math.round(e.nativeEvent.layout.height));

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
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          extraData={loaded}
          renderItem={({ item, index }) => {
            const slot = index % POOL_SIZE;
            const isActive = index === active;
            return (
              <EpisodePage
                series={series}
                episode={item}
                height={height}
                player={loaded[slot] === index ? pool[slot] : null}
                active={isActive}
                playing={isActive && activePlaying}
                paused={isActive && paused}
                locked={!isUnlocked(series.id, item.number)}
                nextLocked={index + 1 < episodes.length && !isUnlocked(series.id, item.number + 1)}
                onTogglePause={togglePause}
                onUnlock={unlockTap}
              />
            );
          }}
        />
      )}

      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} style={styles.back}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => setShowHud((s) => !s)} style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={styles.pill}>
            Ep {activeEpisode.number} / {episodes.length}
          </Text>
          {showHud && join && (
            <Text style={[styles.pill, styles.hud]}>
              started in {join.ms} ms · {join.preloaded ? 'preloaded' : 'cold'}
            </Text>
          )}
        </Pressable>
      </View>

      {toast !== null && (
        <View style={[styles.toast, { bottom: insets.bottom + 110 }]}>
          <Text style={styles.toastText}>
            Episode {toast} unlocked · {EPISODE_PRICE} coins ({toEuro(EPISODE_PRICE)})
          </Text>
          <Pressable
            onPress={() => {
              wallet.refund(series.id, toast);
              setToast(null);
            }}
            hitSlop={8}
          >
            <Text style={styles.undo}>Undo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function usePoolEvents(
  player: VideoPlayer,
  slot: number,
  onPlaying: (slot: number, isPlaying: boolean) => void,
  onEnded: (slot: number) => void,
  onReady: () => void,
) {
  useEventListener(player, 'playingChange', ({ isPlaying }) => onPlaying(slot, isPlaying));
  useEventListener(player, 'playToEnd', () => onEnded(slot));
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') onReady();
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { position: 'absolute', left: 12, right: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  pill: {
    fontFamily: fonts.semibold,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hud: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 15, color: colors.accent },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(20,21,38,0.96)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: { fontFamily: fonts.medium, color: colors.text, fontSize: 13, flex: 1 },
  undo: { fontFamily: fonts.semibold, color: colors.accent, fontSize: 14 },
});
