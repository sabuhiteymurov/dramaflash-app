// Mock CMS. In the real app this comes from the TargetVideo CMS API; the shapes are what the
// screens need, so swapping the source later only touches this module.
import { Platform } from 'react-native';

type ImageAsset = number;

export type SubtitleLine = { from: number; to: number; text: string };

export type Episode = {
  seriesId: string;
  number: number;
  title: string;
  duration: string;
  video: number;
  thumb: ImageAsset;
  subtitles: SubtitleLine[];
};

export type CastMember = { name: string; role: string; photo: ImageAsset };

export type Series = {
  id: string;
  title: string;
  tagline: string;
  poster: ImageAsset;
  cover: ImageAsset;
  genres: string[];
  rating: number;
  reviews: string;
  year: number;
  episodeCount: number;
  viewsPerEpisode: string;
  pro: boolean;
  synopsis: string;
  highlights: string[];
  cast: CastMember[];
};

export const FREE_EPISODES = 3;
export const EPISODE_PRICE = 10;
export const SEASON_PRICE = 150;

// H.264 MP4 plays everywhere native and in Safari. Chromium builds without proprietary codecs
// (and some Android WebViews) only decode VP9, so the web build prefers WebM when it can.
const webmSupported =
  Platform.OS === 'web' &&
  typeof document !== 'undefined' &&
  document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';

const clips = webmSupported
  ? [
      require('../../assets/video/ep1.webm'),
      require('../../assets/video/ep2.webm'),
      require('../../assets/video/ep3.webm'),
      require('../../assets/video/ep4.webm'),
    ]
  : [
      require('../../assets/video/ep1.mp4'),
      require('../../assets/video/ep2.mp4'),
      require('../../assets/video/ep3.mp4'),
      require('../../assets/video/ep4.mp4'),
    ];

const clipThumbs: ImageAsset[] = [
  require('../../assets/img/bs-ep1.jpg'),
  require('../../assets/img/hero-ceo.jpg'),
  require('../../assets/img/bs-ep5.jpg'),
  require('../../assets/img/bs-ep6.jpg'),
];

const episodeTitles = [
  'The Accidental Message',
  'Coffee and Contracts',
  'A Glimpse Behind the Mask',
  'The Gala Encounter',
  'Misunderstandings',
  'Midnight Confessions',
  "The Locket's Clue",
  'Unmasking the Truth',
];

// Each clip is nine seconds; the last two belong to the cliffhanger card.
const scripts: SubtitleLine[][] = [
  [
    { from: 0.6, to: 3.4, text: 'Sign it. Tonight.' },
    { from: 3.8, to: 6.6, text: 'And if I refuse?' },
  ],
  [
    { from: 0.6, to: 3.4, text: 'Nobody in this city knows who I am.' },
    { from: 3.8, to: 6.6, text: 'Not even her.' },
  ],
  [
    { from: 0.6, to: 3.4, text: 'The key was in his desk.' },
    { from: 3.8, to: 6.6, text: 'Then who opened the safe?' },
  ],
  [
    { from: 0.6, to: 3.4, text: 'This locket. It was hers.' },
    { from: 3.8, to: 6.6, text: 'She has been dead for ten years.' },
  ],
];

const cast: CastMember[] = [
  { name: 'Elena', role: 'Mia (Artist)', photo: require('../../assets/img/cast-1.jpg') },
  { name: 'Julian Vance', role: 'Alexander (CEO)', photo: require('../../assets/img/cast-2.jpg') },
  { name: 'Sarah Lin', role: 'Chloe (Best friend)', photo: require('../../assets/img/cast-3.jpg') },
  { name: 'Marcus', role: 'Rival CEO', photo: require('../../assets/img/cast-4.jpg') },
];

const synopsis =
  'When a struggling artist accidentally discovers that the ruthless CEO of the city’s largest conglomerate is actually her anonymous online confidant, her life is turned upside down. Can their digital romance survive the harsh reality of corporate espionage and forbidden love?';

type SeriesSeed = Pick<Series, 'id' | 'title' | 'poster' | 'episodeCount' | 'viewsPerEpisode'> &
  Partial<Series>;

const seed = (s: SeriesSeed): Series => ({
  tagline: 'A dangerous secret contract.',
  cover: s.poster,
  genres: ['Romance', 'Drama'],
  rating: 4.8,
  reviews: '12k',
  year: 2024,
  pro: false,
  synopsis,
  highlights: [
    'Intense chemistry from the very first frame.',
    'A gripping double-life narrative with high stakes.',
  ],
  cast,
  ...s,
});

