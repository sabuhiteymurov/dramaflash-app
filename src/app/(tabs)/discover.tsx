import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PosterCard, Serif } from '../../components/ui';
import { series } from '../../data/catalog';

export default function Discover() {
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      data={series}
      numColumns={3}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 12, paddingBottom: 24, gap: 18 }}
      columnWrapperStyle={{ gap: 10 }}
      ListHeaderComponent={<Serif style={{ fontSize: 24, marginBottom: 4, marginLeft: 4 }}>Discover</Serif>}
      renderItem={({ item }) => (
        <View style={{ flex: 1 / 3 }}>
          <PosterCard item={item} width={118} onPress={() => router.push(`/series/${item.id}`)} />
        </View>
      )}
    />
  );
}
