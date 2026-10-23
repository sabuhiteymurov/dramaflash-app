import { Feather } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, type VideoPlayer } from 'expo-video';
import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Episode, Series } from '../data/catalog';
import { colors, fonts } from '../theme';
import { PrimaryButton, Serif } from './ui';

const CLIFFHANGER_AT = 7;

type Props = {
  series: Series;
  episode: Episode;
  height: number;
  player: VideoPlayer | null;
  active: boolean;
  playing: boolean;
  paused: boolean;
  locked: boolean;
  nextLocked: boolean;
  onTogglePause: () => void;
  onUnlock: (episodeNumber: number) => void;
};

function EpisodePageImpl({ series, episode, height, player, active, playing, paused, locked, nextLocked, onTogglePause, onUnlock }: Props) {
  const [liked, setLiked] = useState(false);
  const [firstFrame, setFirstFrame] = useState(false);

  useEffect(() => setFirstFrame(false), [player]);

  return (
    <View style={{ height, backgroundColor: '#000' }}>
      {locked ? (
        <>
          <Image source={episode.thumb} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={18} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,6,20,0.55)' }]} />
          <View style={styles.lockWrap}>
            <Text style={styles.lockKicker}>EPISODE {episode.number}</Text>
            <Serif style={styles.lockTitle}>Find out what happens next</Serif>
            <Pressable onPress={() => onUnlock(episode.number)} style={({ pressed }) => [styles.lockCard, pressed && { opacity: 0.85 }]}>
              <View style={styles.lockIcon}>
                <Feather name="lock" size={26} color={colors.text} />
                <View style={styles.lockCoin} />
              </View>
              <Text style={styles.lockLabel}>Unlock Episode {episode.number}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Pressable style={StyleSheet.absoluteFill} onPress={onTogglePause}>
          {player && (
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              nativeControls={false}
              playsInline
              onFirstFrameRender={() => setFirstFrame(true)}
            />
          )}
          {!firstFrame && !playing && <Image source={episode.thumb} style={StyleSheet.absoluteFill} contentFit="cover" />}
          {paused && (
            <View style={styles.center} pointerEvents="none">
              <View style={styles.pauseIcon}>
                <Feather name="play" size={34} color={colors.text} />
              </View>
            </View>
          )}
        </Pressable>
      )}

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomShade} pointerEvents="none" />

      {active && player && !locked && <PlaybackOverlay player={player} episode={episode} nextLocked={nextLocked} />}

      <View style={styles.rail}>
        <Pressable style={styles.railItem} onPress={() => setLiked((l) => !l)}>
          <Feather name="heart" size={26} color={liked ? colors.purple : colors.text} />
          <Text style={styles.railText}>{liked ? '12.1K' : '12K'}</Text>
        </Pressable>
        <View style={styles.railItem}>
          <Feather name="message-circle" size={26} color={colors.text} />
          <Text style={styles.railText}>342</Text>
        </View>
        <View style={styles.railItem}>
          <Feather name="share-2" size={24} color={colors.text} />
          <Text style={styles.railText}>Share</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Serif style={{ fontSize: 20 }}>{series.title}</Serif>
        <View style={styles.infoMeta}>
          <Text style={styles.epTag}>Ep {episode.number}</Text>
          <Text style={styles.infoText}>• {episode.title}</Text>
        </View>
        {locked && (
          <PrimaryButton
            label="Unlock"
            icon="unlock"
            onPress={() => onUnlock(episode.number)}
            style={{ alignSelf: 'flex-start', height: 42, marginTop: 12 }}
          />
        )}
      </View>
    </View>
  );
}

export const EpisodePage = memo(EpisodePageImpl);

function PlaybackOverlay({ player, episode, nextLocked }: { player: VideoPlayer; episode: Episode; nextLocked: boolean }) {
  const [time, setTime] = useState(player.currentTime);
  useEventListener(player, 'timeUpdate', ({ currentTime }) => setTime(currentTime));

  const line = episode.subtitles.find((l) => time >= l.from && time <= l.to);
  const progress = player.duration > 0 ? Math.min(time / player.duration, 1) : 0;
  const cliffhanger = time >= CLIFFHANGER_AT;

  return (
    <>
      {line && !cliffhanger && (
        <View style={styles.subtitleWrap} pointerEvents="none">
          <Text style={styles.subtitle}>{line.text}</Text>
        </View>
      )}
      {cliffhanger && (
        <View style={styles.center} pointerEvents="none">
          <Serif style={styles.tbc}>To be continued…</Serif>
          <Text style={styles.tbcNext}>
            {nextLocked ? `🔒 Episode ${episode.number + 1} is locked` : `Episode ${episode.number + 1} starts next`}
          </Text>
        </View>
      )}
      <View style={styles.progressTrack} pointerEvents="none">
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </>
  );
}

const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  center: { ...fill, alignItems: 'center', justifyContent: 'center' },
  pauseIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 260 },
  subtitleWrap: { position: 'absolute', left: 24, right: 72, bottom: 190, alignItems: 'center' },
  subtitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 24,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tbc: { fontSize: 32, color: colors.accent, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 12 },
  tbcNext: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginTop: 10 },
  lockWrap: { ...fill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  lockKicker: { fontFamily: fonts.semibold, color: colors.accent, letterSpacing: 2, fontSize: 12 },
  lockTitle: { fontSize: 24, textAlign: 'center', marginTop: 6, marginBottom: 22 },
  lockCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 26,
    borderRadius: 18,
    backgroundColor: 'rgba(16,24,58,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(94,231,245,0.25)',
  },
  lockIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  lockCoin: { position: 'absolute', right: 2, bottom: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gold },
  lockLabel: { fontFamily: fonts.semibold, color: colors.text, fontSize: 16 },
  rail: { position: 'absolute', right: 12, bottom: 150, alignItems: 'center', gap: 20 },
  railItem: { alignItems: 'center', gap: 4 },
  railText: { fontFamily: fonts.medium, color: colors.text, fontSize: 12 },
  info: { position: 'absolute', left: 16, right: 80, bottom: 40 },
  infoMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  epTag: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  infoText: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 13 },
  progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressFill: { height: 3, backgroundColor: colors.accent },
});