export const series: Series[] = [
  seed({
    id: 'billionaires-secret',
    title: "The Billionaire's Secret",
    tagline: 'One contract. Two lies. No way out.',
    poster: require('../../assets/img/bs-ep1.jpg'),
    cover: require('../../assets/img/bs-ep1.jpg'),
    genres: ['Billionaire', 'Romance'],
    episodeCount: 45,
    viewsPerEpisode: '2.1m',
  }),
  seed({
    id: 'ceos-secret-life',
    title: "The CEO's Secret Life",
    tagline: 'Power. Deception. Legacy.',
    poster: require('../../assets/img/hero-ceo.jpg'),
    cover: require('../../assets/img/hero-ceo.jpg'),
    genres: ['Billionaire', 'Secret Identity', 'Romance'],
    episodeCount: 45,
    viewsPerEpisode: '1.8m',
  }),
  seed({
    id: 'verbotene-liebe',
    title: 'Verbotene Liebe',
    tagline: 'A CEO’s dangerous secret contract.',
    poster: require('../../assets/img/hero-echoes.jpg'),
    cover: require('../../assets/img/hero-echoes.jpg'),
    genres: ['Romance', 'Drama', 'Billionaire'],
    episodeCount: 72,
    viewsPerEpisode: '3.2m',
  }),
  seed({ id: 'der-ceo-und-ich', title: 'Der CEO und ich', poster: require('../../assets/img/p-der-ceo.jpg'), episodeCount: 50, viewsPerEpisode: '2m', pro: true }),
  seed({ id: 'mein-geheimes-leben', title: 'Mein geheimes Leben', poster: require('../../assets/img/p-geheimes-leben.jpg'), episodeCount: 30, viewsPerEpisode: '1m' }),
  seed({ id: 'liebe-auf-umwegen', title: 'Liebe auf Umwegen', poster: require('../../assets/img/p-liebe-umwegen.jpg'), episodeCount: 65, viewsPerEpisode: '2.4m', pro: true }),
  seed({ id: 'blutige-rosen', title: 'Blutige Rosen', poster: require('../../assets/img/p-blutige-rosen.jpg'), episodeCount: 80, viewsPerEpisode: '2m', pro: true, genres: ['Forbidden Love', 'Drama'] }),
  seed({ id: 'schattenkuss', title: 'Schattenkuss', poster: require('../../assets/img/p-schattenkuss.jpg'), episodeCount: 45, viewsPerEpisode: '1.5m', genres: ['Forbidden Love', 'Mystery'] }),
  seed({ id: 'dunkle-begierde', title: 'Dunkle Begierde', poster: require('../../assets/img/p-dunkle-begierde.jpg'), episodeCount: 60, viewsPerEpisode: '2.2m', pro: true, genres: ['Forbidden Love', 'Drama'] }),
  seed({ id: 'racheengel', title: 'Racheengel', poster: require('../../assets/img/p-racheengel.jpg'), episodeCount: 90, viewsPerEpisode: '2.5m', pro: true, genres: ['Action', 'Fantasy'] }),
  seed({ id: 'schicksalsband', title: 'Schicksalsband', poster: require('../../assets/img/p-schicksalsband.jpg'), episodeCount: 25, viewsPerEpisode: '1m', genres: ['Fantasy', 'Romance'] }),
  seed({ id: 'zweite-chance', title: 'Zweite Chance', poster: require('../../assets/img/p-zweite-chance.jpg'), episodeCount: 55, viewsPerEpisode: '1.9m', pro: true }),
];

export const getSeries = (id: string) => series.find((s) => s.id === id) ?? series[0];

export const getEpisodes = (s: Series): Episode[] =>
  Array.from({ length: s.episodeCount }, (_, i) => {
    const clip = i % clips.length;
    return {
      seriesId: s.id,
      number: i + 1,
      title: episodeTitles[i % episodeTitles.length],
      duration: `${1 + (i % 3)}:${String(10 + ((i * 17) % 50)).padStart(2, '0')}`,
      video: clips[clip],
      thumb: clipThumbs[clip],
      subtitles: scripts[clip],
    };
  });

export const shelves = [
  { title: 'Trending Romance', ids: ['der-ceo-und-ich', 'mein-geheimes-leben', 'liebe-auf-umwegen', 'ceos-secret-life'] },
  { title: 'Forbidden Love', ids: ['blutige-rosen', 'schattenkuss', 'dunkle-begierde', 'billionaires-secret'] },
  { title: 'Most Watched', ids: ['racheengel', 'schicksalsband', 'zweite-chance', 'verbotene-liebe'] },
];

export const coinPacks = [
  { id: 'c300', coins: 300, bonus: 0, price: '€2.99' },
  { id: 'c800', coins: 800, bonus: 50, price: '€6.99', tag: 'POPULAR' },
  { id: 'c2500', coins: 2500, bonus: 200, price: '€19.99' },
  { id: 'c6000', coins: 6000, bonus: 1000, price: '€49.99', tag: 'BEST VALUE' },
];
