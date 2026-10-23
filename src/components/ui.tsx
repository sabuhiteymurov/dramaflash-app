import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import type { Series } from '../data/catalog';
import { colors, fonts } from '../theme';

// Without an explicit line height, web crops the descenders of clipped Text.
const withLineHeight = (style: TextProps['style'], fallbackSize: number, ratio: number) => {
  const flat = StyleSheet.flatten(style) ?? {};
  return flat.lineHeight ? null : { lineHeight: Math.round((flat.fontSize ?? fallbackSize) * ratio) };
};

export function Serif({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: fonts.serif, color: colors.text, fontSize: 14 }, style, withLineHeight(style, 14, 1.3)]} />;
}

export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14 }, style, withLineHeight(style, 14, 1.4)]} />;
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  style,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }, style]}
    >
      {icon && <Feather name={icon} size={18} color={colors.accentInk} />}
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function IconCircle({ icon, onPress }: { icon: keyof typeof Feather.glyphMap; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.iconCircle} hitSlop={8}>
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipLabel, active && { color: colors.accentInk }]}>{label}</Text>
    </Pressable>
  );
}

export function ProBadge() {
  return (
    <LinearGradient colors={[colors.accent, colors.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pro}>
      <MaterialCommunityIcons name="crown-outline" size={10} color={colors.accentInk} />
      <Text style={styles.proLabel}>PRO</Text>
    </LinearGradient>
  );
}

export function SectionHeader({ title, action = 'See all' }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Serif style={{ fontSize: 19 }}>{title}</Serif>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  );
}

export function PosterCard({ item, onPress, width = 128 }: { item: Series; onPress: () => void; width?: number }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width }, pressed && { opacity: 0.8 }]}>
      <View style={[styles.poster, { width, height: width * 1.5 }]}>
        <Image source={item.poster} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.posterShade} />
        {item.pro && (
          <View style={{ position: 'absolute', top: 6, left: 6 }}>
            <ProBadge />
          </View>
        )}
        <View style={styles.posterMeta}>
          <Text style={styles.posterMetaText}>{item.episodeCount} Eps</Text>
          <Text style={styles.posterMetaText}>{item.viewsPerEpisode}/ep</Text>
        </View>
      </View>
      <Serif style={styles.posterTitle} numberOfLines={2}>
        {item.title}
      </Serif>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  primary: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 22,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.accentInk },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipLabel: { fontFamily: fonts.medium, color: colors.text, fontSize: 14 },
  pro: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proLabel: { fontFamily: fonts.semibold, fontSize: 10, color: colors.accentInk },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionAction: { fontFamily: fonts.medium, color: colors.accent, fontSize: 13 },
  poster: { borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface },
  posterShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 48 },
  posterMeta: { position: 'absolute', left: 8, right: 8, bottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  posterMetaText: { fontFamily: fonts.medium, color: '#fff', fontSize: 11 },
  posterTitle: { fontSize: 14, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 },
});
