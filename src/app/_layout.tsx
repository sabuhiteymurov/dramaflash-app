import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletProvider } from '../store/wallet';
import { colors, MAX_APP_WIDTH } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts({ PlayfairDisplay_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  if (!loaded) return <View style={styles.page} />;

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <StatusBar style="light" />
        <View style={styles.page}>
          <View style={styles.app}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="series/[id]" />
              <Stack.Screen name="player/[id]" options={{ animation: 'fade' }} />
              <Stack.Screen
                name="unlock"
                options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}
              />
              <Stack.Screen name="coins" options={{ presentation: 'modal' }} />
              <Stack.Screen name="ad" options={{ presentation: 'transparentModal', animation: 'fade' }} />
            </Stack>
          </View>
        </View>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#0B0C12' : colors.bg, alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: MAX_APP_WIDTH, backgroundColor: colors.bg, overflow: 'hidden' },
});
